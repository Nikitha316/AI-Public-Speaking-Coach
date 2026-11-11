import React, { useEffect, useState, useRef } from 'react';
import { Bot, Send, User, Sparkles, HelpCircle } from 'lucide-react';
import { ChatMessage } from '../types';
import { api } from '../services/api';

export const AICoachChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    api.getChatHistory()
      .then(setMessages)
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const message = textToSend || input.trim();
    if (!message || loading) return;

    setInput('');
    const tempUserMsg: ChatMessage = { sender: 'user', message };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await api.sendChatMessage(message);
      const coachMsg: ChatMessage = { sender: 'coach', message: res.coach_response };
      setMessages((prev) => [...prev, coachMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "How can I reduce filler words?",
    "Give me a 3-minute practice topic.",
    "Evaluate my introduction framework.",
    "Give me a mock interview question.",
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-16">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Bot className="w-6 h-6 text-brand-500" /> AI Practice Assistant & Speaking Coach
        </h1>
        <p className="text-xs text-slate-400">Ask questions, request custom practice prompts, or evaluate specific speech segments</p>
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0">
          <HelpCircle className="w-3.5 h-3.5" /> Quick Prompts:
        </span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-3 py-1.5 rounded-full bg-dark-800 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium whitespace-nowrap transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Box */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 min-h-[420px] max-h-[500px] flex flex-col justify-between">
        
        {/* Messages Scroll Area */}
        <div className="space-y-4 overflow-y-auto pr-2 flex-1">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  m.sender === 'user' ? 'bg-brand-500 text-white' : 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed max-w-[80%] ${
                  m.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-none'
                    : 'bg-dark-900 text-slate-200 border border-slate-800 rounded-tl-none font-medium'
                }`}
              >
                {m.message}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-brand-400 italic">
              <Sparkles className="w-4 h-4 animate-spin" /> AI Coach is generating response...
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask your AI coach anything about filler words, pace, or presentation structure..."
            className="flex-1 px-4 py-3 rounded-xl bg-dark-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" /> Send
          </button>
        </div>
      </div>
    </div>
  );
};
