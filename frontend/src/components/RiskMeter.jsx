import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Target, Clock, ExternalLink, Copy, Check } from 'lucide-react';

export default function RiskMeter({ result }) {
  const [copied, setCopied] = React.useState(false);

  if (!result) {
    return (
      <div className="w-full bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-center text-slate-600 mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-slate-300 font-mono">NO URL ANALYZED YET</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1.5 font-sans">
          Paste a website link above or pick a sample preset to test against our threat heuristic engine.
        </p>
      </div>
    );
  }

  const { riskScore = 0, riskLevel = 'Safe', confidence = 90, url, summary, createdAt, scannedAt } = result;

  // Visual theming based on score
  let theme = {
    color: '#10b981', // emerald
    label: 'SAFE',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    bgColor: 'bg-emerald-950/20',
    glowClass: 'cyber-glow-emerald',
    icon: ShieldCheck,
    tagline: 'Minimal Risk Detected'
  };

  if (riskLevel === 'Suspicious') {
    theme = {
      color: '#f59e0b', // amber
      label: 'SUSPICIOUS',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      bgColor: 'bg-amber-950/20',
      glowClass: 'cyber-glow-amber',
      icon: AlertTriangle,
      tagline: 'Elevated Risk Signals'
    };
  } else if (riskLevel === 'Phishing') {
    theme = {
      color: '#f43f5e', // rose
      label: 'PHISHING',
      textColor: 'text-rose-400',
      borderColor: 'border-rose-500/50',
      bgColor: 'bg-rose-950/30',
      glowClass: 'cyber-glow-rose',
      icon: ShieldAlert,
      tagline: 'High Threat Level Detected'
    };
  }

  const IconComponent = theme.icon;

  // SVG Circular Gauge calculation
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  // Progress offset (0 score = 0 progress, 100 score = full progress)
  const strokeDashoffset = circumference - (riskScore / 100) * circumference;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(createdAt || scannedAt || Date.now()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className={`w-full bg-slate-900/60 backdrop-blur-xl border ${theme.borderColor} rounded-2xl p-6 shadow-2xl relative overflow-hidden transition-all duration-500`}>
      {/* Dynamic ambient backdrop glow */}
      <div 
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: theme.color }}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
        {/* Left: Gauge + Big Score */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative flex items-center justify-center">
            <svg className="w-44 h-44 -rotate-90 transform" viewBox="0 0 160 160">
              {/* Background Track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="#1e293b"
                strokeWidth="12"
                fill="transparent"
              />
              {/* Animated Progress Arc */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={theme.color}
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: `drop-shadow(0 0 8px ${theme.color})`
                }}
              />
            </svg>

            {/* Centered Score */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-black font-mono tracking-tight text-white">
                {riskScore}
              </span>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Risk Score
              </span>
            </div>
          </div>

          {/* Classification text info */}
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-mono text-xs font-bold uppercase tracking-wider border mb-2"
              style={{
                backgroundColor: `${theme.color}15`,
                borderColor: `${theme.color}50`,
                color: theme.color
              }}
            >
              <IconComponent className="w-4 h-4" />
              <span>{theme.label} — {theme.tagline}</span>
            </div>

            <h2 className="text-2xl font-bold text-slate-100 font-sans tracking-tight">
              Threat Score: <span className={theme.textColor}>{riskScore} / 100</span>
            </h2>

            <p className="text-xs text-slate-400 mt-2 max-w-md font-sans leading-relaxed">
              {summary}
            </p>
          </div>
        </div>

        {/* Right: Metrics & Inspected URL Chip */}
        <div className="w-full md:w-auto flex flex-col gap-3 min-w-[240px]">
          {/* Confidence Pill */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between font-mono text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-cyan-400" />
              Confidence
            </span>
            <span className="text-slate-200 font-semibold">{confidence}%</span>
          </div>

          {/* Timestamp Pill */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between font-mono text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              Scanned At
            </span>
            <span className="text-slate-300">{formattedDate}</span>
          </div>

          {/* Inspected Target URL */}
          <div className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-2 font-mono text-xs">
            <span className="text-slate-400 truncate max-w-[180px] sm:max-w-[220px]" title={url}>
              {url}
            </span>
            <button
              onClick={handleCopyUrl}
              title="Copy URL"
              className="p-1 text-slate-400 hover:text-cyan-400 rounded transition-colors flex-shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
