/**
 * EnterpriseIAMPage.jsx
 * Enterprise IAM, Roles, Permissions & Access Control Workspace (Phase 11.2).
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  LockKey,
  Key,
  Users,
  UserCheck,
  Clock,
  CheckCircle,
  WarningCircle,
  Plus,
  MagnifyingGlass,
  SlidersHorizontal,
  FolderUser,
  ShieldWarning,
  Scales,
  Sparkle,
  X,
  Play,
  ArrowClockwise,
  ListChecks,
} from '@phosphor-icons/react';
import axios from 'axios';

export function EnterpriseIAMPage() {
  const [activeTab, setActiveTab] = useState('ROLES'); // ROLES, PERMISSIONS, ASSIGNMENTS, TEMP_ACCESS, SIMULATOR, AUDITS
  const [stats, setStats] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [tempGrants, setTempGrants] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Authorization Simulator State
  const [simUserRole, setSimUserRole] = useState('COMPLIANCE_OFFICER');
  const [simPermission, setSimPermission] = useState('compliance.execute');
  const [simResult, setSimResult] = useState(null);

  // Modals
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTempModal, setShowTempModal] = useState(false);

  // Form States
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleCode, setNewRoleCode] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const [assignUserId, setAssignUserId] = useState('');
  const [assignRoleId, setAssignRoleId] = useState('');

  const [tempUserId, setTempUserId] = useState('');
  const [tempRoleId, setTempRoleId] = useState('');
  const [tempDays, setTempDays] = useState(7);

  useEffect(() => {
    fetchIAMData();
  }, [activeTab]);

  const fetchIAMData = async () => {
    setLoading(true);
    try {
      const [statsRes, rolesRes, permsRes, assignsRes, tempRes, revsRes] = await Promise.all([
        axios.get('/api/v1/iam/dashboard/stats'),
        axios.get('/api/v1/iam/roles'),
        axios.get('/api/v1/iam/permissions'),
        axios.get('/api/v1/iam/assignments'),
        axios.get('/api/v1/iam/temporary-access'),
        axios.get('/api/v1/iam/access-reviews'),
      ]);

      setStats(statsRes.data.data);
      setRoles(rolesRes.data.data || []);
      setPermissions(permsRes.data.data || []);
      setAssignments(assignsRes.data.data || []);
      setTempGrants(tempRes.data.data || []);
      setReviews(revsRes.data.data || []);
    } catch (err) {
      console.error('[EnterpriseIAM] Error loading IAM data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomRole = async (e) => {
    e.preventDefault();
    if (!newRoleName) return;
    try {
      await axios.post('/api/v1/iam/roles', {
        name: newRoleName,
        code: newRoleCode || `CUSTOM_${Date.now()}`,
        description: newRoleDesc,
      });
      setNewRoleName('');
      setNewRoleCode('');
      setShowRoleModal(false);
      fetchIAMData();
    } catch (err) {
      alert(`Role creation failed: ${err.message}`);
    }
  };

  const handleAssignRole = async (e) => {
    e.preventDefault();
    if (!assignUserId || !assignRoleId) return;
    try {
      await axios.post('/api/v1/iam/assignments', {
        userId: assignUserId,
        roleId: assignRoleId,
      });
      setShowAssignModal(false);
      fetchIAMData();
    } catch (err) {
      alert(`Role assignment failed: ${err.message}`);
    }
  };

  const handleGrantTempAccess = async (e) => {
    e.preventDefault();
    if (!tempUserId || !tempRoleId) return;
    try {
      await axios.post('/api/v1/iam/temporary-access', {
        userId: tempUserId,
        roleId: tempRoleId,
        durationDays: tempDays,
      });
      setShowTempModal(false);
      fetchIAMData();
    } catch (err) {
      alert(`Temporary access grant failed: ${err.message}`);
    }
  };

  const handleRunSimulator = async () => {
    try {
      const res = await axios.post('/api/v1/iam/authorize/evaluate', {
        user: { id: 1, role: simUserRole },
        permission: simPermission,
      });
      setSimResult(res.data.data);
    } catch (err) {
      alert(`Simulator error: ${err.message}`);
    }
  };

  const handleRunAccessReview = async () => {
    try {
      await axios.post('/api/v1/iam/access-reviews', {
        title: 'Ad-hoc Administrative Access Review',
      });
      fetchIAMData();
    } catch (err) {
      alert(`Access review failed: ${err.message}`);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 bg-gray-50/50 min-h-screen">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-xs">
              <LockKey size={28} weight="bold" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Enterprise IAM & Authorization Engine</h1>
              <p className="text-xs text-gray-600 font-medium mt-0.5">
                Policy-Driven Access Control, Granular Permissions, Temporary Access & Auditing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowTempModal(true)}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Clock size={16} weight="bold" /> Grant Temp Access
            </button>
            <button
              onClick={() => setShowRoleModal(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} weight="bold" /> Create Custom Role
            </button>
          </div>
        </div>

        {/* IAM Overview KPIs */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 border-t border-gray-100 pt-5 text-xs">
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-500 font-semibold flex items-center gap-1.5">
                <FolderUser size={15} className="text-indigo-600" /> Platform Roles
              </span>
              <div className="text-xl font-bold text-gray-900 mt-1">{stats.totalRoles}</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                <Key size={15} className="text-slate-900" /> Catalog Permissions
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1">{stats.totalPermissions}</div>
            </div>
            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <UserCheck size={15} className="text-emerald-600" /> Role Assignments
              </span>
              <div className="text-xl font-bold text-emerald-900 mt-1">{stats.totalAssignments}</div>
            </div>
            <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-100">
              <span className="text-amber-800 font-semibold flex items-center gap-1.5">
                <Clock size={15} className="text-amber-600" /> Active Temp Grants
              </span>
              <div className="text-xl font-bold text-amber-950 mt-1">{stats.activeTempGrants}</div>
            </div>
            <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
              <span className="text-indigo-800 font-semibold flex items-center gap-1.5">
                <ListChecks size={15} className="text-indigo-600" /> Access Reviews
              </span>
              <div className="text-xl font-bold text-indigo-950 mt-1">{stats.totalReviews}</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 text-xs font-semibold text-gray-600">
        <button
          onClick={() => setActiveTab('ROLES')}
          className={`pb-3 px-3 transition-all border-b-2 cursor-pointer ${
            activeTab === 'ROLES' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          Role Directory ({roles.length})
        </button>
        <button
          onClick={() => setActiveTab('PERMISSIONS')}
          className={`pb-3 px-3 transition-all border-b-2 cursor-pointer ${
            activeTab === 'PERMISSIONS' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          Permission Catalog ({permissions.length})
        </button>
        <button
          onClick={() => setActiveTab('ASSIGNMENTS')}
          className={`pb-3 px-3 transition-all border-b-2 cursor-pointer ${
            activeTab === 'ASSIGNMENTS' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          Role Assignments ({assignments.length})
        </button>
        <button
          onClick={() => setActiveTab('TEMP_ACCESS')}
          className={`pb-3 px-3 transition-all border-b-2 cursor-pointer ${
            activeTab === 'TEMP_ACCESS' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          Time-Bound Access ({tempGrants.length})
        </button>
        <button
          onClick={() => setActiveTab('SIMULATOR')}
          className={`pb-3 px-3 transition-all border-b-2 cursor-pointer ${
            activeTab === 'SIMULATOR' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          Authorization Simulator
        </button>
        <button
          onClick={() => setActiveTab('AUDITS')}
          className={`pb-3 px-3 transition-all border-b-2 cursor-pointer ${
            activeTab === 'AUDITS' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          Access Review Audits ({reviews.length})
        </button>
      </div>

      {/* Tab 1: Roles Directory */}
      {activeTab === 'ROLES' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((r) => (
            <div key={r.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-gray-500 font-semibold">{r.code}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${r.is_custom ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-800'}`}>
                    {r.is_custom ? 'CUSTOM' : 'STANDARD'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-gray-900">{r.name}</h3>
                <p className="text-xs text-gray-600">{r.description || 'Standard platform role definition'}</p>
              </div>

              <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs text-gray-500">
                <span>Scope: <strong className="text-gray-800">{r.scope}</strong></span>
                <span>Perms: <strong className="text-indigo-600">{r.role_perms?.length || 0}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Permission Catalog */}
      {activeTab === 'PERMISSIONS' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Permission Registry Catalog</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/70 text-gray-600 border-b border-gray-100 font-semibold">
                  <th className="py-3.5 px-4">Permission Code</th>
                  <th className="py-3.5 px-4">Permission Name</th>
                  <th className="py-3.5 px-4">Category Domain</th>
                  <th className="py-3.5 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {permissions.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/60">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{p.code}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">{p.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Authorization Simulator */}
      {activeTab === 'SIMULATOR' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col gap-6 max-w-2xl">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Sparkle size={20} className="text-indigo-600" /> Authorization Decision Simulator
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Test how the Centralized Authorization Engine evaluates permissions across roles and policies live.
            </p>
          </div>

          <div className="flex flex-col gap-4 text-xs">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Simulated User Role</label>
              <select
                value={simUserRole}
                onChange={(e) => setSimUserRole(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
              >
                {roles.map(r => (
                  <option key={r.id} value={r.code}>{r.name} ({r.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Requested Permission</label>
              <select
                value={simPermission}
                onChange={(e) => setSimPermission(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
              >
                {permissions.map(p => (
                  <option key={p.id} value={p.code}>{p.code} — {p.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleRunSimulator}
              className="px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl cursor-pointer flex items-center justify-center gap-2"
            >
              <Play size={16} weight="bold" /> Run Authorization Evaluation
            </button>

            {simResult && (
              <div className={`p-4 rounded-xl border flex flex-col gap-2 ${simResult.allowed ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'}`}>
                <div className="flex items-center justify-between font-bold">
                  <span>Decision: {simResult.decision}</span>
                  <span className="text-[10px] font-mono">{simResult.policy || 'STANDARD_CHECK'}</span>
                </div>
                <p className="text-xs">{simResult.reason}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Access Reviews */}
      {activeTab === 'AUDITS' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Administrative Access Review Audits</h3>
            <button
              onClick={handleRunAccessReview}
              className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Run Access Review Audit
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/70 text-gray-600 border-b border-gray-100 font-semibold">
                  <th className="py-3.5 px-4">Audit Title</th>
                  <th className="py-3.5 px-4">Reviewer</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Reviewed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-gray-50/60">
                    <td className="py-3.5 px-4 font-bold text-gray-900">{rev.title}</td>
                    <td className="py-3.5 px-4 text-gray-600">{rev.reviewer_id}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700">
                        {rev.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">{new Date(rev.reviewed_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Custom Role */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Create Custom Role</h3>
              <button onClick={() => setShowRoleModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateCustomRole} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Role Name</label>
                <input
                  type="text"
                  placeholder="Special Compliance Reviewer"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Custom role description..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-xl cursor-pointer">
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Grant Temp Access */}
      {showTempModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Grant Time-Bound Temporary Access</h3>
              <button onClick={() => setShowTempModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleGrantTempAccess} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">User ID</label>
                <input
                  type="number"
                  placeholder="1"
                  value={tempUserId}
                  onChange={(e) => setTempUserId(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Target Role</label>
                <select
                  value={tempRoleId}
                  onChange={(e) => setTempRoleId(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  required
                >
                  <option value="">Select Role...</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.code}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Duration (Days)</label>
                <input
                  type="number"
                  value={tempDays}
                  onChange={(e) => setTempDays(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-amber-600 text-white font-semibold rounded-xl cursor-pointer">
                  Grant Temporary Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
