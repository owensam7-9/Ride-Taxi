import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { registerDriver } from '../../services/userService';

interface DriverRegistrationForm {
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

interface DriverRegistrationData {
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

const DriverRegistration = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<DriverRegistrationForm>({
    fullName: '',
    phoneNumber: '',
    vehicleType: 'car',
    vehicleModel: '',
    licensePlate: '',
    documents: {
      driverLicense: null,
      insurance: null,
      vehicleRegistration: null
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Ensure all required files are present
      if (!formData.documents.driverLicense || 
          !formData.documents.insurance || 
          !formData.documents.vehicleRegistration) {
        throw new Error('All documents are required');
      }

      const registrationData: DriverRegistrationData = {
        ...formData,
        documents: {
          driverLicense: '',  // These will be updated with URLs after upload
          insurance: '',
          vehicleRegistration: ''
        }
      };

      await registerDriver(userId, registrationData);
      history.push('/driver/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const name = target.name;
    const isFileInput = target instanceof HTMLInputElement && target.type === 'file';
    
    if (isFileInput && target.files) {
      const file = target.files[0];
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...(prev[parent] as Record<string, any>),
            [child]: file
          }
        }));
      }
    } else {
      const value = target.value;
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...(prev[parent] as Record<string, any>),
            [child]: value
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-2xl font-bold mb-8">Driver Registration</h2>
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block mb-2">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2">Vehicle Type</label>
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    >
                      <option value="car">Car</option>
                      <option value="bike">Bike</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2">Vehicle Model</label>
                    <input
                      type="text"
                      name="vehicleModel"
                      value={formData.vehicleModel}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2">License Plate</label>
                    <input
                      type="text"
                      name="licensePlate"
                      value={formData.licensePlate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2">Driver License</label>
                    <input
                      type="file"
                      name="documents.driverLicense"
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2">Insurance</label>
                    <input
                      type="file"
                      name="documents.insurance"
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2">Vehicle Registration</label>
                    <input
                      type="file"
                      name="documents.vehicleRegistration"
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
                  >
                    {loading ? 'Registering...' : 'Register as Driver'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverRegistration;