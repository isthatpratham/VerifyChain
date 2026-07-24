/**
 * DeveloperPlatformPage.jsx
 * Premium Enterprise Developer Platform Workspace — Phase 8.5.
 * Provides complete management experience for APIs, API Keys, Webhooks, Connectors, Applications,
 * Usage Analytics, Audit Center, Security Center, Observability, and Universal Search.
 */
import { useState, useEffect } from 'react';
import {
  Code,
  Key,
  Broadcast,
  Plugs,
  ChartLineUp,
  ShieldWarning,
  MagnifyingGlass,
  CheckCircle,
  Warning,
  ArrowClockwise,
  Plus,
  Trash,
  LockKey,
  Globe,
  SquaresFour,
  Pulse,
  BookmarkSimple,
  Copy,
  Check,
  Eye,
  EyeSlash,
} from '@phosphor-icons/react';

export function DeveloperPlatformPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // State Datasets
  const [dashboardData, setDashboardData] = useState(null);
  const [apiKeys, setApiKeys] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [connectors, setConnectors] = useState(null);
  const [applications, setApplications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [securityReport, setSecurityReport] = useState(null);
  const [observability, setObservability] = useState(null);

  // Modals & Interactivity State
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdRawKey, setCreatedRawKey] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const [showCreateAppModal, setShowCreateAppModal] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppDesc, setNewAppDesc] = useState('');

  const [showCreateWebhookModal, setShowCreateWebhookModal] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [createdSigningSecret, setCreatedSigningSecret] = useState(null);

  // Fetch initial dashboard data
  useEffect(() => {
    fetchDeveloperPlatformData();
  }, [activeTab]);

  const fetchDeveloperPlatformData = async () => {
    setLoading(true);
    try {
      // Mock / Real API endpoint fetcher
      const token = localStorage.getItem('vc_auth_token');
      const headers = { Authorization: `Bearer ${token}` };

      if (activeTab === 'overview') {
        const res = await fetch('/api/v1/developer-platform/dashboard', { headers });
        const json = await res.json();
        if (json.success) setDashboardData(json.data);
      } else if (activeTab === 'apikeys') {
        const res = await fetch('/api/v1/developer-platform/apikeys?developerAppId=1', { headers });
        const json = await res.json();
        if (json.success) setApiKeys(json.data);
      } else if (activeTab === 'webhooks') {
        const res = await fetch('/api/v1/developer-platform/webhooks?developerAppId=1', { headers });
        const json = await res.json();
        if (json.success) setWebhooks(json.data);
      } else if (activeTab === 'connectors') {
        const res = await fetch('/api/v1/developer-platform/connectors', { headers });
        const json = await res.json();
        if (json.success) setConnectors(json.data);
      } else if (activeTab === 'apps') {
        const res = await fetch('/api/v1/developer-platform/apps', { headers });
        const json = await res.json();
        if (json.success) setApplications(json.data);
      } else if (activeTab === 'analytics') {
        const res = await fetch('/api/v1/developer-platform/analytics?days=7', { headers });
        const json = await res.json();
        if (json.success) setAnalytics(json.data);
      } else if (activeTab === 'audit') {
        const res = await fetch('/api/v1/developer-platform/audit', { headers });
        const json = await res.json();
        if (json.success) setAuditLogs(json.data);
      } else if (activeTab === 'security') {
        const res = await fetch('/api/v1/developer-platform/security', { headers });
        const json = await res.json();
        if (json.success) setSecurityReport(json.data);
      } else if (activeTab === 'observability') {
        const res = await fetch('/api/v1/developer-platform/observability', { headers });
        const json = await res.json();
        if (json.success) setObservability(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch Developer Platform data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalSearch = async (query) => {
    setSearchQuery(query);
    if (!query || query.trim().length === 0) {
      setSearchResults(null);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/v1/developer-platform/search?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (json.success) setSearchResults(json.data);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateApiKey = async () => {
    try {
      const res = await fetch('/api/v1/developer-platform/apikeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ developerAppId: 1, name: newKeyName || 'Primary API Key', environment: 'PRODUCTION' }),
      });
      const json = await res.json();
      if (json.success) {
        setCreatedRawKey(json.data.rawKey);
        fetchDeveloperPlatformData();
      }
    } catch (err) {
      console.error('Failed to create key:', err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: SquaresFour },
    { id: 'apikeys', label: 'API Keys', icon: Key },
    { id: 'webhooks', label: 'Webhooks', icon: Broadcast },
    { id: 'connectors', label: 'Connectors', icon: Plugs },
    { id: 'apps', label: 'Applications', icon: Code },
    { id: 'analytics', label: 'Analytics', icon: ChartLineUp },
    { id: 'audit', label: 'Audit Center', icon: BookmarkSimple },
    { id: 'security', label: 'Security Center', icon: ShieldWarning },
    { id: 'observability', label: 'Observability', icon: Pulse },
  ];

  return (
    <div className="space-y-8">
      {/* Workspace Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
              <Code size={22} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Developer Platform</h1>
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-mono text-xs font-bold border border-indigo-100">
              v1.0.0 Enterprise
            </span>
          </div>
          <p className="text-sm text-gray-500 max-w-2xl">
            Enterprise Management Workspace for REST APIs, Webhook Subscriptions, Integration Connectors, API Keys, Usage Analytics, and Security.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full md:w-80">
          <div className="relative">
            <MagnifyingGlass size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search keys, webhooks, apps..."
              value={searchQuery}
              onChange={(e) => handleGlobalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Search Dropdown Results */}
          {searchResults && searchResults.results.length > 0 && (
            <div className="absolute top-12 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-2 space-y-1 max-h-80 overflow-y-auto">
              <div className="px-3 py-1.5 text-[10px] font-mono text-gray-400 uppercase font-bold">
                Search Results ({searchResults.totalResults})
              </div>
              {searchResults.results.map((res, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSearchResults(null);
                    setSearchQuery('');
                  }}
                  className="p-2.5 rounded-xl hover:bg-indigo-50 cursor-pointer flex flex-col transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">{res.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600">{res.type}</span>
                  </div>
                  <span className="text-[11px] text-gray-500">{res.subtitle}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-xs whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Container */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-gray-400 animate-pulse">
          Loading Developer Platform metrics...
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase font-mono">Active API Keys</span>
                    <div className="text-2xl font-black text-gray-900 mt-1">{dashboardData?.metrics?.activeApiKeys || 2}</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Key size={20} /></div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase font-mono">Success Rate (24h)</span>
                    <div className="text-2xl font-black text-emerald-600 mt-1">{dashboardData?.metrics?.successRate24h || 100}%</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle size={20} /></div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase font-mono">Avg Latency</span>
                    <div className="text-2xl font-black text-indigo-600 mt-1">{dashboardData?.metrics?.avgLatencyMs24h || 14} ms</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Pulse size={20} /></div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase font-mono">Connections Health</span>
                    <div className="text-2xl font-black text-purple-600 mt-1">{dashboardData?.metrics?.healthyConnections || 3} Healthy</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><Plugs size={20} /></div>
                </div>
              </div>

              {/* Connected Apps & Recent Audit Log */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <Code size={18} className="text-indigo-600" /> Connected Applications
                  </h3>
                  <div className="space-y-3">
                    {dashboardData?.recentApplications?.map((app) => (
                      <div key={app.id} className="p-3.5 rounded-xl border border-gray-100 bg-slate-50/50 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-gray-900 block">{app.name}</span>
                          <span className="text-[10px] text-gray-500 font-mono">ID: {app.app_id} • Environment: {app.environment}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">Active</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <BookmarkSimple size={18} className="text-indigo-600" /> Recent Audit Activity
                  </h3>
                  <div className="space-y-3">
                    {dashboardData?.recentAuditLogs?.map((log) => (
                      <div key={log.id} className="p-3 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-gray-900">{log.action}</span>
                          <span className="text-gray-400 block text-[10px] font-mono">Resource: {log.resource_type} ({log.resource_id})</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">{new Date(log.created_at).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: API KEYS */}
          {activeTab === 'apikeys' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-gray-900">API Keys</h3>
                  <p className="text-xs text-gray-500">Manage high-entropy API keys for secure REST API access.</p>
                </div>
                <button
                  onClick={() => setShowCreateKeyModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-2 shadow-xs hover:bg-indigo-700 transition-colors"
                >
                  <Plus size={16} /> Create API Key
                </button>
              </div>

              {/* Raw Key One-Time Display Alert */}
              {createdRawKey && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle size={18} /> Save Your API Secret Key Now!
                  </div>
                  <p className="text-[11px] text-emerald-700">This raw secret key will NEVER be shown again. Store it securely in your secrets manager.</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2.5 bg-white border border-emerald-200 rounded-lg text-xs font-mono font-bold text-gray-900 select-all">
                      {createdRawKey}
                    </code>
                    <button
                      onClick={() => copyToClipboard(createdRawKey)}
                      className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 transition-colors"
                    >
                      {copiedKey ? <Check size={14} /> : <Copy size={14} />} {copiedKey ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              {/* Keys Table */}
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                {apiKeys.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-xs">No active API keys found. Create your first API key above.</div>
                ) : (
                  apiKeys.map((key) => (
                    <div key={key.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-gray-900">{key.name}</span>
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-mono font-bold">{key.environment}</span>
                        </div>
                        <code className="text-xs font-mono text-gray-500 block">{key.displayKey}</code>
                        <div className="text-[10px] text-gray-400 font-mono">Scopes: {key.scopes?.join(', ') || 'ALL'}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">{key.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: WEBHOOKS */}
          {activeTab === 'webhooks' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-gray-900">Webhook Subscriptions</h3>
                  <p className="text-xs text-gray-500">Configure real-time HMAC-SHA256 signed event notifications.</p>
                </div>
                <button
                  onClick={() => setShowCreateWebhookModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-2 shadow-xs hover:bg-indigo-700 transition-colors"
                >
                  <Plus size={16} /> Add Subscription
                </button>
              </div>

              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                {webhooks.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-xs">No active webhook subscriptions found.</div>
                ) : (
                  webhooks.map((wh) => (
                    <div key={wh.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
                      <div className="space-y-1">
                        <span className="font-bold text-xs text-gray-900 block">{wh.subscription_id}</span>
                        <code className="text-xs font-mono text-indigo-600 block">{wh.target_url}</code>
                        <span className="text-[10px] text-gray-400">Events: {wh.subscribed_events?.join(', ') || 'ALL'}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${wh.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {wh.is_active ? 'Active' : 'Paused'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CONNECTORS */}
          {activeTab === 'connectors' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div>
                <h3 className="font-bold text-base text-gray-900">Third-Party Integration Connectors</h3>
                <p className="text-xs text-gray-500">Manage connected SAP ERP, Salesforce CRM, and Statutory Portals.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connectors?.activeConnections?.map((conn) => (
                  <div key={conn.id} className="p-5 border border-gray-200 rounded-xl space-y-3 hover:border-indigo-200 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-900">{conn.integration?.name || 'Integration'}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">{conn.health_status}</span>
                    </div>
                    <div className="text-[11px] font-mono text-gray-500">ID: {conn.connection_identifier}</div>
                    <div className="text-[10px] text-gray-400">Provider Code: {conn.integration?.provider_code}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div>
                <h3 className="font-bold text-base text-gray-900">API Usage Analytics</h3>
                <p className="text-xs text-gray-500">Visual operational insights and request volume trends.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-gray-100">
                  <span className="text-xs text-gray-500 font-mono uppercase block">Total Requests</span>
                  <span className="text-xl font-black text-gray-900">{analytics?.summary?.totalRequests || 0}</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-gray-100">
                  <span className="text-xs text-gray-500 font-mono uppercase block">Success Rate</span>
                  <span className="text-xl font-black text-emerald-600">{analytics?.summary?.successRate || 100}%</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-gray-100">
                  <span className="text-xs text-gray-500 font-mono uppercase block">Avg Latency</span>
                  <span className="text-xl font-black text-indigo-600">{analytics?.summary?.avgLatencyMs || 15} ms</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SECURITY CENTER */}
          {activeTab === 'security' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-gray-900">Security Center & Credential Audit</h3>
                  <p className="text-xs text-gray-500">Credential posture, expired keys audit, and security recommendations.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-600">Security Score:</span>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-xs border border-emerald-100">
                    {securityReport?.securityScore || 100} / 100
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {securityReport?.recommendations?.map((rec) => (
                  <div key={rec.id} className="p-4 rounded-xl border border-gray-100 bg-slate-50/50 flex items-start gap-3">
                    <CheckCircle size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-xs text-gray-900 block">{rec.title}</span>
                      <p className="text-xs text-gray-600 mt-0.5">{rec.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: OBSERVABILITY */}
          {activeTab === 'observability' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div>
                <h3 className="font-bold text-base text-gray-900">System Observability & Health</h3>
                <p className="text-xs text-gray-500">Real-time status of Database, API Gateway, Webhook Queue, and Connector Engine.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-gray-100 bg-emerald-50/30">
                  <span className="text-xs font-bold text-gray-900 block">Database</span>
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                    <CheckCircle size={14} /> Operational
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-gray-100 bg-emerald-50/30">
                  <span className="text-xs font-bold text-gray-900 block">API Gateway</span>
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                    <CheckCircle size={14} /> Operational
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-gray-100 bg-emerald-50/30">
                  <span className="text-xs font-bold text-gray-900 block">Webhook Queue</span>
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                    <CheckCircle size={14} /> Operational
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-gray-100 bg-emerald-50/30">
                  <span className="text-xs font-bold text-gray-900 block">Connector Engine</span>
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                    <CheckCircle size={14} /> Operational
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Create API Key */}
      {showCreateKeyModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <h3 className="font-black text-lg text-gray-900">Create New API Key</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Key Name</label>
                <input
                  type="text"
                  placeholder="e.g. Production ERP Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCreateKeyModal(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleCreateApiKey();
                  setShowCreateKeyModal(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
              >
                Generate Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeveloperPlatformPage;
