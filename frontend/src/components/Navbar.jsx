import React from 'react';
import { Shield, ShieldAlert, Cpu, Terminal, RefreshCw } from 'lucide-react';

export default function Navbar({ onReset, historyCount = 0 }) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={onReset}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">
            <Shield className="w-5 h-5 text-cyan-400 transition-transform group-hover:scale-110" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-lg tracking-wider text-slate-100 uppercase">
                Web<span className="text-cyan-400">Protector</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono hidden sm:block">
              Heuristic & Rule-Based URL Threat Intelligence
            </p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>ENGINE: <strong className="text-emerald-400 font-normal">OPERATIONAL</strong></span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>SCANS: <strong className="text-cyan-400 font-normal">{historyCount}</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
}
