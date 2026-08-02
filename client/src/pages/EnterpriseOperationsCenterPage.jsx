/**
 * EnterpriseOperationsCenterPage.jsx
 * Enterprise Operations Center & Application Intelligence Workspace (Phase 11.5).
 * Strictly adheres to DESIGN_SYSTEM.md enterprise tokens.
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
import { Toast } from '../ui/Toast';

export function EnterpriseOperationsCenterPage() {
  const [activeTab, setActiveTab] = useState('OVERVIEW');
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
      Toast.error('Failed to sync operational telemetry.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAlertStatus = async (alertId, newStatus) => {
    try {
      await axios.put(`/api/v1/operations-analytics/alerts/${alertId}`, { status: newStatus });
      Toast.success(`Alert status updated to ${newStatus}.`);
      fetchOperationsCenterData();
    } catch (err) {
      Toast.error(`Alert state update failed: ${err.message}`);
    }
  };

  const handleGenerateReport = async () => {
    try {
      await axios.post('/api/v1/operations-analytics/reports/generate', {
        reportType: selectedReportType,
      });
      Toast.success('Operational Report generated successfully.');
      fetchOperationsCenterData();
    } catch (err) {
      Toast.error(`Report generation failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] gap-3 text-[--vc-text-tertiary]">
        <ArrowClockwise size={24} className="animate-spin text-[--vc-brand]" />
        <span className="text-[--text-xs] font-semibold">Loading Operations Center Intelligence Payload...</span>
      </div>
    );
  }

  const { summary, health, metrics, analytics, alerts, trends, kpis, insights } = dashboard || {};

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[--vc-surface-raised] p-6 rounded-[--radius-md] border border-[--vc-border] flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-[--vc-brand] text-white rounded-[--radius-sm]">
              <Activity size={28} weight="bold" />
            </div>
            <div>
              <h1 className="text-[--text-xl] font-bold text-[--vc-text-primary] tracking-tight font-[--font-heading]">Enterprise Operations Center</h1>
              <p className="text-[--text-xs] text-[--vc-text-secondary] font-medium mt-0.5">
                Application Operational Intelligence, System Health, Business Metrics & Predictive Trends
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchOperationsCenterData}
              className="px-3.5 py-2 bg-[--vc-bg-base] hover:bg-[--vc-bg-muted] text-[--vc-text-primary] text-[--text-xs] font-semibold rounded-[--radius-md] border border-[--vc-border] flex items-center gap-2 transition-all"
            >
              <ArrowClockwise size={16} /> Sync Telemetry
            </button>
          </div>
        </div>

        {/* Operational KPI Bar */}
        {kpis && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 border-t border-[--vc-border] pt-5 text-[--text-xs]">
            <div className="p-3 bg-[--vc-bg-base] rounded-[--radius-sm] border border-[--vc-border]">
              <span className="text-[--vc-text-tertiary] font-medium font-mono text-[10px] uppercase">System Uptime</span>
              <div className="text-[--text-lg] font-bold font-mono text-[--vc-success-text] mt-1">{kpis.systemUptimePct}%</div>
            </div>
            <div className="p-3 bg-[--vc-bg-base] rounded-[--radius-sm] border border-[--vc-border]">
              <span className="text-[--vc-text-tertiary] font-medium font-mono text-[10px] uppercase">Avg API Latency</span>
              <div className="text-[--text-lg] font-bold font-mono text-[--vc-brand] mt-1">{kpis.avgApiLatencyMs}ms</div>
            </div>
            <div className="p-3 bg-[--vc-bg-base] rounded-[--radius-sm] border border-[--vc-border]">
              <span className="text-[--vc-text-tertiary] font-medium font-mono text-[10px] uppercase">Active Alerts</span>
              <div className="text-[--text-lg] font-bold font-mono text-[--vc-warning-text] mt-1">{kpis.activeAlertCount}</div>
            </div>
            <div className="p-3 bg-[--vc-bg-base] rounded-[--radius-sm] border border-[--vc-border]">
              <span className="text-[--vc-text-tertiary] font-medium font-mono text-[10px] uppercase">Cache Hit Rate</span>
              <div className="text-[--text-lg] font-bold font-mono text-[--vc-text-primary] mt-1">{kpis.cacheHitRatioPct}%</div>
            </div>
            <div className="p-3 bg-[--vc-bg-base] rounded-[--radius-sm] border border-[--vc-border]">
              <span className="text-[--vc-text-tertiary] font-medium font-mono text-[10px] uppercase">Error Rate (24h)</span>
              <div className="text-[--text-lg] font-bold font-mono text-[--vc-success-text] mt-1">{kpis.errorRate24hPct}%</div>
            </div>
            <div className="p-3 bg-[--vc-bg-base] rounded-[--radius-sm] border border-[--vc-border]">
              <span className="text-[--vc-text-tertiary] font-medium font-mono text-[10px] uppercase">Active Connectors</span>
              <div className="text-[--text-lg] font-bold font-mono text-[--vc-brand] mt-1">{kpis.healthyConnectors}</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[--vc-border] overflow-x-auto pb-1">
        {['OVERVIEW', 'HEALTH', 'METRICS', 'ANALYTICS', 'ALERTS', 'REPORTS'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-[--radius-md] font-medium text-[--text-xs] whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-[--vc-brand] text-white font-semibold'
                : 'text-[--vc-text-secondary] hover:text-[--vc-text-primary] hover:bg-[--vc-bg-subtle]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Workspace Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column (2 Cols): Operational Analytics */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Active System Health Component Breakdown */}
          <div className="bg-[--vc-surface-raised] p-5 rounded-[--radius-md] border border-[--vc-border] flex flex-col gap-4">
            <h3 className="text-[--text-sm] font-bold text-[--vc-text-primary] pb-2 border-b border-[--vc-border] font-[--font-heading]">
              Component Subsystem Health Overview
            </h3>
            {health && health.services ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(health.services).map(([svc, info]) => (
                  <div key={svc} className="p-3 rounded-[--radius-sm] bg-[--vc-bg-base] border border-[--vc-border] flex items-center justify-between text-[--text-xs]">
                    <span className="font-semibold text-[--vc-text-primary] capitalize">{svc.replace(/_/g, ' ')}</span>
                    <span className="px-2 py-0.5 rounded-[--radius-sm] text-[10px] font-bold font-mono bg-[--vc-success-bg] text-[--vc-success-text] border border-[--vc-success]/20">
                      {info.status || 'HEALTHY'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[--text-xs] text-[--vc-text-tertiary] py-4">No subsystem telemetry available.</div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Active Alerts & Executive Reports */}
        <div className="flex flex-col gap-6">
          {/* Active Alerts */}
          <div className="bg-[--vc-surface-raised] p-5 rounded-[--radius-md] border border-[--vc-border] flex flex-col gap-3">
            <h3 className="text-[--text-sm] font-bold text-[--vc-text-primary] pb-2 border-b border-[--vc-border] flex items-center gap-2 font-[--font-heading]">
              <Warning size={16} className="text-[--vc-warning]" /> Operational Alerts ({alerts?.length || 0})
            </h3>
            {alerts && alerts.length > 0 ? (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {alerts.map((al) => (
                  <div key={al.id} className="p-3 rounded-[--radius-sm] bg-[--vc-warning-bg] border border-[--vc-warning]/30 text-[--text-xs] space-y-1">
                    <div className="font-bold text-[--vc-warning-text] flex items-center justify-between">
                      <span>{al.alert_name}</span>
                      <span className="font-mono text-[10px]">{al.severity}</span>
                    </div>
                    <p className="text-[11px] text-[--vc-warning-text]/90">{al.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[--text-xs] text-[--vc-text-tertiary]">No active operational alerts.</p>
            )}
          </div>

          {/* Report Generator */}
          <div className="bg-[--vc-surface-raised] p-5 rounded-[--radius-md] border border-[--vc-border] flex flex-col gap-3">
            <h3 className="text-[--text-sm] font-bold text-[--vc-text-primary] pb-2 border-b border-[--vc-border] flex items-center gap-2 font-[--font-heading]">
              <DownloadSimple size={16} className="text-[--vc-brand]" /> Operational Reports
            </h3>
            <div className="space-y-3 text-[--text-xs]">
              <select
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
                className="w-full p-2 bg-[--vc-surface] border border-[--vc-border] rounded-[--radius-md] text-[--vc-text-primary]"
              >
                <option value="EXECUTIVE_SUMMARY">Executive Operations Summary</option>
                <option value="SLA_COMPLIANCE">SLA & Latency Audit</option>
                <option value="SECURITY_TELEMETRY">Security & Threat Telemetry</option>
              </select>
              <button
                onClick={handleGenerateReport}
                className="w-full py-2 bg-[--vc-brand] hover:bg-[--vc-brand-hover] text-white font-semibold rounded-[--radius-md] text-[--text-xs] transition-colors"
              >
                Export Report Payload
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
