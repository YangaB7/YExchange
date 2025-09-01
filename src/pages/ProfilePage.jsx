import React, { useState } from 'react';
import { User, Plus, X, Save, Camera, MapPin, Clock, Languages, Music } from 'lucide-react';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState({
    name: 'John Smith',
    year: 'Sophomore',
    college: 'Silliman',
    bio: '',
    availability: [],
    canTeach: [],
    wantToLearn: []
  });

  const [newSkill, setNewSkill] = useState({
    type: 'language',
    skill: '',
    level: 'beginner',
    category: 'canTeach'
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

  const commonSkills = {
    language: ["Spanish", "French", "Mandarin", "German", "Italian", "Japanese", "Korean", "Portuguese", "Russian", "Arabic"],
    instrument: ["Piano", "Guitar", "Violin", "Drums", "Bass", "Saxophone", "Flute", "Trumpet", "Cello", "Clarinet"]
  };

  const handleAddSkill = () => {
    if (!newSkill.skill.trim()) return;
    
    const skill = {
      type: newSkill.type,
      skill: newSkill.skill,
      level: newSkill.level,
      id: Date.now()
    };

    setProfileData(prev => ({
      ...prev,
      [newSkill.category]: [...prev[newSkill.category], skill]
    }));

    setNewSkill({
      type: 'language',
      skill: '',
      level: 'beginner',
      category: 'canTeach'
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

  const handleSave = () => {
    console.log('Saving profile:', profileData);
    alert('Profile saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Yale Exchange
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Search
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium transition-colors">
                Messages
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">My Profile</h2>
            <p className="text-slate-600">Set up your skills and availability to connect with other Yalies</p>
          </div>

          <div className="flex items-center space-x-6 mb-8">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {profileData.name.split(' ').map(n => n[0]).join('')}
              </div>
              <button className="absolute bottom-0 right-0 bg-white border-2 border-slate-200 rounded-full p-2 hover:bg-slate-50 transition-colors">
                <Camera size={16} className="text-slate-600" />
              </button>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({...prev, name: e.target.value}))}
                    className="w-full bg-slate-50 border-0 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
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

        {/* Skills Section */}
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
                  value={newSkill.type}
                  onChange={(e) => setNewSkill(prev => ({...prev, type: e.target.value, skill: ''}))}
                  className="bg-white border-0 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="language">Language</option>
                  <option value="instrument">Instrument</option>
                </select>

                <select
                  value={newSkill.level}
                  onChange={(e) => setNewSkill(prev => ({...prev, level: e.target.value}))}
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
                  value={newSkill.skill}
                  onChange={(e) => setNewSkill(prev => ({...prev, skill: e.target.value}))}
                  className="flex-1 bg-white border-0 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select {newSkill.type}...</option>
                  {commonSkills[newSkill.type].map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setNewSkill(prev => ({...prev, category: 'canTeach'}));
                    handleAddSkill();
                  }}
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
                  value={newSkill.type}
                  onChange={(e) => setNewSkill(prev => ({...prev, type: e.target.value, skill: ''}))}
                  className="bg-white border-0 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="language">Language</option>
                  <option value="instrument">Instrument</option>
                </select>

                <select
                  value={newSkill.level}
                  onChange={(e) => setNewSkill(prev => ({...prev, level: e.target.value}))}
                  className="bg-white border-0 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="beginner">Beginner Goal</option>
                  <option value="intermediate">Intermediate Goal</option>
                  <option value="advanced">Advanced Goal</option>
                </select>
              </div>

              <div className="flex gap-2">
                <select
                  value={newSkill.skill}
                  onChange={(e) => setNewSkill(prev => ({...prev, skill: e.target.value}))}
                  className="flex-1 bg-white border-0 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select {newSkill.type}...</option>
                  {commonSkills[newSkill.type].map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setNewSkill(prev => ({...prev, category: 'wantToLearn'}));
                    handleAddSkill();
                  }}
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

        {/* Save Button */}
        <div className="text-center">
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-12 rounded-xl transition-all duration-200 flex items-center mx-auto shadow-lg"
          >
            <Save size={20} className="mr-3" />
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;