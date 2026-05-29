import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Fingerprint, ChevronRight, UserPlus } from 'lucide-react';
import { playAccessGranted, playTyping } from '../lib/audio.js';
import { supabase } from '../lib/supabase-db.js';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('AWAITING CLEARANCE');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = async (e, isSignup = false) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsAuthenticating(true);
    setStatus('VERIFYING BIOMETRICS & CREDENTIALS...');

    try {
      // Developer Override for Portfolio Access
      if (password.trim().toUpperCase() === 'OVERRIDE') {
        setStatus('DEVELOPER OVERRIDE ACCEPTED...');
        setTimeout(() => {
          setStatus('ACCESS GRANTED');
          playAccessGranted();
          setTimeout(() => onLogin(), 800);
        }, 1500);
        return;
      }

      let authResponse;
      if (isSignup) {
        setStatus('ENCRYPTING NEW OPERATIVE IDENTITY...');
        authResponse = await supabase.auth.signUp({ email, password });
      } else {
        authResponse = await supabase.auth.signInWithPassword({ email, password });
      }

      if (authResponse.error) throw authResponse.error;

      setStatus('ESTABLISHING SECURE CONNECTION...');
      setTimeout(() => {
        setStatus('ACCESS GRANTED');
        playAccessGranted();
        setTimeout(() => {
          onLogin();
        }, 800);
      }, 1500);

    } catch (err) {
      setStatus(`ACCESS DENIED: ${err.message.toUpperCase()}`);
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#02040a] text-slate-100 flex items-center justify-center relative overflow-hidden font-mono">
      {/* Background Grid */}
      <div className="absolute inset-0 cyber-grid opacity-30"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-purple-900/20 z-0" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-panel p-8 w-full max-w-md z-10 border border-cyan-500/30 shadow-[0_0_50px_rgba(34,211,238,0.15)] relative overflow-hidden"
      >
        {/* Scanning Line Effect */}
        {isAuthenticating && (
          <motion.div 
            initial={{ top: '-10%' }}
            animate={{ top: '110%' }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-1 bg-cyan-400/50 shadow-[0_0_20px_#22d3ee] z-20"
          />
        )}

        <div className="flex flex-col items-center mb-8">
          <motion.div 
            animate={isAuthenticating ? { rotate: 360 } : {}} 
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <Shield className="text-cyan-400 w-16 h-16 mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
          </motion.div>
          <h1 className="text-2xl font-bold tracking-widest uppercase text-white">AI CloudGuard</h1>
          <div className="text-xs text-cyan-400 font-mono tracking-widest mt-1">Global Security Operations</div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Fingerprint size={12} className="text-cyan-500"/> Operative ID
            </label>
            <input 
              type="text" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isAuthenticating}
              className="w-full bg-black/40 border border-white/10 rounded-md p-3 text-sm text-white focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(34,211,238,0.3)] transition disabled:opacity-50"
              placeholder="admin@cloudguard.io"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Lock size={12} className="text-purple-500"/> Clearance Code
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isAuthenticating}
              className="w-full bg-black/40 border border-white/10 rounded-md p-3 text-sm text-white focus:outline-none focus:border-purple-400 focus:shadow-[0_0_10px_rgba(168,85,247,0.3)] transition disabled:opacity-50"
              placeholder="Enter Code (Hint: OVERRIDE)"
            />
          </div>

          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={(e) => handleLogin(e, false)}
              disabled={isAuthenticating || !email || !password}
              className="flex-1 bg-cyan-950/50 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-900/60 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition py-3 rounded-md text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:shadow-none"
            >
              {isAuthenticating ? 'Processing...' : 'Authenticate'} <ChevronRight size={16} />
            </button>

            <button 
              type="button" 
              onClick={(e) => handleLogin(e, true)}
              disabled={isAuthenticating || !email || !password}
              title="Create New Account"
              className="px-4 bg-purple-950/30 border border-purple-500/30 text-purple-400 hover:bg-purple-900/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition rounded-md flex items-center justify-center disabled:opacity-50"
            >
              <UserPlus size={18} />
            </button>
          </div>
        </form>

        <div className={`mt-6 text-center text-[10px] uppercase tracking-widest font-bold ${status === 'ACCESS GRANTED' ? 'text-green-400' : status.includes('DENIED') ? 'text-red-400' : isAuthenticating ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`}>
          [{status}]
        </div>

        <div className="mt-4 text-center text-[9px] text-slate-500 font-mono">
          Demo Access: Type <span className="text-cyan-500 font-bold">OVERRIDE</span> in the Clearance Code to bypass authentication.
        </div>
      </motion.div>
    </div>
  );
}
