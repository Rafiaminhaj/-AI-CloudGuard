import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldAlert, Cpu, Network, Database, Shield, Swords, Volume2, VolumeX, Eye } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { supabase, saveIncidentToDB, incrementThreatsCounter, fetchIncidentTimeline } from './lib/supabase-db.js';
import { playSiren, playTyping, playDefconAlarm } from './lib/audio.js';
import AIChatBot from './components/AIChatBot.jsx';
import Login from './components/Login.jsx';
import MatrixRain from './components/MatrixRain.jsx';
import GlobalThreatMap from './components/GlobalThreatMap.jsx';
import AIPanel from './components/AIPanel.jsx';
import PacketStream from './components/PacketStream.jsx';
import CICDScanner from './components/CICDScanner.jsx';
import AgentSwarm from './components/AgentSwarm.jsx';
import './index.css';

// Mock Data Generator for Recharts
// Mock Data Generator for Recharts
const generateData = (base) => Array(20).fill(0).map((_, i) => ({ time: i, value: base }));

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [battleMode, setBattleMode] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [execMode, setExecMode] = useState(false);
  
  const [cpuData, setCpuData] = useState(generateData(20));
  const [memData, setMemData] = useState(generateData(45));
  
  const [logs, setLogs] = useState([
    { id: 1, tag: 'SYS', level: 'INFO', msg: 'Enterprise SOC Initialized. Perimeter secure.' }
  ]);
  const [infraNodes, setInfraNodes] = useState([1, 2, 3]); // K8s nodes

  // God Mode Features
  const [attacks, setAttacks] = useState([]);
  const [threatsMitigated, setThreatsMitigated] = useState(12842);
  const [cinematicAction, setCinematicAction] = useState(null);
  const [defcon, setDefcon] = useState(5);
  const [matrixMode, setMatrixMode] = useState(false);
  const keyBuffer = useRef('');

  // Map attacks array for the 3D globe visualization
  const mapAttacks = attacks.map(atk => ({
    id: atk.id,
    startLat: atk.sourceLat,
    startLng: atk.sourceLng,
    endLat: atk.targetLat,
    endLng: atk.targetLng,
    color: atk.type === 'DDoS' ? '#ff0000' : atk.type === 'Bot Swarm' ? '#ff00ff' : '#ffff00',
    type: atk.type
  }));

  useEffect(() => {
    // Load historical logs from Supabase on mount
    const loadLogs = async () => {
      const historicalLogs = await fetchIncidentTimeline();
      if (historicalLogs.length > 0) {
        setLogs(historicalLogs.map(log => ({
          id: log.id || log.timestamp,
          tag: log.component_type,
          level: log.log_level,
          msg: log.message_text
        })).reverse());
      }
    };
    loadLogs();

    // Matrix Easter Egg Listener
    const handleKeyDown = (e) => {
      keyBuffer.current += e.key.toUpperCase();
      if (keyBuffer.current.length > 4) {
        keyBuffer.current = keyBuffer.current.slice(-4);
      }
      if (keyBuffer.current === 'HACK') {
        setMatrixMode(prev => !prev);
        keyBuffer.current = ''; // reset
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Setup Supabase Realtime Sync
    let realtimeChannel = null;
    if (supabase) {
      realtimeChannel = supabase
        .channel('custom-all-channel')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'incidents' },
          (payload) => {
            const newLog = payload.new;
            setLogs(prev => {
              if (prev.some(log => log.msg === newLog.message_text && log.level === newLog.log_level && (Date.now() - log.id < 2000))) return prev;
              
              const incoming = {
                id: newLog.id || Date.now(),
                tag: newLog.component_type,
                level: newLog.log_level,
                msg: newLog.message_text
              };
              return [...prev, incoming].slice(-50);
            });
            
            if (audioEnabled) {
              playSiren();
            }
          }
        )
        .subscribe();
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch('https://ai-cloudguard.onrender.com/state');
        if (res.ok) {
          const stateData = await res.json();
          setCpuData(prev => [...prev.slice(1), { time: Date.now(), value: stateData.cpu_usage }]);
          setLogs(prev => {
            const lastLog = prev[prev.length - 1];
            if (lastLog && lastLog.msg !== `Backend RL Status: ${stateData.status}`) {
              return [...prev, { id: Date.now(), tag: 'AI-RL', level: 'INFO', msg: `Backend RL Status: ${stateData.status}` }].slice(-50);
            }
            return prev;
          });
        }
      } catch (err) {
        setCpuData(prev => [...prev.slice(1), { time: Date.now(), value: Math.max(0, prev[prev.length-1].value + (Math.random()-0.5)*15) }]);
      }
      
      setMemData(prev => [...prev.slice(1), { time: Date.now(), value: Math.max(0, prev[prev.length-1].value + (Math.random()-0.5)*10) }]);
    }, 2000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
      if (realtimeChannel) supabase.removeChannel(realtimeChannel);
    };
  }, [audioEnabled]);

  // Tick the threats mitigated counter for cinematic feel
  useEffect(() => {
    const counterInterval = setInterval(() => {
      if (attacks.length > 0) {
        setThreatsMitigated(prev => prev + Math.floor(Math.random() * 5) + 1);
      } else {
        setThreatsMitigated(prev => prev + (Math.random() > 0.7 ? 1 : 0));
      }
    }, 1500);
    return () => clearInterval(counterInterval);
  }, [attacks]);

  const addLog = (msg, tag = 'SYS', level = 'INFO') => {
    setLogs(prev => [...prev, { id: Date.now(), tag, level, msg }].slice(-50));
  };

  const simulateAttack = (type) => {
    const newAttack = {
      id: Date.now(),
      type,
      sourceLat: Math.random() * 180 - 90,
      sourceLng: Math.random() * 360 - 180,
      targetLat: 34.05,
      targetLng: -118.24
    };
    setAttacks(prev => [...prev, newAttack]);
    addLog(`Red Team launched ${type} strike on perimeter.`, 'SEC', 'CRITICAL');
    
    setTimeout(() => {
      setAttacks(prev => prev.filter(a => a.id !== newAttack.id));
    }, 3000);
  };

  const exportCSV = () => {
    const header = "ID,Timestamp,Component,Level,Message\n";
    const csvContent = logs.map(l => `${l.id},${new Date(l.id).toISOString()},${l.tag},${l.level},"${l.msg.replace(/"/g, '""')}"`).join("\n");
    const blob = new Blob([header + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "cloudguard_incident_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBackendAction = async (actionStr) => {
    try {
      const res = await fetch('https://ai-cloudguard.onrender.com/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionStr })
      });
      if (res.ok) {
        const data = await res.json();
        addLog(`RL Agent Action: ${actionStr} | Reward: ${data.reward}`, 'AI-RL', 'INFO');
      }
    } catch (err) {
      addLog(`Backend unreachable for action: ${actionStr}`, 'SYS', 'WARN');
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className={`min-h-screen w-full relative ${execMode ? 'bg-slate-50 text-slate-900' : 'bg-[#02040a] text-slate-100'} transition-colors duration-500`}>
      
      {matrixMode && <MatrixRain />}

      <AnimatePresence>
        {defcon === 1 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-600 z-[9998] pointer-events-none animate-pulse"
          />
        )}
      </AnimatePresence>

      {!execMode && (
        <>
          <div className="cyber-grid"></div>
          <div className="fixed inset-0 bg-gradient-to-br from-cyan-900/10 to-purple-900/10 z-[-1]" />
        </>
      )}

      <header className="sticky top-0 z-50 glass-panel border-b-0 rounded-none px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Shield className="text-cyan-400 w-8 h-8" />
          <div>
            <h1 className="text-xl font-bold tracking-widest uppercase">AI CloudGuard</h1>
            <div className="text-xs text-cyan-400 font-mono tracking-widest">Enterprise SOC Platform</div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end border-l border-white/10 pl-4">
            <div className="text-[10px] text-cyan-500/70 uppercase tracking-widest">Threats Mitigated</div>
            <div className="text-xl text-cyan-400 font-mono">{threatsMitigated.toLocaleString()}</div>
          </div>

          <button onClick={() => setAudioEnabled(!audioEnabled)} className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-md border border-white/10 hover:bg-white/5 transition">
            {audioEnabled ? <Volume2 size={14}/> : <VolumeX size={14}/>} AUDIO
          </button>
          
          <button onClick={() => setBattleMode(!battleMode)} className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-md border transition ${battleMode ? 'border-red-500 text-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-white/10 hover:bg-white/5'}`}>
            <Swords size={14}/> BATTLE: {battleMode ? 'ON' : 'OFF'}
          </button>

          <button onClick={() => setExecMode(!execMode)} className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-md border border-white/10 hover:bg-white/5 transition">
            <Eye size={14}/> EXEC MODE
          </button>
        </div>
      </header>

      <div className="w-full bg-red-950/40 border-b border-red-500/20 text-[10px] text-red-400 font-mono py-1 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          [INTEL] Leaked DB found in Russian Forum | [ALERT] Zero-day exploit spotted targeting Nginx | [WARNING] Increased Botnet activity detected in Region: EU-WEST | [SYSTEM] Defender protocols fully engaged...
        </div>
      </div>

      <main className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-[1920px] mx-auto h-[calc(100vh-60px)] overflow-y-auto overflow-x-hidden">
        
        <div className="col-span-3 flex flex-col gap-2 h-full">
          <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} className="glass-panel p-4 flex-[2]">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 mb-4 text-cyan-500/80"><Activity size={12} className="text-cyan-400"/> Live Observability</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] text-cyan-400 font-mono mb-1">
                  <span>CPU Usage</span><span>{cpuData.length ? cpuData[cpuData.length-1].value.toFixed(0) : 0}%</span>
                </div>
                <div className="h-16 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cpuData} margin={{top:0, right:0, left:0, bottom:0}}>
                      <defs>
                        <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={1} fillOpacity={1} fill="url(#cpuGrad)" isAnimationActive={false}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-[10px] text-purple-400 font-mono mb-1">
                  <span>Memory</span><span>{memData.length ? memData[memData.length-1].value.toFixed(0) : 0}%</span>
                </div>
                <div className="h-16 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={memData} margin={{top:0, right:0, left:0, bottom:0}}>
                      <defs>
                        <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={1} fillOpacity={1} fill="url(#memGrad)" isAnimationActive={false}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="flex-[3] overflow-hidden">
            <PacketStream />
          </div>

          <div className="flex-[2] overflow-hidden">
            <CICDScanner onDeploy={(commit) => {
              addLog(`CI/CD Deployed Commit: ${commit.id}`, 'DEVOPS', 'INFO');
            }} />
          </div>
        </div>

        <div className="col-span-6 flex flex-col gap-2 h-full">
          <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="glass-panel flex-1 relative flex items-center justify-center p-0">
            <h2 className="absolute top-4 left-4 z-10 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-cyan-500/80"><Network size={12} className="text-cyan-400"/> Global Threat Matrix</h2>
            <GlobalThreatMap attacks={mapAttacks} />
          </motion.div>

          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="glass-panel p-2 h-48 flex flex-col">
            <div className="flex justify-between items-center mb-2 px-2">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-cyan-500/80"><Cpu size={12} className="text-cyan-400"/> SOC Terminal</h2>
              <button onClick={exportCSV} className="text-[9px] bg-cyan-900/40 hover:bg-cyan-900/60 text-cyan-300 px-2 py-1 rounded border border-cyan-500/30 font-mono tracking-widest uppercase transition">Export CSV</button>
            </div>
            <div className="flex-1 bg-black/60 rounded border border-white/5 p-3 overflow-y-auto font-mono text-[10px] space-y-1">
              {logs.map((log) => (
                <div key={log.id} className={`${log.level === 'CRITICAL' ? 'text-red-400 font-bold' : log.level === 'WARN' ? 'text-orange-400' : 'text-cyan-400'}`}>
                  <span className="text-slate-500">[{new Date(log.id).toLocaleTimeString()}]</span> <span className="text-slate-400">[{log.tag}]</span> {log.msg}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="col-span-3 flex flex-col gap-2 h-full">
          <AIPanel attacks={mapAttacks} defcon={defcon} />

          <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="glass-panel p-4 flex-[2] relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 text-cyan-500/80"><Database size={12} className="text-cyan-400"/> Infrastructure</h2>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest ${defcon === 1 ? 'border-red-500 text-red-500 bg-red-500/10 glitch-text' : 'border-green-500/50 text-green-500 bg-green-500/10'}`}>
                DEFCON {defcon}
              </span>
            </div>
            
            <div className="flex flex-col items-center gap-4 py-2 relative">
              <motion.div drag dragConstraints={{ left: -30, right: 30, top: -30, bottom: 30 }} className="cursor-grab active:cursor-grabbing px-4 py-1.5 border border-cyan-500/30 rounded bg-cyan-500/10 text-cyan-400 font-mono text-[9px] shadow-[0_0_10px_rgba(34,211,238,0.2)]">Load Balancer</motion.div>
              <div className="flex gap-2">
                <motion.div drag dragConstraints={{ left: -30, right: 30, top: -30, bottom: 30 }} className="cursor-grab active:cursor-grabbing px-4 py-1.5 border border-white/10 rounded bg-white/5 font-mono text-[9px]">Gateway-E</motion.div>
                <motion.div drag dragConstraints={{ left: -30, right: 30, top: -30, bottom: 30 }} className="cursor-grab active:cursor-grabbing px-4 py-1.5 border border-white/10 rounded bg-white/5 font-mono text-[9px]">Gateway-W</motion.div>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                <AnimatePresence>
                  {infraNodes.map(n => (
                    <motion.div drag dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }} key={n} layout initial={{scale:0, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0, opacity:0}} className="cursor-grab active:cursor-grabbing px-2 py-1 border border-white/10 rounded bg-white/5 font-mono text-[9px]">
                      K8s-{n.toString().slice(-4)}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="glass-panel p-4 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 mb-4 text-red-500/80"><Swords size={12} className="text-red-500"/> Red Team Console</h2>
            
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => simulateAttack('DDoS')} className="p-2 border border-red-500/50 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition text-[10px] font-bold tracking-widest uppercase">🚨 DDoS</button>
              <button onClick={() => simulateAttack('Bot Swarm')} className="p-2 border border-purple-500/50 rounded bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition text-[10px] font-bold tracking-widest uppercase">🕷️ Bot Swarm</button>
              <button onClick={() => simulateAttack('Mem Exploit')} className="p-2 border border-yellow-500/50 rounded bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition text-[10px] font-bold tracking-widest uppercase">⚠️ Exploit</button>
              
              <button onClick={() => { 
                addLog('Manual Intervention: Pod Terminated', 'SYS', 'WARN'); 
                setInfraNodes(prev => prev.slice(1));
              }} className="p-2 border border-red-500/50 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition text-[10px] font-bold tracking-widest uppercase">☠️ Kill Pod</button>
              
              <button onClick={() => { 
                setCinematicAction("AI PROTOCOL ENGAGED: NEUTRALIZING THREAT");
                setInfraNodes(prev => [...prev, Date.now()]); 
                addLog('AI Auto-Heal provisioned pod.', 'AI', 'INFO'); 
                handleBackendAction('scale_server'); 
                setTimeout(() => setCinematicAction(null), 2500);
              }} className="col-span-2 p-2 mt-2 border border-cyan-500/50 rounded bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition text-[10px] font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(34,211,238,0.2)]">🤖 Engage Auto-Heal</button>
            </div>
          </motion.div>

          <div className="flex-[2] overflow-hidden">
            <AgentSwarm attacks={mapAttacks} />
          </div>
        </div>

        {/* Incident Timeline Replay */}
        <div className="mt-4 glass-panel p-3 flex flex-col gap-2 relative overflow-hidden flex-shrink-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-500/80 mb-1">
            Incident Timeline Replay
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {logs.slice(-12).map((log, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`flex-shrink-0 min-w-[220px] max-w-[300px] border p-2 rounded flex flex-col gap-1 ${log.system === 'AI' || log.system === 'AI-RL' ? 'bg-purple-900/20 border-purple-500/30' : log.level === 'WARN' || log.level === 'CRIT' ? 'bg-red-900/20 border-red-500/30' : 'bg-cyan-900/10 border-cyan-500/20'}`}>
                <span className="text-[8px] text-white/50">{log.time} [{log.system}]</span>
                <span className={`text-[10px] truncate ${log.level === 'WARN' || log.level === 'CRIT' ? 'text-red-400' : 'text-slate-300'}`}>{log.msg}</span>
              </motion.div>
            ))}
          </div>
        </div>

      </main>

      {/* Floating AI Chat Assistant */}
      <AIChatBot />

      {/* Cinematic Overlays */}
      <AnimatePresence>
        {cinematicAction && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              animate={{ opacity: [0, 1, 0, 1, 1], x: [-15, 15, -15, 15, 0] }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-6xl font-black text-cyan-400 uppercase tracking-[0.1em] text-center px-4"
              style={{ textShadow: '0 0 50px rgba(34,211,238,0.8)' }}
            >
              {cinematicAction}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
