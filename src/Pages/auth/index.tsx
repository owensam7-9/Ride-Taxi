import React from 'react';
import GreetUser from '../../Component/account';
import { 
  handleGoogleSignIn,
} from '../../services/authService';

const Auth: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'rider' | 'driver'>('rider');

  // Dummy implementations for social sign-in handlers
  const onGoogleSignIn = async () => {
    try {
      await handleGoogleSignIn(activeTab);
      // Handle successful sign-in
      window.location.reload();
    } catch (error) {
      console.error('Google sign-in failed', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to Ride Cosy</h1>
        <div className="flex justify-center mb-6">
          <button 
            onClick={() => setActiveTab('rider')}
            className={`px-4 py-2 text-lg font-semibold ${activeTab === 'rider' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            Rider
          </button>
          <button 
            onClick={() => setActiveTab('driver')}
            className={`px-4 py-2 text-lg font-semibold ${activeTab === 'driver' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          >
            Driver
          </button>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={onGoogleSignIn}
            className="w-full flex items-center justify-center bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
          >
            <span className="mr-2"></span>
            Sign in with Google
          </button>
        </div>
        <div id="recaptcha-container"></div>
      </div>
      <GreetUser />
    </div>
  );
};

export default Auth;
