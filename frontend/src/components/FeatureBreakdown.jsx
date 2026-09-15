import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  SlidersHorizontal,
  Lock,
  Globe,
  FileText,
  Key,
  Layers,
  AtSign,
  MinusCircle
} from 'lucide-react';

const ICON_MAP = {
  https: Lock,
  ip_address: Globe,
  url_length: FileText,
  suspicious_keywords: Key,
  subdomains: Layers,
  at_symbol: AtSign,
  hyphens: MinusCircle,
  obfuscation: SlidersHorizontal
};

export default function FeatureBreakdown({ features = [] }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'flagged' | 'safe'

  if (!features || features.length === 0) return null;

  const dangerCount = features.filter(f => f.status === 'danger').length;
  const warningCount = features.filter(f => f.status === 'warning').length;
  const safeCount = features.filter(f => f.status === 'safe').length;

  const filteredFeatures = features.filter(f => {
    if (filter === 'flagged') return f.status === 'danger' || f.status === 'warning';
    if (filter === 'safe') return f.status === 'safe';
    return true;
  });

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl relative transition-all">
      {/* Header bar with collapsible toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-base font-bold text-slate-100 uppercase tracking-wide">
              Feature & Threat Signal Breakdown
            </h3>
            <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {features.length} Signals
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Granular evaluation of URL structure, protocol, brand impersonation, and obfuscation heuristics.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Filter Pills */}
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 font-mono text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter === 'all' 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({features.length})
            </button>
            <button
              onClick={() => setFilter('flagged')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter === 'flagged' 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                  : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              Flagged ({dangerCount + warningCount})
            </button>
            <button
              onClick={() => setFilter('safe')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter === 'safe' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              Safe ({safeCount})
            </button>
          </div>

          {/* Expand / Collapse button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse panel' : 'Expand panel'}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Feature cards list */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-5">
          {filteredFeatures.map((feat) => {
            const FeatureIcon = ICON_MAP[feat.id] || SlidersHorizontal;

            let cardTheme = {
              border: 'border-slate-800/80',
              bg: 'bg-slate-950/40',
              badge: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60',
              badgeLabel: 'PASSED',
              iconBg: 'bg-emerald-950/30 text-emerald-400',
              statusIcon: ShieldCheck
            };

            if (feat.status === 'danger') {
              cardTheme = {
                border: 'border-rose-900/60',
                bg: 'bg-rose-950/10',
                badge: 'bg-rose-950/60 text-rose-400 border-rose-800/80',
                badgeLabel: 'HIGH RISK',
                iconBg: 'bg-rose-950/40 text-rose-400',
                statusIcon: XCircle
              };
            } else if (feat.status === 'warning') {
              cardTheme = {
                border: 'border-amber-900/60',
                bg: 'bg-amber-950/10',
                badge: 'bg-amber-950/60 text-amber-400 border-amber-800/80',
                badgeLabel: 'WARNING',
                iconBg: 'bg-amber-950/40 text-amber-400',
                statusIcon: AlertTriangle
              };
            }

            const StatusIcon = cardTheme.statusIcon;

            return (
              <div
                key={feat.id}
                className={`border ${cardTheme.border} ${cardTheme.bg} rounded-xl p-4 transition-all hover:border-slate-700 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${cardTheme.iconBg}`}>
                        <FeatureIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-mono text-sm font-semibold text-slate-100">
                          {feat.name}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {feat.category} • Weight: {feat.weight}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${cardTheme.badge}`}>
                        {cardTheme.badgeLabel}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 font-sans leading-relaxed mt-2">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between font-mono text-xs">
                  <span className="text-slate-400">
                    Detected Value: <strong className="text-slate-200 font-normal">{feat.value}</strong>
                  </span>
                  <span className={feat.contribution > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                    {feat.contribution > 0 ? `+${feat.contribution} pts` : '0 pts'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
