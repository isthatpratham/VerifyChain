/**
 * Dashboard.jsx
 * Enterprise Dashboard with Score Engine Ring, Business Summary,
 * Quick Actions, Verification Operations, Compliance Workspace, and Service Modules.
 *
 * Strictly preserves existing useAuth, useMsmeProfile, and useBusinessVerification hooks.
 */
import { useAuth } from '../hooks/useAuth';
import { useMsmeProfile } from '../hooks/useMsmeProfile';
import { useBusinessVerification } from '../hooks/useBusinessVerification';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { BusinessSummaryCard } from '../components/dashboard/BusinessSummaryCard';
import { BusinessVerificationCard } from '../components/profile/BusinessVerificationCard';
import { ScoreRingDisplay } from '../components/dashboard/ScoreRingDisplay';
import { ComplianceWorkspace } from '../components/dashboard/ComplianceWorkspace';
import { ModulePlaceholdersGrid } from '../components/dashboard/ModulePlaceholdersGrid';
import { QuickActionsPanel } from '../components/dashboard/QuickActionsPanel';
import { Container } from '../layouts/Container';
import { Skeleton } from '../ui/Skeleton';
import { Alert } from '../ui/Alert';

export default function Dashboard() {
  const { user } = useAuth();
  const { profile, loading: profileLoading, error: profileError, refreshProfile } = useMsmeProfile();
  const { statusData } = useBusinessVerification();

  if (profileLoading) {
    return (
      <Container size="xl" className="py-12">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-28 w-full rounded-[--radius-md]" />
          <Skeleton className="h-44 w-full rounded-[--radius-md]" />
          <Skeleton className="h-64 w-full rounded-[--radius-md]" />
        </div>
      </Container>
    );
  }

  return (
    <Container size="xl" className="py-8">
      {/* Enterprise Header */}
      <DashboardHeader
        userName={user?.name}
        businessName={profile?.businessName}
        lastSync={profile?.lastComplianceSync}
        onSync={refreshProfile}
      />

      {profileError && !profile && (
        <div className="mb-6">
          <Alert variant="error" title="Dashboard Error">
            {profileError}
          </Alert>
        </div>
      )}

      {/* Enterprise Quick Actions Panel */}
      <QuickActionsPanel publicSlug={profile?.publicSlug} />

      {/* Compliance Health Score Engine Presentation */}
      <ScoreRingDisplay score={88} level="HIGH" />

      {/* Business Details Overview */}
      <BusinessSummaryCard
        profile={profile}
        verificationStatus={statusData?.verificationStatus}
      />

      {/* Registration Verification Operations */}
      {profile && <BusinessVerificationCard profile={profile} />}

      {/* Compliance Workspace */}
      <div className="mt-8">
        <ComplianceWorkspace />
      </div>

      {/* Service Modules Grid */}
      <div className="mt-8">
        <ModulePlaceholdersGrid />
      </div>
    </Container>
  );
}
