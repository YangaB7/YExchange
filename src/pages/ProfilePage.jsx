import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Plus, X, Save, Camera, MapPin, Clock, Languages, Music, ArrowLeft } from 'lucide-react';
import { profileService, getCurrentUser } from '../lib/supabaseClient';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    year: 'Sophomore',
    college: 'Silliman',
    bio: '',
    availability: [],
    canTeach: [],
    wantToLearn: [],
    meetingSpots: []
  });

  const [newTeachSkill, setNewTeachSkill] = useState({
    type: 'language',
    skill: '',
    level: 'beginner'
  });

  const [newLearnSkill, setNewLearnSkill] = useState({
    type: 'language',
    skill: '',
    level: 'beginner'
  });

  const [availabilityOptions] = useState([
    'Monday Morning', 'Monday Afternoon', 'Monday Evening',
    'Tuesday Morning', 'Tuesday Afternoon', 'Tuesday Evening', 
    'Wednesday Morning', 'Wednesday Afternoon', 'Wednesday Evening',
    'Thursday Morning', 'Thursday Afternoon', 'Thursday Evening',
    'Friday Morning', 'Friday Afternoon', 'Friday Evening',
    'Saturday Morning', 'Saturday Afternoon', 'Saturday Evening',
    'Sunday Morning', 'Sunday Afternoon', 'Sunday Evening'
  ]);

  const colleges = ["Berkeley", "Branford", "Davenport", "Ezra Stiles", "Franklin", "Grace Hopper", "Jonathan Edwards", "Morse", "Pauli Murray", "Pierson", "Saybrook", "Silliman", "Timothy Dwight", "Trumbull"];

  const yaleMeetingSpots = [
    // Libraries
    "Bass Library",
    "Sterling Memorial Library",
    "Beinecke Library",
    "Marx Science Library",
    "Haas Arts Library",
    // Cafes & Dining
    "Blue State Coffee",
    "Starbucks (Barnes & Noble)",
    "The Bow Wow",
    "Uncommon",
    "Koffee?",
    "Commons Dining Hall",
    // Academic Buildings
    "Cross Campus",
    "Science Hill",
    "Hillhouse Avenue",
    "Watson Center",
    "Linsly-Chittenden Hall (LC)",
    "William L. Harkness Hall (WLH)",
    // Colleges
    "My Residential College",
    "Partner's Residential College",
    // Other Spaces
    "Schwarzman Center",
    "Pauli Murray College",
    "Benjamin Franklin College",
    "Grace Hopper College"
  ];
  const commonSkills = {
    language: ["Spanish", "French", "Mandarin", "German", "Italian", "Japanese", "Korean", "Portuguese", "Russian", "Arabic"],
    instrument: ["Piano", "Guitar", "Violin", "Drums", "Bass", "Saxophone", "Flute", "Trumpet", "Cello", "Clarinet"]
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const currentUser = getCurrentUser();
      
      if (!currentUser) {
        navigate('/auth');
        return;
      }

      const result = await profileService.getProfile(currentUser.netId);
      
      if (result.success && result.profile) {
        setProfileData({
          name: result.profile.name || currentUser.name || '',
          year: result.profile.year || 'Sophomore',
          college: result.profile.college || 'Silliman',
          bio: result.profile.bio || '',
          availability: result.profile.availability || [],
          canTeach: result.profile.canTeach || [],
          wantToLearn: result.profile.wantToLearn || []
        });
      } else {
        setProfileData(prev => ({
          ...prev,
          name: currentUser.name || ''
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      alert('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeachSkill = () => {
    if (!newTeachSkill.skill.trim()) return;
    
    const skill = {
      type: newTeachSkill.type,
      skill: newTeachSkill.skill,
      level: newTeachSkill.level,
      id: Date.now()
    };

    setProfileData(prev => ({
      ...prev,
      canTeach: [...prev.canTeach, skill]
    }));

    setNewTeachSkill({
      type: 'language',
      skill: '',
      level: 'beginner'
    });
  };

  const handleAddLearnSkill = () => {
    if (!newLearnSkill.skill.trim()) return;
    
    const skill = {
      type: newLearnSkill.type,
      skill: newLearnSkill.skill,
      level: newLearnSkill.level,
      id: Date.now()
    };

    setProfileData(prev => ({
      ...prev,
      wantToLearn: [...prev.wantToLearn, skill]
    }));

    setNewLearnSkill({
      type: 'language',
      skill: '',
      level: 'beginner'
    });
  };

  const handleRemoveSkill = (category, skillId) => {
    setProfileData(prev => ({
      ...prev,
      [category]: prev[category].filter(skill => skill.id !== skillId)
    }));
  };

  const handleAvailabilityToggle = (timeSlot) => {
    setProfileData(prev => ({
      ...prev,
      availability: prev.availability.includes(timeSlot)
        ? prev.availability.filter(slot => slot !== timeSlot)
        : [...prev.availability, timeSlot]
    }));
  };

  const handleMeetingSpotToggle = (spot) => {
    setProfileData(prev => ({
      ...prev,
      meetingSpots: prev.meetingSpots.includes(spot)
        ? prev.meetingSpots.filter(s => s !== spot)
        : [...prev.meetingSpots, spot]
    }));
  };

  const handleSave = async () => {
    if (!profileData.name.trim()) {
      alert('Please enter your name');
      return;
    }

    try {
      setSaving(true);
      const currentUser = getCurrentUser();
      
      if (!currentUser) {
        navigate('/auth');
        return;
      }

      const result = await profileService.upsertProfile(profileData, currentUser.netId);
      
      if (result.success) {
        alert('Profile saved successfully!');
        navigate('/profile');
      } else {
        alert('Error saving profile: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/profile'); 
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCancel}
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
                onClick={handleCancel}
                className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-full font-medium transition-colors"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Edit Profile</h2>
            <p className="text-slate-600">Set up your skills and availability to connect with other Yalies</p>
          </div>

          <div className="flex items-center space-x-6 mb-8">
            {/* Picture */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {profileData.name.split(' ').map(n => n[0]).join('')}
              </div>
              <button className="absolute bottom-0 right-0 bg-white border-2 border-slate-200 rounded-full p-2 hover:bg-slate-50 transition-colors">
                <Camera size={16} className="text-slate-600" />
              </button>
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({...prev, name: e.target.value}))}
                    className="w-full bg-slate-50 border-0 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Year</label>
                  <select
                    value={profileData.year}
                    onChange={(e) => setProfileData(prev => ({...prev, year: e.target.value}))}
                    className="w-full bg-slate-50 border-0 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="First Year">First Year</option>
                    <option value="Sophomore">Sophomore</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Residential College</label>
                  <select
                    value={profileData.college}
                    onChange={(e) => setProfileData(prev => ({...prev, college: e.target.value}))}
                    className="w-full bg-slate-50 border-0 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {colleges.map(college => (
                      <option key={college} value={college}>{college}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Bio (Optional)</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({...prev, bio: e.target.value}))}
                  placeholder="Tell others about yourself, your interests, or learning goals..."
                  className="w-full bg-slate-50 border-0 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Can Teach */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mr-3">
                <Languages size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Skills I Can Teach</h3>
            </div>

            {/* Add Skill Form */}
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <select
                  value={newTeachSkill.type}
                  onChange={(e) => setNewTeachSkill(prev => ({...prev, type: e.target.value, skill: ''}))}
                  className="bg-white border-0 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="language">Language</option>
                  <option value="instrument">Instrument</option>
                </select>

                <select
                  value={newTeachSkill.level}
                  onChange={(e) => setNewTeachSkill(prev => ({...prev, level: e.target.value}))}
                  className="bg-white border-0 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="beginner">Beginner Level</option>
                  <option value="intermediate">Intermediate Level</option>
                  <option value="advanced">Advanced Level</option>
                  <option value="native">Native/Expert</option>
                </select>
              </div>

              <div className="flex gap-2">
                <select
                  value={newTeachSkill.skill}
                  onChange={(e) => setNewTeachSkill(prev => ({...prev, skill: e.target.value}))}
                  className="flex-1 bg-white border-0 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select {newTeachSkill.type}...</option>
                  {commonSkills[newTeachSkill.type].map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                  <option value="Other">Other (Custom)</option>
                </select>
                {newTeachSkill.skill === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter skill"
                    onChange={(e) => setNewTeachSkill(prev => ({...prev, skill: e.target.value}))}
                    className="flex-1 bg-white border-0 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                )}
                <button
                  onClick={handleAddTeachSkill}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Skills List */}
            <div className="space-y-3">
              {profileData.canTeach.map(skill => (
                <div key={skill.id} className="bg-emerald-50 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{skill.skill}</div>
                    <div className="text-sm text-slate-600">{skill.level} • {skill.type}</div>
                  </div>
                  <button
                    onClick={() => handleRemoveSkill('canTeach', skill.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {profileData.canTeach.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">No skills added yet</p>
              )}
            </div>
          </div>

          {/* Want to Learn */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                <Music size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Skills I Want to Learn</h3>
            </div>

            {/* Add Skill Form */}
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <select
                  value={newLearnSkill.type}
                  onChange={(e) => setNewLearnSkill(prev => ({...prev, type: e.target.value, skill: ''}))}
                  className="bg-white border-0 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="language">Language</option>
                  <option value="instrument">Instrument</option>
                </select>

                <select
                  value={newLearnSkill.level}
                  onChange={(e) => setNewLearnSkill(prev => ({...prev, level: e.target.value}))}
                  className="bg-white border-0 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="beginner">Beginner Goal</option>
                  <option value="intermediate">Intermediate Goal</option>
                  <option value="advanced">Advanced Goal</option>
                </select>
              </div>

              <div className="flex gap-2">
                <select
                  value={newLearnSkill.skill}
                  onChange={(e) => setNewLearnSkill(prev => ({...prev, skill: e.target.value}))}
                  className="flex-1 bg-white border-0 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select {newLearnSkill.type}...</option>
                  {commonSkills[newLearnSkill.type].map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                  <option value="Other">Other (Custom)</option>
                </select>
                {newLearnSkill.skill === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter skill"
                    onChange={(e) => setNewLearnSkill(prev => ({...prev, skill: e.target.value}))}
                    className="flex-1 bg-white border-0 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                )}
                <button
                  onClick={handleAddLearnSkill}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Skills List */}
            <div className="space-y-3">
              {profileData.wantToLearn.map(skill => (
                <div key={skill.id} className="bg-blue-50 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{skill.skill}</div>
                    <div className="text-sm text-slate-600">{skill.level} • {skill.type}</div>
                  </div>
                  <button
                    onClick={() => handleRemoveSkill('wantToLearn', skill.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {profileData.wantToLearn.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">No skills added yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Availability Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
              <Clock size={20} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">My Availability</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availabilityOptions.map(timeSlot => (
              <label key={timeSlot} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profileData.availability.includes(timeSlot)}
                  onChange={() => handleAvailabilityToggle(timeSlot)}
                  className="sr-only"
                />
                <div className={`flex-1 p-3 rounded-lg text-sm text-center transition-all ${
                  profileData.availability.includes(timeSlot)
                    ? 'bg-purple-100 text-purple-800 border-2 border-purple-300'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}>
                  {timeSlot}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Preferred Meeting Spots */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-3">
              <MapPin size={20} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Preferred Meeting Spots</h3>
          </div>

          <p className="text-sm text-slate-600 mb-4">Select your favorite places to meet on campus</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {yaleMeetingSpots.map(spot => (
              <label key={spot} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profileData.meetingSpots.includes(spot)}
                  onChange={() => handleMeetingSpotToggle(spot)}
                  className="sr-only"
                />
                <div className={`flex-1 p-3 rounded-lg text-sm text-center transition-all ${
                  profileData.meetingSpots.includes(spot)
                    ? 'bg-orange-100 text-orange-800 border-2 border-orange-300 font-medium'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}>
                  {spot}
                </div>
              </label>
            ))}
          </div>
          
          {profileData.meetingSpots.length === 0 && (
            <p className="text-xs text-slate-500 mt-4 text-center">Select at least one meeting spot to help others know where you prefer to meet</p>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-12 rounded-xl transition-all duration-200 flex items-center mx-auto shadow-lg"
          >
            <Save size={20} className="mr-3" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;