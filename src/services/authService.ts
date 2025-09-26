import { auth, db, rtdb } from '../firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  User, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ref, set, onValue, onDisconnect } from 'firebase/database';

export const handleGoogleSignIn = async (userType: 'rider' | 'driver' = 'rider') => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    const result = await signInWithPopup(auth, provider);
    await createOrUpdateUserProfile(result.user, userType);
    return result.user;
  } catch (error: any) {
    console.error('Google sign-in error:', {
      code: error.code,
      message: error.message,
      email: error.email,
      credential: error.credential
    });
    if (error.code === 'auth/unauthorized-domain') {
      console.error('Please ensure this domain is added to OAuth redirect domains in Google Cloud Console');
    }
    throw error;
  }
};

export const setupRecaptcha = (containerId: string) => {
  return new RecaptchaVerifier(containerId, {
    'size': 'invisible',
  }, auth);
};

export const handlePhoneSignIn = async (phoneNumber: string, appVerifier: RecaptchaVerifier) => {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    return confirmationResult;
  } catch (error: any) {
    console.error('Phone sign-in error:', error);
    throw error;
  }
};

export const verifyOtp = async (confirmationResult: ConfirmationResult, otp: string, userType: 'rider' | 'driver') => {
  try {
    const result = await confirmationResult.confirm(otp);
    await createOrUpdateUserProfile(result.user, userType);
    return result.user;
  } catch (error: any) {
    console.error('OTP verification error:', error);
    throw error;
  }
};

const createOrUpdateUserProfile = async (user: User, userType: 'rider' | 'driver') => {
  if (!user.uid) return;

  try {
    const userRef = doc(db, userType === 'driver' ? 'drivers' : 'users', user.uid);
    const userSnap = await getDoc(userRef);

    const userData = {
      uid: user.uid,
      displayName: user.displayName || user.phoneNumber,
      email: user.email,
      phoneNumber: user.phoneNumber,
      photoURL: user.photoURL,
      type: userType,
      lastLogin: serverTimestamp(),
      status: userType === 'driver' ? 'inactive' : 'active'
    };

    if (!userSnap.exists()) {
      // Create new user profile
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
      }, { merge: true });

      // Also create a realtime database reference for online status
      const rtdbUserRef = ref(rtdb, `users/${user.uid}/status`);
      await set(rtdbUserRef, 'online');
      
      // Set up presence system
      const connectedRef = ref(rtdb, '.info/connected');
      onValue(connectedRef, (snap) => {
        if (snap.val() === true) {
          onDisconnect(rtdbUserRef).set('offline');
          set(rtdbUserRef, 'online');
        }
      });

    } else {
      // Update existing user's data
      await setDoc(userRef, userData, { merge: true });
    }

    // Cache user data locally for offline access
    localStorage.setItem(`userData_${user.uid}`, JSON.stringify({
      ...userData,
      lastUpdated: new Date().toISOString()
    }));

  } catch (error) {
    console.error('Error updating user profile:', error);
    // Try to use cached data if available
    const cachedData = localStorage.getItem(`userData_${user.uid}`);
    if (cachedData) {
      console.log('Using cached user data');
      return JSON.parse(cachedData);
    }
    throw error;
  }
};