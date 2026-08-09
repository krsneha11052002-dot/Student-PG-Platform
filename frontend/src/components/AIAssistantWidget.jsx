import React, { useState } from 'react';
import { Sparkles, MessageSquare, X, Send, Bot, User, ArrowRight, Shield } from 'lucide-react';

export const AIAssistantWidget = ({ onSelectPG }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hi there! I am StaySmart AI 🤖. Ask me to find PGs near North Campus, check roommate matching rules, or budget suggestions!'
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedPGs, setSuggestedPGs] = useState([]);

  const handleSend = async (customText) => {
    const textToSend = customText || inputMsg;
    if (!textToSend.trim()) return;

    const userMessage = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    if (!customText) setInputMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend })
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
        if (data.suggestedPGs && data.suggestedPGs.length > 0) {
          setSuggestedPGs(data.suggestedPGs);
        }
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `🌟 AI Recommendation: I found 2 verified PGs near university hubs with biometric safety and high-speed Wi-Fi! Explore UrbanNest PG (₹12,500/mo) or Starlight Girls Residency (₹9,800/mo).`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 text-white font-bold text-xs shadow-xl shadow-indigo-500/30 hover:scale-105 transition-all duration-300"
        >
          <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
          <span>Ask StaySmart AI</span>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </button>
      ) : (
        <div className="w-80 sm:w-96 h-[480px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-extrabold text-xs flex items-center gap-1">
                  StaySmart AI Advisor <Sparkles className="w-3 h-3 text-amber-300" />
                </div>
                <span className="text-[10px] text-indigo-100 font-medium">Smart Student Housing Engine</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-white/20 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-50/50 dark:bg-slate-950/50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
                {m.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-slate-400 text-xs py-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                <span>AI analyzing accommodations & safety scores...</span>
              </div>
            )}

            {/* AI Suggested PG Card inside widget */}
            {suggestedPGs.length > 0 && (
              <div className="mt-2 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">AI Recommended Choice:</span>
                {suggestedPGs.map((pg, idx) => (
                  <div 
                    key={idx}
                    onClick={() => onSelectPG && onSelectPG(pg)}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900/50 hover:border-indigo-500 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{pg.title}</div>
                      <div className="text-[10px] text-slate-500">₹{pg.pricePerMonth}/mo • {pg.gender}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Prompt Pills */}
          <div className="px-3 py-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => handleSend('Find PGs under ₹10,000 near campus')}
              className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 px-2.5 py-1 rounded-full whitespace-nowrap border border-indigo-200 dark:border-indigo-900/50"
            >
              💰 Under ₹10k PGs
            </button>
            <button
              onClick={() => handleSend('Show Girls Only hostels with Biometric security')}
              className="text-[10px] bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-300 px-2.5 py-1 rounded-full whitespace-nowrap border border-pink-200 dark:border-pink-900/50"
            >
              🔒 Girls Hostel
            </button>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask AI anything about PGs or roommates..."
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};
