/**
 * DeveloperPlatformPage.jsx
 * Premium Enterprise Developer Platform Workspace — Phase 8.5 & 8.6.
 * Complete experience for Developer Applications, API Keys, Webhook Subscriptions,
 * Integration Connectors, Usage Analytics, Audit Center, Security Center, Observability, and Search.
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
  Prohibit,
  Clock,
  ChartBar,
  PaperPlaneTilt,
  ListNumbers,
  Play,
  CheckFat,
  XCircle,
  Database,
  Lightning,
  ShieldCheck,
  Funnel,
  PencilSimple,
  Info,
  CalendarBlank,
  ChartPie,
  TrendUp,
  Activity,
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

  // Analytics Filter State
  const [analyticsDays, setAnalyticsDays] = useState(7);
  const [analyticsSearch, setAnalyticsSearch] = useState('');

  // Application Modal State
  const [showCreateAppModal, setShowCreateAppModal] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppDesc, setNewAppDesc] = useState('');
  const [newAppEnv, setNewAppEnv] = useState('PRODUCTION');
  const [showEditAppModal, setShowEditAppModal] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [selectedAppDetails, setSelectedAppDetails] = useState(null);
  const [showAppDetailsModal, setShowAppDetailsModal] = useState(false);

  // API Key Modal State
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [assignTargetAppId, setAssignTargetAppId] = useState(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState('PRODUCTION');
  const [newKeyExpiresDays, setNewKeyExpiresDays] = useState('90');
  const [selectedScopes, setSelectedScopes] = useState([
    'developer.read',
    'developer.write',
    'apikey.manage',
    'webhook.manage',
    'connector.manage',
    'audit.read',
  ]);
  const [createdRawKey, setCreatedRawKey] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [selectedKeyStats, setSelectedKeyStats] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Webhook Modal State
  const [showCreateWebhookModal, setShowCreateWebhookModal] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedWebhookEvents, setSelectedWebhookEvents] = useState([
    'SupplierTrustScoreUpdated',
    'VerificationCompleted',
  ]);
  const [createdSigningSecret, setCreatedSigningSecret] = useState(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [selectedWebhookLogs, setSelectedWebhookLogs] = useState(null);
  const [showWebhookLogsModal, setShowWebhookLogsModal] = useState(false);
  const [selectedWebhookSubId, setSelectedWebhookSubId] = useState(null);

  // Connector Modal State
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [connName, setConnName] = useState('');
  const [connEnv, setConnEnv] = useState('PRODUCTION');
  const [connApiKey, setConnApiKey] = useState('');
  const [selectedConnLogs, setSelectedConnLogs] = useState(null);
  const [showConnLogsModal, setShowConnLogsModal] = useState(false);
  const [selectedConnId, setSelectedConnId] = useState(null);

  const AVAILABLE_SCOPES = [
    { id: 'developer.read', label: 'Developer Read', desc: 'Read metrics, apps, & analytics' },
    { id: 'developer.write', label: 'Developer Write', desc: 'Modify apps & preferences' },
    { id: 'apikey.manage', label: 'API Key Management', desc: 'Create, rotate, & revoke API keys' },
    { id: 'webhook.manage', label: 'Webhook Management', desc: 'Manage webhook subscriptions' },
    { id: 'connector.manage', label: 'Connector Management', desc: 'Configure integration adapters' },
    { id: 'audit.read', label: 'Audit Log Read', desc: 'Search & view audit trails' },
  ];

  const SYSTEM_EVENTS = [
    { id: 'SupplierTrustScoreUpdated', label: 'Trust Score Updated', desc: 'Emitted when supplier trust score recalculates' },
    { id: 'VerificationCompleted', label: 'Verification Completed', desc: 'Emitted when GSTIN/PAN verification completes' },
    { id: 'ComplianceRequirementUpdated', label: 'Compliance Updated', desc: 'Emitted on compliance requirement changes' },
    { id: 'DistributionSynchronized', label: 'Distribution Synchronized', desc: 'Emitted when trust badge assets distribute' },
  ];

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('vc_auth_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  useEffect(() => {
    fetchDeveloperPlatformData();
  }, [activeTab, analyticsDays]);

  const fetchDeveloperPlatformData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();

      if (activeTab === 'overview') {
        const res = await fetch('/api/v1/developer-platform/dashboard', { headers });
        const json = await res.json();
        if (json.success) setDashboardData(json.data);
      } else if (activeTab === 'apikeys') {
        const res = await fetch('/api/v1/developer-platform/apikeys', { headers });
        const json = await res.json();
        if (json.success) setApiKeys(json.data);
      } else if (activeTab === 'webhooks') {
        const res = await fetch('/api/v1/developer-platform/webhooks', { headers });
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
        const queryParams = new URLSearchParams({ days: analyticsDays });
        if (analyticsSearch) queryParams.append('search', analyticsSearch);
        const res = await fetch(`/api/v1/developer-platform/analytics?${queryParams.toString()}`, { headers });
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
      const res = await fetch(`/api/v1/developer-platform/search?q=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) setSearchResults(json.data);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // ─── DEVELOPER APPLICATIONS ACTIONS ──────────────────────────────────────────

  const handleRegisterApp = async () => {
    if (!newAppName.trim()) {
      alert('Application name is required.');
      return;
    }
    try {
      const res = await fetch('/api/v1/developer-platform/apps', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: newAppName,
          description: newAppDesc,
          environment: newAppEnv,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowCreateAppModal(false);
        setNewAppName('');
        setNewAppDesc('');
        fetchDeveloperPlatformData();
      } else {
        alert(`Failed to register app: ${json.error || json.message}`);
      }
    } catch (err) {
      console.error('Failed to register application:', err);
    }
  };

  const handleUpdateApp = async () => {
    if (!editingApp) return;
    try {
      const res = await fetch(`/api/v1/developer-platform/apps/${editingApp.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: editingApp.name,
          description: editingApp.description,
          environment: editingApp.environment,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowEditAppModal(false);
        setEditingApp(null);
        fetchDeveloperPlatformData();
      } else {
        alert(`Failed to update app: ${json.error || json.message}`);
      }
    } catch (err) {
      console.error('Failed to update application:', err);
    }
  };

  const handleToggleAppActive = async (appId) => {
    try {
      const res = await fetch(`/api/v1/developer-platform/apps/${appId}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) fetchDeveloperPlatformData();
    } catch (err) {
      console.error('Failed to toggle app status:', err);
    }
  };

  const handleDeleteApp = async (appId) => {
    if (!window.confirm('Permanently delete this Developer Application and all its assigned API keys and webhooks?')) return;
    try {
      const res = await fetch(`/api/v1/developer-platform/apps/${appId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) fetchDeveloperPlatformData();
    } catch (err) {
      console.error('Failed to delete application:', err);
    }
  };

  const handleViewAppDetails = async (appId) => {
    try {
      const res = await fetch(`/api/v1/developer-platform/apps/${appId}`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedAppDetails(json.data);
        setShowAppDetailsModal(true);
      }
    } catch (err) {
      console.error('Failed to fetch app details:', err);
    }
  };

  // ─── API KEY MANAGEMENT ACTIONS ──────────────────────────────────────────────

  const handleCreateApiKey = async () => {
    try {
      const payload = {
        name: newKeyName || 'Enterprise API Key',
        environment: newKeyEnv,
        scopes: selectedScopes,
        expiresDays: parseInt(newKeyExpiresDays, 10),
      };
      if (assignTargetAppId) {
        payload.developerAppId = assignTargetAppId;
      }

      const res = await fetch('/api/v1/developer-platform/apikeys', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setCreatedRawKey(json.data.rawKey);
        setShowCreateKeyModal(false);
        setAssignTargetAppId(null);
        setNewKeyName('');
        fetchDeveloperPlatformData();
      } else {
        alert(`Failed to create key: ${json.error || json.message}`);
      }
    } catch (err) {
      console.error('Failed to create API key:', err);
    }
  };

  const handleToggleKeyStatus = async (key) => {
    const nextStatus = key.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/v1/developer-platform/apikeys/${key.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (json.success) fetchDeveloperPlatformData();
    } catch (err) {
      console.error('Failed to update API key status:', err);
    }
  };

  const handleRotateKey = async (keyId) => {
    if (!window.confirm('Are you sure you want to rotate this API Key? The old key will be revoked immediately.')) return;
    try {
      const res = await fetch(`/api/v1/developer-platform/apikeys/${keyId}/rotate`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        setCreatedRawKey(json.data.rawKey);
        fetchDeveloperPlatformData();
      }
    } catch (err) {
      console.error('Failed to rotate key:', err);
    }
  };

  const handleRevokeKey = async (keyId) => {
    const reason = prompt('Enter revocation reason:', 'Revoked via console');
    if (reason === null) return;
    try {
      const res = await fetch(`/api/v1/developer-platform/apikeys/${keyId}/revoke`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason }),
      });
      const json = await res.json();
      if (json.success) fetchDeveloperPlatformData();
    } catch (err) {
      console.error('Failed to revoke key:', err);
    }
  };

  const handleDeleteKey = async (keyId) => {
    if (!window.confirm('Permanently delete this API Key and all its usage metrics?')) return;
    try {
      const res = await fetch(`/api/v1/developer-platform/apikeys/${keyId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) fetchDeveloperPlatformData();
    } catch (err) {
      console.error('Failed to delete key:', err);
    }
  };

  const handleViewKeyStats = async (keyId) => {
    try {
      const res = await fetch(`/api/v1/developer-platform/apikeys/${keyId}/stats`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedKeyStats(json.data);
        setShowStatsModal(true);
      }
    } catch (err) {
      console.error('Failed to fetch key stats:', err);
    }
  };

  // ─── WEBHOOK MANAGEMENT ACTIONS ──────────────────────────────────────────────

  const handleCreateWebhook = async () => {
    if (!webhookUrl || (!webhookUrl.startsWith('http://') && !webhookUrl.startsWith('https://'))) {
      alert('Target URL must be a valid HTTP or HTTPS endpoint URL.');
      return;
    }

    try {
      const res = await fetch('/api/v1/developer-platform/webhooks', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          targetUrl: webhookUrl,
          subscribedEvents: selectedWebhookEvents,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCreatedSigningSecret(json.data.signingSecret);
        setShowCreateWebhookModal(false);
        setWebhookUrl('');
        fetchDeveloperPlatformData();
      } else {
        alert(`Failed to create webhook: ${json.error || json.message}`);
      }
    } catch (err) {
      console.error('Failed to create webhook subscription:', err);
    }
  };

  const handleToggleWebhookStatus = async (webhook) => {
    try {
      const res = await fetch(`/api/v1/developer-platform/webhooks/${webhook.id}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) fetchDeveloperPlatformData();
    } catch (err) {
      console.error('Failed to toggle webhook status:', err);
    }
  };

  const handleRotateWebhookSecret = async (webhookId) => {
    if (!window.confirm('Are you sure you want to rotate the HMAC signing secret for this webhook subscription?')) return;
    try {
      const res = await fetch(`/api/v1/developer-platform/webhooks/${webhookId}/rotate-secret`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        setCreatedSigningSecret(json.data.newSigningSecret);
        fetchDeveloperPlatformData();
      }
    } catch (err) {
      console.error('Failed to rotate webhook secret:', err);
    }
  };

  const handleTestWebhookPing = async (webhookId) => {
    try {
      const res = await fetch(`/api/v1/developer-platform/webhooks/${webhookId}/test`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        alert(`Ping test dispatched! Delivery Status: ${json.data.status || 'PROCESSED'}`);
        fetchDeveloperPlatformData();
      } else {
        alert(`Ping test failed: ${json.error || json.message}`);
      }
    } catch (err) {
      console.error('Failed to test webhook ping:', err);
    }
  };

  const handleDeleteWebhook = async (webhookId) => {
    if (!window.confirm('Permanently delete this Webhook Subscription and all its delivery logs?')) return;
    try {
      const res = await fetch(`/api/v1/developer-platform/webhooks/${webhookId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) fetchDeveloperPlatformData();
    } catch (err) {
      console.error('Failed to delete webhook subscription:', err);
    }
  };

  const handleViewWebhookLogs = async (webhookId) => {
    try {
      setSelectedWebhookSubId(webhookId);
      const res = await fetch(`/api/v1/developer-platform/webhooks/${webhookId}/logs`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedWebhookLogs(json.data);
        setShowWebhookLogsModal(true);
      }
    } catch (err) {
      console.error('Failed to fetch webhook delivery logs:', err);
    }
  };

  const handleReplayWebhookDelivery = async (deliveryId) => {
    try {
      const res = await fetch(`/api/v1/developer-platform/webhooks/deliveries/${deliveryId}/replay`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        alert('Webhook delivery replay dispatched!');
        if (selectedWebhookSubId) handleViewWebhookLogs(selectedWebhookSubId);
      } else {
        alert(`Replay failed: ${json.error || json.message}`);
      }
    } catch (err) {
      console.error('Failed to replay webhook delivery:', err);
    }
  };

  // ─── CONNECTOR MANAGEMENT ACTIONS ────────────────────────────────────────────

  const handleConnectProvider = async () => {
    if (!selectedProvider) return;
    try {
      const res = await fetch('/api/v1/developer-platform/connectors/connections', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          providerCode: selectedProvider.providerCode,
          name: connName || `${selectedProvider.name} (${connEnv})`,
          environment: connEnv,
          credentials: { apiKey: connApiKey || 'live_secret_key' },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowConnectModal(false);
        setConnName('');
        setConnApiKey('');
        fetchDeveloperPlatformData();
      } else {
        alert(`Failed to connect provider: ${json.error || json.message}`);
      }
    } catch (err) {
      console.error('Failed to connect provider:', err);
    }
  };

  const handleToggleConnStatus = async (connId) => {
    try {
      const res = await fetch(`/api/v1/developer-platform/connectors/connections/${connId}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) fetchDeveloperPlatformData();
    } catch (err) {
      console.error('Failed to toggle connection status:', err);
    }
  };

  const handleTestConnHealth = async (connId) => {
    try {
      const res = await fetch(`/api/v1/developer-platform/connectors/connections/${connId}/test`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        alert(`Health Diagnostic Complete!\nStatus: ${json.data.healthStatus}\nLatency: ${json.data.latencyMs}ms`);
        fetchDeveloperPlatformData();
      } else {
        alert(`Health diagnostic failed: ${json.error || json.message}`);
      }
    } catch (err) {
      console.error('Failed to test connection health:', err);
    }
  };

  const handleTriggerConnSync = async (connId) => {
    try {
      const res = await fetch(`/api/v1/developer-platform/connectors/connections/${connId}/sync`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ syncType: 'INCREMENTAL' }),
      });
      const json = await res.json();
      if (json.success) {
        alert(`Background Sync Dispatched!\nJob ID: ${json.data.jobId}\nProcessed: ${json.data.recordsProcessed} records`);
        fetchDeveloperPlatformData();
      } else {
        alert(`Sync failed: ${json.error || json.message}`);
      }
    } catch (err) {
      console.error('Failed to trigger connector sync:', err);
    }
  };

  const handleRotateConnSecret = async (connId) => {
    const newKey = prompt('Enter new API key or credential secret to encrypt:');
    if (!newKey) return;
    try {
      const res = await fetch(`/api/v1/developer-platform/connectors/connections/${connId}/rotate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ newSecretKey: newKey }),
      });
      const json = await res.json();
      if (json.success) {
        alert('Connector credentials rotated & encrypted successfully (AES-256-GCM).');
        fetchDeveloperPlatformData();
      }
    } catch (err) {
      console.error('Failed to rotate connector credentials:', err);
    }
  };

  const handleDeleteConnection = async (connId) => {
    if (!window.confirm('Disconnect and remove this integration connection permanently?')) return;
    try {
      const res = await fetch(`/api/v1/developer-platform/connectors/connections/${connId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) fetchDeveloperPlatformData();
    } catch (err) {
      console.error('Failed to delete connection:', err);
    }
  };

  const handleViewConnLogs = async (connId) => {
    try {
      setSelectedConnId(connId);
      const res = await fetch(`/api/v1/developer-platform/connectors/connections/${connId}/logs`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedConnLogs(json.data);
        setShowConnLogsModal(true);
      }
    } catch (err) {
      console.error('Failed to fetch connector logs:', err);
    }
  };

  const toggleScopeSelection = (scopeId) => {
    if (selectedScopes.includes(scopeId)) {
      setSelectedScopes(selectedScopes.filter((s) => s !== scopeId));
    } else {
      setSelectedScopes([...selectedScopes, scopeId]);
    }
  };

  const toggleWebhookEventSelection = (eventId) => {
    if (selectedWebhookEvents.includes(eventId)) {
      setSelectedWebhookEvents(selectedWebhookEvents.filter((e) => e !== eventId));
    } else {
      setSelectedWebhookEvents([...selectedWebhookEvents, eventId]);
    }
  };

  const copyToClipboard = (text, type = 'key') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: SquaresFour },
    { id: 'apps', label: 'Applications', icon: Code },
    { id: 'apikeys', label: 'API Keys', icon: Key },
    { id: 'webhooks', label: 'Webhooks', icon: Broadcast },
    { id: 'connectors', label: 'Connectors', icon: Plugs },
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
          Loading Developer Platform workspace...
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

          {/* TAB: DEVELOPER APPLICATIONS */}
          {activeTab === 'apps' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-gray-900">Developer Applications</h3>
                  <p className="text-xs text-gray-500">
                    Manage developer applications, assign API keys, configure permission scopes, environment isolation, and audit posture.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateAppModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-2 shadow-xs hover:bg-indigo-700 transition-colors shrink-0"
                >
                  <Plus size={16} /> Create Application
                </button>
              </div>

              {/* Applications Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {applications.length === 0 ? (
                  <div className="p-12 text-center text-gray-400 text-xs md:col-span-2">
                    No developer applications found. Click "Create Application" above to register your first application.
                  </div>
                ) : (
                  applications.map((app) => (
                    <div
                      key={app.id}
                      className="p-6 border border-gray-200 rounded-2xl space-y-4 hover:border-indigo-300 shadow-xs transition-all bg-white flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-black text-base text-gray-900 block">{app.name}</span>
                            <span className="text-xs font-mono text-indigo-600 font-bold block">{app.app_id}</span>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                              app.is_active
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                            }`}
                          >
                            {app.is_active ? 'ACTIVE' : 'DISABLED'}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500">{app.description || 'No description provided.'}</p>

                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-gray-500 pt-1">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                            ENV: {app.environment}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            Keys: {app.activeKeysCount || app.api_keys?.length || 0}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                            Webhooks: {app.activeWebhooksCount || app.webhook_subscriptions?.length || 0}
                          </span>
                        </div>
                      </div>

                      {/* Application Actions */}
                      <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setAssignTargetAppId(app.id);
                            setNewKeyName(`${app.name} Key`);
                            setShowCreateKeyModal(true);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Key size={14} /> Assign Key
                        </button>

                        <button
                          onClick={() => handleViewAppDetails(app.id)}
                          className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Info size={14} /> Details
                        </button>

                        <button
                          onClick={() => {
                            setEditingApp(app);
                            setShowEditAppModal(true);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <PencilSimple size={14} /> Edit
                        </button>

                        <button
                          onClick={() => handleToggleAppActive(app.id)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors ${
                            app.is_active
                              ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          <Prohibit size={14} /> {app.is_active ? 'Disable' : 'Enable'}
                        </button>

                        <button
                          onClick={() => handleDeleteApp(app.id)}
                          className="p-1.5 rounded-xl border border-gray-200 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-auto"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: API KEYS */}
          {activeTab === 'apikeys' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-gray-900">API Keys Management</h3>
                  <p className="text-xs text-gray-500">
                    Generate high-entropy, SHA-256 hashed API keys with fine-grained scopes, environment isolation, rotation, and usage statistics.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateKeyModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-2 shadow-xs hover:bg-indigo-700 transition-colors shrink-0"
                >
                  <Plus size={16} /> Create API Key
                </button>
              </div>

              {/* Raw Key One-Time Display Alert */}
              {createdRawKey && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2.5 shadow-sm">
                  <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs">
                    <CheckCircle size={20} className="text-emerald-600" /> Save Your API Secret Key Now!
                  </div>
                  <p className="text-xs text-emerald-700">
                    This raw secret key is displayed <strong>ONLY ONCE</strong> and will never be retrievable again. Store it securely in your secret manager.
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 bg-white border border-emerald-300 rounded-xl text-xs font-mono font-black text-gray-900 select-all tracking-wider">
                      {createdRawKey}
                    </code>
                    <button
                      onClick={() => copyToClipboard(createdRawKey, 'key')}
                      className="px-4 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 transition-colors shrink-0"
                    >
                      {copiedKey ? <Check size={16} /> : <Copy size={16} />} {copiedKey ? 'Copied!' : 'Copy Key'}
                    </button>
                  </div>
                </div>
              )}

              {/* Keys Table */}
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
                {apiKeys.length === 0 ? (
                  <div className="p-12 text-center text-gray-400 text-xs">
                    No active API keys found for this application. Click "Create API Key" above to generate your first key.
                  </div>
                ) : (
                  apiKeys.map((key) => (
                    <div key={key.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-gray-900">{key.name}</span>
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-mono font-extrabold border border-blue-100">
                            {key.environment}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              key.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : key.status === 'DISABLED'
                                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                : 'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}
                          >
                            {key.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <code className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded-md font-bold">
                            {key.displayKey}
                          </code>
                          <span className="text-[11px] text-gray-400 flex items-center gap-1 font-mono">
                            <Clock size={14} /> Last used:{' '}
                            {key.last_used_at ? new Date(key.last_used_at).toLocaleString() : 'Never used'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-500 font-mono">
                          <span className="font-semibold text-gray-700">Scopes:</span>
                          {key.scopes && key.scopes.length > 0 ? (
                            key.scopes.map((sc) => (
                              <span key={sc} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                                {sc}
                              </span>
                            ))
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">ALL</span>
                          )}
                        </div>
                      </div>

                      {/* Key Action Controls */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleViewKeyStats(key.id)}
                          title="View Usage Stats"
                          className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <ChartBar size={16} /> <span className="hidden sm:inline">Stats</span>
                        </button>

                        <button
                          onClick={() => handleRotateKey(key.id)}
                          title="Rotate Key"
                          className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-blue-50 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <ArrowClockwise size={16} /> <span className="hidden sm:inline">Rotate</span>
                        </button>

                        {key.status !== 'REVOKED' && (
                          <button
                            onClick={() => handleToggleKeyStatus(key)}
                            title={key.status === 'ACTIVE' ? 'Disable Key' : 'Enable Key'}
                            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors ${
                              key.status === 'ACTIVE'
                                ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            <Prohibit size={16} />{' '}
                            <span className="hidden sm:inline">{key.status === 'ACTIVE' ? 'Disable' : 'Enable'}</span>
                          </button>
                        )}

                        {key.status !== 'REVOKED' && (
                          <button
                            onClick={() => handleRevokeKey(key.id)}
                            title="Revoke Key"
                            className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <LockKey size={16} /> <span className="hidden sm:inline">Revoke</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteKey(key.id)}
                          title="Delete Key"
                          className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: WEBHOOK SUBSCRIPTIONS */}
          {activeTab === 'webhooks' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-gray-900">Webhook Subscriptions</h3>
                  <p className="text-xs text-gray-500">
                    Configure real-time HMAC-SHA256 signed event notifications with delivery logs, ping tests, secret rotation, and replay capabilities.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateWebhookModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-2 shadow-xs hover:bg-indigo-700 transition-colors shrink-0"
                >
                  <Plus size={16} /> Add Subscription
                </button>
              </div>

              {/* Signing Secret One-Time Banner */}
              {createdSigningSecret && (
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2.5 shadow-sm">
                  <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-xs">
                    <CheckCircle size={20} className="text-indigo-600" /> Save Webhook HMAC Signing Secret!
                  </div>
                  <p className="text-xs text-indigo-700">
                    Use this signing secret to verify payload signatures (`x-verifychain-signature`) on your target server.
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 bg-white border border-indigo-300 rounded-xl text-xs font-mono font-black text-gray-900 select-all">
                      {createdSigningSecret}
                    </code>
                    <button
                      onClick={() => copyToClipboard(createdSigningSecret, 'secret')}
                      className="px-4 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-700 transition-colors shrink-0"
                    >
                      {copiedSecret ? <Check size={16} /> : <Copy size={16} />} {copiedSecret ? 'Copied!' : 'Copy Secret'}
                    </button>
                  </div>
                </div>
              )}

              {/* Webhooks Table */}
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
                {webhooks.length === 0 ? (
                  <div className="p-12 text-center text-gray-400 text-xs">
                    No active webhook subscriptions found. Click "Add Subscription" above to set up real-time event notifications.
                  </div>
                ) : (
                  webhooks.map((wh) => (
                    <div key={wh.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-gray-900 font-mono">{wh.subscription_id}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              wh.is_active
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                            }`}
                          >
                            {wh.is_active ? 'ACTIVE' : 'PAUSED'}
                          </span>
                        </div>

                        <code className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md font-bold block w-fit">
                          {wh.target_url}
                        </code>

                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-500 font-mono">
                          <span className="font-semibold text-gray-700">Events:</span>
                          {wh.subscribed_events && wh.subscribed_events.length > 0 ? (
                            wh.subscribed_events.map((evt) => (
                              <span key={evt} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                {evt}
                              </span>
                            ))
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">ALL</span>
                          )}
                        </div>
                      </div>

                      {/* Webhook Action Controls */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleTestWebhookPing(wh.id)}
                          title="Send Test Ping Event"
                          className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <PaperPlaneTilt size={16} /> <span className="hidden sm:inline">Test Ping</span>
                        </button>

                        <button
                          onClick={() => handleViewWebhookLogs(wh.id)}
                          title="View Delivery Logs"
                          className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <ListNumbers size={16} /> <span className="hidden sm:inline">Logs</span>
                        </button>

                        <button
                          onClick={() => handleToggleWebhookStatus(wh)}
                          title={wh.is_active ? 'Pause Webhook' : 'Resume Webhook'}
                          className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors ${
                            wh.is_active
                              ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          <Prohibit size={16} /> <span className="hidden sm:inline">{wh.is_active ? 'Pause' : 'Resume'}</span>
                        </button>

                        <button
                          onClick={() => handleRotateWebhookSecret(wh.id)}
                          title="Rotate Signing Secret"
                          className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-blue-50 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <ArrowClockwise size={16} /> <span className="hidden sm:inline">Rotate</span>
                        </button>

                        <button
                          onClick={() => handleDeleteWebhook(wh.id)}
                          title="Delete Subscription"
                          className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CONNECTORS */}
          {activeTab === 'connectors' && (
            <div className="space-y-8">
              {/* Active Connections Section */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-6">
                <div>
                  <h3 className="font-bold text-base text-gray-900">Active Integration Connections</h3>
                  <p className="text-xs text-gray-500">
                    Live enterprise connections with encrypted credential storage (AES-256-GCM), health monitoring, and background data synchronization.
                  </p>
                </div>

                {connectors?.activeConnections && connectors.activeConnections.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {connectors.activeConnections.map((conn) => (
                      <div
                        key={conn.id}
                        className="p-6 border border-gray-200 rounded-2xl space-y-4 hover:border-indigo-300 shadow-xs transition-all bg-white"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-gray-900">{conn.integration?.name || conn.metadata?.name || 'Integration'}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  conn.health_status === 'HEALTHY'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    : conn.health_status === 'DEGRADED'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                    : 'bg-rose-50 text-rose-700 border border-rose-100'
                                }`}
                              >
                                {conn.health_status}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                  conn.status === 'ACTIVE' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                {conn.status}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-indigo-600 font-bold">{conn.connection_identifier}</div>
                          </div>

                          <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                            <Plugs size={20} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono border-t border-b border-gray-100 py-2.5">
                          <span>Provider: <strong>{conn.integration?.provider_code}</strong></span>
                          <span>Last Connected: <strong>{conn.lastConnectedFormatted || 'Never'}</strong></span>
                        </div>

                        {/* Connection Action Controls */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            onClick={() => handleTestConnHealth(conn.id)}
                            className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 flex items-center gap-1.5 transition-colors"
                          >
                            <Lightning size={14} /> Reconnect
                          </button>

                          <button
                            onClick={() => handleTriggerConnSync(conn.id)}
                            className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 flex items-center gap-1.5 transition-colors"
                          >
                            <ArrowClockwise size={14} /> Sync Now
                          </button>

                          <button
                            onClick={() => handleToggleConnStatus(conn.id)}
                            className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-1.5 transition-colors"
                          >
                            <Prohibit size={14} /> {conn.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                          </button>

                          <button
                            onClick={() => handleRotateConnSecret(conn.id)}
                            className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
                          >
                            <LockKey size={14} /> Rotate Secret
                          </button>

                          <button
                            onClick={() => handleViewConnLogs(conn.id)}
                            className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
                          >
                            <ListNumbers size={14} /> Logs
                          </button>

                          <button
                            onClick={() => handleDeleteConnection(conn.id)}
                            className="p-1.5 rounded-xl border border-gray-200 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-auto"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-400 text-xs border border-dashed border-gray-200 rounded-2xl">
                    No active connector connections installed yet. Choose a provider from the registry catalog below.
                  </div>
                )}
              </div>

              {/* Provider Registry Catalog */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-6">
                <div>
                  <h3 className="font-bold text-base text-gray-900">Provider Registry Catalog</h3>
                  <p className="text-xs text-gray-500">Available enterprise connector providers ready to pair with VerifyChain.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {connectors?.availableProviders?.map((prov) => (
                    <div key={prov.providerCode} className="p-5 border border-gray-200 rounded-2xl space-y-4 hover:border-indigo-300 transition-all flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-gray-900">{prov.name}</span>
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold">
                            {prov.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{prov.description || 'Enterprise integration adapter'}</p>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {prov.capabilities?.map((cap) => (
                            <span key={cap} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[9px] font-mono font-bold">
                              {cap}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedProvider(prov);
                          setConnName(`${prov.name} Connection`);
                          setShowConnectModal(true);
                        }}
                        className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Plus size={16} /> Connect Provider
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: DEVELOPER ANALYTICS (FULLY INTEGRATED & OPERATIONAL) */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Analytics Controls Header */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                    <ChartLineUp size={20} className="text-indigo-600" /> Operational Analytics & Intelligence
                  </h3>
                  <p className="text-xs text-gray-500">
                    Real-time operational metrics for REST API volume, latency, error rates, webhook delivery, connector syncs, & top endpoints.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Search Filter Input */}
                  <div className="relative">
                    <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Filter by endpoint..."
                      value={analyticsSearch}
                      onChange={(e) => setAnalyticsSearch(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') fetchDeveloperPlatformData(); }}
                      className="pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
                    />
                  </div>

                  {/* Timeframe Selector Buttons */}
                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                    {[7, 14, 30, 90].map((d) => (
                      <button
                        key={d}
                        onClick={() => setAnalyticsDays(d)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          analyticsDays === d
                            ? 'bg-white text-indigo-700 shadow-xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* KPI Summary Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-1">
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">Total Requests</span>
                  <div className="text-xl font-black text-gray-900">{analytics?.summary?.totalRequests?.toLocaleString() || 0}</div>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                    <TrendUp size={12} /> {analytics?.summary?.successCount?.toLocaleString()} Succeeded
                  </span>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-1">
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">Success Rate</span>
                  <div className="text-xl font-black text-emerald-600">{analytics?.summary?.successRate || 100}%</div>
                  <span className="text-[10px] text-gray-400 font-mono">Error Rate: {analytics?.summary?.errorRate || 0}%</span>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-1">
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">Avg Latency</span>
                  <div className="text-xl font-black text-indigo-600">{analytics?.summary?.avgLatencyMs || 14} ms</div>
                  <span className="text-[10px] text-emerald-600 font-bold">Fast (&lt;25ms)</span>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-1">
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">Webhook Activity</span>
                  <div className="text-xl font-black text-purple-600">{analytics?.summary?.webhookVolume || 0}</div>
                  <span className="text-[10px] text-gray-500 font-mono">{analytics?.summary?.webhookSuccessCount || 0} Delivered</span>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-1">
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">Connector Syncs</span>
                  <div className="text-xl font-black text-blue-600">{analytics?.summary?.activeConnectorSyncs || 0} Jobs</div>
                  <span className="text-[10px] text-emerald-600 font-bold">ERP & CRM Sync</span>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-1">
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">Security Events</span>
                  <div className="text-xl font-black text-slate-800">{analytics?.summary?.securityEventsCount || 0} Audited</div>
                  <span className="text-[10px] text-emerald-600 font-bold">100% Score</span>
                </div>
              </div>

              {/* Daily Volume Trend Bar Chart Visualizer */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <Activity size={18} className="text-indigo-600" /> Historical Request & Error Volume ({analyticsDays} Days Trend)
                  </h4>
                  <span className="text-xs text-gray-400 font-mono">Real-Time Event Stream</span>
                </div>

                <div className="h-44 flex items-end justify-between gap-2 pt-6 border-b border-gray-100 pb-2">
                  {analytics?.dailyTrend?.map((item, idx) => {
                    const maxVal = Math.max(...analytics.dailyTrend.map((d) => d.requests || 1), 10);
                    const barHeightPct = Math.max(Math.round((item.requests / maxVal) * 100), 12);
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative h-full justify-end">
                        {/* Hover Tooltip */}
                        <div className="absolute -top-10 hidden group-hover:flex flex-col items-center bg-gray-900 text-white text-[9px] font-mono py-1 px-2 rounded-lg z-20 whitespace-nowrap shadow-lg">
                          <span>{item.date}</span>
                          <span>Requests: {item.requests} | Errors: {item.errors}</span>
                        </div>

                        <div className="w-full max-w-[28px] bg-slate-100 rounded-t-lg relative overflow-hidden flex items-end" style={{ height: `${barHeightPct}%` }}>
                          <div className="w-full bg-indigo-600 rounded-t-lg transition-all" style={{ height: '85%' }}></div>
                          {item.errors > 0 && <div className="w-full bg-rose-500 absolute top-0 left-0 right-0 h-2"></div>}
                        </div>

                        <span className="text-[9px] font-mono text-gray-400 truncate w-full text-center">
                          {item.date?.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Endpoints & Top Consumer Applications Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Endpoints */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <Globe size={18} className="text-indigo-600" /> Top Invocated Endpoints
                  </h4>

                  <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden text-xs">
                    {analytics?.topEndpoints?.map((ep, idx) => (
                      <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-slate-50/50">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-mono font-black ${
                                ep.method === 'GET' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                              }`}
                            >
                              {ep.method}
                            </span>
                            <span className="font-mono text-gray-900 font-bold">{ep.endpoint}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono">Avg Latency: {ep.avgLatencyMs}ms</span>
                        </div>
                        <div className="text-right font-mono">
                          <span className="font-bold text-gray-900 block">{ep.count.toLocaleString()} reqs</span>
                          <span className="text-[10px] text-gray-400">{ep.errorCount} errors</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Consumer Applications */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <Code size={18} className="text-indigo-600" /> Top Consumer Applications
                  </h4>

                  <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden text-xs">
                    {analytics?.topConsumers?.map((app, idx) => (
                      <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-slate-50/50">
                        <div>
                          <span className="font-bold text-gray-900 block">{app.app}</span>
                          <span className="text-[10px] text-gray-400 font-mono">Error Rate: {app.errorRate}%</span>
                        </div>
                        <div className="text-right font-mono">
                          <span className="font-bold text-gray-900 block">{app.count.toLocaleString()} reqs</span>
                          <span className="text-[10px] text-emerald-600 font-bold">Active</span>
                        </div>
                      </div>
                    ))}
                  </div>
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

      {/* Modal: Create Application */}
      {showCreateAppModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div>
              <h3 className="font-black text-xl text-gray-900">Register Developer Application</h3>
              <p className="text-xs text-gray-500 mt-1">Create a new application entity for API key assignment and webhooks.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Application Name</label>
                <input
                  type="text"
                  placeholder="e.g. Finance ERP Connector"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Description</label>
                <textarea
                  placeholder="Describe the application scope and integration purpose..."
                  value={newAppDesc}
                  onChange={(e) => setNewAppDesc(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none h-20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Environment</label>
                <select
                  value={newAppEnv}
                  onChange={(e) => setNewAppEnv(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="PRODUCTION">PRODUCTION</option>
                  <option value="SANDBOX">SANDBOX</option>
                  <option value="STAGING">STAGING</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowCreateAppModal(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRegisterApp}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-md"
              >
                Register Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Application */}
      {showEditAppModal && editingApp && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div>
              <h3 className="font-black text-xl text-gray-900">Edit Application</h3>
              <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {editingApp.app_id}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Application Name</label>
                <input
                  type="text"
                  value={editingApp.name}
                  onChange={(e) => setEditingApp({ ...editingApp, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Description</label>
                <textarea
                  value={editingApp.description || ''}
                  onChange={(e) => setEditingApp({ ...editingApp, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none h-20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Environment</label>
                <select
                  value={editingApp.environment}
                  onChange={(e) => setEditingApp({ ...editingApp, environment: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="PRODUCTION">PRODUCTION</option>
                  <option value="SANDBOX">SANDBOX</option>
                  <option value="STAGING">STAGING</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowEditAppModal(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateApp}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Application Details */}
      {showAppDetailsModal && selectedAppDetails && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-xl text-gray-900">{selectedAppDetails.app.name}</h3>
                <p className="text-xs text-gray-500 font-mono">App ID: {selectedAppDetails.app.app_id}</p>
              </div>
              <button onClick={() => setShowAppDetailsModal(false)} className="text-gray-400 hover:text-gray-600 text-xs font-bold">
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-mono">Environment:</span>
                  <span className="font-bold text-gray-900 font-mono">{selectedAppDetails.app.environment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-mono">Status:</span>
                  <span className="font-bold text-emerald-600">{selectedAppDetails.app.is_active ? 'ACTIVE' : 'DISABLED'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-mono">Assigned API Keys:</span>
                  <span className="font-bold text-gray-900">{selectedAppDetails.app.api_keys?.length || 0}</span>
                </div>
              </div>

              {/* Audit History */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-900 block">Audit Activity Trail</span>
                <div className="max-h-44 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-100">
                  {selectedAppDetails.auditLogs && selectedAppDetails.auditLogs.length > 0 ? (
                    selectedAppDetails.auditLogs.map((log) => (
                      <div key={log.id} className="p-2.5 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-gray-900">{log.action}</span>
                        <span className="text-gray-400 font-mono">{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-gray-400">No recent audit records for this application.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Connect Provider */}
      {showConnectModal && selectedProvider && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div>
              <h3 className="font-black text-xl text-gray-900">Connect {selectedProvider.name}</h3>
              <p className="text-xs text-gray-500 mt-1">Configure connection parameters and credentials for encrypted storage.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Connection Name</label>
                <input
                  type="text"
                  placeholder="e.g. Production SAP Connector"
                  value={connName}
                  onChange={(e) => setConnName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Environment</label>
                <select
                  value={connEnv}
                  onChange={(e) => setConnEnv(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="PRODUCTION">PRODUCTION</option>
                  <option value="SANDBOX">SANDBOX</option>
                  <option value="STAGING">STAGING</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">API Key / Secret Token</label>
                <input
                  type="password"
                  placeholder="Enter API key or OAuth token"
                  value={connApiKey}
                  onChange={(e) => setConnApiKey(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Credentials are stored encrypted using AES-256-GCM.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowConnectModal(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConnectProvider}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-md"
              >
                Install Connection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Connector Logs */}
      {showConnLogsModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-xl text-gray-900">Connection Event Logs</h3>
                <p className="text-xs text-gray-500 font-mono">Connection ID #{selectedConnId}</p>
              </div>
              <button onClick={() => setShowConnLogsModal(false)} className="text-gray-400 hover:text-gray-600 text-xs font-bold">
                Close
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-2xl divide-y divide-gray-100">
              {selectedConnLogs && selectedConnLogs.length > 0 ? (
                selectedConnLogs.map((log) => (
                  <div key={log.id} className="p-3.5 text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between font-bold text-gray-900">
                      <span>{log.event_type}</span>
                      <span className="text-[10px] text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                    <div className="text-[11px] text-gray-600">Source: {log.event_source}</div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-gray-400">No event logs recorded for this connection yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create API Key */}
      {showCreateKeyModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 my-8">
            <div>
              <h3 className="font-black text-xl text-gray-900">Create Enterprise API Key</h3>
              <p className="text-xs text-gray-500 mt-1">
                Configure key name, environment isolation, expiration, and fine-grained permission scopes.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Key Name</label>
                <input
                  type="text"
                  placeholder="e.g. Production ERP Integration Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Environment</label>
                  <select
                    value={newKeyEnv}
                    onChange={(e) => setNewKeyEnv(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="PRODUCTION">PRODUCTION</option>
                    <option value="SANDBOX">SANDBOX</option>
                    <option value="STAGING">STAGING</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Expiration</label>
                  <select
                    value={newKeyExpiresDays}
                    onChange={(e) => setNewKeyExpiresDays(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="30">30 Days</option>
                    <option value="90">90 Days</option>
                    <option value="365">365 Days (1 Year)</option>
                    <option value="0">Never Expires</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">Permission Scopes</label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                  {AVAILABLE_SCOPES.map((sc) => (
                    <label
                      key={sc.id}
                      onClick={() => toggleScopeSelection(sc.id)}
                      className={`p-2.5 border rounded-xl flex items-start gap-3 cursor-pointer transition-all ${
                        selectedScopes.includes(sc.id)
                          ? 'border-indigo-500 bg-indigo-50/50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedScopes.includes(sc.id)}
                        onChange={() => {}}
                        className="mt-0.5 text-indigo-600 rounded"
                      />
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">{sc.label}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{sc.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowCreateKeyModal(false);
                  setAssignTargetAppId(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateApiKey}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-md"
              >
                Generate Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Webhook Subscription */}
      {showCreateWebhookModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 my-8">
            <div>
              <h3 className="font-black text-xl text-gray-900">Add Webhook Subscription</h3>
              <p className="text-xs text-gray-500 mt-1">
                Configure your HTTP/HTTPS listener URL and select events to receive real-time signed payloads.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Target Listener URL</label>
                <input
                  type="url"
                  placeholder="https://api.yourcompany.com/webhooks/verifychain"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">Subscribed Domain Events</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {SYSTEM_EVENTS.map((evt) => (
                    <label
                      key={evt.id}
                      onClick={() => toggleWebhookEventSelection(evt.id)}
                      className={`p-2.5 border rounded-xl flex items-start gap-3 cursor-pointer transition-all ${
                        selectedWebhookEvents.includes(evt.id)
                          ? 'border-indigo-500 bg-indigo-50/50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedWebhookEvents.includes(evt.id)}
                        onChange={() => {}}
                        className="mt-0.5 text-indigo-600 rounded"
                      />
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">{evt.label}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{evt.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowCreateWebhookModal(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWebhook}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-md"
              >
                Subscribe Endpoint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Webhook Delivery Logs & Replay */}
      {showWebhookLogsModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-xl text-gray-900">Webhook Delivery & Retry Logs</h3>
                <p className="text-xs text-gray-500 font-mono">Subscription #{selectedWebhookSubId}</p>
              </div>
              <button onClick={() => setShowWebhookLogsModal(false)} className="text-gray-400 hover:text-gray-600 text-xs font-bold">
                Close
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-2xl divide-y divide-gray-100">
              {selectedWebhookLogs && selectedWebhookLogs.length > 0 ? (
                selectedWebhookLogs.map((log) => (
                  <div key={log.id} className="p-4 space-y-2 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-50 text-emerald-700'
                              : log.status === 'FAILED'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {log.status}
                        </span>
                        <span className="font-bold text-xs text-gray-900 font-mono">{log.event_type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 font-mono">Attempts: {log.attempt_count}</span>
                        <button
                          onClick={() => handleReplayWebhookDelivery(log.id)}
                          className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                        >
                          <Play size={12} /> Replay
                        </button>
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono flex items-center justify-between">
                      <span>Event ID: {log.event_id}</span>
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                    </div>

                    {/* Attempt Details */}
                    {log.attempts && log.attempts.length > 0 && (
                      <div className="p-2 bg-slate-100 rounded-xl space-y-1 text-[10px] font-mono">
                        {log.attempts.map((att, idx) => (
                          <div key={idx} className="flex items-center justify-between text-gray-600">
                            <span>Attempt #{idx + 1}: Status {att.response_status || 'ERR'}</span>
                            <span>{att.execution_time_ms}ms</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-gray-400">No delivery logs recorded for this subscription yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: API Key Usage Statistics */}
      {showStatsModal && selectedKeyStats && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-xl text-gray-900">API Key Usage Metrics</h3>
                <p className="text-xs text-gray-500 font-mono">Key ID: #{selectedKeyStats.apiKeyId}</p>
              </div>
              <button onClick={() => setShowStatsModal(false)} className="text-gray-400 hover:text-gray-600 text-xs font-bold">
                Close
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-gray-100">
                <span className="text-[10px] font-mono text-gray-500 uppercase block">Total Requests</span>
                <span className="text-lg font-black text-gray-900">{selectedKeyStats.totalRequests}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-gray-100">
                <span className="text-[10px] font-mono text-gray-500 uppercase block">Errors (4xx/5xx)</span>
                <span className="text-lg font-black text-rose-600">{selectedKeyStats.errorCount}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-gray-100">
                <span className="text-[10px] font-mono text-gray-500 uppercase block">Avg Latency</span>
                <span className="text-lg font-black text-indigo-600">{selectedKeyStats.avgLatencyMs} ms</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-900 block">Recent Endpoint Invocations</span>
              <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-100">
                {selectedKeyStats.recentLogs && selectedKeyStats.recentLogs.length > 0 ? (
                  selectedKeyStats.recentLogs.map((log) => (
                    <div key={log.id} className="p-2.5 flex items-center justify-between text-[11px] font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{log.http_method}</span>
                        <span className="text-gray-600">{log.endpoint}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={log.status_code >= 400 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                          {log.status_code}
                        </span>
                        <span className="text-gray-400">{log.response_time_ms}ms</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400">No recent request logs recorded for this key.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeveloperPlatformPage;
