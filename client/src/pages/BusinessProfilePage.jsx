/**
 * BusinessProfilePage.jsx
 * Redesigned Enterprise Business Profile & Registration Verification Page.
 * Strictly preserves existing hook integration with useMsmeProfile.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsmeProfile } from '../hooks/useMsmeProfile';
import { BusinessProfileForm } from '../components/profile/BusinessProfileForm';
import { BusinessProfileCard } from '../components/profile/BusinessProfileCard';
import { BusinessVerificationCard } from '../components/profile/BusinessVerificationCard';
import { Container } from '../layouts/Container';
import { Skeleton } from '../ui/Skeleton';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';

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
    }, 1200);
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
      <Container size="lg" className="py-12">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-10 w-64 rounded-[--radius-sm]" />
          <Skeleton className="h-44 w-full rounded-[--radius-md]" />
          <Skeleton className="h-64 w-full rounded-[--radius-md]" />
        </div>
      </Container>
    );
  }

  return (
    <Container size="lg" className="py-8">
      {/* Header */}
      <div className="mb-8">
        <span className="text-[--text-xs] font-semibold uppercase tracking-[--ls-caps] text-[--vc-text-brand] block mb-1">
          Enterprise Settings
        </span>
        <h1 className="font-[--font-heading] text-[--text-2xl] lg:text-[--text-3xl] font-bold text-[--vc-text-primary]">
          MSME Business Profile & Registration Verification
        </h1>
        <p className="text-[--text-xs] text-[--vc-text-secondary] mt-1">
          Manage your business details, registration IDs, and verify registration credentials.
        </p>
      </div>

      {successMessage && (
        <div className="mb-6">
          <Alert variant="success" title="Profile Success">
            {successMessage}
          </Alert>
        </div>
      )}

      {error && !profile && (
        <div className="mb-6">
          <Alert variant="error" title="Profile Load Error">
            {error}
          </Alert>
        </div>
      )}

      {!profile ? (
        <div className="flex flex-col gap-6">
          <Alert variant="info" title="Welcome to VerifyChain">
            Please complete your MSME Business Profile to unlock automated compliance tracking and supplier health scoring.
          </Alert>
          <BusinessProfileForm onSubmit={handleCreate} isEdit={false} />
        </div>
      ) : isEditing ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between p-4 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-surface-raised]">
            <h2 className="font-[--font-heading] text-[--text-base] font-bold text-[--vc-text-primary]">
              Edit Business Details
            </h2>
            <Button
              type="button"
              variant="tertiary"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              Cancel Editing
            </Button>
          </div>

          <BusinessProfileForm initialValues={profile} onSubmit={handleUpdate} isEdit={true} />
        </div>
      ) : (
        <>
          <BusinessProfileCard profile={profile} onEdit={() => setIsEditing(true)} />
          <BusinessVerificationCard profile={profile} />
        </>
      )}
    </Container>
  );
}
