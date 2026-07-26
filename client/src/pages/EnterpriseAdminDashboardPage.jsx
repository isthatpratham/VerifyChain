/**
 * EnterpriseAdminDashboardPage.jsx
 * Enterprise Administration Platform Workspace for Phase 11.1 Identity, User & Organization Management.
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Buildings,
  PaperPlaneTilt,
  ShieldCheck,
  UserPlus,
  BuildingPlus,
  MagnifyingGlass,
  CheckCircle,
  WarningCircle,
  XCircle,
  DotsThreeVertical,
  SlidersHorizontal,
  Key,
  IdentificationCard,
  LockKey,
  ShieldWarning,
  PencilSimple,
  Trash,
  X,
  Funnel,
  TrendUp,
  EnvelopeSimple,
  Clock,
  ArrowClockwise,
} from '@phosphor-icons/react';
import axios from 'axios';

export function EnterpriseAdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('OVERVIEW'); // OVERVIEW, ORGANIZATIONS, USERS, INVITATIONS
  const [stats, setStats] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  // Form States
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [inviteOrgId, setInviteOrgId] = useState('');
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgTier, setNewOrgTier] = useState('ENTERPRISE');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('MSME_OWNER');

  useEffect(() => {
    fetchAdminData();
  }, [activeTab, statusFilter]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, orgsRes, usersRes, invsRes] = await Promise.all([
        axios.get('/api/v1/admin/dashboard/stats'),
        axios.get('/api/v1/admin/organizations'),
        axios.get('/api/v1/admin/users'),
        axios.get('/api/v1/admin/invitations'),
      ]);

      setStats(statsRes.data.data);
      setOrganizations(orgsRes.data.data.organizations || orgsRes.data.data || []);
      setUsers(usersRes.data.data.users || usersRes.data.data || []);
      setInvitations(invsRes.data.data || []);
    } catch (err) {
      console.error('[EnterpriseAdmin] Error loading administration data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvitation = async (e) => {
    e.preventDefault();
    if (!inviteEmail || !inviteOrgId) return;
    try {
      await axios.post('/api/v1/admin/invitations', {
        email: inviteEmail,
        organizationId: inviteOrgId,
        role: inviteRole,
      });
      setInviteEmail('');
      setShowInviteModal(false);
      fetchAdminData();
    } catch (err) {
      alert(`Invitation failed: ${err.message}`);
    }
  };

  const handleCreateOrganization = async (e) => {
    e.preventDefault();
    if (!newOrgName) return;
    try {
      await axios.post('/api/v1/admin/organizations', {
        name: newOrgName,
        subscriptionTier: newOrgTier,
      });
      setNewOrgName('');
      setShowOrgModal(false);
      fetchAdminData();
    } catch (err) {
      alert(`Organization creation failed: ${err.message}`);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserEmail || !newUserName) return;
    try {
      await axios.post('/api/v1/admin/users', {
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
      });
      setNewUserName('');
      setNewUserEmail('');
      setShowUserModal(false);
      fetchAdminData();
    } catch (err) {
      alert(`User creation failed: ${err.message}`);
    }
  };

  const handleUserStatusToggle = async (userId, currentActive) => {
    try {
      await axios.post(`/api/v1/admin/users/${userId}/status`, {
        targetStatus: currentActive ? 'SUSPENDED' : 'ACTIVE',
        reason: 'Admin dashboard status update',
      });
      fetchAdminData();
    } catch (err) {
      alert(`Status transition failed: ${err.message}`);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 bg-gray-50/50 min-h-screen">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xs">
              <ShieldCheck size={28} weight="bold" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Enterprise Administration Platform</h1>
              <p className="text-xs text-gray-600 font-medium mt-0.5">
                Centralized Workspace for Identity, Organization Lifecycle, Memberships & Invitations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <PaperPlaneTilt size={16} weight="bold" /> Send Invitation
            </button>
            <button
              onClick={() => setShowOrgModal(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <BuildingPlus size={16} weight="bold" /> Create Organization
            </button>
          </div>
        </div>

        {/* Platform Overview KPIs */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 border-t border-gray-100 pt-5 text-xs">
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-500 font-semibold flex items-center gap-1.5">
                <Users size={15} className="text-indigo-600" /> Total Users
              </span>
              <div className="text-xl font-bold text-gray-900 mt-1">{stats.totalUsers}</div>
            </div>
            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <CheckCircle size={15} className="text-emerald-600" /> Active Users
              </span>
              <div className="text-xl font-bold text-emerald-900 mt-1">{stats.activeUsers}</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                <Buildings size={15} className="text-slate-900" /> Platform Organizations
              </span>
              <div className="text-xl font-bold text-slate-900 mt-1">{stats.totalOrganizations}</div>
            </div>
            <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-100">
              <span className="text-amber-800 font-semibold flex items-center gap-1.5">
                <PaperPlaneTilt size={15} className="text-amber-600" /> Pending Invitations
              </span>
              <div className="text-xl font-bold text-amber-950 mt-1">{stats.pendingInvitations}</div>
            </div>
            <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
              <span className="text-indigo-800 font-semibold flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-indigo-600" /> Active Memberships
              </span>
              <div className="text-xl font-bold text-indigo-950 mt-1">{stats.activeMemberships}</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 text-xs font-semibold text-gray-600">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`pb-3 px-3 transition-all border-b-2 cursor-pointer ${
            activeTab === 'OVERVIEW' ? 'border-slate-900 text-slate-900 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          Overview & Quick Actions
        </button>
        <button
          onClick={() => setActiveTab('ORGANIZATIONS')}
          className={`pb-3 px-3 transition-all border-b-2 cursor-pointer ${
            activeTab === 'ORGANIZATIONS' ? 'border-slate-900 text-slate-900 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          Organizations Directory ({organizations.length})
        </button>
        <button
          onClick={() => setActiveTab('USERS')}
          className={`pb-3 px-3 transition-all border-b-2 cursor-pointer ${
            activeTab === 'USERS' ? 'border-slate-900 text-slate-900 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          User Identity Directory ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('INVITATIONS')}
          className={`pb-3 px-3 transition-all border-b-2 cursor-pointer ${
            activeTab === 'INVITATIONS' ? 'border-slate-900 text-slate-900 font-bold' : 'border-transparent hover:text-gray-900'
          }`}
        >
          Invitation Center ({invitations.length})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Buildings size={18} className="text-indigo-600" /> Recent Organizations
            </h3>
            <div className="divide-y divide-gray-100 text-xs">
              {organizations.slice(0, 5).map((org) => (
                <div key={org.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900">{org.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono">Slug: {org.slug}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800">
                    {org.subscription_tier}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Users size={18} className="text-indigo-600" /> Recent Platform Users
            </h3>
            <div className="divide-y divide-gray-100 text-xs">
              {users.slice(0, 5).map((u) => (
                <div key={u.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900">{u.name}</div>
                    <div className="text-[10px] text-gray-500">{u.email}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {u.is_active ? 'ACTIVE' : 'SUSPENDED'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Organizations Directory */}
      {activeTab === 'ORGANIZATIONS' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Platform Organizations</h3>
            <button
              onClick={() => setShowOrgModal(true)}
              className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              + Add Organization
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/70 text-gray-600 border-b border-gray-100 font-semibold">
                  <th className="py-3.5 px-4">Organization Name</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4">Tier</th>
                  <th className="py-3.5 px-4">Storage Quota</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {organizations.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50/60">
                    <td className="py-3.5 px-4 font-bold text-gray-900">{org.name}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-600">{org.slug}</td>
                    <td className="py-3.5 px-4 font-semibold text-indigo-600">{org.subscription_tier}</td>
                    <td className="py-3.5 px-4 text-gray-600">{org.storage_quota_mb} MB</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700">
                        {org.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Users Directory */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">User Identity Directory</h3>
            <button
              onClick={() => setShowUserModal(true)}
              className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              + Create User
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/70 text-gray-600 border-b border-gray-100 font-semibold">
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/60">
                    <td className="py-3.5 px-4 font-bold text-gray-900">{u.name}</td>
                    <td className="py-3.5 px-4 text-gray-600">{u.email}</td>
                    <td className="py-3.5 px-4 font-semibold text-indigo-600">{u.role}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {u.is_active ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleUserStatusToggle(u.id, u.is_active)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold cursor-pointer"
                      >
                        {u.is_active ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Invitations Center */}
      {activeTab === 'INVITATIONS' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Enterprise Invitations</h3>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              + Send Invitation
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/70 text-gray-600 border-b border-gray-100 font-semibold">
                  <th className="py-3.5 px-4">Invitee Email</th>
                  <th className="py-3.5 px-4">Target Organization</th>
                  <th className="py-3.5 px-4">Assigned Role</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/60">
                    <td className="py-3.5 px-4 font-bold text-gray-900">{inv.email}</td>
                    <td className="py-3.5 px-4 text-gray-600">{inv.organization?.name || 'Organization'}</td>
                    <td className="py-3.5 px-4 font-semibold text-indigo-600">{inv.role}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700">
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <PaperPlaneTilt size={20} className="text-indigo-600" /> Send Organization Invitation
              </h3>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateInvitation} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Invitee Email</label>
                <input
                  type="email"
                  placeholder="user@enterprise.org"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Target Organization</label>
                <select
                  value={inviteOrgId}
                  onChange={(e) => setInviteOrgId(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  required
                >
                  <option value="">Select Organization...</option>
                  {organizations.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                >
                  <option value="MEMBER">Member</option>
                  <option value="COMPLIANCE_OFFICER">Compliance Officer</option>
                  <option value="BUSINESS_OWNER">Business Owner</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl cursor-pointer">
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Org Modal */}
      {showOrgModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <BuildingPlus size={20} className="text-slate-900" /> Create Platform Organization
              </h3>
              <button onClick={() => setShowOrgModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateOrganization} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Organization Name</label>
                <input
                  type="text"
                  placeholder="Acme Global Logistics"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Subscription Tier</label>
                <select
                  value={newOrgTier}
                  onChange={(e) => setNewOrgTier(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                >
                  <option value="ENTERPRISE">Enterprise</option>
                  <option value="GROWTH">Growth</option>
                  <option value="STARTER">Starter</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-xl cursor-pointer">
                  Create Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <UserPlus size={20} className="text-slate-900" /> Provision Platform User
              </h3>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">User Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="john.doe@company.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-xl cursor-pointer">
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
