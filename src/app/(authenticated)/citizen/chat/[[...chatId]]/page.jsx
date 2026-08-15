'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { databases } from '@/lib/appwrite-client';
import { ID, Query } from 'appwrite';
import {
  ArrowLeft, Send, Brain, Bot, User, Sparkles, HelpCircle,
  Plus, Menu, Trash2, MessageSquare, Sun, Moon
} from 'lucide-react';
import axios from 'axios';

const SUGGESTIONS = [
  'Where should I file a road maintenance complaint?',
  'What documents are required to file a water leakage complaint?',
  'How long does a sanitation issue take to resolve?',
  'How do I verify my citizen identity profile?'
];

const generateSessionId = () => `sess_${Math.random().toString(36).substring(2, 10)}`;
const generateChatId = () => `CHT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

export default function CosmosChatPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  
  // Extract chatId from catch-all router parameter
  const routeChatId = params?.chatId?.[0];

  const [allMessages, setAllMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const messagesEndRef = useRef(null);
  const hasFetched = useRef(false);
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

  // 1. Fetch all chat logs on mount
  useEffect(() => {
    const fetchChatLogs = async () => {
      if (!user || hasFetched.current) return;
      hasFetched.current = true;
      try {
        const res = await databases.listDocuments(databaseId, 'ChatHistory', [
          Query.equal('id_user', user.$id),
          Query.orderAsc('timestamp'),
          Query.limit(100)
        ]);

        const mapped = res.documents.map(d => ({
          session_id: d.session_id,
          sender: d.sender,
          message: d.message,
          timestamp: d.timestamp,
          $id: d.$id
        }));
        setAllMessages(mapped);

        // Redirect to latest session or new session if URL has no session parameter
        if (!routeChatId) {
          if (mapped.length > 0) {
            const latestSess = mapped[mapped.length - 1].session_id;
            router.replace(`/citizen/chat/${latestSess}`);
          } else {
            router.replace(`/citizen/chat/${generateSessionId()}`);
          }
        }
      } catch (err) {
        console.error('Error fetching chat history:', err.message);
        if (!routeChatId) {
          router.replace(`/citizen/chat/${generateSessionId()}`);
        }
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchChatLogs();
  }, [databaseId, user, routeChatId, router]);

  // 2. Redirect fallback for empty parameter when history is already loaded
  useEffect(() => {
    if (!isLoadingHistory && !routeChatId) {
      if (allMessages.length > 0) {
        const latestSess = allMessages[allMessages.length - 1].session_id;
        router.replace(`/citizen/chat/${latestSess}`);
      } else {
        router.replace(`/citizen/chat/${generateSessionId()}`);
      }
    }
  }, [routeChatId, allMessages, isLoadingHistory, router]);

  // 3. Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages, routeChatId]);

  // Filter messages for current active session
  const activeMessages = routeChatId ? allMessages.filter(m => m.session_id === routeChatId) : [];

  // Group messages to extract active sessions
  const getSessionsList = () => {
    const sessionsMap = {};
    allMessages.forEach(m => {
      if (!sessionsMap[m.session_id]) {
        sessionsMap[m.session_id] = {
          id: m.session_id,
          title: m.sender === 'user' ? m.message : '',
          timestamp: m.timestamp
        };
      } else if (!sessionsMap[m.session_id].title && m.sender === 'user') {
        sessionsMap[m.session_id].title = m.message;
      }
    });
    return Object.values(sessionsMap).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const sessions = getSessionsList();

  const handleNewChat = () => {
    router.push(`/citizen/chat/${generateSessionId()}`);
  };

  const handleDeleteSession = async (sessId) => {
    if (!confirm('Are you sure you want to delete this chat history?')) return;
    try {
      // Find all local document IDs for this session
      const docsToDelete = allMessages.filter(m => m.session_id === sessId);
      
      // Delete documents from database
      for (const doc of docsToDelete) {
        if (doc.$id) {
          await databases.deleteDocument(databaseId, 'ChatHistory', doc.$id);
        }
      }

      // Update local state
      setAllMessages(prev => prev.filter(m => m.session_id !== sessId));
      
      if (routeChatId === sessId) {
        router.replace('/citizen/chat');
      }
    } catch (err) {
      console.error('Error deleting chat session:', err.message);
      alert('Failed to delete chat session.');
    }
  };

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim() || isSending || !routeChatId) return;
    const userMsgText = textToSend;
    setInputText('');
    setIsSending(true);

    const timestamp = new Date().toISOString();
    const newUserMsg = {
      session_id: routeChatId,
      sender: 'user',
      message: userMsgText,
      timestamp
    };
    
    // Add user message locally
    setAllMessages(prev => [...prev, newUserMsg]);

    try {
      // 1. Save user message to Appwrite
      const userDoc = await databases.createDocument(databaseId, 'ChatHistory', ID.unique(), {
        chat_id: generateChatId(),
        id_user: user.$id,
        session_id: routeChatId,
        sender: 'user',
        message: userMsgText,
        timestamp
      });
      
      // eslint-disable-next-line react-hooks/immutability
      newUserMsg.$id = userDoc.$id;

      // 2. Query Next.js API Proxy -> FastAPI AI Server
      // We pass the last 5 messages in this session for context
      const chatHistoryForAI = activeMessages.slice(-5).map(m => ({
        sender: m.sender,
        message: m.message
      }));

      const response = await axios.post('/api/ai/chat', {
        history: chatHistoryForAI,
        new_message: userMsgText
      });

      const aiResponseText = response.data.response;
      const aiTimestamp = new Date().toISOString();
      const newAiMsg = {
        session_id: routeChatId,
        sender: 'ai',
        message: aiResponseText,
        timestamp: aiTimestamp
      };

      // 3. Save AI message to Appwrite
      const aiDoc = await databases.createDocument(databaseId, 'ChatHistory', ID.unique(), {
        chat_id: generateChatId(),
        id_user: user.$id,
        session_id: routeChatId,
        sender: 'ai',
        message: aiResponseText,
        timestamp: aiTimestamp
      });
      
      newAiMsg.$id = aiDoc.$id;

      // Update local state
      setAllMessages(prev => [...prev, newAiMsg]);
    } catch (err) {
      console.error(err);
      setAllMessages(prev => [...prev, {
        session_id: routeChatId,
        sender: 'ai',
        message: 'I experienced a brief timeout. Please check your internet connection or repeat your message.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  return (
    <div className="h-screen bg-slate-950 text-gray-100 font-sans flex overflow-hidden">
      {/* 1. Collapsible Sidebar (Gemini Style) */}
      <aside
        className={`bg-slate-900 border-r border-white/5 flex flex-col justify-between transition-all duration-300 ${
          isSidebarOpen ? 'w-68 p-4' : 'w-0 overflow-hidden p-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-gray-300 hover:text-white font-bold text-xs py-3 px-4 rounded-xl border border-white/5 transition-all w-full cursor-pointer mb-6"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            New Chat
          </button>

          {/* Recent list */}
          <div className="flex-1 flex flex-col min-h-0">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 px-1 block">
              Recent Activity
            </span>

            {isLoadingHistory ? (
              <div className="text-[10px] text-gray-600 font-bold px-1 py-4">
                Loading history...
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-[10px] text-gray-600 font-bold px-1 py-4">
                No recent chats
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className={`flex items-center justify-between group rounded-xl px-3 py-2.5 cursor-pointer border transition-all ${
                      routeChatId === s.id
                        ? 'bg-blue-600/10 border-blue-500/20 text-blue-400'
                        : 'bg-transparent border-transparent hover:bg-slate-800/50 text-gray-400 hover:text-white'
                    }`}
                    onClick={() => router.push(`/citizen/chat/${s.id}`)}
                  >
                    <div className="flex items-center gap-2 truncate flex-1 pr-1">
                      <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-xs font-semibold truncate">
                        {s.title || 'Untitled conversation'}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(s.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-opacity p-0.5 flex-shrink-0 cursor-pointer"
                      title="Delete Conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 2. Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950 relative h-full">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Floating Header */}
        <header className="h-16 border-b border-white/5 px-6 flex items-center justify-between bg-slate-950/70 backdrop-blur-md z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-900 rounded-xl transition-colors cursor-pointer text-gray-400 hover:text-white"
              title="Toggle Sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white block leading-none mb-0.5">Cosmos AI</span>
              <span className="text-[8px] text-blue-400 font-bold block uppercase tracking-wider">Smart Assistant</span>
            </div>
          </div>

          <div className="w-20 flex justify-end" />
        </header>

        {/* Chat Stream or Welcome Grid */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar min-h-0">
          {activeMessages.length === 0 ? (
            /* Gemini Welcome Screen */
            <div className="max-w-2xl mx-auto py-16 px-4 space-y-8 flex flex-col justify-center min-h-[70vh]">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 leading-tight">
                  Hello, {user?.name ? user.name.split(' ')[0] : 'Citizen'}
                </h1>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-500 leading-tight">
                  How can I help you today?
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                {SUGGESTIONS.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSendMessage(s)}
                    className="bg-slate-900/40 border border-white/5 hover:border-blue-500/20 p-5 rounded-2xl cursor-pointer hover:bg-slate-900/80 transition-all flex flex-col justify-between h-28 group"
                  >
                    <p className="text-xs text-gray-300 group-hover:text-white leading-relaxed font-semibold">
                      {s}
                    </p>
                    <div className="self-end h-8 w-8 bg-slate-950 rounded-full flex items-center justify-center border border-white/5 group-hover:border-blue-500/30 transition-all">
                      <Sparkles className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Messages Stream */
            <div className="max-w-3xl mx-auto divide-y divide-white/5">
              {activeMessages.map((m, idx) => (
                <div key={idx} className="py-6 flex gap-4">
                  {/* Avatar */}
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 border ${
                    m.sender === 'user' ? 'bg-blue-600 border-blue-500/20' : 'bg-slate-900 border-white/5'
                  }`}>
                    {m.sender === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Brain className="w-4 h-4 text-blue-400" />
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 space-y-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                      {m.sender === 'user' ? 'You' : 'Cosmos AI'}
                    </span>
                    <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap font-medium">
                      {m.message}
                    </div>
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="py-6 flex gap-4 animate-pulse">
                  {/* Avatar */}
                  <div className="h-8 w-8 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4 text-blue-400" />
                  </div>

                  {/* Body Content Shimmer */}
                  <div className="flex-1 space-y-2.5 max-w-[85%]">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1">
                      Cosmos AI
                    </span>
                    <div className="space-y-2 pt-1">
                      <div className="h-3 bg-blue-500/10 rounded-full w-[45%] animate-pulse" />
                      <div className="h-3 bg-blue-500/5 rounded-full w-[80%] animate-pulse" />
                      <div className="h-3 bg-blue-500/5 rounded-full w-[65%] animate-pulse" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Footer Area */}
        <footer className="p-6 bg-slate-950 flex-shrink-0 z-10 border-t border-white/5">
          <div className="max-w-3xl mx-auto space-y-3">
            {/* Input Bar */}
            <form onSubmit={handleFormSubmit} className="relative flex items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask Cosmos about department listings, documents needed..."
                className="w-full text-xs bg-slate-900 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/40 transition-colors focus:ring-1 focus:ring-blue-500/10"
                disabled={isSending}
                required
              />
              <button
                type="submit"
                disabled={isSending || !inputText.trim()}
                className="absolute right-2.5 p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-900 text-white rounded-xl transition-all shadow-md shadow-blue-500/15 cursor-pointer disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            
            {/* Disclaimer */}
            <p className="text-[10px] text-gray-600 text-center font-medium">
              Cosmos AI can make mistakes. Consider checking important municipal information.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
