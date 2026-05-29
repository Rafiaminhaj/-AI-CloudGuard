import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Bot, Shield, Scale } from 'lucide-react';

export default function AgentSwarm({ attacks }) {
  const [discussions, setDiscussions] = useState([]);

  useEffect(() => {
    if (attacks.length > 0) {
      const atk = attacks[attacks.length - 1];
      
      const newSequence = [
        { id: Date.now() + 1, agent: 'Hunter', icon: <Bot size={12}/>, color: 'text-red-400', msg: `Detected ${atk.type} signature matching APT-29.` },
        { id: Date.now() + 2, agent: 'Defender', icon: <Shield size={12}/>, color: 'text-cyan-400', msg: `Isolating affected pods. Deploying WAF rate-limits.` },
        { id: Date.now() + 3, agent: 'Compliance', icon: <Scale size={12}/>, color: 'text-green-400', msg: `No PII breached. Logging incident for GDPR audit.` }
      ];

      // Stagger the messages
      newSequence.forEach((msgObj, index) => {
        setTimeout(() => {
          setDiscussions(prev => [msgObj, ...prev].slice(0, 5));
        }, index * 1000);
      });
    }
  }, [attacks]);

  return (
    <div className="glass-panel p-4 flex flex-col relative h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-purple-400/80">
          <Users size={12} className="text-purple-400"/> AI Agent Swarm
        </h2>
        {attacks.length > 0 && <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
        </span>}
      </div>

      <div className="flex-1 overflow-y-auto font-mono text-[9px] space-y-2 pr-1">
        <AnimatePresence>
          {discussions.map(d => (
            <motion.div 
              key={d.id}
              initial={{ opacity: 0, x: -10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              className="p-2 rounded border border-white/5 bg-black/40 flex flex-col gap-1"
            >
              <div className={`flex items-center gap-1 font-bold ${d.color}`}>
                {d.icon} [{d.agent} AI]
              </div>
              <div className="text-slate-300 pl-4 border-l border-white/10 ml-1.5">
                {d.msg}
              </div>
            </motion.div>
          ))}
          {discussions.length === 0 && (
            <div className="text-slate-500 italic text-center mt-4">
              Agents standing by. Awaiting telemetry anomalies...
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
