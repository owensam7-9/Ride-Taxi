import { useState } from 'react';
import { handleGoogleSignIn, handleFacebookSignIn } from '../../services/authService';
import { FacebookSVG, LogoSVG, GoogleSVG } from "../../Component/const/svg";

const Auth = () => {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [input, setInput] = useState('');
  const [userType, setUserType] = useState<'rider' | 'driver'>('rider');


  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };
  //const [isAuthorised, setIsAuthorised] = useState(false)


  // useEffect(() => {
  //    const userName = localStorage.getItem('userName');
  //     if (userName) {
  //       window.location.href = "/";
  //     }
  //   },[isAuthorised]);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');
    
    try {
      const user = await handleGoogleSignIn(userType);
      if (user.displayName) {
        localStorage.setItem('userName', user.displayName);
        localStorage.setItem('userEmail', user.email || '');
        localStorage.setItem('userId', user.uid);
        localStorage.setItem('userType', userType);
        window.location.href = '/';
      }
    } catch (error: any) {
      console.error('Google Sign-in Error:', error);
      setIsError(true);
      setErrorMessage(error.message || 'Failed to sign in with Google. Please try again.');
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
        window.location.href = '/';
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
        <div>
          <header className="bg-black py-6 px-6 md:px-8 cursor-pointer">
            <LogoSVG/>
          </header>
          <section className="my-[2em] sm:my-[7em] mx-auto w-[90%] sm:w-[380px] font-[arial] placeholder-text-reed-400">
            {isError && (
              <div className="error_message mx-auto bg-red-100 py-3 text-center text-red-600 rounded-lg mb-3">
                {errorMessage || 'Something went wrong. Please try again!'}
              </div>
            )}
            {isLoading && (
              <div className="loading_message mx-auto bg-blue-100 py-3 text-center text-blue-600 rounded-lg mb-3">
                Please wait while we sign you in...
              </div>
            )}
            
            <div className="mb-6">
              <h2 className="text-2xl mb-4">I want to...</h2>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setUserType('rider')}
                  className={`flex-1 py-3 px-4 rounded-lg transition-colors ${
                    userType === 'rider'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Book a Ride
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('driver')}
                  className={`flex-1 py-3 px-4 rounded-lg transition-colors ${
                    userType === 'driver'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Drive
                </button>
              </div>
            </div>

            <form className='login'>
                <h2 className='text-2xl mb-3'>What's your phone number or email?</h2>
                <input className='focus:border bg-gray-200 w-full px-3 py-3 rounded-lg placeholder-gray-500'
                placeholder='Enter phone number or email'
                autoFocus
                inputMode='email'
                autoComplete='email'
                value={input}
                onChange={handleChange}
                />
                {!isPhoneNumberOrEmail(input) && input.length > 0 && <p className='text-red-600 text-sm font-medium my-1'>Please enter a phone number or email </p>
                }
                

                <button className='bg-black text-white w-full px-3 py-3 rounded-lg my-3 font-semibold'>Continue</button>
            </form>

            <span className="flex items-center my-2">
              <hr className="flex-grow border-t-1 border-gray-400 mr-2"/>
              <span className="text-gray-500">or</span>
              <hr className="flex-grow border-t-1 border-gray-400 ml-2"/>
            </span>
            
            <div className='social_media_auth'>
            <div 
              onClick={signInWithGoogle}
              className="google flex cursor-pointer justify-center   px-3 py-3  my-3 hover:bg-gray-200 font-[Arial] bg-gray-100 rounded-lg">
              <GoogleSVG/>
              <button
              className="text-center text-md font-semibold ml-3"
              >Continue with Google</button>
            </div>
            <div
            onClick={signInWithFacebook}
             className="facebook cursor-pointer flex justify-center px-3 py-3 my-3 hover:bg-gray-200 font-[Arial] bg-gray-100 rounded-lg">
              <FacebookSVG/>
              <button className="text-center ml-3 text-md font-semibold" >Continue with Facebook
              </button>
            </div>
            </div>
            < div className='info text-[#6B6B6B] text-[12px] mt-5'>
              <p>By proceeding, you consent to get calls, WhatsApp or SMS messages, including by automated means, from Ride Cosy and its affiliates to the number provided.
              </p>
              <p>
              This site is protected by reCAPTCHA and the Google <a className='underline text-black' href="https://policies.google.com/privacy">Privacy Policy</a>  and <a className='underline text-black' href="https://policies.google.com/terms">Terms of Service</a> apply.</p>
            </div>
            
          </section>
        </div>
    );
}


function isPhoneNumberOrEmail(input:any) {
  // Phone number regular expression
  const phoneNumberRegex = /^\+?[0-9()-]{7,20}$/;
  
  // Email regular expression
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Check if input matches phone number or email format
  if (phoneNumberRegex.test(input) || emailRegex.test(input)) {
    return true;
  } else {
    return false;
  }
}
export default Auth;