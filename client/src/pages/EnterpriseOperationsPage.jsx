/**
 * EnterpriseOperationsPage.jsx
 * Platform Operations Center Workspace (Phase 11.3).
 */

import React, { useState, useEffect } from 'react';
import {
  Gear,
  ToggleLeft,
  ToggleRight,
  HardDrives,
  Plugs,
  EnvelopeSimple,
  Palette,
  Megaphone,
  ClockCounterClockwise,
  CheckCircle,
  WarningCircle,
  XCircle,
  MagnifyingGlass,
  ArrowClockwise,
  Plus,
  X,
  Sparkle,
  ShieldWarning,
  Wrench,
  SlidersHorizontal,
  CloudCheck,
} from '@phosphor-icons/react';
import axios from 'axios';

export function EnterpriseOperationsPage() {
  const [activeTab, setActiveTab] = useState('SETTINGS'); // SETTINGS, FEATURES, INTEGRATIONS, STORAGE_EMAIL, BRANDING, ANNOUNCEMENTS, HISTORY
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState([]);
  const [flags, setFlags] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [storageProviders, setStorageProviders] = useState([]);
  const [emailProviders, setEmailProviders] = useState([]);
  const [branding, setBranding] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form & Modals
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceMsg, setAnnounceMsg] = useState('');
  const [announceSeverity, setAnnounceSeverity] = useState('INFO');

  useEffect(() => {
    fetchOperationsData();
  }, [activeTab]);

  const fetchOperationsData = async () => {
    setLoading(true);
    try {
      const [statsRes, settingsRes, flagsRes, integrRes, storageRes, emailRes, brandRes, annRes, snapRes] = await Promise.all([
        axios.get('/api/v1/operations/dashboard/stats'),
        axios.get('/api/v1/operations/settings'),
        axios.get('/api/v1/operations/features'),
        axios.get('/api/v1/operations/integrations'),
        axios.get('/api/v1/operations/storage'),
        axios.get('/api/v1/operations/email'),
        axios.get('/api/v1/operations/branding'),
        axios.get('/api/v1/operations/announcements'),
        axios.get('/api/v1/operations/history'),
      ]);

      setStats(statsRes.data.data);
      setSettings(settingsRes.data.data || []);
      setFlags(flagsRes.data.data || []);
      setIntegrations(integrRes.data.data || []);
      setStorageProviders(storageRes.data.data || []);
      setEmailProviders(emailRes.data.data || []);
      setBranding(brandRes.data.data || null);
      setAnnouncements(annRes.data.data || []);
      setSnapshots(snapRes.data.data || []);
    } catch (err) {
      console.error('[EnterpriseOperations] Error loading operations data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMaintenanceMode = async (currentStatus) => {
    try {
      await axios.post('/api/v1/operations/maintenance-mode', {
        enabled: !currentStatus,
        reason: 'Maintenance mode toggled from Operations Center',
      });
      fetchOperationsData();
    } catch (err) {
      alert(`Maintenance mode update failed: ${err.message}`);
    }
  };

  const handleToggleFeatureFlag = async (key, currentStatus) => {
    try {
      await axios.post('/api/v1/operations/features', {
        key,
        isEnabled: !currentStatus,
      });
      fetchOperationsData();
    } catch (err) {
      alert(`Feature flag update failed: ${err.message}`);
    }
  };

  const handleRunHealthChecks = async () => {
    try {
      await axios.post('/api/v1/operations/integrations/health-check');
      fetchOperationsData();
    } catch (err) {
      alert(`Health check execution failed: ${err.message}`);
    }
  };

  const handlePublishAnnouncement = async (e) => {
    e.preventDefault();
    if (!announceTitle || !announceMsg) return;
    try {
      await axios.post('/api/v1/operations/announcements', {
        title: announceTitle,
        message: announceMsg,
        severity: announceSeverity,
      });
      setAnnounceTitle('');
      setAnnounceMsg('');
      setShowAnnounceModal(false);
      fetchOperationsData();
    } catch (err) {
      alert(`Announcement publishing failed: ${err.message}`);
    }
  };

  const handleRollback = async (version) => {
    if (!window.confirm(`Rollback platform configuration to snapshot version ${version}?`)) return;
    try {
      await axios.post('/api/v1/operations/rollback', { version });
      fetchOperationsData();
    } catch (err) {
      alert(`Rollback failed: ${err.message}`);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 bg-gray-50/50 min-h-screen">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xs">
              <Gear size={28} weight="bold" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Platform Operations Center</h1>
              <p className="text-xs text-gray-600 font-medium mt-0.5">
                Centralized Operations Workspace for Settings, Feature Flags, Integrations & Rollback
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleToggleMaintenanceMode(stats?.maintenanceMode)}
              className={`px-3.5 py-2 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
                stats?.maintenanceMode ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              <Wrench size={16} weight="bold" /> {stats?.maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
            </button>
            <button
              onClick={() => setShowAnnounceModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Megaphone size={16} weight="bold" /> Publish Notice
            </button>
          </div>
        </div>

        {/* Operations Overview KPIs */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 border-t border-gray-100 pt-5 text-xs">
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-500 font-semibold flex items-center gap-1.5">
                <SlidersHorizontal size={15} className="text-indigo-600" /> Platform Settings
              </span>
              <div className="text-xl font-bold text-gray-900 mt-1">{stats.settingsCount}</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                <ToggleRight size={15} className="text-slate-900" /> Feature Flags
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1">{stats.flagsCount}</div>
            </div>
            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <Plugs size={15} className="text-emerald-600" /> Integrations
              </span>
              <div className="text-xl font-bold text-emerald-900 mt-1">{stats.integrCount}</div>
            </div>
            <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
              <span className="text-indigo-800 font-semibold flex items-center gap-1.5">
                <HardDrives size={15} className="text-indigo-600" /> Active Storage
              </span>
              <div className="text-sm font-bold text-indigo-950 mt-1.5 font-mono">{stats.activeStorageProvider}</div>
            </div>
            <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-100">
              <span className="text-amber-800 font-semibold flex items-center gap-1.5">
                <ClockCounterClockwise size={15} className="text-amber-600" /> Snapshots
              </span>
              <div className="text-xl font-bold text-amber-950 mt-1">{stats.snapshotsCount}</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 text-xs font-semibold text-gray-600">
        <button
          onClick={() => setActiveTab('SETTINGS')}
          className={`pb-3 px-3 transition-all border-b-2 cursor-pointer ${
            activeTab === 'SETTINGS' ? 'border-slate-900 text-slate-900 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          System Settings ({settings.length})
        </button>
        <button
          onClick={() => setActiveTab('FEATURES')}
          className={`pb-3 px-3 transition-all border-b-2 cursor-pointer ${
            activeTab === 'FEATURES' ? 'border-slate-900 text-slate-900 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          Feature Flags ({flags.length})
        </button>
        <button
          onClick={() => setActiveTab('INTEGRATIONS')}
          className={`pb-3 px-3 transition-all border-b-2 cursor-pointer ${
            activeTab === 'INTEGRATIONS' ? 'border-slate-900 text-slate-900 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          Integration Registry ({integrations.length})
        </button>
        <button
          onClick={() => setActiveTab('STORAGE_EMAIL')}
          className={`pb-3 px-3 transition-all border-b-2 cursor-pointer ${
            activeTab === 'STORAGE_EMAIL' ? 'border-slate-900 text-slate-900 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          Storage & Email Providers
        </button>
        <button
          onClick={() => setActiveTab('BRANDING')}
          className={`pb-3 px-3 transition-all border-b-2 cursor-pointer ${
            activeTab === 'BRANDING' ? 'border-slate-900 text-slate-900 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          Branding & Identity
        </button>
        <button
          onClick={() => setActiveTab('ANNOUNCEMENTS')}
          className={`pb-3 px-3 transition-all border-b-2 cursor-pointer ${
            activeTab === 'ANNOUNCEMENTS' ? 'border-slate-900 text-slate-900 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          Announcements ({announcements.length})
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`pb-3 px-3 transition-all border-b-2 cursor-pointer ${
            activeTab === 'HISTORY' ? 'border-slate-900 text-slate-900 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          Configuration Rollback ({snapshots.length})
        </button>
      </div>

      {/* Tab 1: System Settings */}
      {activeTab === 'SETTINGS' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Global Platform Parameters</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/70 text-gray-600 border-b border-gray-100 font-semibold">
                  <th className="py-3.5 px-4">Setting Key</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Configured Value</th>
                  <th className="py-3.5 px-4">Last Updated By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {settings.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/60">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{s.key}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800">
                        {s.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-indigo-600">{JSON.stringify(s.value_json)}</td>
                    <td className="py-3.5 px-4 text-gray-500">{s.updated_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Feature Flags */}
      {activeTab === 'FEATURES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {flags.map((f) => (
            <div key={f.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-sm">{f.name}</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700">
                    {f.category}
                  </span>
                </div>
                <div className="font-mono text-[10px] text-gray-400">{f.key}</div>
                <p className="text-xs text-gray-600 mt-1">{f.description}</p>
              </div>

              <button
                onClick={() => handleToggleFeatureFlag(f.key, f.is_enabled)}
                className={`p-2.5 rounded-xl cursor-pointer transition-all ${
                  f.is_enabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {f.is_enabled ? <ToggleRight size={28} weight="fill" /> : <ToggleLeft size={28} />}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Integration Registry */}
      {activeTab === 'INTEGRATIONS' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Service Integration Registry</h3>
            <button
              onClick={handleRunHealthChecks}
              className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Run Health Checks
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/70 text-gray-600 border-b border-gray-100 font-semibold">
                  <th className="py-3.5 px-4">Integration Key</th>
                  <th className="py-3.5 px-4">Integration Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Health Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {integrations.map((i) => (
                  <tr key={i.id} className="hover:bg-gray-50/60">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{i.key}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">{i.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800">
                        {i.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 flex items-center gap-1.5 w-fit">
                        <CheckCircle size={14} /> {i.health_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Rollback History */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Configuration History & Snapshots</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/70 text-gray-600 border-b border-gray-100 font-semibold">
                  <th className="py-3.5 px-4">Version</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Created By</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {snapshots.map((snap) => (
                  <tr key={snap.id} className="hover:bg-gray-50/60">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">v{snap.version}</td>
                    <td className="py-3.5 px-4 text-gray-900">{snap.reason}</td>
                    <td className="py-3.5 px-4 text-gray-600">{snap.created_by}</td>
                    <td className="py-3.5 px-4 text-gray-500">{new Date(snap.created_at).toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleRollback(snap.version)}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg font-bold cursor-pointer"
                      >
                        Rollback to v{snap.version}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notice Modal */}
      {showAnnounceModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Megaphone size={20} className="text-indigo-600" /> Publish System Notice
              </h3>
              <button onClick={() => setShowAnnounceModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePublishAnnouncement} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Infrastructure Upgrade Window"
                  value={announceTitle}
                  onChange={(e) => setAnnounceTitle(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Message</label>
                <textarea
                  placeholder="Platform maintenance will occur at 02:00 UTC..."
                  value={announceMsg}
                  onChange={(e) => setAnnounceMsg(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Severity</label>
                <select
                  value={announceSeverity}
                  onChange={(e) => setAnnounceSeverity(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                >
                  <option value="INFO">Info</option>
                  <option value="WARNING">Warning</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl cursor-pointer">
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
