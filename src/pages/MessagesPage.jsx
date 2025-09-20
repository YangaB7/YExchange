import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Search, ArrowLeft, Clock } from 'lucide-react';
import { chatService, getCurrentUser } from '../lib/supabaseClient';

const MessagesPage = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    loadConversations();
    
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadConversations = async () => {
    try {
      const result = await chatService.getUserConversations(currentUser.netId);
      if (result.success) {
        setConversations(result.conversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (conversationId) => {
    navigate(`/messages/${conversationId}`);
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return conv.otherUser?.name?.toLowerCase().includes(searchLower);
  });

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getUnreadCount = (conv) => {
    if (conv.user1_id === currentUser.netId) {
      return conv.user1_unread_count || 0;
    } else {
      return conv.user2_unread_count || 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/search')}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
            </div>
            <button 
              onClick={() => navigate('/search')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium transition-colors"
            >
              Find Partners
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Convos List */}
        {filteredConversations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <MessageCircle size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No conversations yet</h3>
            <p className="text-slate-600 mb-6">Start connecting with other Yalies to exchange skills!</p>
            <button
              onClick={() => navigate('/search')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
            >
              Browse Profiles
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {filteredConversations.map((conv, index) => {
              const unreadCount = getUnreadCount(conv);
              const isUnread = unreadCount > 0;
              
              return (
                <div
                  key={conv.id}
                  onClick={() => handleConversationClick(conv.id)}
                  className={`flex items-center p-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                    index !== filteredConversations.length - 1 ? 'border-b border-slate-100' : ''
                  }`}
                >
                  <div className="relative mr-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                      {conv.otherUser?.avatar_initials || conv.otherUser?.name?.split(' ').map(n => n[0]).join('') || '?'}
                    </div>
                    {isUnread && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold text-slate-900 truncate ${isUnread ? 'font-bold' : ''}`}>
                        {conv.otherUser?.name || 'Unknown User'}
                      </h3>
                      <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                        {formatTime(conv.last_message_time)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${isUnread ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                        {conv.last_message_sender === currentUser.netId && 'You: '}
                        {conv.last_message || 'Start a conversation...'}
                      </p>
                    </div>
                    {conv.otherUser && (
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-slate-500">
                          {conv.otherUser.year} • {conv.otherUser.college}
                        </span>
                        {conv.otherUser.canTeach?.length > 0 && (
                          <span className="text-xs text-emerald-600">
                            Teaches: {conv.otherUser.canTeach[0].skill}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;