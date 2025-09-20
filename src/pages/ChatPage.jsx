import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, User, MapPin, Clock, Languages, Music, Calendar, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { chatService, getCurrentUser } from '../lib/supabaseClient';

const ChatPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [proposalNote, setProposalNote] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const messagesEndRef = useRef(null);
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    loadConversation();
  
    chatService.markMessagesAsRead(conversationId, currentUser.netId);

    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async () => {
    try {
      setLoading(true);
      

      const convResult = await chatService.getConversation(conversationId);
      if (convResult.success) {
        setOtherUser(convResult.otherUser);
      }

      await loadMessages();
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const result = await chatService.getMessages(conversationId);
      if (result.success) {
        setMessages(result.messages);

        chatService.markMessagesAsRead(conversationId, currentUser.netId);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;
    
    try {
      setSending(true);
      const result = await chatService.sendMessage(conversationId, currentUser.netId, newMessage.trim());
      
      if (result.success) {
        setNewMessage('');
        // Immediately add the message to the UI
        setMessages(prev => [...prev, result.message]);
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    } finally {
      setSending(false);
    }
  };

  const handleSendMeetingProposal = async () => {
    if (!selectedDate || !selectedTime || !selectedLocation) {
      alert('Please select a date, time, and location');
      return;
    }

    const meetingProposal = {
      type: 'meeting_proposal',
      date: selectedDate.toISOString().split('T')[0],
      time: selectedTime,
      location: selectedLocation,
      note: proposalNote,
      status: 'pending'
    };

    const messageText = `📅 Meeting Proposal\n📍 ${selectedLocation}\n📆 ${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}\n⏰ ${selectedTime}${proposalNote ? `\n💬 ${proposalNote}` : ''}\n[MEETING_PROPOSAL:${JSON.stringify(meetingProposal)}]`;

    try {
      setSending(true);
      const result = await chatService.sendMessage(conversationId, currentUser.netId, messageText);
      
      if (result.success) {
        setMessages(prev => [...prev, result.message]);
        setShowCalendar(false);
        setSelectedDate(null);
        setSelectedTime('');
        setSelectedLocation('');
        setProposalNote('');
      } else {
        alert('Failed to send meeting proposal');
      }
    } catch (error) {
      console.error('Error sending meeting proposal:', error);
      alert('Error sending meeting proposal');
    } finally {
      setSending(false);
    }
  };

  const handleAcceptMeeting = async (messageId, proposalData) => {
    const acceptanceMessage = `✅ Meeting Accepted!\n📍 ${proposalData.location}\n📆 ${new Date(proposalData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}\n⏰ ${proposalData.time}\nSee you there!`;

    try {
      const result = await chatService.sendMessage(conversationId, currentUser.netId, acceptanceMessage);
      
      if (result.success) {
        setMessages(prev => [...prev, result.message]);
      }
    } catch (error) {
      console.error('Error accepting meeting:', error);
      alert('Error accepting meeting');
    }
  };

  const handleDeclineMeeting = async (messageId, proposalData) => {
    const declineMessage = `❌ Sorry, I can't make it at that time. Can we find another time that works?`;

    try {
      const result = await chatService.sendMessage(conversationId, currentUser.netId, declineMessage);
      
      if (result.success) {
        setMessages(prev => [...prev, result.message]);
      }
    } catch (error) {
      console.error('Error declining meeting:', error);
      alert('Error declining meeting');
    }
  };

  const parseMeetingProposal = (messageText) => {
    try {
      const match = messageText.match(/\[MEETING_PROPOSAL:(.*?)\]/);
      if (match) {
        return JSON.parse(match[1]);
      }
    } catch (error) {
      console.error('Error parsing meeting proposal:', error);
    }
    return null;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleViewProfile = () => {
    if (otherUser?.id) {
      navigate(`/profile/${otherUser.id}`);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
    '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM'
  ];

  const meetingLocations = otherUser?.meetingSpots?.length > 0 
    ? otherUser.meetingSpots 
    : [
        'Bass Library',
        'Sterling Memorial Library',
        'Blue State Coffee',
        'Cross Campus',
        'Commons Dining Hall',
        'Schwarzman Center'
      ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/messages')}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {otherUser?.avatar_initials || otherUser?.name?.split(' ').map(n => n[0]).join('') || '?'}
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">{otherUser?.name || 'Unknown User'}</h2>
                  <p className="text-sm text-slate-600">
                    {otherUser?.year} • {otherUser?.college}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleViewProfile}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View Profile
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-slate-500 mb-2">No messages yet</p>
                    <p className="text-sm text-slate-400">Start the conversation!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isOwnMessage = message.sender_id === currentUser.netId;
                    const meetingProposal = parseMeetingProposal(message.message_text);
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                          {meetingProposal ? (
                            // Meeting Proposal Card
                            <div className="bg-white border-2 border-blue-200 rounded-2xl p-4 shadow-sm">
                              <div className="flex items-center mb-3">
                                <Calendar size={20} className="text-blue-600 mr-2" />
                                <span className="font-semibold text-slate-900">Meeting Proposal</span>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center text-slate-700">
                                  <MapPin size={16} className="mr-2 text-slate-500" />
                                  {meetingProposal.location}
                                </div>
                                <div className="flex items-center text-slate-700">
                                  <Calendar size={16} className="mr-2 text-slate-500" />
                                  {new Date(meetingProposal.date).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </div>
                                <div className="flex items-center text-slate-700">
                                  <Clock size={16} className="mr-2 text-slate-500" />
                                  {meetingProposal.time}
                                </div>
                                {meetingProposal.note && (
                                  <div className="text-slate-600 italic pt-2 border-t border-slate-100">
                                    "{meetingProposal.note}"
                                  </div>
                                )}
                              </div>
                              {!isOwnMessage && meetingProposal.status === 'pending' && (
                                <div className="flex gap-2 mt-4">
                                  <button
                                    onClick={() => handleAcceptMeeting(message.id, meetingProposal)}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
                                  >
                                    <Check size={16} className="mr-1" />
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleDeclineMeeting(message.id, meetingProposal)}
                                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 px-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
                                  >
                                    <X size={16} className="mr-1" />
                                    Decline
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : message.message_text.includes('✅ Meeting Accepted!') ? (
                            // Meeting Accepted Card
                            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
                              <div className="text-green-800 font-medium">
                                {message.message_text.split('\n').map((line, idx) => (
                                  <div key={idx}>{line}</div>
                                ))}
                              </div>
                            </div>
                          ) : message.message_text.includes('❌ Sorry') ? (
                            // Meeting Declined Card
                            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                              <div className="text-red-800">
                                {message.message_text}
                              </div>
                            </div>
                          ) : (
                            // Regular Message
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                isOwnMessage
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-slate-200'
                              }`}
                            >
                              <p className={`text-sm ${isOwnMessage ? 'text-white' : 'text-slate-900'}`}>
                                {message.message_text}
                              </p>
                            </div>
                          )}
                          <div className={`text-xs text-slate-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                            {formatTime(message.created_at)}
                            {isOwnMessage && message.is_read && ' • Read'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Calendar Modal */}
            {showCalendar && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-slate-900">Schedule a Meeting</h3>
                      <button
                        onClick={() => setShowCalendar(false)}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Calendar */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={handlePreviousMonth}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <h4 className="font-semibold text-slate-900">
                          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h4>
                        <button
                          onClick={handleNextMonth}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                          <div key={day} className="text-center text-xs font-semibold text-slate-600 py-2">
                            {day}
                          </div>
                        ))}
                        {getDaysInMonth(currentMonth).map((date, index) => (
                          <button
                            key={index}
                            onClick={() => date && !isPastDate(date) && setSelectedDate(date)}
                            disabled={!date || isPastDate(date)}
                            className={`
                              aspect-square p-2 text-sm rounded-lg transition-all
                              ${!date ? 'invisible' : ''}
                              ${isPastDate(date) ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-slate-100'}
                              ${isToday(date) ? 'bg-blue-50 text-blue-600 font-semibold' : ''}
                              ${selectedDate && date && date.toDateString() === selectedDate.toDateString() 
                                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                : ''}
                            `}
                          >
                            {date?.getDate()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Time Selection */}
                    {selectedDate && (
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-700 mb-3">Select Time</label>
                        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                          {timeSlots.map(time => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`
                                py-2 px-3 rounded-lg text-sm transition-all
                                ${selectedTime === time 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700'}
                              `}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Location Selection */}
                    {selectedTime && (
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-700 mb-3">Select Location</label>
                        <div className="grid grid-cols-2 gap-2">
                          {meetingLocations.map(location => (
                            <button
                              key={location}
                              onClick={() => setSelectedLocation(location)}
                              className={`
                                py-2 px-3 rounded-lg text-sm transition-all text-left
                                ${selectedLocation === location 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700'}
                              `}
                            >
                              {location}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Note */}
                    {selectedLocation && (
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Add a Note (Optional)</label>
                        <textarea
                          value={proposalNote}
                          onChange={(e) => setProposalNote(e.target.value)}
                          placeholder="Any additional details about the meeting..."
                          className="w-full bg-slate-50 border-0 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                          rows={3}
                        />
                      </div>
                    )}

                    {/* Summary */}
                    {selectedDate && selectedTime && selectedLocation && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-6">
                        <h5 className="font-semibold text-slate-900 mb-2">Meeting Summary</h5>
                        <div className="space-y-1 text-sm text-slate-700">
                          <div>📆 {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
                          <div>⏰ {selectedTime}</div>
                          <div>📍 {selectedLocation}</div>
                          {proposalNote && <div>💬 {proposalNote}</div>}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowCalendar(false)}
                        className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 px-4 rounded-xl font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendMeetingProposal}
                        disabled={!selectedDate || !selectedTime || !selectedLocation || sending}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                      >
                        {sending ? 'Sending...' : 'Send Proposal'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="bg-white border-t border-slate-200 px-6 py-4">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCalendar(true)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-full transition-colors"
                  title="Schedule a meeting"
                >
                  <Calendar size={20} />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-50 border-0 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-full transition-colors"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar with user info */}
          <div className="hidden lg:block w-80 bg-white border-l border-slate-200 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Profile Summary */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">About {otherUser?.name?.split(' ')[0]}</h3>
                {otherUser?.bio && (
                  <p className="text-sm text-slate-600 mb-4">{otherUser.bio}</p>
                )}
              </div>

              {/* Skills they teach*/}
              {otherUser?.canTeach && otherUser.canTeach.length > 0 && (
                <div>
                  <div className="flex items-center mb-3">
                    <Languages size={16} className="text-emerald-600 mr-2" />
                    <h4 className="font-semibold text-slate-900">Can Teach</h4>
                  </div>
                  <div className="space-y-2">
                    {otherUser.canTeach.map((skill, idx) => (
                      <div key={idx} className="bg-emerald-50 rounded-lg p-2">
                        <p className="text-sm font-medium text-slate-900">{skill.skill}</p>
                        <p className="text-xs text-slate-600">{skill.level} • {skill.type}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills they wanna learn */}
              {otherUser?.wantToLearn && otherUser.wantToLearn.length > 0 && (
                <div>
                  <div className="flex items-center mb-3">
                    <Music size={16} className="text-blue-600 mr-2" />
                    <h4 className="font-semibold text-slate-900">Wants to Learn</h4>
                  </div>
                  <div className="space-y-2">
                    {otherUser.wantToLearn.map((skill, idx) => (
                      <div key={idx} className="bg-blue-50 rounded-lg p-2">
                        <p className="text-sm font-medium text-slate-900">{skill.skill}</p>
                        <p className="text-xs text-slate-600">Goal: {skill.level}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Meeting Spots */}
              {otherUser?.meetingSpots && otherUser.meetingSpots.length > 0 && (
                <div>
                  <div className="flex items-center mb-3">
                    <MapPin size={16} className="text-orange-600 mr-2" />
                    <h4 className="font-semibold text-slate-900">Preferred Spots</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {otherUser.meetingSpots.map((spot, idx) => (
                      <span key={idx} className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full">
                        {spot}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability */}
              {otherUser?.availability && otherUser.availability.length > 0 && (
                <div>
                  <div className="flex items-center mb-3">
                    <Clock size={16} className="text-purple-600 mr-2" />
                    <h4 className="font-semibold text-slate-900">Availability</h4>
                  </div>
                  <div className="text-sm text-slate-600">
                    {otherUser.availability.slice(0, 5).map((slot, idx) => (
                      <div key={idx}>{slot}</div>
                    ))}
                    {otherUser.availability.length > 5 && (
                      <div className="text-slate-400">+{otherUser.availability.length - 5} more</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;