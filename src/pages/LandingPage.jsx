import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Languages, Music, ArrowRight, Shield } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleHowItWorks = () => {
    const element = document.getElementById('how-it-works');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/')}
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer"
            >
              Yale Exchange
            </button>
            <button 
              onClick={handleGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
            Learn Together,<br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Grow Together
            </span>
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Connect with fellow Yalies to exchange languages and learn instruments. 
            Share your skills, discover new ones, and build lasting connections across residential colleges.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center shadow-lg"
            >
              Start Learning
              <ArrowRight size={20} className="ml-2" />
            </button>
            <button 
              onClick={handleHowItWorks}
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors py-4 px-8"
            >
              How it works
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Languages size={24} className="text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Language Exchange</h3>
            <p className="text-slate-600 text-sm">Practice Spanish, Mandarin, French and more with native speakers</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music size={24} className="text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Instrument Lessons</h3>
            <p className="text-slate-600 text-sm">Learn guitar, piano, violin from talented student musicians</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Group Sessions</h3>
            <p className="text-slate-600 text-sm">Join study groups and practice sessions with multiple students</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield size={24} className="text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Yale Community</h3>
            <p className="text-slate-600 text-sm">Secure platform exclusively for Yale students with NetID verification</p>
          </div>
        </div>

        <div id="how-it-works" className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 mb-16">
          <h3 className="text-2xl font-bold text-slate-900 text-center mb-8">How Yale Exchange Works</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                1
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Create Your Profile</h4>
              <p className="text-slate-600 text-sm">List the skills you can teach and what you'd like to learn. Set your availability and preferences.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                2
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Find Your Match</h4>
              <p className="text-slate-600 text-sm">Search for students who can teach what you want to learn, or who want to learn what you teach.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                3
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Start Learning</h4>
              <p className="text-slate-600 text-sm">Connect through our chat system, schedule sessions, and meet up around campus to learn together.</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-6 text-white text-center">
            <div className="text-3xl font-bold mb-2">12+</div>
            <div className="text-blue-100">Residential Colleges</div>
          </div>
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl p-6 text-white text-center">
            <div className="text-3xl font-bold mb-2">50+</div>
            <div className="text-emerald-100">Languages & Instruments</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white text-center">
            <div className="text-3xl font-bold mb-2">∞</div>
            <div className="text-purple-100">Learning Possibilities</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to Start Your Learning Journey?</h3>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join the Yale Exchange community and discover the incredible talent within our student body.
          </p>
          <button 
            onClick={handleGetStarted}
            className="bg-white hover:bg-gray-100 text-slate-900 font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg"
          >
            Sign Up with Yale NetID
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-slate-600">
          <p>&copy; 2025 Yale Exchange. Built by Yale students, for Yale students.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;