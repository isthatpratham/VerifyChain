/**
 * Dashboard.jsx
 * Enterprise Dashboard with Score Engine Ring, Business Summary,
 * Quick Actions, Verification Operations, Compliance Workspace, and Service Modules.
 *
 * All displayed values sourced from live backend APIs.
 * No hardcoded scores or mock data.
 */
import { useAuth } from '../hooks/useAuth';
import { useMsmeProfile } from '../hooks/useMsmeProfile';
import { useBusinessVerification } from '../hooks/useBusinessVerification';
import { useHealthIntelligence } from '../hooks/useHealthIntelligence';
import { useCompliance } from '../hooks/useCompliance';
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

  // Live compliance health intelligence from the score engine
  const {
    currentScore,
    insights,
    loading: healthLoading,
  } = useHealthIntelligence();

  // Live compliance records for the authority breakdown ring
  const { records: complianceRecords } = useCompliance();

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

  // Derive live score, level, and breakdown from the health intelligence engine
  const liveScore =
    typeof insights?.overallScore === 'number' ? insights.overallScore :
    typeof currentScore?.overallScore === 'number' ? currentScore.overallScore :
    typeof currentScore?.overall_score === 'number' ? currentScore.overall_score :
    null;

  const liveLevel =
    insights?.riskAnalysis?.overallRiskLevel ||
    currentScore?.riskLevel ||
    currentScore?.risk_level ||
    null;

  // Build authority breakdown from live compliance records, augmented with
  // engine category weights when available
  const authorityWeightMap = {};
  if (Array.isArray(currentScore?.categoryBreakdown)) {
    currentScore.categoryBreakdown.forEach((cat) => {
      authorityWeightMap[cat.authority || cat.category] = cat.maxScore || cat.weight;
    });
  }

  const liveBreakdown = Array.isArray(complianceRecords) && complianceRecords.length > 0
    ? complianceRecords.map((rec) => ({
        name: rec.authority,
        authority: rec.authority,
        weight: authorityWeightMap[rec.authority] ?? null,
        status: rec.status,
      }))
    : [];

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

      {/* Compliance Health Score Engine — Live Data */}
      <ScoreRingDisplay
        score={liveScore}
        level={liveLevel}
        breakdown={liveBreakdown}
        loading={healthLoading && liveScore === null}
      />

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
