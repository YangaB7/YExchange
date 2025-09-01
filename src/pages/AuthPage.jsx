import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleYaleLogin = async () => {
    setIsLoading(true);
    
    // Simulate authentication process
    setTimeout(() => {
      setIsLoading(false);
      const isNewUser = Math.random() > 0.5; // Random for now
      
      if (isNewUser) {
        navigate('/profile');
      } else {
        navigate('/search');
      }
    }, 2000);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <button 
            onClick={() => navigate('/')}
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 cursor-pointer"
          >
            Yale Exchange
          </button>
          <p className="text-slate-600">Sign in with your Yale NetID to continue</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleYaleLogin}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center shadow-sm"
          >
            <Shield size={20} className="mr-3" />
            {isLoading ? 'Authenticating...' : 'Sign in with Yale NetID'}
          </button>

          <div className="text-center">
            <button 
              onClick={handleBackToHome}
              className="text-slate-500 hover:text-slate-700 text-sm transition-colors flex items-center justify-center"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to home
            </button>
          </div>
        </div>

        <div className="mt-8 p-4 bg-slate-50 rounded-lg">
          <h3 className="font-semibold text-slate-900 mb-2">Why Yale NetID?</h3>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Ensures only Yale students can access</li>
            <li>• No need to create another account</li>
            <li>• Secure and verified identity</li>
          </ul>
        </div>

        {isLoading && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <p className="text-blue-800 text-sm">Connecting to Yale NetID...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;