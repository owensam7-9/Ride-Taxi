import { useState } from 'react';
import { handleGoogleSignIn, handleFacebookSignIn } from '../../services/authService';
import { FacebookSVG, LogoSVG, GoogleSVG } from "../../Component/const/svg";
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

const Auth = () => {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userType, setUserType] = useState<'rider' | 'driver'>('rider');

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');
    
    try {
      const user = await handleGoogleSignIn(userType);
      if (user) {
        // Store user data
        localStorage.setItem('userName', user.displayName || '');
        localStorage.setItem('userEmail', user.email || '');
        localStorage.setItem('userId', user.uid);
        localStorage.setItem('userType', userType);
        localStorage.setItem('photoURL', user.photoURL || '');
        
        // Redirect based on user type
        if (userType === 'driver') {
          // Check if driver is already registered
          const driverDoc = await getDoc(doc(db, 'drivers', user.uid));
          if (driverDoc.exists()) {
            window.location.href = '/driver/dashboard';
          } else {
            window.location.href = '/driver/register';
          }
        } else {
          // Riders go straight to home
          window.location.href = '/';
        }
      }
    } catch (error: any) {
      console.error('Google Sign-in Error:', error);
      setIsError(true);
      if (error.code === 'permission-denied') {
        setErrorMessage('Access denied. Please check your account type and try again.');
      } else {
        setErrorMessage(error.message || 'Failed to sign in with Google. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }
 
  const signInWithFacebook = async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');
    
    try {
      const user = await handleFacebookSignIn(userType);
      if (user.displayName) {
        localStorage.setItem('userName', user.displayName);
        localStorage.setItem('userEmail', user.email || '');
        localStorage.setItem('userId', user.uid);
        localStorage.setItem('userType', userType);
        localStorage.setItem('photoURL', user.photoURL || '');

        if (userType === 'driver') {
          const driverDoc = await getDoc(doc(db, 'drivers', user.uid));
          if (driverDoc.exists()) {
            window.location.href = '/driver/dashboard';
          } else {
            window.location.href = '/driver/register';
          }
        } else {
          window.location.href = '/';
        }
      }
    } catch (error: any) {
      console.error('Facebook Sign-in Error:', error);
      setIsError(true);
      setErrorMessage(error.message || 'Failed to sign in with Facebook. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }
 
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-black py-6 px-6 md:px-8">
        <a href="/" className="inline-block">
          <div className="text-white text-2xl font-bold">Ride Cosy</div>
        </a>
      </header>
      
      <div className="max-w-md mx-auto my-8 px-4 py-8 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Ride Cosy</h2>
          <p className="text-gray-600">Choose how you want to use the platform</p>
        </div>

        <div className="mb-8">
          <div className="flex gap-4">
            <button
              onClick={() => setUserType('rider')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                userType === 'rider'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-xl mb-2">🚗</div>
              <h3 className="font-semibold mb-1">Book a Ride</h3>
              <p className="text-sm text-gray-500">Get to your destination safely</p>
            </button>

            <button
              onClick={() => setUserType('driver')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                userType === 'driver'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-xl mb-2">👨</div>
              <h3 className="font-semibold mb-1">Drive with Us</h3>
              <p className="text-sm text-gray-500">Earn money driving</p>
            </button>
          </div>
        </div>

        {isError && (
          <div className="mb-6 p-4 bg-red-100 text-red-600 rounded-lg">
            {errorMessage}
          </div>
        )}

        {isLoading && (
          <div className="mb-6 p-4 bg-blue-100 text-blue-600 rounded-lg text-center">
            Please wait while we sign you in...
          </div>
        )}

        <div className="flex flex-col space-y-4">
          <button
            onClick={signInWithGoogle}
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-lg border border-gray-300 bg-white text-gray-900 font-medium 
              flex items-center justify-center space-x-3 hover:bg-gray-50 transition-colors
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="w-6 h-6">
              <GoogleSVG/>
            </div>
            <span>Continue with Google</span>
          </button>

          <button
            onClick={signInWithFacebook}
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-lg border border-gray-300 bg-white text-gray-900 font-medium 
              flex items-center justify-center space-x-3 hover:bg-gray-50 transition-colors
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="w-6 h-6 fill-current">
              <FacebookSVG/>
            </div>
            <span>Continue with Facebook</span>
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>By continuing, you agree to Ride Cosy</p>
          <div className="mt-2 space-x-2">
            <a href="/terms" className="text-blue-600 hover:text-blue-800">Terms of Service</a>
            <span>•</span>
            <a href="/privacy" className="text-blue-600 hover:text-blue-800">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;