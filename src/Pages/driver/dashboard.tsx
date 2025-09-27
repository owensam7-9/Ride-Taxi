import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { getDriverProfile, toggleDriverAvailability, updateDriverLocation, acceptRideRequest } from '../../services/driverService';
import { db } from '../../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

interface RideRequest {
  id: string;
  riderName: string;
  pickupLocation: string;
  dropoffLocation: string;
  status: string;
}

interface DriverProfile extends Record<string, any> {
  fullName: string;
  vehicleType: string;
  vehicleModel: string;
  licensePlate: string;
  isVerified: boolean;
  isAvailable: boolean;
  rating: number;
  totalRides: number;
  id: string;
}

const DriverDashboard = () => {
  const history = useHistory();
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [watchId, setWatchId] = useState<number | null>(null);
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      history.push('/login');
      return;
    }

    loadProfile(userId);

    const requestsQuery = query(
      collection(db, 'ride-requests'),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RideRequest));
      setRideRequests(requests);
    });

    return () => unsubscribe();
  }, [history]);

  const loadProfile = async (userId: string) => {
    try {
      const driverData = await getDriverProfile(userId);
      setProfile(driverData as unknown as DriverProfile);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!profile) return;

    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      await toggleDriverAvailability(userId, !profile.isAvailable);
      setProfile(prev => prev ? { ...prev, isAvailable: !prev.isAvailable } : null);

      if (!profile.isAvailable) {
        // Start location tracking when going online
        startLocationTracking(userId);
      } else {
        // Stop location tracking when going offline
        stopLocationTracking();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startLocationTracking = (userId: string) => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          lastUpdated: new Date()
        };

        try {
          await updateDriverLocation(userId, location);
        } catch (err: any) {
          console.error('Failed to update location:', err);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Failed to get location');
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    setWatchId(id);
  };

  const stopLocationTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  const handleAcceptRide = async (rideId: string) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      await acceptRideRequest(rideId, userId);
      // Optionally, update UI to show accepted ride
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (!profile) {
    return <div>No profile found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Driver Dashboard
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              {/* ... driver profile details ... */}
            </dl>
          </div>
          <div className="px-4 py-5 sm:px-6">
            <button
              onClick={handleToggleAvailability}
              disabled={!profile.isVerified}
              className={`w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                profile.isAvailable
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
              } ${!profile.isVerified && 'opacity-50 cursor-not-allowed'}`}
            >
              {profile.isAvailable ? 'Go Offline' : 'Go Online'}
            </button>
            {!profile.isVerified && (
              <p className="mt-2 text-sm text-gray-500">
                Your account needs to be verified before you can go online.
              </p>
            )}
          </div>
        </div>

        {profile.isAvailable && (
          <div className="mt-8">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Ride Requests</h3>
            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {rideRequests.length > 0 ? (
                  rideRequests.map((request) => (
                    <li key={request.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-indigo-600 truncate">{request.riderName}</p>
                          <p className="mt-1 text-sm text-gray-500">From: {request.pickupLocation}</p>
                          <p className="mt-1 text-sm text-gray-500">To: {request.dropoffLocation}</p>
                        </div>
                        <button
                          onClick={() => handleAcceptRide(request.id)}
                          className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Accept
                        </button>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-4 sm:px-6">
                    <p className="text-sm text-gray-500">No pending ride requests.</p>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
