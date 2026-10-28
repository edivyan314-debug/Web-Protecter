import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import UrlInput from './components/UrlInput';
import RiskMeter from './components/RiskMeter';
import FeatureBreakdown from './components/FeatureBreakdown';
import ScanHistory from './components/ScanHistory';
import { ShieldCheck, AlertCircle, Info, Radio, Lock } from 'lucide-react';

// Base API endpoint - uses import.meta.env.VITE_API_URL as the base URL, falling back to http://localhost:5000/api for local development
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const cleanUrl = envUrl.trim().replace(/\/$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

const API_BASE = getApiBaseUrl();

export default function App() {
  const [history, setHistory] = useState([]);
  const [activeScan, setActiveScan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [notification, setNotification] = useState('');

  // Fetch scan history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/history`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setHistory(json.data);
          // Pre-populate with most recent scan if activeScan is empty
          if (json.data.length > 0 && !activeScan) {
            setActiveScan(json.data[0]);
          }
        }
      }
    } catch (err) {
      console.warn('Backend not yet reachable on /api/history:', err.message);
    }
  };

  const handleAnalyze = async (urlToScan) => {
    setIsLoading(true);
    setErrorMessage('');
    setNotification('');

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: urlToScan })
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'URL analysis failed');
      }

      const scanResult = json.data;
      setActiveScan(scanResult);
      // Prepend to local history
      setHistory(prev => [scanResult, ...prev.filter(h => h.id !== scanResult.id)]);
      showNotification(`Analysis complete: Classified as ${scanResult.riskLevel.toUpperCase()}`);
    } catch (err) {
      setErrorMessage(err.message || 'Could not connect to analysis service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteScan = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/history/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
        if (activeScan && activeScan.id === id) {
          const remaining = history.filter(item => item.id !== id);
          setActiveScan(remaining.length > 0 ? remaining[0] : null);
        }
        showNotification('Scan removed from history');
      }
    } catch (err) {
      setErrorMessage('Failed to delete scan record');
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all scan history?')) return;

    try {
      const res = await fetch(`${API_BASE}/history`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setHistory([]);
        setActiveScan(null);
        showNotification('All scan history cleared');
      }
    } catch (err) {
      setErrorMessage('Failed to clear history');
    }
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification('');
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans relative selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Cyber Grid */}
      <div className="fixed inset-0 cyber-grid opacity-30 pointer-events-none" />

      {/* Navbar */}
      <Navbar onReset={() => setActiveScan(null)} historyCount={history.length} />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 relative z-10 space-y-6">
        {/* Floating Notification / Error Alerts */}
        {errorMessage && (
          <div className="bg-rose-950/70 border border-rose-800 text-rose-300 px-4 py-3 rounded-xl flex items-center justify-between font-mono text-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="text-rose-400 hover:text-rose-200 ml-4 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {notification && (
          <div className="bg-cyan-950/70 border border-cyan-800 text-cyan-300 px-4 py-2.5 rounded-xl flex items-center gap-2 font-mono text-xs animate-in fade-in slide-in-from-top-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse flex-shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Hero URL Input Section */}
        <section>
          <UrlInput onAnalyze={handleAnalyze} isLoading={isLoading} />
        </section>

        {/* Dashboard Grid: Left for Analysis & Breakdown, Right for History */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Risk Meter & Breakdown (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-6">
            <RiskMeter result={activeScan} />
            <FeatureBreakdown features={activeScan?.features || []} />
          </div>

          {/* Right Column: Scan History (4 cols on lg) */}
          <div className="lg:col-span-4 h-full">
            <ScanHistory
              history={history}
              activeScanId={activeScan?.id}
              onSelectScan={(scan) => setActiveScan(scan)}
              onDeleteScan={handleDeleteScan}
              onClearHistory={handleClearHistory}
            />
          </div>
        </section>
      </main>

      {/* Cyberpunk Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/60 backdrop-blur-md px-4 py-6 text-center text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Web Protector Security Intelligence Engine</span>
          </div>
          <div className="text-slate-400">
            Node.js • Express • React • Tailwind CSS • SQLite (better-sqlite3)
          </div>
        </div>
      </footer>
    </div>
  );
}
