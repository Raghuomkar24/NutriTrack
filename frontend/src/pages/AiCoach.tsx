import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Bot, User, ArrowRight } from 'lucide-react';
import api from '../api';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const AiCoach: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Hi there! I am Ria, your AI Nutrition Coach. Ask me what to eat, request a high protein meal plan, or have me analyze today\'s progress. What is on your mind?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "What should I eat to lose weight?",
    "Suggest a high protein breakfast.",
    "Analyze my today's logs.",
    "Give me healthy snack alternatives."
  ];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    // User message
    const userMsg: Message = { sender: 'user', text: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/api/ai/chat', { message: textToSend });
      const aiMsg: Message = { sender: 'ai', text: res.data.response, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = { 
        sender: 'ai', 
        text: 'Sorry, I had trouble connecting to the network. Please check your API keys or connection and try again.', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100dvh-8rem)] pb-4 relative">
      <div className="mb-4">
        <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <span>Ria - AI Coach</span>
          <Sparkles className="text-primary-500 animate-pulse" size={24} />
        </h2>
        <p className="text-slate-500 text-sm font-semibold">Personalized meal recommendations and nutritional advice guided by your goals.</p>
      </div>

      {/* Chat Display Window */}
      <div className="flex-1 glass bg-white/20 rounded-3xl p-6 flex flex-col justify-between overflow-hidden">
        
        {/* Messages Listing */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin">
          {messages.map((m, idx) => {
            const isAi = m.sender === 'ai';
            return (
              <div 
                key={idx} 
                className={`flex gap-3 max-w-[85%] ${isAi ? 'self-start mr-auto' : 'self-end ml-auto flex-row-reverse'}`}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isAi ? 'bg-primary-50 border border-primary-200 text-primary-600 shadow-sm' : 'bg-slate-100 border border-slate-300 text-slate-600 shadow-sm'}`}>
                  {isAi ? <Bot size={16} /> : <User size={16} />}
                </div>

                {/* Message bubble */}
                <div className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${isAi ? 'bg-white/60 border border-white/40 text-slate-800 shadow-sm font-semibold' : 'bg-primary-600 text-white font-semibold shadow-md shadow-primary-600/10'}`}>
                  {m.text}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-[80%] mr-auto">
              <div className="w-8 h-8 rounded-xl bg-primary-50 border border-primary-200 text-primary-600 flex items-center justify-center shadow-sm">
                <Bot size={16} />
              </div>
              <div className="p-4 bg-white/60 border border-white/40 rounded-2xl flex items-center gap-1.5 shadow-sm">
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}

          <div ref={chatEndRef}></div>
        </div>

        {/* Quick Prompts Suggestions */}
        {messages.length === 1 && (
          <div className="pb-4 space-y-2">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Suggested Questions</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(p)}
                  className="px-3.5 py-2 bg-white/50 border border-primary-100 hover:border-primary-350 hover:bg-white/85 text-xs rounded-xl text-slate-750 font-bold transition flex items-center gap-1.5 shadow-sm hover:scale-102 hover:shadow"
                >
                  <span>{p}</span>
                  <ArrowRight size={12} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form Input */}
        <form onSubmit={handleFormSubmit} className="flex gap-3 pt-3 border-t border-white/30">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl glass-input text-xs text-slate-800 font-bold placeholder-slate-400"
            placeholder="Type your question for Coach..."
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl flex items-center justify-center transition shadow-md shadow-primary-600/10"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiCoach;


