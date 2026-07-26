/**
 * EnterpriseAIAdminPage.jsx
 * Enterprise AI Administration & Governance Workspace (Phase 11.4).
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
  const [activeTab, setActiveTab] = useState('PROVIDERS'); // PROVIDERS, MODELS, PROMPTS, POLICIES, QUOTAS, CONFIG, AUDIT
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
      alert(`Prompt creation failed: ${err.message}`);
    }
  };

  const handleSetQuota = async (e) => {
    e.preventDefault();
    if (!quotaScopeId) return;
    try {
      await axios.post('/api/v1/ai-admin/quotas', {
        scopeType: quotaScope,
        scopeId: quotaScopeId,
        dailyLimit: quotaDaily,
        monthlyLimit: quotaMonthly,
      });
      setQuotaScopeId('');
      setShowQuotaModal(false);
      fetchAIAdminData();
    } catch (err) {
      alert(`Quota setting failed: ${err.message}`);
    }
  };

  const handleRollbackPrompt = async (promptId, versionNumber) => {
    try {
      await axios.post(`/api/v1/ai-admin/prompts/${promptId}/rollback`, { versionNumber });
      fetchAIAdminData();
    } catch (err) {
      alert(`Prompt rollback failed: ${err.message}`);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 bg-gray-50/50 min-h-screen">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-xs">
              <Brain size={28} weight="bold" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">AI Operations Center & Governance</h1>
              <p className="text-xs text-gray-600 font-medium mt-0.5">
                Provider-Agnostic AI Administration, Model Catalogs, Prompt Versioning & Quotas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowQuotaModal(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Gauge size={16} weight="bold" /> Configure Quotas
            </button>
            <button
              onClick={() => setShowPromptModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} weight="bold" /> Create Prompt Template
            </button>
          </div>
        </div>

        {/* AI Operations KPIs */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 border-t border-gray-100 pt-5 text-xs">
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-500 font-semibold flex items-center gap-1.5">
                <Cpu size={15} className="text-indigo-600" /> AI Providers
              </span>
              <div className="text-xl font-bold text-gray-900 mt-1">{stats.providersCount}</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                <Sparkle size={15} className="text-slate-900" /> Model Catalog
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1">{stats.modelsCount}</div>
            </div>
            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <CodeBlock size={15} className="text-emerald-600" /> Production Prompts
              </span>
              <div className="text-xl font-bold text-emerald-900 mt-1">{stats.promptsCount}</div>
            </div>
            <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
              <span className="text-indigo-800 font-semibold flex items-center gap-1.5">
                <Scales size={15} className="text-indigo-600" /> Active Policies
              </span>
              <div className="text-xl font-bold text-indigo-950 mt-1">{stats.policiesCount}</div>
            </div>
            <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-100">
              <span className="text-amber-800 font-semibold flex items-center gap-1.5">
                <ListChecks size={15} className="text-amber-600" /> Audit Events
              </span>
              <div className="text-xl font-bold text-amber-950 mt-1">{stats.auditEventsCount}</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 text-xs font-semibold text-gray-600">
        <button
          onClick={() => setActiveTab('PROVIDERS')}
          className={`pb-3 px-3 transition-all border-b-2 cursor-pointer ${
            activeTab === 'PROVIDERS' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          Provider Registry ({providers.length})
        </button>
        <button
          onClick={() => setActiveTab('MODELS')}
          className={`pb-3 px-3 transition-all border-b-2 cursor-pointer ${
            activeTab === 'MODELS' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          Model Catalog ({models.length})
        </button>
        <button
          onClick={() => setActiveTab('PROMPTS')}
          className={`pb-3 px-3 transition-all border-b-2 cursor-pointer ${
            activeTab === 'PROMPTS' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          Prompt Library ({prompts.length})
        </button>
        <button
          onClick={() => setActiveTab('POLICIES')}
          className={`pb-3 px-3 transition-all border-b-2 cursor-pointer ${
            activeTab === 'POLICIES' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          Governance Policies ({policies.length})
        </button>
        <button
          onClick={() => setActiveTab('QUOTAS')}
          className={`pb-3 px-3 transition-all border-b-2 cursor-pointer ${
            activeTab === 'QUOTAS' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          Quota Management ({quotas.length})
        </button>
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`pb-3 px-3 transition-all border-b-2 cursor-pointer ${
            activeTab === 'AUDIT' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          AI Audit Trail ({auditEvents.length})
        </button>
      </div>

      {/* Tab 1: Provider Registry */}
      {activeTab === 'PROVIDERS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {providers.map((p) => (
            <div key={p.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-gray-500 font-semibold">{p.key}</span>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700">
                    {p.health_status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-gray-900">{p.name}</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {p.capabilities_json && Array.isArray(p.capabilities_json) && p.capabilities_json.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-700">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs text-gray-500">
                <span>Priority: <strong className="text-gray-800">#{p.priority}</strong></span>
                <span>Models: <strong className="text-indigo-600">{p.models?.length || 0}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Model Catalog */}
      {activeTab === 'MODELS' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Provider-Independent Model Catalog</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/70 text-gray-600 border-b border-gray-100 font-semibold">
                  <th className="py-3.5 px-4">Model Key</th>
                  <th className="py-3.5 px-4">Display Name</th>
                  <th className="py-3.5 px-4">Provider</th>
                  <th className="py-3.5 px-4">Context Window</th>
                  <th className="py-3.5 px-4">Streaming</th>
                  <th className="py-3.5 px-4">Structured Output</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {models.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/60">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{m.key}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">{m.name}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{m.provider?.name || m.provider_id}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-600">{m.context_window.toLocaleString()} tokens</td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-600">{m.supports_streaming ? 'Yes' : 'No'}</td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-600">{m.supports_structured_output ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Prompt Library */}
      {activeTab === 'PROMPTS' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Production Prompt Library & Versions</h3>
            <button
              onClick={() => setShowPromptModal(true)}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              + New Prompt Template
            </button>
          </div>
          <div className="divide-y divide-gray-100 text-xs">
            {prompts.map((pr) => (
              <div key={pr.id} className="p-5 flex flex-col gap-3 hover:bg-gray-50/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-600">{pr.code}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800">
                      {pr.category}
                    </span>
                  </div>
                  <span className="text-gray-500 font-semibold">Active Version: <strong className="text-gray-900 font-mono">v{pr.current_version}</strong></span>
                </div>
                <h4 className="font-bold text-gray-900 text-sm">{pr.name}</h4>
                {pr.system_prompt && (
                  <p className="text-gray-600 italic bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    System: "{pr.system_prompt}"
                  </p>
                )}

                {/* Prompt Version List */}
                <div className="flex flex-col gap-2 mt-2">
                  <span className="font-bold text-gray-700">Version History:</span>
                  {pr.versions?.map((v) => (
                    <div key={v.id} className="p-3 bg-slate-50/60 rounded-xl border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <div className="font-mono font-bold text-slate-900">v{v.version_number} ({v.status})</div>
                        <div className="text-[11px] text-gray-600 font-mono mt-0.5">{v.template_text}</div>
                      </div>
                      {v.version_number !== pr.current_version && (
                        <button
                          onClick={() => handleRollbackPrompt(pr.id, v.version_number)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg font-bold cursor-pointer"
                        >
                          Rollback to v{v.version_number}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: AI Governance Policies */}
      {activeTab === 'POLICIES' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">AI Governance Rules & Policies</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/70 text-gray-600 border-b border-gray-100 font-semibold">
                  <th className="py-3.5 px-4">Policy Code</th>
                  <th className="py-3.5 px-4">Policy Name</th>
                  <th className="py-3.5 px-4">Rule Type</th>
                  <th className="py-3.5 px-4">Rule Rules Matrix</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {policies.map((pol) => (
                  <tr key={pol.id} className="hover:bg-gray-50/60">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{pol.code}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">{pol.name}</td>
                    <td className="py-3.5 px-4 font-semibold text-indigo-600">{pol.rule_type}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-600">{JSON.stringify(pol.rules_json)}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700">
                        {pol.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New Prompt */}
      {showPromptModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Create Production Prompt Template</h3>
              <button onClick={() => setShowPromptModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreatePrompt} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Prompt Code</label>
                <input
                  type="text"
                  placeholder="PROMPT_SUPPLIER_AUDIT"
                  value={promptCode}
                  onChange={(e) => setPromptCode(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Display Name</label>
                <input
                  type="text"
                  placeholder="Supplier Audit Synthesis Prompt"
                  value={promptName}
                  onChange={(e) => setPromptName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Template Text</label>
                <textarea
                  placeholder="Synthesize compliance findings for {{supplierName}}..."
                  value={promptTemplate}
                  onChange={(e) => setPromptTemplate(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl cursor-pointer">
                  Create Prompt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Set Quota */}
      {showQuotaModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Configure AI Quota Limits</h3>
              <button onClick={() => setShowQuotaModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSetQuota} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Scope Type</label>
                <select
                  value={quotaScope}
                  onChange={(e) => setQuotaScope(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                >
                  <option value="ORGANIZATION">Organization</option>
                  <option value="USER">User</option>
                  <option value="MODULE">Module</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Scope ID / Identifier</label>
                <input
                  type="text"
                  placeholder="ENTERPRISE_ORG_1"
                  value={quotaScopeId}
                  onChange={(e) => setQuotaScopeId(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Daily Request Limit</label>
                <input
                  type="number"
                  value={quotaDaily}
                  onChange={(e) => setQuotaDaily(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-xl cursor-pointer">
                  Set Quota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
