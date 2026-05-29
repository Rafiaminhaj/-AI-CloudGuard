import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from 'lucide-react';

export default function PacketStream() {
  const [packets, setPackets] = useState([]);

  useEffect(() => {
    const generatePacket = () => {
      const hexString = Array(8).fill(0).map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(' ');
      const ip1 = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.1.1`;
      const ip2 = `10.250.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      return { id: Date.now(), text: `[${ip1} -> ${ip2}] PAYLOAD: ${hexString.toUpperCase()}` };
    };

    const interval = setInterval(() => {
      setPackets(prev => [...prev.slice(-15), generatePacket()]);
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel p-4 flex flex-col h-full overflow-hidden relative">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 mb-2 text-cyan-500/80">
        <Activity size={12} className="text-cyan-400 animate-pulse"/> Packet Telemetry
      </h2>
      <div className="flex-1 overflow-hidden relative font-mono text-[9px] text-cyan-400/60 leading-tight">
        <AnimatePresence>
          {packets.map(p => (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="whitespace-nowrap"
            >
              {p.text}
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#02040a] pointer-events-none" />
      </div>
    </div>
  );
}
