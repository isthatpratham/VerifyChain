/**
 * EnterpriseOperationsCenterPage.jsx
 * Enterprise Operations Center & Application Intelligence Workspace (Phase 11.5).
 */

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Heartbeat,
  TrendUp,
  Warning,
  ShieldCheck,
  FileText,
  Users,
  Gauge,
  Brain,
  Vault,
  MagnifyingGlass,
  ArrowClockwise,
  CheckCircle,
  XCircle,
  ChartLineUp,
  DownloadSimple,
  Sliders,
  ListBullets,
  Sparkle,
} from '@phosphor-icons/react';
import axios from 'axios';

export function EnterpriseOperationsCenterPage() {
  const [activeTab, setActiveTab] = useState('OVERVIEW'); // OVERVIEW, HEALTH, METRICS, ANALYTICS, ALERTS, TRENDS, REPORTS
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReportType, setSelectedReportType] = useState('EXECUTIVE_SUMMARY');

  useEffect(() => {
    fetchOperationsCenterData();
  }, []);

  const fetchOperationsCenterData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/v1/operations-analytics/dashboard');
      setDashboard(res.data.data);
    } catch (err) {
      console.error('[EnterpriseOperationsCenter] Error loading operational payload:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAlertStatus = async (alertId, newStatus) => {
    try {
      await axios.put(`/api/v1/operations-analytics/alerts/${alertId}`, { status: newStatus });
      fetchOperationsCenterData();
    } catch (err) {
      alert(`Alert state update failed: ${err.message}`);
    }
  };

  const handleGenerateReport = async () => {
    try {
      await axios.post('/api/v1/operations-analytics/reports/generate', {
        reportType: selectedReportType,
      });
      alert(`Report generated successfully.`);
      fetchOperationsCenterData();
    } catch (err) {
      alert(`Report generation failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-sm text-gray-500 font-semibold">
          <ArrowClockwise size={20} className="animate-spin text-indigo-600" />
          Loading Operations Center Intelligence Payload...
        </div>
      </div>
    );
  }

  const { summary, health, metrics, analytics, alerts, trends, kpis, insights } = dashboard || {};

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 bg-gray-50/50 min-h-screen">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xs">
              <Activity size={28} weight="bold" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Enterprise Operations Center</h1>
              <p className="text-xs text-gray-600 font-medium mt-0.5">
                Application Operational Intelligence, System Health, Business Metrics & Predictive Trends
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchOperationsCenterData}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowClockwise size={15} /> Refresh Diagnostics
            </button>
            <button
              onClick={handleGenerateReport}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <DownloadSimple size={16} weight="bold" /> Generate Executive Brief
            </button>
          </div>
        </div>

        {/* Live System KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3.5 border-t border-gray-100 pt-5 text-xs">
          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <span className="text-emerald-800 font-semibold flex items-center gap-1.5">
              <Heartbeat size={15} className="text-emerald-600" /> Platform Health
            </span>
            <div className="text-lg font-bold text-emerald-950 mt-1">{health?.overallStatus || 'HEALTHY'}</div>
          </div>
          <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
            <span className="text-indigo-800 font-semibold flex items-center gap-1.5">
              <Users size={15} className="text-indigo-600" /> DAU / MAU Users
            </span>
            <div className="text-lg font-bold text-indigo-950 mt-1">
              {analytics?.users?.dailyActiveUsers} / {analytics?.users?.monthlyActiveUsers}
            </div>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-700 font-semibold flex items-center gap-1.5">
              <Vault size={15} className="text-slate-900" /> Vault Documents
            </span>
            <div className="text-lg font-bold text-slate-900 mt-1">{metrics?.documentsCount?.toLocaleString()}</div>
          </div>
          <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-100">
            <span className="text-amber-800 font-semibold flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-amber-600" /> Compliance Avg
            </span>
            <div className="text-lg font-bold text-amber-950 mt-1">{metrics?.complianceHealthScoreAvg}%</div>
          </div>
          <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-100">
            <span className="text-purple-800 font-semibold flex items-center gap-1.5">
              <Brain size={15} className="text-purple-600" /> AI Prompts
            </span>
            <div className="text-lg font-bold text-purple-950 mt-1">{metrics?.aiPromptsCount}</div>
          </div>
          <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-100">
            <span className="text-rose-800 font-semibold flex items-center gap-1.5">
              <Warning size={15} className="text-rose-600" /> Open Alerts
            </span>
            <div className="text-lg font-bold text-rose-950 mt-1">{alerts?.filter(a => a.status === 'OPEN').length}</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 text-xs font-semibold text-gray-600">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`pb-3 px-3 transition-all border-b-2 cursor-pointer ${
            activeTab === 'OVERVIEW' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          Executive Overview
        </button>
        <button
          onClick={() => setActiveTab('HEALTH')}
          className={`pb-3 px-3 transition-all border-b-2 cursor-pointer ${
            activeTab === 'HEALTH' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          System Module Health ({health?.totalModules})
        </button>
        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`pb-3 px-3 transition-all border-b-2 cursor-pointer ${
            activeTab === 'ANALYTICS' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          Domain Analytics
        </button>
        <button
          onClick={() => setActiveTab('ALERTS')}
          className={`pb-3 px-3 transition-all border-b-2 cursor-pointer ${
            activeTab === 'ALERTS' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          Operational Alerts ({alerts?.length})
        </button>
        <button
          onClick={() => setActiveTab('TRENDS')}
          className={`pb-3 px-3 transition-all border-b-2 cursor-pointer ${
            activeTab === 'TRENDS' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          Trend Analysis
        </button>
      </div>

      {/* Tab 1: Executive Overview */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Left Column: Key Insights */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col gap-4">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Sparkle size={18} className="text-indigo-600" /> Operational Insights & Anomaly Sweeper
              </h3>
              <div className="flex flex-col gap-2.5">
                {insights?.map((ins) => (
                  <div key={ins.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800 font-mono">
                        {ins.category}
                      </span>
                      <span className="text-gray-800 font-medium">{ins.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Metrics Table */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col gap-4">
              <h3 className="font-bold text-gray-900 text-sm">Enterprise Business Snapshot</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-gray-500 text-[11px]">Organizations</div>
                  <div className="text-lg font-bold text-gray-900 mt-1">{metrics?.organizationsCount}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-gray-500 text-[11px]">MSME Profiles</div>
                  <div className="text-lg font-bold text-gray-900 mt-1">{metrics?.businessesCount}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-gray-500 text-[11px]">Storage MB</div>
                  <div className="text-lg font-bold text-indigo-600 mt-1">{metrics?.totalStorageMB?.toLocaleString()} MB</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-gray-500 text-[11px]">Legal Holds</div>
                  <div className="text-lg font-bold text-amber-600 mt-1">{metrics?.activeLegalHoldsCount}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Executive Actions */}
          <div className="flex flex-col gap-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col gap-4">
              <h3 className="font-bold text-gray-900 text-sm">Executive Reporting Center</h3>
              <p className="text-gray-600 text-[11px]">Select report type to generate export-ready executive summary briefing.</p>
              <select
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
                className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
              >
                <option value="EXECUTIVE_SUMMARY">Executive Briefing Summary</option>
                <option value="PLATFORM_HEALTH">Platform Health Diagnostic</option>
                <option value="COMPLIANCE">Compliance Trajectory Report</option>
                <option value="SECURITY">Security Posture Audit Report</option>
                <option value="AI_GOVERNANCE">AI Governance & Prompt Audit</option>
                <option value="DOCUMENT_REPOSITORY">Document Vault Metrics Report</option>
              </select>
              <button
                onClick={handleGenerateReport}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all cursor-pointer"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: System Health */}
      {activeTab === 'HEALTH' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {health?.modules?.map((m) => (
            <div key={m.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{m.module_name}</span>
                  <span className="font-mono text-[10px] text-gray-400">({m.module_key})</span>
                </div>
                <p className="text-gray-500 font-medium text-[11px]">{m.reason}</p>
              </div>
              <span className="px-3 py-1 rounded-lg font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                {m.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Domain Analytics */}
      {activeTab === 'ANALYTICS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* User Analytics */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col gap-3">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Users size={16} className="text-indigo-600" /> User Engagement & Growth Analytics
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="p-2.5 bg-gray-50 rounded-xl">
                <div className="text-gray-500">DAU</div>
                <div className="text-base font-bold text-gray-900 mt-0.5">{analytics?.users?.dailyActiveUsers}</div>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl">
                <div className="text-gray-500">WAU</div>
                <div className="text-base font-bold text-gray-900 mt-0.5">{analytics?.users?.weeklyActiveUsers}</div>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl">
                <div className="text-gray-500">MAU</div>
                <div className="text-base font-bold text-gray-900 mt-0.5">{analytics?.users?.monthlyActiveUsers}</div>
              </div>
            </div>
          </div>

          {/* Compliance & Security */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col gap-3">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600" /> Security Posture & Compliance Health
            </h3>
            <div className="grid grid-cols-2 gap-2 text-center pt-2">
              <div className="p-2.5 bg-emerald-50/60 rounded-xl">
                <div className="text-emerald-800 font-medium">Compliance Avg</div>
                <div className="text-base font-bold text-emerald-950 mt-0.5">{analytics?.compliance?.overallComplianceScore}%</div>
              </div>
              <div className="p-2.5 bg-indigo-50/60 rounded-xl">
                <div className="text-indigo-800 font-medium">Security Index</div>
                <div className="text-base font-bold text-indigo-950 mt-0.5">{analytics?.security?.securityScorePct}%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Operational Alerts */}
      {activeTab === 'ALERTS' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">Operational Alert Log & Lifecycle</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {alerts?.map((a) => (
              <div key={a.id} className="p-4 flex items-center justify-between hover:bg-gray-50/40">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{a.title}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">{a.category}</span>
                  </div>
                  <p className="text-gray-500 font-medium">{a.message}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700">
                    {a.status}
                  </span>
                  {a.status === 'OPEN' && (
                    <button
                      onClick={() => handleUpdateAlertStatus(a.id, 'ACKNOWLEDGED')}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-md font-bold cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
