/**
 * EnterpriseAIAdminPage.jsx
 * Enterprise AI Administration & Governance Workspace (Phase 11.4).
 * Strictly adheres to DESIGN_SYSTEM.md enterprise tokens.
 */

import React, { useState, useEffect } from 'react';
import {
  Brain,
  Cpu,
  CodeBlock,
  Scales,
  Gauge,
  Sliders,
  ListChecks,
  Sparkle,
  Plus,
  MagnifyingGlass,
  ArrowClockwise,
  CheckCircle,
  WarningCircle,
  X,
  DotsThreeVertical,
  Clock,
  Play,
  PencilSimple,
  GitBranch,
} from '@phosphor-icons/react';
import axios from 'axios';

export function EnterpriseAIAdminPage() {
  const [activeTab, setActiveTab] = useState('PROVIDERS');
  const [stats, setStats] = useState(null);
  const [providers, setProviders] = useState([]);
  const [models, setModels] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [quotas, setQuotas] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Form States
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);

  const [promptCode, setPromptCode] = useState('');
  const [promptName, setPromptName] = useState('');
  const [promptCategory, setPromptCategory] = useState('COMPLIANCE');
  const [promptTemplate, setPromptTemplate] = useState('');

  const [quotaScope, setQuotaScope] = useState('ORGANIZATION');
  const [quotaScopeId, setQuotaScopeId] = useState('');
  const [quotaDaily, setQuotaDaily] = useState(5000);
  const [quotaMonthly, setQuotaMonthly] = useState(10000000);

  useEffect(() => {
    fetchAIAdminData();
  }, [activeTab]);

  const fetchAIAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, provRes, modelRes, promptRes, polRes, quotaRes, cfgRes, auditRes] = await Promise.all([
        axios.get('/api/v1/ai-admin/dashboard/stats'),
        axios.get('/api/v1/ai-admin/providers'),
        axios.get('/api/v1/ai-admin/models'),
        axios.get('/api/v1/ai-admin/prompts'),
        axios.get('/api/v1/ai-admin/policies'),
        axios.get('/api/v1/ai-admin/quotas'),
        axios.get('/api/v1/ai-admin/config'),
        axios.get('/api/v1/ai-admin/audits'),
      ]);

      setStats(statsRes.data.data);
      setProviders(provRes.data.data || []);
      setModels(modelRes.data.data || []);
      setPrompts(promptRes.data.data || []);
      setPolicies(polRes.data.data || []);
      setQuotas(quotaRes.data.data || []);
      setConfigs(cfgRes.data.data || []);
      setAuditEvents(auditRes.data.data || []);
    } catch (err) {
      console.error('[EnterpriseAIAdmin] Error loading AI administration data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrompt = async (e) => {
    e.preventDefault();
    if (!promptCode || !promptName || !promptTemplate) return;
    try {
      await axios.post('/api/v1/ai-admin/prompts', {
        code: promptCode,
        name: promptName,
        category: promptCategory,
        templateText: promptTemplate,
      });
      setPromptCode('');
      setPromptName('');
      setPromptTemplate('');
      setShowPromptModal(false);
      fetchAIAdminData();
    } catch (err) {
      alert(`Prompt template creation failed: ${err.message}`);
    }
  };

  const handleCreateQuota = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/v1/ai-admin/quotas', {
        scope: quotaScope,
        scopeId: quotaScopeId || 'GLOBAL',
        dailyTokenLimit: parseInt(quotaDaily, 10),
        monthlyTokenLimit: parseInt(quotaMonthly, 10),
      });
      setShowQuotaModal(false);
      fetchAIAdminData();
    } catch (err) {
      alert(`Quota allocation failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] gap-3 text-[--vc-text-tertiary]">
        <Brain size={24} className="animate-spin text-[--vc-brand]" />
        <span className="text-[--text-xs] font-semibold">Loading AI Platform Governance Admin...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[--vc-surface-raised] p-6 rounded-[--radius-md] border border-[--vc-border] flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-[--vc-brand] text-white rounded-[--radius-sm]">
              <Brain size={28} weight="bold" />
            </div>
            <div>
              <h1 className="text-[--text-xl] font-bold text-[--vc-text-primary] tracking-tight font-[--font-heading]">
                Enterprise AI Administration & Governance
              </h1>
              <p className="text-[--text-xs] text-[--vc-text-secondary] font-medium mt-0.5">
                Multi-Model Infrastructure Management, System Prompt Catalog, Safety Governance & Token Accounting
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPromptModal(true)}
              className="px-3.5 py-2 bg-[--vc-brand] hover:bg-[--vc-brand-hover] text-white text-[--text-xs] font-semibold rounded-[--radius-md] flex items-center gap-1.5 transition-all"
            >
              <Plus size={15} weight="bold" /> New Prompt Template
            </button>
            <button
              onClick={() => setShowQuotaModal(true)}
              className="px-3.5 py-2 bg-[--vc-bg-base] hover:bg-[--vc-bg-muted] text-[--vc-text-primary] text-[--text-xs] font-semibold rounded-[--radius-md] border border-[--vc-border] flex items-center gap-1.5 transition-all"
            >
              <Gauge size={15} /> Allocate Quota
            </button>
          </div>
        </div>

        {/* AI Admin KPI Bar */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 border-t border-[--vc-border] pt-5 text-[--text-xs]">
            <div className="p-3 bg-[--vc-bg-base] rounded-[--radius-sm] border border-[--vc-border]">
              <span className="text-[--vc-text-tertiary] font-mono text-[10px] uppercase">Active Providers</span>
              <div className="text-[--text-lg] font-bold font-mono text-[--vc-text-primary] mt-1">{stats.activeProviders}</div>
            </div>
            <div className="p-3 bg-[--vc-bg-base] rounded-[--radius-sm] border border-[--vc-border]">
              <span className="text-[--vc-text-tertiary] font-mono text-[10px] uppercase">Depl. AI Models</span>
              <div className="text-[--text-lg] font-bold font-mono text-[--vc-brand] mt-1">{stats.activeModels}</div>
            </div>
            <div className="p-3 bg-[--vc-bg-base] rounded-[--radius-sm] border border-[--vc-border]">
              <span className="text-[--vc-text-tertiary] font-mono text-[10px] uppercase">System Prompts</span>
              <div className="text-[--text-lg] font-bold font-mono text-[--vc-success-text] mt-1">{stats.systemPromptsCount}</div>
            </div>
            <div className="p-3 bg-[--vc-bg-base] rounded-[--radius-sm] border border-[--vc-border]">
              <span className="text-[--vc-text-tertiary] font-mono text-[10px] uppercase">Safety Policies</span>
              <div className="text-[--text-lg] font-bold font-mono text-[--vc-warning-text] mt-1">{stats.activePolicies}</div>
            </div>
            <div className="p-3 bg-[--vc-bg-base] rounded-[--radius-sm] border border-[--vc-border]">
              <span className="text-[--vc-text-tertiary] font-mono text-[10px] uppercase">Total Tokens (24h)</span>
              <div className="text-[--text-lg] font-bold font-mono text-[--vc-info-text] mt-1">{stats.tokensConsumed24h?.toLocaleString() || 0}</div>
            </div>
            <div className="p-3 bg-[--vc-bg-base] rounded-[--radius-sm] border border-[--vc-border]">
              <span className="text-[--vc-text-tertiary] font-mono text-[10px] uppercase">Avg AI Latency</span>
              <div className="text-[--text-lg] font-bold font-mono text-[--vc-brand] mt-1">{stats.avgExecutionMs}ms</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[--vc-border] overflow-x-auto pb-1">
        {['PROVIDERS', 'MODELS', 'PROMPTS', 'POLICIES', 'QUOTAS'].map((tab) => (
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

      {/* Providers Grid */}
      {activeTab === 'PROVIDERS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {providers.map((p) => (
            <div key={p.id} className="bg-[--vc-surface-raised] p-5 rounded-[--radius-md] border border-[--vc-border] flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-[--font-heading] text-[--text-sm] font-bold text-[--vc-text-primary]">{p.name}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-[--radius-sm] bg-[--vc-success-bg] text-[--vc-success-text] font-bold border border-[--vc-success]/20">
                    {p.status || 'ACTIVE'}
                  </span>
                </div>
                <p className="text-[--text-xs] text-[--vc-text-secondary] font-mono">Code: {p.code}</p>
              </div>
              <div className="pt-3 border-t border-[--vc-border] flex justify-between items-center text-[11px] text-[--vc-text-tertiary] font-mono">
                <span>Priority: {p.priority || 1}</span>
                <span>Type: {p.type || 'LLM_ENGINE'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showPromptModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
          <div className="bg-[--vc-surface-overlay] rounded-[--radius-md] max-w-md w-full p-6 border border-[--vc-border] flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[--vc-border] pb-3">
              <h3 className="text-[--text-base] font-bold text-[--vc-text-primary] font-[--font-heading]">Create System Prompt Template</h3>
              <button onClick={() => setShowPromptModal(false)} className="text-[--vc-text-tertiary] hover:text-[--vc-text-primary]"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreatePrompt} className="flex flex-col gap-3 text-[--text-xs]">
              <div>
                <label className="block text-[--vc-text-primary] font-semibold mb-1">Prompt Code</label>
                <input
                  type="text"
                  placeholder="e.g. COMPLIANCE_ANALYSIS_V2"
                  value={promptCode}
                  onChange={(e) => setPromptCode(e.target.value)}
                  className="w-full p-2.5 bg-[--vc-surface] border border-[--vc-border] rounded-[--radius-md] text-[--vc-text-primary]"
                  required
                />
              </div>
              <div>
                <label className="block text-[--vc-text-primary] font-semibold mb-1">Prompt Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Statutory Analysis System Prompt"
                  value={promptName}
                  onChange={(e) => setPromptName(e.target.value)}
                  className="w-full p-2.5 bg-[--vc-surface] border border-[--vc-border] rounded-[--radius-md] text-[--vc-text-primary]"
                  required
                />
              </div>
              <div>
                <label className="block text-[--vc-text-primary] font-semibold mb-1">Template Text</label>
                <textarea
                  placeholder="System prompt instructions with {{variables}}..."
                  value={promptTemplate}
                  onChange={(e) => setPromptTemplate(e.target.value)}
                  className="w-full p-2.5 bg-[--vc-surface] border border-[--vc-border] rounded-[--radius-md] text-[--vc-text-primary] font-mono text-[11px]"
                  rows={4}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-[--vc-brand] hover:bg-[--vc-brand-hover] text-white font-semibold rounded-[--radius-md]">
                  Save System Prompt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
