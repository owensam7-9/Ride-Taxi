import { db, rtdb } from '../firebase';
import { 
  doc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  GeoPoint 
} from 'firebase/firestore';
import { ref, set } from 'firebase/database';

interface Location {
  latitude: number;
  longitude: number;
}

interface DriverRegistration {
  fullName: string;
  phoneNumber: string;
  vehicleType: 'car' | 'bike';
  vehicleModel: string;
  licensePlate: string;
  documents: {
    driverLicense: string;
    insurance: string;
    vehicleRegistration: string;
  };
}

export const createUserProfile = async (
  userId: string, 
  userData: any, 
  userType: 'rider' | 'driver'
) => {
  try {
    const userRef = doc(db, userType === 'driver' ? 'drivers' : 'users', userId);
    await setDoc(userRef, {
      ...userData,
      userType,
      createdAt: new Date(),
      updatedAt: new Date()
    }, { merge: true });

    // Set up real-time presence
    const statusRef = ref(rtdb, `${userType}s/${userId}/status`);
    await set(statusRef, 'online');
    
    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const registerDriver = async (userId: string, driverData: DriverRegistration) => {
  try {
    const driverRef = doc(db, 'drivers', userId);
    await setDoc(driverRef, {
      ...driverData,
      status: 'pending',
      rating: 0,
      totalRides: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error registering driver:', error);
    throw error;
  }
};

export const updateDriverLocation = async (
  driverId: string, 
  location: Location
) => {
  try {
    const locationRef = ref(rtdb, `drivers/${driverId}/location`);
    await set(locationRef, {
      ...location,
      timestamp: Date.now()
    });

    const driverRef = doc(db, 'drivers', driverId);
    await setDoc(driverRef, {
      lastLocation: new GeoPoint(location.latitude, location.longitude),
      lastUpdated: new Date()
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('Error updating driver location:', error);
    throw error;
  }
};

export const findNearbyDrivers = async (
  location: Location, 
  vehicleType: string,
  radius: number = 5 // km
) => {
  try {
    // Query active drivers with the specified vehicle type
    const driversRef = collection(db, 'drivers');
    const q = query(
      driversRef,
      where('vehicleType', '==', vehicleType),
      where('status', '==', 'active')
    );
    
    const snapshot = await getDocs(q);
    const nearbyDrivers: any[] = [];

    snapshot.forEach((doc) => {
      const driver = doc.data();
      if (driver.lastLocation) {
        const distance = calculateDistance(
          location,
          { 
            latitude: driver.lastLocation.latitude, 
            longitude: driver.lastLocation.longitude 
          }
        );
        
        if (distance <= radius) {
          nearbyDrivers.push({
            id: doc.id,
            ...driver,
            distance
          });
        }
      }
    });

    return nearbyDrivers.sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('Error finding nearby drivers:', error);
    throw error;
  }
};

// Helper function to calculate distance between two points using Haversine formula
const calculateDistance = (point1: Location, point2: Location): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);
  const lat1 = toRad(point1.latitude);
  const lat2 = toRad(point2.latitude);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const toRad = (value: number): number => {
  return value * Math.PI / 180;
};