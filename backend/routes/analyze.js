const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { analyzeUrl } = require('../services/ruleEngine');
const { Scan } = require('../database');

// In-memory fallback if MongoDB is not connected (e.g. during offline test suites without MONGODB_URI)
let memoryScans = [];

/**
 * POST /api/analyze
 * Accepts { url: string }
 * Returns analyzed score, features, and persisted scan record using Mongoose Scan model
 */
router.post('/analyze', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({
        error: 'URL is required and must be a non-empty string'
      });
    }

    const analysisResult = analyzeUrl(url);

    let savedRecord;

    if (mongoose.connection.readyState === 1) {
      // Persist using Mongoose model
      const scanDoc = new Scan({
        url: analysisResult.url,
        hostname: analysisResult.hostname || '',
        riskScore: analysisResult.riskScore,
        riskLevel: analysisResult.riskLevel,
        confidence: analysisResult.confidence,
        summary: analysisResult.summary || '',
        features: analysisResult.features || [],
        timestamp: new Date()
      });

      savedRecord = await scanDoc.save();
    } else {
      // Offline fallback for testing
      const id = new mongoose.Types.ObjectId().toString();
      savedRecord = {
        id,
        _id: id,
        url: analysisResult.url,
        hostname: analysisResult.hostname || '',
        riskScore: analysisResult.riskScore,
        riskLevel: analysisResult.riskLevel,
        confidence: analysisResult.confidence,
        summary: analysisResult.summary || '',
        features: analysisResult.features || [],
        timestamp: new Date(),
        createdAt: new Date()
      };
      memoryScans.unshift(savedRecord);
    }

    return res.status(200).json({
      success: true,
      data: savedRecord
    });
  } catch (err) {
    return res.status(422).json({
      error: err.message || 'Failed to analyze URL'
    });
  }
});

/**
 * GET /api/history
 * Returns list of previous scans from MongoDB using Mongoose Scan model
 */
router.get('/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;

    let history;
    if (mongoose.connection.readyState === 1) {
      history = await Scan.find()
        .sort({ timestamp: -1, createdAt: -1 })
        .limit(limit);
    } else {
      history = memoryScans.slice(0, limit);
    }

    return res.status(200).json({
      success: true,
      data: history
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to retrieve scan history'
    });
  }
});

/**
 * GET /api/history/:id
 * Retrieve single scan detail using Mongoose Scan model
 */
router.get('/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let scan;

    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        scan = await Scan.findById(id);
      } else {
        scan = await Scan.findOne({ _id: id });
      }
    } else {
      scan = memoryScans.find(s => s.id === id || s._id === id);
    }

    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    return res.status(200).json({
      success: true,
      data: scan
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve scan' });
  }
});

/**
 * DELETE /api/history/:id
 * Removes a scan by ID using Mongoose Scan model
 */
router.delete('/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let deleted = false;

    if (mongoose.connection.readyState === 1) {
      const result = mongoose.Types.ObjectId.isValid(id)
        ? await Scan.findByIdAndDelete(id)
        : await Scan.findOneAndDelete({ _id: id });
      deleted = !!result;
    } else {
      const idx = memoryScans.findIndex(s => s.id === id || s._id === id);
      if (idx !== -1) {
        memoryScans.splice(idx, 1);
        deleted = true;
      }
    }

    if (!deleted) {
      return res.status(404).json({ error: 'Scan not found or already deleted' });
    }

    return res.status(200).json({
      success: true,
      message: `Scan ${id} removed successfully`,
      deletedId: id
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete scan' });
  }
});

/**
 * DELETE /api/history
 * Clears all history from MongoDB using Mongoose Scan model
 */
router.delete('/history', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await Scan.deleteMany({});
    } else {
      memoryScans = [];
    }

    return res.status(200).json({
      success: true,
      message: 'All scan history cleared'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to clear scan history' });
  }
});

module.exports = router;
