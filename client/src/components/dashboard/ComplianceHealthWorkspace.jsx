/**
 * ComplianceHealthWorkspace.jsx
 * Primary Compliance Health Intelligence Workspace assembling score cards,
 * category breakdowns, risk analysis, recommendations, summary, and snapshot logs.
 */
import { useHealthIntelligence } from '../../hooks/useHealthIntelligence';
import { HealthScoreCard } from './HealthScoreCard';
import { CategoryHealthGrid } from './CategoryHealthGrid';
import { RiskIntelligencePanel } from './RiskIntelligencePanel';
import { StrengthsWeaknessesPanel } from './StrengthsWeaknessesPanel';
import { RecommendationsList } from './RecommendationsList';
import { ExecutiveSummaryPanel } from './ExecutiveSummaryPanel';
import { ScoreSnapshotList } from './ScoreSnapshotList';
import { Lightning, TrendUp, Cpu } from '@phosphor-icons/react';

export function ComplianceHealthWorkspace() {
  const { currentScore, insights, snapshots, loading, calculating, calculateScore } = useHealthIntelligence();

  if (loading && !insights) {
    return (
      <div className="flex items-center justify-center p-12 text-neutral-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mr-3" />
        <span>Loading Compliance Health Intelligence Workspace...</span>
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

      {/* 6. Score Snapshot History & Future Extension Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ScoreSnapshotList snapshots={snapshots} />
        </div>

        {/* Future Extension Placeholders */}
        <div className="rounded-xl bg-neutral-900/40 border border-neutral-800/80 p-5 backdrop-blur-sm space-y-3">
          <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Future Intelligence Modules</h4>

          <div className="p-3 rounded-lg bg-neutral-950/40 border border-neutral-800/40 flex items-center justify-between text-xs opacity-60">
            <div className="flex items-center gap-2 text-neutral-400">
              <TrendUp size={16} className="text-emerald-400" />
              <span>Historical Trend Analytics</span>
            </div>
            <span className="text-[10px] font-mono bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded">Phase 6</span>
          </div>

          <div className="p-3 rounded-lg bg-neutral-950/40 border border-neutral-800/40 flex items-center justify-between text-xs opacity-60">
            <div className="flex items-center gap-2 text-neutral-400">
              <Lightning size={16} className="text-blue-400" />
              <span>Industry Benchmark Comparison</span>
            </div>
            <span className="text-[10px] font-mono bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded">Phase 6</span>
          </div>

          <div className="p-3 rounded-lg bg-neutral-950/40 border border-neutral-800/40 flex items-center justify-between text-xs opacity-60">
            <div className="flex items-center gap-2 text-neutral-400">
              <Cpu size={16} className="text-purple-400" />
              <span>Predictive Score Forecasting</span>
            </div>
            <span className="text-[10px] font-mono bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded">Phase 6</span>
          </div>
        </div>
      </div>
    </div>
  );
}
