import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCommit, ShieldCheck, ShieldAlert, Code2 } from 'lucide-react';

export default function CICDScanner({ onDeploy }) {
  const [commits, setCommits] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const triggerPipeline = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanResult(null);
    
    // Simulate pipeline steps
    setTimeout(() => {
      const isMalicious = Math.random() > 0.6;
      setScanResult(isMalicious ? 'FAILED' : 'PASSED');
      setIsScanning(false);
      
      const newCommit = {
        id: Math.random().toString(36).substr(2, 7),
        msg: isMalicious ? "Update auth middleware" : "Fix padding in header",
        status: isMalicious ? "VULNERABILITY DETECTED" : "CLEAN",
        isBad: isMalicious
      };
      
      setCommits(prev => [newCommit, ...prev].slice(0, 4));
      
      if (!isMalicious && onDeploy) {
        onDeploy(newCommit);
      }
    }, 2500);
  };

  return (
    <div className="glass-panel p-4 flex flex-col relative h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-cyan-500/80">
          <GitCommit size={12} className="text-cyan-400"/> CI/CD SecOps Pipeline
        </h2>
        <button 
          onClick={triggerPipeline}
          disabled={isScanning}
          className="text-[9px] bg-cyan-900/40 hover:bg-cyan-900/80 px-3 py-1.5 rounded border border-cyan-500/30 font-mono tracking-widest uppercase transition disabled:opacity-50"
        >
          Push Code
        </button>
      </div>

      {isScanning && (
        <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded flex items-center gap-3">
          <Code2 size={16} className="text-blue-400 animate-bounce" />
          <div className="flex flex-col font-mono text-[9px] text-blue-300">
            <span className="font-bold">AI STATIC ANALYSIS RUNNING...</span>
            <span className="opacity-70">Scanning AST for zero-days & secrets</span>
          </div>
        </div>
      )}

      {scanResult && !isScanning && (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`mb-4 p-3 rounded flex items-center gap-3 border ${scanResult === 'PASSED' ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}
        >
          {scanResult === 'PASSED' ? <ShieldCheck size={16} className="text-green-400"/> : <ShieldAlert size={16} className="text-red-400"/>}
          <div className="flex flex-col font-mono text-[9px]">
            <span className={`font-bold ${scanResult === 'PASSED' ? 'text-green-400' : 'text-red-400'}`}>
              PIPELINE {scanResult}
            </span>
            <span className={scanResult === 'PASSED' ? 'text-green-500/70' : 'text-red-500/70'}>
              {scanResult === 'PASSED' ? 'Code deployed to production.' : 'SQL Injection pattern blocked.'}
            </span>
          </div>
        </motion.div>
      )}

      <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-2">
        <AnimatePresence>
          {commits.map(c => (
            <motion.div 
              key={c.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-2 rounded border flex justify-between items-center ${c.isBad ? 'bg-red-500/5 border-red-500/20' : 'bg-white/5 border-white/10'}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-slate-500">{c.id}</span>
                <span className={c.isBad ? 'text-red-300' : 'text-slate-300'}>{c.msg}</span>
              </div>
              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${c.isBad ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                {c.status}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
