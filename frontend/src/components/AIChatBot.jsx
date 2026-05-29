import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Settings, Sparkles } from 'lucide-react';
import { askHuggingFace } from '../lib/huggingface.js';

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [hfToken, setHfToken] = useState(localStorage.getItem('hfToken') || '');
  
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', text: 'CloudGuard AI Security Assistant online. How can I help you secure your infrastructure today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSaveToken = () => {
    localStorage.setItem('hfToken', hfToken);
    setShowConfig(false);
    setMessages(prev => [...prev, { id: Date.now(), role: 'sys', text: 'Hugging Face Token saved securely in local storage.' }]);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: userMsg }]);
    
    setIsTyping(true);
    
    const aiResponse = await askHuggingFace(userMsg, hfToken);
    
    setIsTyping(false);
    setMessages(prev => [...prev, { id: Date.now(), role: 'ai', text: aiResponse }]);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-cyan-600/20 border border-cyan-400 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] z-50 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <Bot size={24} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-[380px] max-w-[90vw] p-4 z-50 flex flex-col overflow-hidden glass-panel shadow-2xl shadow-cyan-900/20 h-[80vh] max-h-[550px]"
          >
            {/* Header */}
            <div className="p-3 border-b border-white/10 flex justify-between items-center bg-cyan-950/40">
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-cyan-400" />
                <span className="font-bold text-sm tracking-widest text-cyan-400 uppercase">AI Assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowConfig(!showConfig)} className="text-slate-400 hover:text-white transition">
                  <Settings size={16} />
                </button>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-red-400 transition">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Config Overlay */}
            {showConfig && (
              <div className="absolute inset-0 top-12 bg-[#02040a]/95 backdrop-blur-md z-10 p-4 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-200">Hugging Face API Config</h3>
                <p className="text-xs text-slate-400">Enter your token to enable real Mistral-7B inference.</p>
                <input 
                  type="password" 
                  value={hfToken} 
                  onChange={(e) => setHfToken(e.target.value)} 
                  placeholder="hf_..." 
                  className="bg-black/50 border border-white/10 rounded p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
                <button onClick={handleSaveToken} className="bg-cyan-500/20 text-cyan-400 border border-cyan-400 rounded py-2 text-xs font-bold hover:bg-cyan-500/30">
                  Save & Connect
                </button>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-3 font-mono text-[11px]">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-2 rounded-lg ${
                    m.role === 'user' ? 'bg-slate-700 text-white' : 
                    m.role === 'sys' ? 'bg-amber-900/30 text-amber-400 border border-amber-500/30' : 
                    'bg-cyan-900/30 text-cyan-100 border border-cyan-500/30'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-2 rounded-lg bg-cyan-900/30 text-cyan-400 border border-cyan-500/30 flex items-center gap-2">
                    <Sparkles size={12} className="animate-pulse"/> Processing...
                  </div>
                </div>
              )}
              <div ref={endOfMessagesRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-black/40 flex gap-2">
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI something..." 
                className="flex-grow bg-transparent border-none text-xs text-white focus:outline-none font-mono"
              />
              <button type="submit" disabled={isTyping} className="text-cyan-400 hover:text-cyan-300 disabled:opacity-50">
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
