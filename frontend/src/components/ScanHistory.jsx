import React, { useState } from 'react';
import { 
  History, 
  Trash2, 
  ExternalLink, 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  ChevronRight,
  RotateCcw
} from 'lucide-react';

export default function ScanHistory({ 
  history = [], 
  onSelectScan, 
  onDeleteScan, 
  onClearHistory, 
  activeScanId 
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = history.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.url.toLowerCase().includes(q) ||
      (item.hostname && item.hostname.toLowerCase().includes(q)) ||
      item.riskLevel.toLowerCase().includes(q)
    );
  });

  const safeCount = history.filter(h => h.riskLevel === 'Safe').length;
  const suspiciousCount = history.filter(h => h.riskLevel === 'Suspicious').length;
  const phishingCount = history.filter(h => h.riskLevel === 'Phishing').length;

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-950/40 text-cyan-400 border border-cyan-800/40">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-base font-bold text-slate-100 uppercase tracking-wide">
              Scan History
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Persisted in SQLite Database
            </span>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="font-mono text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-rose-950/20"
            title="Clear all scan history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear All</span>
          </button>
        )}
      </div>

      {/* Aggregate Stats Badges */}
      <div className="grid grid-cols-3 gap-2 mb-4 font-mono text-xs">
        <div className="bg-slate-950/80 border border-emerald-900/40 rounded-xl p-2.5 text-center">
          <span className="text-[10px] text-slate-400 block uppercase">Safe</span>
          <span className="text-emerald-400 font-bold text-sm">{safeCount}</span>
        </div>
        <div className="bg-slate-950/80 border border-amber-900/40 rounded-xl p-2.5 text-center">
          <span className="text-[10px] text-slate-400 block uppercase">Suspicious</span>
          <span className="text-amber-400 font-bold text-sm">{suspiciousCount}</span>
        </div>
        <div className="bg-slate-950/80 border border-rose-900/40 rounded-xl p-2.5 text-center">
          <span className="text-[10px] text-slate-400 block uppercase">Phishing</span>
          <span className="text-rose-400 font-bold text-sm">{phishingCount}</span>
        </div>
      </div>

      {/* Search Filter */}
      {history.length > 3 && (
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past scans..."
            className="w-full bg-slate-950/90 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>
      )}

      {/* Scrollable History List */}
      <div className="flex-1 overflow-y-auto max-h-[460px] pr-1 space-y-2.5">
        {history.length === 0 ? (
          <div className="text-center py-10 px-4">
            <Clock className="w-8 h-8 mx-auto text-slate-700 mb-2" />
            <p className="font-mono text-xs text-slate-400">No scans recorded yet</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Your analyzed URLs and safety scores will be saved here automatically.
            </p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-8">
            <p className="font-mono text-xs text-slate-500">No matching scans found</p>
          </div>
        ) : (
          filteredHistory.map((item) => {
            const isActive = activeScanId === item.id;

            let badgeClasses = 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60';
            let Icon = ShieldCheck;
            if (item.riskLevel === 'Suspicious') {
              badgeClasses = 'bg-amber-950/40 text-amber-400 border-amber-800/60';
              Icon = AlertTriangle;
            } else if (item.riskLevel === 'Phishing') {
              badgeClasses = 'bg-rose-950/40 text-rose-400 border-rose-800/60';
              Icon = ShieldAlert;
            }

            const formattedTime = new Date(item.createdAt || item.created_at || Date.now()).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={item.id}
                onClick={() => onSelectScan(item)}
                className={`p-3 rounded-xl border transition-all cursor-pointer group flex items-center justify-between gap-3 ${
                  isActive 
                    ? 'bg-slate-800/90 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.15)]' 
                    : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${badgeClasses}`}>
                      <Icon className="w-2.5 h-2.5" />
                      {item.riskLevel} ({item.riskScore})
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {formattedTime}
                    </span>
                  </div>

                  <p className="font-mono text-xs text-slate-200 truncate group-hover:text-cyan-300 transition-colors" title={item.url}>
                    {item.url}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteScan(item.id);
                    }}
                    title="Delete record"
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
