import { db, storage } from '../firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDocumentWithRetry } from '../services/offlineService';

interface DriverRegistrationData {
  fullName: string;
  phoneNumber: string;
  vehicleType: 'car' | 'bike';
  vehicleModel: string;
  licensePlate: string;
  documents: {
    driverLicense: File | null;
    insurance: File | null;
    vehicleRegistration: File | null;
  };
}

interface DriverLocation {
  latitude: number;
  longitude: number;
  lastUpdated: Date;
}

export const registerDriver = async (userId: string, data: DriverRegistrationData) => {
  try {
    // Upload documents
    const documentUrls = await Promise.all(
      Object.entries(data.documents).map(async ([key, file]) => {
        if (!file) {
          throw new Error(`Missing required document: ${key}`);
        }
        return uploadDocument(userId, key, file);
      })
    );

    // Create driver profile
    const driverData = {
      ...data,
      documents: {
        driverLicense: documentUrls[0],
        insurance: documentUrls[1],
        vehicleRegistration: documentUrls[2]
      },
      isVerified: false,
      isAvailable: false,
      rating: 0,
      totalRides: 0,
      createdAt: new Date(),
      currentLocation: null
    };

    await setDoc(doc(db, 'drivers', userId), driverData);

    // Update user type in users collection
    await updateDoc(doc(db, 'users', userId), {
      userType: 'driver',
      driverId: userId
    });

    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to register driver');
  }
};

const uploadDocument = async (userId: string, documentType: string, file: File): Promise<string> => {
  const storageRef = ref(storage, `drivers/${userId}/${documentType}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

export const updateDriverLocation = async (driverId: string, location: DriverLocation) => {
  try {
    await updateDoc(doc(db, 'drivers', driverId), {
      currentLocation: location
    });
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update location');
  }
};

export const toggleDriverAvailability = async (driverId: string, isAvailable: boolean) => {
  try {
    await updateDoc(doc(db, 'drivers', driverId), {
      isAvailable
    });
    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update availability');
  }
};

export const getDriverProfile = async (driverId: string) => {
  try {
    const driverDoc = await getDocumentWithRetry<any>(doc(db, 'drivers', driverId), {
      maxRetries: 3,
      retryDelay: 1000,
      allowCached: true
    });
    
    if (!driverDoc.exists()) {
      throw new Error('Driver not found');
    }

    // Check if we're using cached data
    if (driverDoc.metadata.fromCache) {
      console.warn('Using cached driver data');
    }

    return { id: driverDoc.id, ...driverDoc.data() };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch driver profile');
  }
};

export const acceptRideRequest = async (rideId: string, driverId: string) => {
    try {
      const rideRef = doc(db, 'ride-requests', rideId);
      await updateDoc(rideRef, {
        status: 'accepted',
        driverId: driverId,
      });
      return { success: true };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to accept ride request');
    }
  };