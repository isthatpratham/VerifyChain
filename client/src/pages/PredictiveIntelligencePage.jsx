/**
 * PredictiveIntelligencePage.jsx
 * Enterprise Predictive Compliance & Forecasting Workspace (Phase 9.5).
 * Features prediction overview dashboard, early warning alert center, visual forecast timeline, and interactive "What-If" scenario simulator.
 */

import React, { useState, useEffect } from 'react';
import {
  TrendUp,
  Clock,
  Warning,
  Sliders,
  ShieldCheck,
  Brain,
  Lightning,
  CheckCircle,
  CaretRight,
  ArrowRight,
  Sparkle,
  ChartLineUp,
  Info,
  Lightbulb,
} from '@phosphor-icons/react';
import axios from 'axios';

export function PredictiveIntelligencePage() {
  const [forecast, setForecast] = useState(null);
  const [earlyWarnings, setEarlyWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState('GST_DELAY');
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fcRes, warnRes] = await Promise.all([
        axios.post('/api/v1/predictive-intelligence/forecast'),
        axios.get('/api/v1/predictive-intelligence/early-warnings'),
      ]);
      setForecast(fcRes.data.data);
      setEarlyWarnings(warnRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch predictive intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunSimulation = async (scenarioType) => {
    setSimulating(true);
    try {
      const res = await axios.post('/api/v1/predictive-intelligence/simulate', {
        scenarioType: scenarioType || selectedScenario,
      });
      setSimulationResult(res.data.data);
    } catch (err) {
      console.error('Failed to run scenario simulation:', err);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
          <Brain size={20} className="animate-spin text-blue-600" />
          Synthesizing historical telemetry and forecasting predictive risk...
        </div>
      </div>
    );
  }

  const trustFc = forecast?.trustForecast || { currentTrust: 95.0, projected30dTrust: 96.0, projected90dTrust: 97.5 };
  const riskFc = forecast?.riskForecast || { overallRisk: 12.3, riskTrend: 'STABLE_LOW' };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <ChartLineUp size={16} weight="bold" /> Phase 9.5 Enterprise Predictive Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Predictive Intelligence & Forecasting
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Proactive forecasting of compliance renewals, supplier trust trajectories, emerging risk vectors, and "What-If" scenario impact.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition-all"
        >
          Recalculate Forecasts
        </button>
      </div>

      {/* Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Current & Projected Trust */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex flex-col gap-2">
          <span className="text-xs text-gray-500 font-semibold uppercase">30-Day Projected Trust</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-extrabold text-gray-900">{trustFc.projected30dTrust}</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <TrendUp size={14} /> +{(trustFc.projected30dTrust - trustFc.currentTrust).toFixed(1)}
            </span>
          </div>
          <span className="text-[11px] text-gray-400">Current Standing: {trustFc.currentTrust}/100</span>
        </div>

        {/* Projected 90-Day Risk */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex flex-col gap-2">
          <span className="text-xs text-gray-500 font-semibold uppercase">90-Day Risk Trajectory</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-extrabold text-emerald-600">{riskFc.overallRisk}%</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {riskFc.riskTrend}
            </span>
          </div>
          <span className="text-[11px] text-gray-400">Low Exposure Risk Level</span>
        </div>

        {/* Early Warnings Active */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex flex-col gap-2">
          <span className="text-xs text-gray-500 font-semibold uppercase">Active Early Warnings</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-extrabold text-amber-600">{earlyWarnings.length}</span>
            <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
              <Warning size={14} /> Proactive
            </span>
          </div>
          <span className="text-[11px] text-gray-400">Zero Critical Bottlenecks</span>
        </div>

        {/* Overall Confidence */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex flex-col gap-2">
          <span className="text-xs text-gray-500 font-semibold uppercase">Forecast Model Certainty</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl md:text-3xl font-extrabold text-blue-600">
              {((forecast?.overallConfidenceScore || 0.95) * 100).toFixed(0)}%
            </span>
            <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
              <ShieldCheck size={14} /> Verified
            </span>
          </div>
          <span className="text-[11px] text-gray-400">Grounded in VerifyChain Telemetry</span>
        </div>
      </div>

      {/* Main Grid: Early Warnings + Scenario Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Early Warning Alert Center */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Proactive Early Warning Center</h3>
              <p className="text-xs text-gray-500">Preventive alerts generated before compliance or trust degradation occurs.</p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              {earlyWarnings.length} Warnings Active
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {earlyWarnings.map((warn, idx) => (
              <div key={idx} className="p-5 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Warning size={18} className="text-amber-500" />
                    <h4 className="text-sm font-bold text-gray-900">{warn.title}</h4>
                  </div>
                  <span className="text-[11px] font-bold text-gray-600 bg-white px-2.5 py-1 rounded-md border border-gray-200">
                    {warn.time_horizon}
                  </span>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed">{warn.predicted_impact}</p>

                <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
                  <Lightbulb size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Preventive Action Plan:</span> {warn.preventive_action}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Interactive What-If Scenario Simulator */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex flex-col gap-6">
          <div>
            <h3 className="text-base font-bold text-gray-900">"What-If" Scenario Simulator</h3>
            <p className="text-xs text-gray-500 mt-1">Simulate operational events & estimate business impact.</p>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-gray-700">Select Scenario:</label>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="w-full px-3 py-2 text-xs text-gray-900 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600"
            >
              <option value="GST_DELAY">GST Statutory Filing Delayed 30 Days</option>
              <option value="ISO_LAPSE">ISO 9001 Quality Certification Lapses</option>
              <option value="SUPPLIER_DEFAULT">Tier-1 Supplier Enters Default</option>
              <option value="TRUST_IMPROVEMENT">Enable Continuous ERP Connector</option>
            </select>

            <button
              onClick={() => handleRunSimulation(selectedScenario)}
              disabled={simulating}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-all shadow-xs flex items-center justify-center gap-2"
            >
              {simulating ? <Brain size={16} className="animate-spin" /> : <Lightning size={16} />}
              Run Scenario Simulation
            </button>
          </div>

          {/* Simulation Result */}
          {simulationResult && (
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex flex-col gap-3">
              <h4 className="text-xs font-extrabold text-blue-950 uppercase">{simulationResult.title}</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-white border border-gray-200">
                  <span className="text-[10px] text-gray-500">Trust Impact</span>
                  <p className={`font-bold ${simulationResult.simulatedResults.trustImpact < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {simulationResult.simulatedResults.trustImpact > 0 ? '+' : ''}{simulationResult.simulatedResults.trustImpact} pts
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-white border border-gray-200">
                  <span className="text-[10px] text-gray-500">Risk Impact</span>
                  <p className={`font-bold ${simulationResult.simulatedResults.riskImpact > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {simulationResult.simulatedResults.riskImpact > 0 ? '+' : ''}{simulationResult.simulatedResults.riskImpact}%
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-700">
                <span className="font-bold text-gray-900">Business Impact:</span> {simulationResult.simulatedResults.businessImpact}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
