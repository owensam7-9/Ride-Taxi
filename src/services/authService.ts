import { auth, db } from '../firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  User 
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

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

export const handleFacebookSignIn = async (userType: 'rider' | 'driver' = 'rider') => {
  try {
    const provider = new FacebookAuthProvider();
    provider.setCustomParameters({
      'display': 'popup'
    });
    const result = await signInWithPopup(auth, provider);
    await createOrUpdateUserProfile(result.user, userType);
    return result.user;
  } catch (error: any) {
    console.error('Facebook sign-in error:', {
      code: error.code,
      message: error.message,
      email: error.email,
      credential: error.credential
    });
    if (error.code === 'auth/unauthorized-domain') {
      console.error('Please ensure this domain is added to OAuth redirect domains in Facebook Developer Console');
    }
    throw error;
  }
};

const createOrUpdateUserProfile = async (user: User, userType: 'rider' | 'driver') => {
  if (!user.uid) return;

  const userRef = doc(db, userType === 'driver' ? 'drivers' : 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Create new user profile
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      photoURL: user.photoURL,
      type: userType,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      status: userType === 'driver' ? 'inactive' : 'active'
    });
  } else {
    // Update existing user's last login
    await setDoc(userRef, {
      lastLogin: serverTimestamp(),
      ...(user.phoneNumber && { phoneNumber: user.phoneNumber }),
      ...(user.photoURL && { photoURL: user.photoURL })
    }, { merge: true });
  }
};