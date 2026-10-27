'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Bot,
  Send,
  X,
  Sparkles,
  Phone,
  ArrowRight,
  ShieldAlert,
  Mic,
  MessageSquare,
  HelpCircle,
  Minimize2,
  Maximize2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  suggestedLinks?: { label: string; href: string }[];
  timestamp: string;
}

export default function AiCivicChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Namaskar! I am your CityNova AI Civic Copilot for Ponda Municipal Council (PMC), Goa.
Ask me anything about:
• Statutory repair deadlines (SLA) under Goa Right to Public Services Act 2013
• How to report potholes, water supply bursts, or broken streetlights
• Ward Nodal Officers & emergency contact numbers
• How to track or dispute a grievance with before/after photo proof`,
      suggestedLinks: [
        { label: '+ Report New Problem', href: '/report' },
        { label: 'Ward Directory', href: '/#ward-directory' },
        { label: 'Citizen Rights Charter', href: '/#citizens-rights' },
      ],
      timestamp: '24x7 Helpdesk',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Listen for global open event (e.g. from navbar or links)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open_ai_civic_chat', handleOpen);
    return () => window.removeEventListener('open_ai_civic_chat', handleOpen);
  }, []);

  const messageCounterRef = useRef(0);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    messageCounterRef.current += 1;
    const userMsg: ChatMessage = {
      id: `user-${messageCounterRef.current}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: '24x7 Helpdesk',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSend.trim() }),
      });
      const data = await res.json();

      messageCounterRef.current += 1;
      const aiMsg: ChatMessage = {
        id: `assistant-${messageCounterRef.current}`,
        sender: 'assistant',
        text: data.answer || 'Thank you for your enquiry. For urgent municipal dispatch, please call Toll-Free 1913.',
        suggestedLinks: data.suggestedLinks || [],
        timestamp: '24x7 Helpdesk',
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chatbot error:', err);
      messageCounterRef.current += 1;
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${messageCounterRef.current}`,
          sender: 'assistant',
          text: 'Apologies, our municipal server had a hiccup. For immediate help, call our 24x7 Control Room on 1913.',
          timestamp: '24x7 Helpdesk',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    '🛣️ What is the SLA deadline for potholes?',
    '💧 Khandepar water pipe burst procedure',
    '💡 Streetlights not working on hospital road',
    '🏛️ Who is the Nodal Officer for Ward 2 (Tisk)?',
    '⚖️ What are my rights if SLA is breached?',
  ];

  return (
    <>
      {/* Floating Action Button (Bottom-Right) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-white/60"
            aria-label="Open AI Civic Assistant"
          >
            <div className="relative">
              <Bot className="w-5 h-5 text-orange-400 group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
            </div>
            <div className="text-left">
              <span className="text-xs font-black tracking-tight block">
                CityNova Copilot
              </span>
              <span className="text-[10px] text-blue-200 block leading-none">
                AI Civic Sahayak (24x7)
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Interactive Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-full sm:w-[420px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border-2 border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Indian Tricolor Hairline Accent */}
          <div className="tricolor-bar w-full shrink-0" />

          {/* Modal Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-600/20 border border-orange-400/40 flex items-center justify-center text-orange-400 shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-white">
                    CityNova AI Copilot
                  </h3>
                  <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded-full uppercase">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">
                  Ponda Municipal Council &bull; Goa Right to Public Services
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg cursor-pointer transition-colors"
                title="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap font-sans ${
                    m.sender === 'user'
                      ? 'bg-blue-700 text-white rounded-br-xs shadow-xs font-medium'
                      : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs shadow-xs'
                  }`}
                >
                  {m.text}

                  {/* Suggested links inside assistant response */}
                  {m.suggestedLinks && m.suggestedLinks.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {m.suggestedLinks.map((link, idx) => (
                        <Link
                          key={idx}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold border border-blue-200 transition-colors"
                        >
                          <span>{link.label}</span>
                          <ArrowRight className="w-3 h-3 text-blue-700" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">
                  {m.timestamp}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-500 bg-white p-3 rounded-2xl border border-slate-200 w-fit">
                <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
                <span className="text-[11px] font-semibold">Consulting Municipal Knowledge Base...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Suggestion Pills */}
          <div className="p-2.5 bg-slate-100/90 border-t border-slate-200 shrink-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 px-1">
              Common Questions &bull; त्वरित प्रश्न:
            </span>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {sampleQuestions.map((sq, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(sq.slice(3))}
                  className="shrink-0 px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-blue-500 text-[11px] font-semibold text-slate-700 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  {sq}
                </button>
              ))}
            </div>
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask in English or Hindi (e.g. 'Pothole SLA deadline')..."
              className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="p-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white rounded-xl shadow-xs transition-transform hover:scale-105 cursor-pointer"
              title="Send question"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
