'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Bot,
  Send,
  X,
  Sparkles,
  ArrowRight,
  Mic,
  MessageSquare,
  HelpCircle,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  suggestedLinks?: { label: string; href: string }[];
  timestamp: string;
}

const CONVERSATION_STORAGE_KEY = 'citynova-enquiry-conversation';

export default function AiCivicChatbot() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [hasLoadedConversation, setHasLoadedConversation] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your CityNova Civic Enquiry Assistant for your city.
Ask me about:
- Reporting a problem and checking its status
- Reported complaints shown on the city map`,
      timestamp: 'CityNova Enquiry',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageCounterRef = useRef(0);

  useEffect(() => {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      const windowState = window as Window & { cityNovaConversationClearedOnReload?: boolean };
      if (navigation?.type === 'reload' && !windowState.cityNovaConversationClearedOnReload) {
        sessionStorage.removeItem(CONVERSATION_STORAGE_KEY);
        windowState.cityNovaConversationClearedOnReload = true;
      }
      const savedMessages = sessionStorage.getItem(CONVERSATION_STORAGE_KEY);
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.every((message) => message.id && message.sender && message.text)) {
          messageCounterRef.current = parsed.length;
          setMessages((current) => [...current.slice(0, 1), ...parsed]);
        }
      }
    } catch (error) {
      console.warn('Could not restore Enquiry conversation:', error);
    } finally {
      setHasLoadedConversation(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedConversation) return;
    try {
      sessionStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify(messages.slice(1)));
    } catch (error) {
      console.warn('Could not save Enquiry conversation:', error);
    }
  }, [messages, hasLoadedConversation]);

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

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    messageCounterRef.current += 1;
    const userMsg: ChatMessage = {
      id: `user-${messageCounterRef.current}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: 'CityNova Enquiry',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsLoading(true);

    try {
      const conversation = [...messages.slice(1), userMsg]
        .slice(-16)
        .map((message) => ({
          role: message.sender === 'assistant' ? 'assistant' : 'user',
          content: message.text,
        }));
      const res = await fetch('/api/ai/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversation, language }),
      });
      const responseText = await res.text();
      let data: { answer?: string; suggestedLinks?: ChatMessage['suggestedLinks']; error?: string };
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error('The Enquiry server returned an invalid response. Check the server terminal and try again.');
      }
      if (!res.ok) throw new Error(data.error || 'The Enquiry service could not answer just now.');

      messageCounterRef.current += 1;
      const aiMsg: ChatMessage = {
        id: `assistant-${messageCounterRef.current}`,
        sender: 'assistant',
        text: data.answer || 'Thank you for your question. Ask about reported complaints or using this website.',
        suggestedLinks: data.suggestedLinks || [],
        timestamp: 'CityNova Enquiry',
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
          text: err instanceof Error ? err.message : 'The Enquiry service could not answer just now. Please try again.',
          timestamp: 'CityNova Enquiry',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    'What complaints have been reported recently?',
    'How do I open a complaint from the map?',
    `What issues have been reported in ${user?.city?.name || 'my city'}?`,
  ];

  return (
    <>
      {/* Interactive Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-full sm:w-[420px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border-2 border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Indian Tricolor Hairline Accent */}
          <div className="tricolor-bar w-full shrink-0" />

          {/* Modal Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center shadow-xs shrink-0">
                <Image src="/citynova-icon.png" alt="CityNova" width={36} height={36} unoptimized className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">
                  CityNova Enquiry
                </h3>
                <p className="text-[10px] text-slate-300">
                  {user?.city?.name || 'Your city'} &bull; {user?.state || user?.city?.state || ''}
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
                <span className="text-[11px] font-semibold">Checking this city's complaint data...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Suggestion Pills */}
          <div className="p-2.5 bg-slate-100/90 border-t border-slate-200 shrink-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 px-1">
              Common Questions
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
              placeholder="Ask a question (e.g. 'Pothole SLA deadline')..."
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
