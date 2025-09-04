import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, MapPin, Clock, Languages, Music, Edit, ArrowLeft, MessageCircle } from 'lucide-react';
import { profileService, getCurrentUser } from '../lib/supabaseClient';

const ProfileView = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [profileId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const currentUser = getCurrentUser();
      
      let result;
      if (profileId) {
        // Viewing someone else's profile by ID
        result = await profileService.getProfileById(profileId);
        // Check if this is the current user's profile
        if (currentUser && result.profile?.net_id === currentUser.netId) {
          setIsOwnProfile(true);
        }
      } else if (currentUser) {
        // Viewing own profile
        result = await profileService.getProfile(currentUser.netId);
        setIsOwnProfile(true);
      } else {
        // No user logged in and no profile ID
        navigate('/auth');
        return;
      }

      if (result.success && result.profile) {
        setProfile(result.profile);
      } else if (isOwnProfile && !result.profile) {
        // Own profile doesn't exist, redirect to create it
        navigate('/profile/edit');
      } else {
        // Profile not found
        alert('Profile not found');
        navigate('/search');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      alert('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate('/profile/edit');
  };

  const handleConnect = () => {
    // TODO: Implement messaging system
    alert(`Connecting with ${profile.name}... (Messaging feature coming soon!)`);
  };

  const handleBack = () => {
    navigate('/search');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Profile not found</p>
          <button
            onClick={() => navigate('/search')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const formatAvailability = (availability) => {
    if (!availability || availability.length === 0) return 'Not specified';
    
    // Group by day
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const grouped = {};
    
    availability.forEach(slot => {
      const [day, time] = slot.split(' ');
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(time);
    });

    // Format for display
    const formatted = days
      .filter(day => grouped[day])
      .map(day => `${day}: ${grouped[day].join(', ')}`)
      .slice(0, 3); // Show first 3 days

    if (availability.length > 9) {
      formatted.push(`+${availability.length - 9} more slots`);
    }

    return formatted.join(' • ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Yale Exchange
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => navigate('/search')}
                className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Search
              </button>
              {isOwnProfile ? (
                <button 
                  onClick={handleEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium transition-colors flex items-center"
                >
                  <Edit size={16} className="mr-2" />
                  Edit Profile
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/profile')}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-full font-medium transition-colors"
                >
                  My Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-6">
              {/* Profile Picture */}
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {profile.avatar_initials || profile.name?.split(' ').map(n => n[0]).join('')}
              </div>

              {/* Basic Info */}
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">{profile.name}</h2>
                <div className="flex items-center space-x-4 text-slate-600">
                  <span>{profile.year}</span>
                  <span>•</span>
                  <span>{profile.college}</span>
                </div>
                {profile.bio && (
                  <p className="mt-3 text-slate-700 max-w-xl">{profile.bio}</p>
                )}
              </div>
            </div>

            {/* Action Button */}
            {!isOwnProfile && (
              <button
                onClick={handleConnect}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center shadow-sm"
              >
                <MessageCircle size={18} className="mr-2" />
                Connect
              </button>
            )}
          </div>

          {/* Availability Summary */}
          <div className="bg-slate-50 rounded-lg p-4 flex items-center">
            <Clock size={20} className="text-slate-500 mr-3" />
            <div>
              <p className="text-sm font-semibold text-slate-700">Availability</p>
              <p className="text-sm text-slate-600">{formatAvailability(profile.availability)}</p>
            </div>
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Can Teach */}
          {profile.canTeach && profile.canTeach.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mr-3">
                  <Languages size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Can Teach</h3>
              </div>

              <div className="space-y-3">
                {profile.canTeach.map((skill, index) => (
                  <div key={index} className="bg-emerald-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-900 text-lg">{skill.skill}</span>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                        {skill.type}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600">
                      {skill.level === 'native' ? 'Native/Expert' : `${skill.level.charAt(0).toUpperCase() + skill.level.slice(1)} Level`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Want to Learn */}
          {profile.wantToLearn && profile.wantToLearn.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                  <Music size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Wants to Learn</h3>
              </div>

              <div className="space-y-3">
                {profile.wantToLearn.map((skill, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-900 text-lg">{skill.skill}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                        {skill.type}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600">
                      Goal: {skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {(!profile.canTeach || profile.canTeach.length === 0) && 
         (!profile.wantToLearn || profile.wantToLearn.length === 0) && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-500">No skills added yet</p>
            {isOwnProfile && (
              <button
                onClick={handleEdit}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
              >
                Add Skills
              </button>
            )}
          </div>
        )}

        {/* Edit Button for Own Profile */}
        {isOwnProfile && (
          <div className="text-center mt-12">
            <button
              onClick={handleEdit}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-12 rounded-xl transition-all duration-200 flex items-center mx-auto shadow-lg"
            >
              <Edit size={20} className="mr-3" />
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;