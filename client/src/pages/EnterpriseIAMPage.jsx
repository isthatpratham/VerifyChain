/**
 * EnterpriseIAMPage.jsx
 * Enterprise IAM, Roles, Permissions & Access Control Workspace (Phase 11.2).
 * Strictly adheres to DESIGN_SYSTEM.md enterprise tokens.
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
import { Toast } from '../ui/Toast';

export function EnterpriseIAMPage() {
  const [activeTab, setActiveTab] = useState('ROLES');
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
      setNewRoleDesc('');
      setShowRoleModal(false);
      Toast.success('Custom IAM Role successfully created.');
      fetchIAMData();
    } catch (err) {
      Toast.error(`Role creation failed: ${err.message}`);
    }
  };

  const handleAssignRole = async (e) => {
    e.preventDefault();
    if (!assignUserId || !assignRoleId) return;
    try {
      await axios.post('/api/v1/iam/assignments', {
        userId: parseInt(assignUserId, 10),
        roleId: parseInt(assignRoleId, 10),
      });
      setShowAssignModal(false);
      Toast.success('Role assigned to user.');
      fetchIAMData();
    } catch (err) {
      Toast.error(`Role assignment failed: ${err.message}`);
    }
  };

  const handleGrantTempAccess = async (e) => {
    e.preventDefault();
    if (!tempUserId || !tempRoleId) return;
    try {
      await axios.post('/api/v1/iam/temporary-access', {
        userId: parseInt(tempUserId, 10),
        roleId: parseInt(tempRoleId, 10),
        days: parseInt(tempDays, 10),
      });
      setShowTempModal(false);
      Toast.success('Temporary access grant authorized.');
      fetchIAMData();
    } catch (err) {
      Toast.error(`Temporary grant failed: ${err.message}`);
    }
  };

  const handleRunSimulation = async () => {
    try {
      const res = await axios.post('/api/v1/iam/authorize/simulate', {
        role: simUserRole,
        permission: simPermission,
      });
      setSimResult(res.data.data);
      Toast.info('Authorization simulation complete.');
    } catch (err) {
      Toast.error(`Simulation failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] gap-3 text-[--vc-text-tertiary]">
        <ArrowClockwise size={24} className="animate-spin text-[--vc-brand]" />
        <span className="text-[--text-xs] font-semibold">Loading Enterprise IAM Workspace...</span>
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
              <LockKey size={28} weight="bold" />
            </div>
            <div>
              <h1 className="text-[--text-xl] font-bold text-[--vc-text-primary] tracking-tight font-[--font-heading]">
                Enterprise Identity & Access Management (IAM)
              </h1>
              <p className="text-[--text-xs] text-[--vc-text-secondary] font-medium mt-0.5">
                Role-Based Access Control (RBAC), Permission Matrix, Temporary Access Grants & Security Audits
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRoleModal(true)}
              className="px-3.5 py-2 bg-[--vc-brand] hover:bg-[--vc-brand-hover] text-white text-[--text-xs] font-semibold rounded-[--radius-md] flex items-center gap-1.5 transition-all"
            >
              <Plus size={15} weight="bold" /> Create Role
            </button>
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-3.5 py-2 bg-[--vc-bg-base] hover:bg-[--vc-bg-muted] text-[--vc-text-primary] text-[--text-xs] font-semibold rounded-[--radius-md] border border-[--vc-border] flex items-center gap-1.5 transition-all"
            >
              <UserCheck size={15} /> Assign Role
            </button>
          </div>
        </div>

        {/* IAM Stats Bar */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 border-t border-[--vc-border] pt-5 text-[--text-xs]">
            <div className="p-3 bg-[--vc-bg-base] rounded-[--radius-sm] border border-[--vc-border]">
              <span className="text-[--vc-text-tertiary] font-mono text-[10px] uppercase">Active Roles</span>
              <div className="text-[--text-lg] font-bold font-mono text-[--vc-text-primary] mt-1">{stats.totalRoles}</div>
            </div>
            <div className="p-3 bg-[--vc-bg-base] rounded-[--radius-sm] border border-[--vc-border]">
              <span className="text-[--vc-text-tertiary] font-mono text-[10px] uppercase">Defined Permissions</span>
              <div className="text-[--text-lg] font-bold font-mono text-[--vc-brand] mt-1">{stats.totalPermissions}</div>
            </div>
            <div className="p-3 bg-[--vc-bg-base] rounded-[--radius-sm] border border-[--vc-border]">
              <span className="text-[--vc-text-tertiary] font-mono text-[10px] uppercase">User Assignments</span>
              <div className="text-[--text-lg] font-bold font-mono text-[--vc-success-text] mt-1">{stats.activeAssignments}</div>
            </div>
            <div className="p-3 bg-[--vc-bg-base] rounded-[--radius-sm] border border-[--vc-border]">
              <span className="text-[--vc-text-tertiary] font-mono text-[10px] uppercase">Active Temp Grants</span>
              <div className="text-[--text-lg] font-bold font-mono text-[--vc-warning-text] mt-1">{stats.activeTempGrants}</div>
            </div>
            <div className="p-3 bg-[--vc-bg-base] rounded-[--radius-sm] border border-[--vc-border]">
              <span className="text-[--vc-text-tertiary] font-mono text-[10px] uppercase">Pending Reviews</span>
              <div className="text-[--text-lg] font-bold font-mono text-[--vc-info-text] mt-1">{stats.pendingAccessReviews}</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[--vc-border] overflow-x-auto pb-1">
        {['ROLES', 'PERMISSIONS', 'ASSIGNMENTS', 'TEMP_ACCESS', 'SIMULATOR'].map((tab) => (
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

      {/* Main Tab Views */}
      {activeTab === 'ROLES' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((r) => (
            <div key={r.id} className="bg-[--vc-surface-raised] p-5 rounded-[--radius-md] border border-[--vc-border] flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-[--font-heading] text-[--text-sm] font-bold text-[--vc-text-primary]">{r.name}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-[--radius-sm] bg-[--vc-brand-subtle] text-[--vc-brand] font-bold">
                    {r.code}
                  </span>
                </div>
                <p className="text-[--text-xs] text-[--vc-text-secondary]">{r.description}</p>
              </div>
              <div className="pt-3 border-t border-[--vc-border] flex justify-between items-center text-[11px]">
                <span className="text-[--vc-text-tertiary] font-mono">{r.permissions?.length || 0} Permissions</span>
                <span className="text-[--vc-brand] font-bold font-mono">{r.is_system ? 'SYSTEM ROLE' : 'CUSTOM ROLE'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'SIMULATOR' && (
        <div className="bg-[--vc-surface-raised] p-6 rounded-[--radius-md] border border-[--vc-border] flex flex-col gap-6 max-w-2xl">
          <h3 className="text-[--text-sm] font-bold text-[--vc-text-primary] pb-2 border-b border-[--vc-border] font-[--font-heading]">
            Authorization Policy Simulator
          </h3>
          <div className="grid grid-cols-2 gap-4 text-[--text-xs]">
            <div>
              <label className="block text-[--vc-text-primary] font-semibold mb-1">User Role</label>
              <select
                value={simUserRole}
                onChange={(e) => setSimUserRole(e.target.value)}
                className="w-full p-2.5 bg-[--vc-surface] border border-[--vc-border] rounded-[--radius-md] text-[--vc-text-primary]"
              >
                <option value="ENTERPRISE_ADMIN">ENTERPRISE_ADMIN</option>
                <option value="COMPLIANCE_OFFICER">COMPLIANCE_OFFICER</option>
                <option value="AUDITOR">AUDITOR</option>
                <option value="DEVELOPER">DEVELOPER</option>
              </select>
            </div>
            <div>
              <label className="block text-[--vc-text-primary] font-semibold mb-1">Target Scope / Permission</label>
              <select
                value={simPermission}
                onChange={(e) => setSimPermission(e.target.value)}
                className="w-full p-2.5 bg-[--vc-surface] border border-[--vc-border] rounded-[--radius-md] text-[--vc-text-primary]"
              >
                <option value="compliance.execute">compliance.execute</option>
                <option value="vault.admin">vault.admin</option>
                <option value="iam.manage">iam.manage</option>
                <option value="developer.read">developer.read</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleRunSimulation}
            className="px-4 py-2.5 bg-[--vc-brand] hover:bg-[--vc-brand-hover] text-white font-semibold text-[--text-xs] rounded-[--radius-md]"
          >
            Run Policy Authorization Test
          </button>

          {simResult && (
            <div className={`p-4 rounded-[--radius-sm] border text-[--text-xs] font-mono ${simResult.authorized ? 'bg-[--vc-success-bg] text-[--vc-success-text] border-[--vc-success]/30' : 'bg-[--vc-error-bg] text-[--vc-error-text] border-[--vc-error]/30'}`}>
              <div className="font-bold uppercase text-[11px] mb-1">
                Evaluation Result: {simResult.authorized ? 'AUTHORIZED (200 OK)' : 'DENIED (403 FORBIDDEN)'}
              </div>
              <p className="text-[11px] font-sans">{simResult.reason}</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
          <div className="bg-[--vc-surface-overlay] rounded-[--radius-md] max-w-md w-full p-6 border border-[--vc-border] flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[--vc-border] pb-3">
              <h3 className="text-[--text-base] font-bold text-[--vc-text-primary] font-[--font-heading]">Create Custom IAM Role</h3>
              <button onClick={() => setShowRoleModal(false)} className="text-[--vc-text-tertiary] hover:text-[--vc-text-primary]"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateCustomRole} className="flex flex-col gap-3 text-[--text-xs]">
              <div>
                <label className="block text-[--vc-text-primary] font-semibold mb-1">Role Name</label>
                <input
                  type="text"
                  placeholder="e.g. Statutory Auditor"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full p-2.5 bg-[--vc-surface] border border-[--vc-border] rounded-[--radius-md] text-[--vc-text-primary]"
                  required
                />
              </div>
              <div>
                <label className="block text-[--vc-text-primary] font-semibold mb-1">Role Description</label>
                <textarea
                  placeholder="Scope of custom access permissions..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full p-2.5 bg-[--vc-surface] border border-[--vc-border] rounded-[--radius-md] text-[--vc-text-primary]"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-[--vc-brand] hover:bg-[--vc-brand-hover] text-white font-semibold rounded-[--radius-md]">
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
