import { useAuth } from '../hooks/useAuth';
import { useMsmeProfile } from '../hooks/useMsmeProfile';
import { useBusinessVerification } from '../hooks/useBusinessVerification';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { BusinessSummaryCard } from '../components/dashboard/BusinessSummaryCard';
import { BusinessVerificationCard } from '../components/profile/BusinessVerificationCard';
import { ModulePlaceholdersGrid } from '../components/dashboard/ModulePlaceholdersGrid';

export default function Dashboard() {
  const { user } = useAuth();
  const { profile, loading: profileLoading, error: profileError } = useMsmeProfile();
  const { statusData } = useBusinessVerification();

  if (profileLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-sm font-medium text-gray-500">Loading MSME Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <DashboardHeader
        userName={user?.name}
        businessName={profile?.businessName}
        lastSync={profile?.lastComplianceSync}
      />

      {profileError && !profile && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {profileError}
        </div>
      )}

      <BusinessSummaryCard
        profile={profile}
        verificationStatus={statusData?.verificationStatus}
      />

      {profile && <BusinessVerificationCard profile={profile} />}

      <div className="mt-8">
        <ModulePlaceholdersGrid />
      </div>
    </div>
  );
}
