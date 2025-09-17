import { auth, db, rtdb } from './config';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { ref, set, onValue } from 'firebase/database';

// User Management
export const createUserProfile = async (uid: string, userData: any) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      ...userData,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (uid: string, data: any) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Driver Management
export const createDriverProfile = async (uid: string, driverData: any) => {
  try {
    await setDoc(doc(db, 'drivers', uid), {
      ...driverData,
      status: 'inactive',
      rating: 0,
      totalRides: 0,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating driver profile:', error);
    throw error;
  }
};

export const updateDriverStatus = async (uid: string, status: string) => {
  try {
    await updateDoc(doc(db, 'drivers', uid), {
      status,
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating driver status:', error);
    throw error;
  }
};

// Ride Management
export const createRide = async (rideData: any) => {
  try {
    const rideRef = doc(collection(db, 'rides'));
    await setDoc(rideRef, {
      ...rideData,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    return rideRef.id;
  } catch (error) {
    console.error('Error creating ride:', error);
    throw error;
  }
};

export const updateRideStatus = async (rideId: string, status: string) => {
  try {
    await updateDoc(doc(db, 'rides', rideId), {
      status,
      ...(status === 'completed' && { completedAt: serverTimestamp() })
    });
  } catch (error) {
    console.error('Error updating ride status:', error);
    throw error;
  }
};

// Location Management (Real-time)
export const updateDriverLocation = async (driverId: string, location: { lat: number; lng: number }) => {
  try {
    const locationRef = ref(rtdb, `locations/drivers/${driverId}`);
    await set(locationRef, {
      ...location,
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating driver location:', error);
    throw error;
  }
};

export const subscribeToDriverLocation = (driverId: string, callback: (location: any) => void) => {
  const locationRef = ref(rtdb, `locations/drivers/${driverId}`);
  return onValue(locationRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};