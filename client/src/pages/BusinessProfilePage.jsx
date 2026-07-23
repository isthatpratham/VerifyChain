import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsmeProfile } from '../hooks/useMsmeProfile';
import { BusinessProfileForm } from '../components/profile/BusinessProfileForm';
import { BusinessProfileCard } from '../components/profile/BusinessProfileCard';
import { BusinessVerificationCard } from '../components/profile/BusinessVerificationCard';

export default function BusinessProfilePage() {
  const navigate = useNavigate();
  const { profile, loading, error, createProfile, updateProfile } = useMsmeProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleCreate = async (payload) => {
    await createProfile(payload);
    setSuccessMessage('Business profile created successfully! Syncing compliance data...');
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  const handleUpdate = async (payload) => {
    await updateProfile(payload);
    setIsEditing(false);
    setSuccessMessage('Business profile updated successfully!');
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-sm font-medium text-gray-500">Loading business profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">MSME Business Profile & Verification</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your business details, registration IDs, and verify registration credentials.
        </p>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 font-medium">
          {successMessage}
        </div>
      )}

      {error && !profile && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {!profile ? (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-sm text-blue-800">
            Welcome! Please complete your MSME Business Profile to unlock automated compliance tracking and supplier health scoring.
          </div>
          <BusinessProfileForm onSubmit={handleCreate} isEdit={false} />
        </div>
      ) : isEditing ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Edit Business Details</h2>
            <button
              onClick={() => setIsEditing(false)}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Cancel Edit
            </button>
          </div>
          <BusinessProfileForm initialValues={profile} onSubmit={handleUpdate} isEdit={true} />
        </div>
      ) : (
        <>
          <BusinessProfileCard profile={profile} onEdit={() => setIsEditing(true)} />
          <BusinessVerificationCard profile={profile} />
        </>
      )}
    </div>
  );
}
