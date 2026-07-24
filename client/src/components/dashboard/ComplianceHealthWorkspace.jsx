/**
 * ComplianceHealthWorkspace.jsx
 * Primary Compliance Health Intelligence Workspace assembling score cards,
 * category breakdowns, risk analysis, recommendations, summary, and snapshot logs.
 * 100% Light Enterprise Surface redesign. ZERO dark cards.
 */
import { useHealthIntelligence } from '../../hooks/useHealthIntelligence';
import { HealthScoreCard } from './HealthScoreCard';
import { CategoryHealthGrid } from './CategoryHealthGrid';
import { RiskIntelligencePanel } from './RiskIntelligencePanel';
import { StrengthsWeaknessesPanel } from './StrengthsWeaknessesPanel';
import { RecommendationsList } from './RecommendationsList';
import { ExecutiveSummaryPanel } from './ExecutiveSummaryPanel';
import { ScoreSnapshotList } from './ScoreSnapshotList';
import { Lightning, TrendUp, Cpu, Sparkle } from '@phosphor-icons/react';

export function ComplianceHealthWorkspace() {
  const { currentScore, insights, snapshots, loading, calculating, calculateScore } = useHealthIntelligence();

  if (loading && !insights) {
    return (
      <div className="flex items-center justify-center p-12 text-[--vc-text-secondary]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--vc-brand] mr-3" />
        <span className="text-xs font-semibold">Loading Compliance Health Intelligence Workspace...</span>
      </div>
    );
  }

  const scoreVal = insights?.overallScore !== undefined ? insights.overallScore : currentScore?.overallScore || 100;
  const riskVal = insights?.riskAnalysis?.overallRiskLevel || currentScore?.riskLevel || 'LOW';
  const confidenceVal = currentScore?.explanation?.confidence || 95;
  const versionVal = currentScore?.configVersion || 'v1.0.0';
  const evaluatedAtVal = insights?.evaluatedAt || currentScore?.evaluatedAt;

  return (
    <div className="space-y-6">
      {/* 1. Executive Summary & Core Score Ring */}
      <HealthScoreCard
        score={scoreVal}
        riskLevel={riskVal}
        confidence={confidenceVal}
        version={versionVal}
        lastEvaluated={evaluatedAtVal}
        onRefresh={calculateScore}
        calculating={calculating}
      />

      {/* 2. Executive Health Summary */}
      <ExecutiveSummaryPanel summary={insights?.summary} />

      {/* 3. Category Score Breakdown */}
      <CategoryHealthGrid categories={insights?.scoreBreakdown?.categoryBreakdown} />

      {/* 4. Risk Analysis & Strengths/Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RiskIntelligencePanel riskAnalysis={insights?.riskAnalysis} />
        </div>
        <div className="lg:col-span-2">
          <StrengthsWeaknessesPanel strengths={insights?.strengths} weaknesses={insights?.weaknesses} />
        </div>
      </div>

      {/* 5. Prioritized Action Recommendations */}
      <RecommendationsList recommendations={insights?.recommendations} />

      {/* 6. Score Snapshot History & Upcoming Enterprise Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ScoreSnapshotList snapshots={snapshots} />
        </div>

        {/* Enterprise Roadmap Cards */}
        <div className="rounded-[--radius-md] bg-[--vc-surface-raised] border border-[--vc-border] p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[--vc-border]">
            <Sparkle size={18} className="text-[--vc-brand]" />
            <h4 className="font-[--font-heading] text-[--text-sm] font-bold text-[--vc-text-primary]">
              Enterprise Roadmap & Modules
            </h4>
          </div>

          <div className="p-3.5 rounded-[--radius-sm] bg-[--vc-bg-base] border border-[--vc-border] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 text-[--vc-text-primary] font-medium">
              <TrendUp size={16} className="text-[--vc-brand]" />
              <span>Historical Trend Analytics</span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[--vc-brand-light]/10 text-[--vc-brand] px-2 py-0.5 rounded-[--radius-sm] border border-[--vc-brand]/20">
              Coming Soon
            </span>
          </div>

          <div className="p-3.5 rounded-[--radius-sm] bg-[--vc-bg-base] border border-[--vc-border] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 text-[--vc-text-primary] font-medium">
              <Lightning size={16} className="text-[--vc-brand]" />
              <span>Industry Benchmark Comparison</span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[--vc-brand-light]/10 text-[--vc-brand] px-2 py-0.5 rounded-[--radius-sm] border border-[--vc-brand]/20">
              Coming Soon
            </span>
          </div>

          <div className="p-3.5 rounded-[--radius-sm] bg-[--vc-bg-base] border border-[--vc-border] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 text-[--vc-text-primary] font-medium">
              <Cpu size={16} className="text-[--vc-brand]" />
              <span>Predictive Score Forecasting</span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[--vc-brand-light]/10 text-[--vc-brand] px-2 py-0.5 rounded-[--radius-sm] border border-[--vc-brand]/20">
              Coming Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
