import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Send, Plus, User, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const MessagesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isUrdu = i18n.language === 'ur';

  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [teachers, setTeachers] = useState<any[]>([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [chatTopic, setChatTopic] = useState('');

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations/');
      const list = res.data.results || res.data;
      setConversations(list);
      if (list.length > 0 && !selectedConv) {
        setSelectedConv(list[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConversations();
    api.get('/staff/?is_teaching=true').then((res) => setTeachers(res.data.results || res.data));
  }, []);

  useEffect(() => {
    if (selectedConv) {
      api.get(`/messages/conversations/${selectedConv.id}/messages/`).then((res) => {
        setMessages(res.data);
      });
    }
  }, [selectedConv]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;
    try {
      const res = await api.post(`/messages/conversations/${selectedConv.id}/messages/`, {
        content: newMessage,
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
      fetchConversations();
    } catch (err) {
      alert('Failed to send message.');
    }
  };

  const handleStartConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/messages/conversations/', {
        participants: [selectedRecipient],
        subject: chatTopic || 'General Inquiry',
        message: newMessage,
      });
      setShowNewChatModal(false);
      setSelectedConv(res.data);
      setNewMessage('');
      fetchConversations();
    } catch (err) {
      alert('Communication permission check failed.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-emerald-400" />
            <span>{t('nav.messages')}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isUrdu 
              ? 'اساتذہ، سرپرست حضرات اور اسکول انتظامیہ کے درمیان محفوظ مراسلت' 
              : 'Secure, authenticated communication between teachers, parents, and administrative staff.'}
          </p>
        </div>

        <button
          onClick={() => setShowNewChatModal(true)}
          className="btn btn-primary text-xs py-2.5 px-4"
        >
          <Plus className="w-4 h-4" />
          <span>New Conversation</span>
        </button>
      </div>

      {/* Main Messaging Interface */}
      <div className="glass-panel overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[550px]">
        
        {/* Left: Conversation List */}
        <div className="border-e border-white/10 overflow-y-auto divide-y divide-white/5">
          <div className="p-3 bg-white/5 font-semibold text-xs text-slate-400 uppercase tracking-wider">
            Conversations
          </div>
          {conversations.length > 0 ? (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedConv(c)}
                className={`w-full text-start p-4 transition-colors flex flex-col gap-1 ${
                  selectedConv?.id === c.id ? 'bg-emerald-950/50 border-s-2 border-emerald-500' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white line-clamp-1">{c.subject || 'Conversation'}</span>
                  {c.unread_count > 0 && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1">
                  {c.last_message?.content || 'No messages yet'}
                </div>
              </button>
            ))
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">No conversations.</div>
          )}
        </div>

        {/* Right: Message Window */}
        <div className="md:col-span-2 flex flex-col justify-between h-full bg-slate-950/50">
          {selectedConv ? (
            <>
              {/* Header */}
              <div className="p-3 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
                <div>
                  <div className="text-xs font-bold text-white">{selectedConv.subject}</div>
                  <div className="text-[10px] text-emerald-400">Authenticated Channel</div>
                </div>
              </div>

              {/* Chat Log */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map((m) => {
                  const isMe = m.sender === user?.id;
                  return (
                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl p-3 text-xs ${
                          isMe
                            ? 'bg-emerald-600 text-white rounded-ee-none shadow-md'
                            : 'bg-slate-800 text-slate-200 rounded-es-none border border-white/5'
                        }`}
                      >
                        <div className="text-[10px] opacity-75 mb-1 font-semibold">
                          {isMe ? 'You' : m.sender_name || m.sender_username}
                        </div>
                        <div className="whitespace-pre-line">{m.content}</div>
                        <div className="text-[9px] opacity-60 text-end mt-1">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="input-field text-xs flex-1"
                />
                <button type="submit" className="btn btn-primary text-xs py-2 px-4">
                  <Send className="w-3.5 h-3.5 rtl-flip" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
              Select a conversation to start messaging.
            </div>
          )}
        </div>

      </div>

      {/* New Conversation Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-sm font-bold text-white">Start New Conversation</h3>
              <button onClick={() => setShowNewChatModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleStartConversation} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Select Teacher / Recipient</label>
                <select
                  required
                  value={selectedRecipient}
                  onChange={(e) => setSelectedRecipient(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select Recipient</option>
                  {teachers.map((t) => (
                    <option key={t.user} value={t.user}>
                      {t.full_name} ({t.qualification || 'Teacher'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Topic / Subject</label>
                <input
                  type="text"
                  required
                  value={chatTopic}
                  onChange={(e) => setChatTopic(e.target.value)}
                  placeholder="e.g. Student Academic Progress Inquiry"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Initial Message</label>
                <textarea
                  rows={3}
                  required
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="input-field"
                />
              </div>

              <button type="submit" className="btn btn-primary w-full py-2 mt-2">
                Send Message
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
