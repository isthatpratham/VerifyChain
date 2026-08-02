/**
 * EnterpriseAdminDashboardPage.jsx
 * Enterprise Administration Platform Workspace for Phase 11.1 Identity, User & Organization Management.
 * Strictly adheres to DESIGN_SYSTEM.md enterprise tokens.
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
  const [activeTab, setActiveTab] = useState('OVERVIEW');
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

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    if (!newOrgName) return;
    try {
      await axios.post('/api/v1/admin/organizations', {
        name: newOrgName,
        tier: newOrgTier,
      });
      setNewOrgName('');
      setShowOrgModal(false);
      fetchAdminData();
    } catch (err) {
      alert(`Organization creation failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] gap-3 text-[--vc-text-tertiary]">
        <ArrowClockwise size={24} className="animate-spin text-[--vc-brand]" />
        <span className="text-[--text-xs] font-semibold">Loading Administration Workspace...</span>
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
              <ShieldCheck size={28} weight="bold" />
            </div>
            <div>
              <h1 className="text-[--text-xl] font-bold text-[--vc-text-primary] tracking-tight font-[--font-heading]">
                Platform Administration
              </h1>
              <p className="text-[--text-xs] text-[--vc-text-secondary] font-medium mt-0.5">
                Enterprise Multi-Tenant Tenant Isolation, User Governance & Onboarding Operations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-3.5 py-2 bg-[--vc-brand] hover:bg-[--vc-brand-hover] text-white text-[--text-xs] font-semibold rounded-[--radius-md] flex items-center gap-1.5 transition-all"
            >
              <PaperPlaneTilt size={15} weight="bold" /> Send Invitation
            </button>
            <button
              onClick={() => setShowOrgModal(true)}
              className="px-3.5 py-2 bg-[--vc-bg-base] hover:bg-[--vc-bg-muted] text-[--vc-text-primary] text-[--text-xs] font-semibold rounded-[--radius-md] border border-[--vc-border] flex items-center gap-1.5 transition-all"
            >
              <BuildingPlus size={15} /> New Tenant Org
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-[--vc-border] pt-5 text-[--text-xs]">
            <div className="p-3 bg-[--vc-bg-base] rounded-[--radius-sm] border border-[--vc-border]">
              <span className="text-[--vc-text-tertiary] font-mono text-[10px] uppercase">Registered MSMEs</span>
              <div className="text-[--text-lg] font-bold font-mono text-[--vc-text-primary] mt-1">{stats.totalMsmes}</div>
            </div>
            <div className="p-3 bg-[--vc-bg-base] rounded-[--radius-sm] border border-[--vc-border]">
              <span className="text-[--vc-text-tertiary] font-mono text-[10px] uppercase">Verified Accounts</span>
              <div className="text-[--text-lg] font-bold font-mono text-[--vc-success-text] mt-1">{stats.verifiedMsmes}</div>
            </div>
            <div className="p-3 bg-[--vc-bg-base] rounded-[--radius-sm] border border-[--vc-border]">
              <span className="text-[--vc-text-tertiary] font-mono text-[10px] uppercase">Active Users</span>
              <div className="text-[--text-lg] font-bold font-mono text-[--vc-brand] mt-1">{stats.totalUsers}</div>
            </div>
            <div className="p-3 bg-[--vc-bg-base] rounded-[--radius-sm] border border-[--vc-border]">
              <span className="text-[--vc-text-tertiary] font-mono text-[10px] uppercase">Tenant Organizations</span>
              <div className="text-[--text-lg] font-bold font-mono text-[--vc-info-text] mt-1">{stats.totalOrganizations}</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[--vc-border] overflow-x-auto pb-1">
        {['OVERVIEW', 'ORGANIZATIONS', 'USERS', 'INVITATIONS'].map((tab) => (
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

      {/* Overview & Organizations Grid */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Organizations List */}
          <div className="bg-[--vc-surface-raised] p-5 rounded-[--radius-md] border border-[--vc-border] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[--vc-border]">
              <h3 className="font-[--font-heading] text-[--text-sm] font-bold text-[--vc-text-primary]">Tenant Organizations</h3>
              <span className="text-[10px] font-mono text-[--vc-text-tertiary]">{organizations.length} Total</span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {organizations.map((org) => (
                <div key={org.id} className="p-3 rounded-[--radius-sm] bg-[--vc-bg-base] border border-[--vc-border] flex items-center justify-between text-[--text-xs]">
                  <div>
                    <span className="font-bold text-[--vc-text-primary] block">{org.name}</span>
                    <span className="text-[10px] font-mono text-[--vc-text-tertiary]">{org.slug}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-[--radius-sm] text-[10px] font-bold font-mono bg-[--vc-brand-subtle] text-[--vc-brand] border border-[--vc-brand]/20">
                    {org.tier || 'ENTERPRISE'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Users */}
          <div className="bg-[--vc-surface-raised] p-5 rounded-[--radius-md] border border-[--vc-border] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[--vc-border]">
              <h3 className="font-[--font-heading] text-[--text-sm] font-bold text-[--vc-text-primary]">Recent Accounts</h3>
              <span className="text-[10px] font-mono text-[--vc-text-tertiary]">{users.length} Users</span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {users.slice(0, 5).map((u) => (
                <div key={u.id} className="p-3 rounded-[--radius-sm] bg-[--vc-bg-base] border border-[--vc-border] flex items-center justify-between text-[--text-xs]">
                  <div>
                    <span className="font-bold text-[--vc-text-primary] block">{u.email}</span>
                    <span className="text-[10px] text-[--vc-text-tertiary]">{u.name || 'Enterprise User'}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-[--radius-sm] text-[10px] font-bold font-mono bg-[--vc-bg-muted] text-[--vc-text-secondary]">
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
          <div className="bg-[--vc-surface-overlay] rounded-[--radius-md] max-w-md w-full p-6 border border-[--vc-border] flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[--vc-border] pb-3">
              <h3 className="text-[--text-base] font-bold text-[--vc-text-primary] font-[--font-heading]">Invite Enterprise User</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-[--vc-text-tertiary] hover:text-[--vc-text-primary]"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateInvitation} className="flex flex-col gap-3 text-[--text-xs]">
              <div>
                <label className="block text-[--vc-text-primary] font-semibold mb-1">User Email Address</label>
                <input
                  type="email"
                  placeholder="user@enterprise.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full p-2.5 bg-[--vc-surface] border border-[--vc-border] rounded-[--radius-md] text-[--vc-text-primary]"
                  required
                />
              </div>
              <div>
                <label className="block text-[--vc-text-primary] font-semibold mb-1">Organization ID</label>
                <input
                  type="text"
                  placeholder="Organization ID"
                  value={inviteOrgId}
                  onChange={(e) => setInviteOrgId(e.target.value)}
                  className="w-full p-2.5 bg-[--vc-surface] border border-[--vc-border] rounded-[--radius-md] text-[--vc-text-primary]"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-[--vc-brand] hover:bg-[--vc-brand-hover] text-white font-semibold rounded-[--radius-md]">
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
