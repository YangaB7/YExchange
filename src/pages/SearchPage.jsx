import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, MapPin, Clock, MessageCircle } from 'lucide-react';
import { profileService, getCurrentUser } from '../lib/supabaseClient';
import { chatService } from '../lib/supabaseClient';

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({
    skillType: 'all',
    level: 'all',
    availability: 'all',
    college: 'all'
  });
  const [viewMode, setViewMode] = useState('individual');

  const colleges = ["All Colleges", "Berkeley", "Branford", "Davenport", "Ezra Stiles", "Franklin", "Grace Hopper", "Jonathan Edwards", "Morse", "Pauli Murray", "Pierson", "Saybrook", "Silliman", "Timothy Dwight", "Trumbull"];

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    loadProfiles();
  }, []); 
  const loadProfiles = async () => {
    try {
      setLoading(true);
      const result = await profileService.getAllProfiles();
      
      if (result.success) {
        const currentUser = getCurrentUser();
        const filteredProfiles = result.profiles.filter(
          profile => profile.net_id !== currentUser?.netId
        );
        setProfiles(filteredProfiles);
      } else {
        console.error('Error loading profiles:', result.error);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileClick = (profileId) => {
    navigate(`/profile/${profileId}`);
  };

  const handleMyProfile = () => {
    navigate('/profile');
  };

  const handleConnect = async (otherUserNetId, otherUserName) => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        navigate('/auth');
        return;
      }

      if (!otherUserNetId) {
        alert('Could not find this user’s ID.');
        return;
      }

      if (currentUser.netId === otherUserNetId) {
        navigate('/profile');
        return;
      }

      const { success, conversationId, error } = await chatService.getOrCreateConversation(
        currentUser.netId,
        otherUserNetId
      );

      if (!success || !conversationId) {
        console.error('Conversation error:', error);
        alert('Unable to start a conversation right now.');
        return;
      }

      navigate(`/messages/${conversationId}`);
    } catch (err) {
      console.error('Error connecting:', err);
      alert('Something went wrong starting the chat.');
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        profile.name?.toLowerCase().includes(searchLower) ||
        profile.canTeach?.some(skill => skill.skill.toLowerCase().includes(searchLower)) ||
        profile.seeking?.some(skill => skill.skill.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    if (activeFilters.college !== 'all' && activeFilters.college !== 'allcolleges') {
      const filterCollege = activeFilters.college.replace(/([A-Z])/g, ' $1').trim();
      if (profile.college?.toLowerCase() !== filterCollege.toLowerCase()) return false;
    }

    if (activeFilters.skillType !== 'all') {
      const hasSkillType = 
        profile.canTeach?.some(skill => skill.type === activeFilters.skillType) ||
        profile.seeking?.some(skill => skill.type === activeFilters.skillType);
      if (!hasSkillType) return false;
    }

    return true;
  });

  const formatAvailability = (availability) => {
    if (!availability || availability.length === 0) return 'Flexible';
    
    const periods = new Set();
    availability.forEach(slot => {
      const parts = slot.split(' ');
      if (parts.length > 1) {
        periods.add(parts[1]);
      }
    });
    
    return Array.from(periods).slice(0, 2).join(', ');
  };

  const formatMeetingSpots = (spots) => {
    if (!spots || spots.length === 0) return 'No preference';
    if (spots.length === 1) return spots[0];
    const firstSpot = spots[0];
    if (firstSpot.length <= 15 && spots.length >= 2) {
      return `${firstSpot} • ${spots[1]}`;
    }
    return `${firstSpot} +${spots.length - 1}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Yale Exchange
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleMyProfile}
                className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                My Profile
              </button>
              <button 
                onClick={() => navigate('/messages')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium transition-colors"
              >
                Messages
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Find Your Learning Partner</h2>
            <p className="text-slate-600 text-lg">Connect with fellow Yalies to exchange languages and learn instruments</p>
          </div>
          
          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search for Spanish, Guitar, Piano..."
              className="w-full pl-12 pr-4 py-4 text-lg bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* View Mode */}
          <div className="flex justify-center mb-8">
            <div className="bg-slate-100 p-1 rounded-full inline-flex">
              <button
                onClick={() => setViewMode('individual')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  viewMode === 'individual' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Individual Sessions
              </button>
              <button
                onClick={() => setViewMode('group')}
                className={`px-6 py-2 rounded-full font-medium transition-all flex items-center ${
                  viewMode === 'group' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users size={16} className="mr-2" />
                Group Sessions
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Skill Type</label>
              <select 
                className="w-full bg-slate-50 border-0 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                value={activeFilters.skillType}
                onChange={(e) => setActiveFilters({...activeFilters, skillType: e.target.value})}
              >
                <option value="all">All Skills</option>
                <option value="language">Languages</option>
                <option value="instrument">Instruments</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Level</label>
              <select 
                className="w-full bg-slate-50 border-0 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                value={activeFilters.level}
                onChange={(e) => setActiveFilters({...activeFilters, level: e.target.value})}
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Availability</label>
              <select 
                className="w-full bg-slate-50 border-0 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                value={activeFilters.availability}
                onChange={(e) => setActiveFilters({...activeFilters, availability: e.target.value})}
              >
                <option value="all">Any Time</option>
                <option value="morning">Mornings</option>
                <option value="afternoon">Afternoons</option>
                <option value="evening">Evenings</option>
                <option value="weekend">Weekends</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">College</label>
              <select 
                className="w-full bg-slate-50 border-0 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                value={activeFilters.college}
                onChange={(e) => setActiveFilters({...activeFilters, college: e.target.value})}
              >
                {colleges.map(college => (
                  <option key={college} value={college.toLowerCase().replace(' ', '')}>{college}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredProfiles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-500 text-lg mb-4">No profiles found matching your criteria</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setActiveFilters({
                  skillType: 'all',
                  level: 'all',
                  availability: 'all',
                  college: 'all'
                });
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <div 
                key={profile.id} 
                className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() => handleProfileClick(profile.id)}
              >
                {/* Profile Header */}
                <div className="p-6 pb-4 relative">
                  {profile.groupSession && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 text-xs font-semibold rounded-full flex items-center">
                      <Users size={12} className="mr-1" />
                      GROUP
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {profile.avatar_initials || profile.name?.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{profile.name}</h3>
                      <p className="text-slate-600 text-sm">{profile.year} • {profile.college}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-500 mb-4">
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-1 flex-shrink-0" />
                      <span className="truncate">{formatMeetingSpots(profile.meetingSpots)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1 flex-shrink-0" />
                      <span className="truncate">{formatAvailability(profile.availability)}</span>
                    </div>
                  </div>
                </div>

                {/* Skills Teaching */}
                {profile.canTeach && profile.canTeach.length > 0 && (
                  <div className="px-6 pb-4">
                    <h4 className="text-xs font-bold text-emerald-600 mb-3 uppercase tracking-wide">Can Teach</h4>
                    <div className="space-y-2">
                      {profile.canTeach.slice(0, 2).map((skill, index) => (
                        <div key={index} className="bg-emerald-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-900">{skill.skill}</span>
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                              {skill.type}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600">
                            {skill.level === 'native' ? 'Native/Expert' : `${skill.level} Level`}
                          </div>
                        </div>
                      ))}
                      {profile.canTeach.length > 2 && (
                        <p className="text-xs text-slate-500 text-center">+{profile.canTeach.length - 2} more</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Skills Seeking */}
                {profile.seeking && profile.seeking.length > 0 && (
                  <div className="px-6 pb-6">
                    <h4 className="text-xs font-bold text-blue-600 mb-3 uppercase tracking-wide">Looking to Learn</h4>
                    <div className="space-y-2">
                      {profile.seeking.slice(0, 1).map((skill, index) => (
                        <div key={index} className="bg-blue-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-900">{skill.skill}</span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                              {skill.type}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600">Goal: {skill.level}</div>
                        </div>
                      ))}
                      {profile.seeking.length > 1 && (
                        <p className="text-xs text-slate-500 text-center">+{profile.seeking.length - 1} more</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="px-6 pb-6">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConnect(profile.net_id, profile.name);
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center shadow-sm"
                  >
                    <MessageCircle size={18} className="mr-2" />
                    Connect & Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {filteredProfiles.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold transition-colors">
              Load More Results
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
