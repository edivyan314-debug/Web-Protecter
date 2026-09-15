import React, { useState } from 'react';
import { Search, Globe, ShieldAlert, CornerDownLeft, Clipboard, X, Sparkles, Loader2 } from 'lucide-react';

const PRESETS = [
  {
    label: 'Safe: Google',
    url: 'https://google.com',
    type: 'safe'
  },
  {
    label: 'Phishing: Raw IP + Login',
    url: 'http://192.168.1.1/login?verify=bank',
    type: 'phishing'
  },
  {
    label: 'Suspicious: Keyword & Hyphens',
    url: 'http://my-secure-banking-update.com/signin',
    type: 'suspicious'
  },
  {
    label: 'Phishing: @ Symbol Trick',
    url: 'https://paypal.com@verify-account-gate.ru/update',
    type: 'phishing'
  }
];

export default function UrlInput({ onAnalyze, isLoading }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;
    onAnalyze(url.trim());
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
      }
    } catch (err) {
      // Fallback if clipboard permission denied
      console.warn('Clipboard read error:', err);
    }
  };

  const handlePresetSelect = (presetUrl) => {
    setUrl(presetUrl);
    onAnalyze(presetUrl);
  };

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden group">
      {/* Decorative cyber grid highlight */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <label htmlFor="url-input" className="font-mono text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400 animate-pulse" />
            Target Inspection Endpoint
          </label>
          <span className="font-mono text-[11px] text-slate-500">
            HTTP / HTTPS / FQDN / RAW IP
          </span>
        </div>

        {/* Input Bar Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 flex items-center">
            <div className="absolute left-4 text-slate-500 pointer-events-none">
              <Search className="w-5 h-5 group-focus-within:text-cyan-400 transition-colors" />
            </div>

            <input
              id="url-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste or enter any URL (e.g. http://192.168.1.1/login or https://example.com)..."
              disabled={isLoading}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-12 pr-20 py-3.5 text-slate-100 placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 transition-all"
            />

            {/* In-input Action Buttons */}
            <div className="absolute right-2.5 flex items-center gap-1">
              {url && (
                <button
                  type="button"
                  onClick={() => setUrl('')}
                  title="Clear input"
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={handlePaste}
                title="Paste from clipboard"
                className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 rounded-lg transition-colors hidden sm:inline-flex"
              >
                <Clipboard className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={!url.trim() || isLoading}
            className={`px-6 py-3.5 rounded-xl font-mono text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg ${
              !url.trim() || isLoading
                ? 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-slate-800'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-[0.98]'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>ANALYZING...</span>
              </>
            ) : (
              <>
                <span>ANALYZE URL</span>
                <CornerDownLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Test Presets */}
        <div className="mt-4 pt-4 border-t border-slate-800/60 flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-slate-400 flex items-center gap-1.5 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Quick Presets:
          </span>

          {PRESETS.map((preset, index) => {
            let badgeStyle = 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-600';
            if (preset.type === 'safe') {
              badgeStyle = 'border-emerald-900/60 bg-emerald-950/30 text-emerald-400 hover:border-emerald-500/60';
            } else if (preset.type === 'suspicious') {
              badgeStyle = 'border-amber-900/60 bg-amber-950/30 text-amber-400 hover:border-amber-500/60';
            } else if (preset.type === 'phishing') {
              badgeStyle = 'border-rose-900/60 bg-rose-950/30 text-rose-400 hover:border-rose-500/60';
            }

            return (
              <button
                key={index}
                type="button"
                onClick={() => handlePresetSelect(preset.url)}
                disabled={isLoading}
                className={`font-mono text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${badgeStyle}`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
