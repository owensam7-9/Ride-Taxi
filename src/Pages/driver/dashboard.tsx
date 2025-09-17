import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { getDriverProfile, toggleDriverAvailability, updateDriverLocation } from '../../services/driverService';

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

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      history.push('/login');
      return;
    }

    loadProfile(userId);
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
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Full name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {profile.fullName}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Vehicle</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {profile.vehicleType} - {profile.vehicleModel}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">License plate</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {profile.licensePlate}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Rating</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {profile.rating.toFixed(1)} ({profile.totalRides} rides)
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {profile.isVerified ? (
                    <span className="text-green-600">Verified</span>
                  ) : (
                    <span className="text-yellow-600">Pending Verification</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
          <div className="px-4 py-5 sm:px-6">
            <button
              onClick={handleToggleAvailability}
              disabled={!profile.isVerified}
              className={`${
                profile.isAvailable
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              } w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                profile.isAvailable
                  ? 'focus:ring-red-500'
                  : 'focus:ring-green-500'
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
      </div>
    </div>
  );
};

export default DriverDashboard;