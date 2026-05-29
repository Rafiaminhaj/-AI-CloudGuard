import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, ShieldAlert, Cpu } from 'lucide-react';

export default function AIPanel({ attacks, defcon }) {
  const [reasoning, setReasoning] = useState([]);
  
  useEffect(() => {
    if (attacks.length > 0) {
      const msgs = [
        "Analyzing anomalous volumetric traffic...",
        "Cross-referencing IOCs with Threat Intel DB...",
        "Identifying potential zero-day payload signature.",
        "Initiating heuristic isolation protocols."
      ];
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
      setReasoning(prev => [
        { id: Date.now(), text: randomMsg, type: 'analyze' },
        ...prev.slice(0, 3)
      ]);
    }
  }, [attacks]);

  const confidence = defcon === 1 ? 98 : (attacks.length > 0 ? 85 : 99);

  return (
    <div className="glass-panel p-4 flex flex-col relative overflow-hidden group">
      {/* Glitch bg */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0JyBoZWlnaHQ9JzQnPjxyZWN0IHdpZHRoPSc0JyBoZWlnaHQ9JzQnIGZpbGw9JyMwZDBkMGQnLz48cmVjdCB3aWR0aD0nMicgaGVpZ2h0PScyJyBmaWxsPScjMWExYTFhJy8+PC9zdmc+')] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity" />
      
      <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 mb-4 text-purple-400 z-10">
        <BrainCircuit size={14} className={attacks.length > 0 ? "animate-pulse text-red-500" : ""} /> AI Reasoning Engine
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-4 z-10">
        <div className="p-3 border border-white/5 bg-black/40 rounded flex flex-col gap-1">
          <span className="text-[9px] text-slate-500 font-mono">CONFIDENCE SCORE</span>
          <span className={`text-2xl font-bold font-mono ${confidence > 90 ? 'text-green-500' : 'text-red-500'}`}>{confidence}%</span>
        </div>
        <div className="p-3 border border-white/5 bg-black/40 rounded flex flex-col gap-1">
          <span className="text-[9px] text-slate-500 font-mono">THREAT CLASSIFIER</span>
          <span className="text-sm font-bold text-slate-300 font-mono">{defcon === 1 ? 'CRITICAL' : 'NOMINAL'}</span>
        </div>
      </div>

      <div className="flex-1 font-mono text-[10px] space-y-2 z-10">
        <div className="text-slate-500 mb-1 border-b border-white/5 pb-1">LIVE INFERENCE STREAM</div>
        <AnimatePresence>
          {reasoning.map(r => (
            <motion.div 
              key={r.id} 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="text-purple-300/80 bg-purple-500/10 p-2 rounded border border-purple-500/20"
            >
              &gt; {r.text}
            </motion.div>
          ))}
          {reasoning.length === 0 && (
            <div className="text-slate-600 animate-pulse">&gt; Standby. Monitoring telemetry...</div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
