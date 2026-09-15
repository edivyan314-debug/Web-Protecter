const express = require('express');
const router = express.Router();
const { analyzeUrl } = require('../services/ruleEngine');
const { saveScan, getAllScans, deleteScan, getScanById, clearAllScans } = require('../database');

/**
 * POST /api/analyze
 * Accepts { url: string }
 * Returns analyzed score, features, and persisted scan record
 */
router.post('/analyze', (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({
        error: 'URL is required and must be a non-empty string'
      });
    }

    const analysisResult = analyzeUrl(url);
    const savedRecord = saveScan(analysisResult);

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
 * Returns list of previous scans
 */
router.get('/history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const history = getAllScans(limit);
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
 * Retrieve single scan detail
 */
router.get('/history/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const scan = getScanById(id);

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
 * Removes a scan by ID
 */
router.delete('/history/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = deleteScan(id);

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
 * Clears all history
 */
router.delete('/history', (req, res) => {
  try {
    clearAllScans();
    return res.status(200).json({
      success: true,
      message: 'All scan history cleared'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to clear scan history' });
  }
});

module.exports = router;
