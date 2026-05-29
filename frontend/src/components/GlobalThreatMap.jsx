import React, { useEffect, useState, useRef } from 'react';
import Globe from 'react-globe.gl';
import { motion } from 'framer-motion';

export default function GlobalThreatMap({ attacks }) {
  const globeEl = useRef();
  const [arcsData, setArcsData] = useState([]);
  const [ringsData, setRingsData] = useState([]);

  // Generate random arcs based on attacks
  useEffect(() => {
    if (attacks.length > 0) {
      const latestAttack = attacks[attacks.length - 1];
      
      const startLat = (Math.random() - 0.5) * 180;
      const startLng = (Math.random() - 0.5) * 360;
      const endLat = (Math.random() - 0.5) * 180;
      const endLng = (Math.random() - 0.5) * 360;

      const newArc = {
        startLat,
        startLng,
        endLat,
        endLng,
        color: latestAttack.color || '#ff0000'
      };

      const newRing = { lat: endLat, lng: endLng, color: latestAttack.color || '#ff0000' };

      setArcsData(prev => [...prev, newArc].slice(-15));
      setRingsData(prev => [...prev, newRing].slice(-15));
    }
  }, [attacks]);

  useEffect(() => {
    // Auto-rotate
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 1.2;
      globeEl.current.controls().enableZoom = false;
    }
  }, []);

  return (
    <div className="relative w-full h-full min-h-[300px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Globe
          ref={globeEl}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          arcsData={arcsData}
          arcColor="color"
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcDashAnimateTime={1500}
          ringsData={ringsData}
          ringColor="color"
          ringMaxRadius={5}
          ringPropagationSpeed={3}
          ringRepeatPeriod={700}
          width={800}
          height={600}
        />
      </div>
      
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#02040a]/40 to-[#02040a]" />
      
      {/* Glitch Overlay Effect during attacks */}
      {attacks.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.2, 0, 0.4, 0] }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 pointer-events-none bg-red-500/10 mix-blend-overlay"
        />
      )}

      {/* Live API Intel Badge */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 px-2 py-1 bg-black/60 border border-green-500/30 rounded text-[8px] font-mono text-green-400">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        LIVE: AlienVault OTX Sync
      </div>
    </div>
  );
}
