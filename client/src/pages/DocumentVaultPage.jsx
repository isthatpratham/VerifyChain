/**
 * DocumentVaultPage.jsx
 * Enterprise Workspace for Phase 10.1 - 10.5 Document Vault, Version Control, Smart Organization, Collaboration & Records Governance.
 * Strictly adheres to DESIGN_SYSTEM.md enterprise tokens.
 */

import React, { useState, useEffect } from 'react';
import {
  Folder,
  FolderPlus,
  FileText,
  UploadSimple,
  HardDrive,
  MagnifyingGlass,
  Funnel,
  CheckCircle,
  WarningCircle,
  Clock,
  Archive,
  Trash,
  ArrowClockwise,
  ShieldCheck,
  Eye,
  DownloadSimple,
  Tag as TagIcon,
  Database,
  Sparkle,
  X,
  LockKey,
  GitBranch,
  GitCommit,
  Scales,
  Star,
  BookmarkSimple,
  DotsThreeVertical,
  Export,
  CaretRight,
  CaretDown,
  ShareNetwork,
  ChatCircleText,
  CheckSquare,
  BellRinging,
  Users,
  PaperPlaneTilt,
  Gavel,
  ShieldWarning,
  TrendUp,
  Recycle,
} from '@phosphor-icons/react';
import axios from 'axios';
import { Toast } from '../ui/Toast';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export function DocumentVaultPage() {
  const [assets, setAssets] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [governanceMetrics, setGovernanceMetrics] = useState(null);
  const [folders, setFolders] = useState([]);
  const [collections, setCollections] = useState([]);
  const [tags, setTags] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [legalHolds, setLegalHolds] = useState([]);
  const [dispositions, setDispositions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Search Debouncer
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Bulk Selection State
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);

  // Modals & Drawers
  const [showLegalHoldModal, setShowLegalHoldModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, type: null, assetId: null });

  // Form State
  const [holdTitle, setHoldTitle] = useState('');
  const [caseReference, setCaseReference] = useState('');
  const [holdReason, setHoldReason] = useState('');
  const [selectedPolicyId, setSelectedPolicyId] = useState('');

  useEffect(() => {
    fetchVaultData();
    fetchOrganizationData();
  }, [selectedCategory, selectedStatus, selectedFolderId, selectedCollectionId, debouncedSearchQuery]);

  const fetchVaultData = async () => {
    setLoading(true);
    try {
      if (selectedCollectionId) {
        const evalRes = await axios.get(`/api/v1/vault/collections/${selectedCollectionId}`);
        setAssets(evalRes.data.data.assets || []);
      } else {
        const params = {};
        if (selectedCategory !== 'ALL') params.category = selectedCategory;
        if (selectedStatus !== 'ALL') params.status = selectedStatus;
        if (selectedFolderId) params.folderId = selectedFolderId;
        if (debouncedSearchQuery) params.query = debouncedSearchQuery;

        const [assetsRes, metricsRes, govRes] = await Promise.all([
          axios.get('/api/v1/vault/search/advanced', { params }),
          axios.get('/api/v1/vault/metrics'),
          axios.get('/api/v1/vault/governance/metrics'),
        ]);

        setAssets(assetsRes.data.data.results || assetsRes.data.data || []);
        setMetrics(metricsRes.data.data || null);
        setGovernanceMetrics(govRes.data.data || null);
      }
    } catch (err) {
      console.error('[DocumentVault] Error loading vault data:', err.message);
      Toast.error('Failed to load governance assets telemetry.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizationData = async () => {
    try {
      const [fRes, cRes, tRes, pRes, hRes, dRes] = await Promise.all([
        axios.get('/api/v1/vault/folders/tree'),
        axios.get('/api/v1/vault/collections'),
        axios.get('/api/v1/vault/tags'),
        axios.get('/api/v1/vault/policies'),
        axios.get('/api/v1/vault/legal-holds'),
        axios.get('/api/v1/vault/dispositions'),
      ]);
      setFolders(fRes.data.data || []);
      setCollections(cRes.data.data || []);
      setTags(tRes.data.data || []);
      setPolicies(pRes.data.data || []);
      setLegalHolds(hRes.data.data || []);
      setDispositions(dRes.data.data || []);
    } catch (err) {
      console.error('[DocumentVault] Error loading governance data:', err.message);
    }
  };

  const handleCreateLegalHold = async (e) => {
    e.preventDefault();
    if (!holdTitle || !caseReference) return;
    try {
      await axios.post('/api/v1/vault/legal-holds', {
        title: holdTitle,
        caseReference,
        reason: holdReason,
        assetIds: selectedAssetIds.length > 0 ? selectedAssetIds : (selectedAsset ? [selectedAsset.assetId] : []),
      });
      setHoldTitle('');
      setCaseReference('');
      setHoldReason('');
      setShowLegalHoldModal(false);
      Toast.success('Statutory Legal Hold successfully applied.');
      fetchVaultData();
      fetchOrganizationData();
    } catch (err) {
      Toast.error(`Legal Hold creation failed: ${err.message}`);
    }
  };

  const handleAssignPolicy = async (e) => {
    e.preventDefault();
    if (!selectedAsset || !selectedPolicyId) return;
    try {
      await axios.post(`/api/v1/vault/assets/${selectedAsset.assetId}/policies`, {
        policyId: selectedPolicyId,
      });
      setShowPolicyModal(false);
      Toast.success('Retention policy assigned to asset.');
      fetchVaultData();
    } catch (err) {
      Toast.error(`Policy assignment failed: ${err.message}`);
    }
  };

  const executeArchiveAsset = async () => {
    if (!confirmModal.assetId) return;
    try {
      await axios.post(`/api/v1/vault/assets/${confirmModal.assetId}/archive`);
      Toast.success('Document successfully archived.');
      setConfirmModal({ open: false, type: null, assetId: null });
      fetchVaultData();
    } catch (err) {
      Toast.error(`Archive failed: ${err.message}`);
    }
  };

  const executeQueueDisposition = async () => {
    if (!confirmModal.assetId) return;
    try {
      await axios.post(`/api/v1/vault/assets/${confirmModal.assetId}/disposition`);
      Toast.success('Document queued for governed disposition.');
      setConfirmModal({ open: false, type: null, assetId: null });
      fetchVaultData();
      fetchOrganizationData();
    } catch (err) {
      Toast.error(`Disposition queue failed: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Governance Metrics Header */}
      <div className="bg-[--vc-surface-raised] p-6 rounded-[--radius-md] border border-[--vc-border] flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-[--vc-brand-subtle] text-[--vc-brand] rounded-[--radius-sm] border border-[--vc-brand]/20">
              <Gavel size={28} weight="bold" />
            </div>
            <div>
              <h1 className="text-[--text-xl] font-bold text-[--vc-text-primary] tracking-tight font-[--font-heading]">
                Records Management, Retention & Legal Hold
              </h1>
              <p className="text-[--text-xs] text-[--vc-text-secondary] font-medium mt-0.5">
                Statutory Retention Policies, Legal Hold Protection, Archival & Governed Disposition
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLegalHoldModal(true)}
              className="px-4 py-2 bg-[--vc-warning] hover:bg-[--vc-warning-text] text-white text-[--text-xs] font-semibold rounded-[--radius-md] transition-all flex items-center gap-2"
            >
              <ShieldWarning size={16} weight="bold" /> Create Legal Hold
            </button>
          </div>
        </div>

        {/* Governance KPI Grid */}
        {governanceMetrics && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 border-t border-[--vc-border] pt-5 text-[--text-xs]">
            <div className="p-3 bg-[--vc-bg-base] rounded-[--radius-sm] border border-[--vc-border]">
              <span className="text-[--vc-text-secondary] font-medium">Total Assets</span>
              <div className="text-[--text-lg] font-bold text-[--vc-text-primary] font-mono mt-1">{governanceMetrics.totalAssets}</div>
            </div>
            <div className="p-3 bg-[--vc-warning-bg] rounded-[--radius-sm] border border-[--vc-warning]/20">
              <span className="text-[--vc-warning-text] font-medium">Active Legal Holds</span>
              <div className="text-[--text-lg] font-bold text-[--vc-warning-text] font-mono mt-1">{governanceMetrics.activeHolds}</div>
            </div>
            <div className="p-3 bg-[--vc-brand-subtle] rounded-[--radius-sm] border border-[--vc-brand]/20">
              <span className="text-[--vc-brand] font-medium">Active Policies</span>
              <div className="text-[--text-lg] font-bold text-[--vc-brand] font-mono mt-1">{governanceMetrics.activePolicies}</div>
            </div>
            <div className="p-3 bg-[--vc-info-bg] rounded-[--radius-sm] border border-[--vc-info]/20">
              <span className="text-[--vc-info-text] font-medium">Archived Assets</span>
              <div className="text-[--text-lg] font-bold text-[--vc-info-text] font-mono mt-1">{governanceMetrics.archivedAssets}</div>
            </div>
            <div className="p-3 bg-[--vc-error-bg] rounded-[--radius-sm] border border-[--vc-error]/20">
              <span className="text-[--vc-error-text] font-medium">Pending Disposition</span>
              <div className="text-[--text-lg] font-bold text-[--vc-error-text] font-mono mt-1">{governanceMetrics.pendingDispositions}</div>
            </div>
            <div className="p-3 bg-[--vc-success-bg] rounded-[--radius-sm] border border-[--vc-success]/20">
              <span className="text-[--vc-success-text] font-medium">Compliance Health</span>
              <div className="text-[--text-lg] font-bold text-[--vc-success-text] font-mono mt-1">{governanceMetrics.complianceHealthScore}%</div>
            </div>
          </div>
        )}
      </div>

      {/* Main Split Layout: Sidebar & Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Governance Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Legal Holds Overview */}
          <div className="bg-[--vc-surface-raised] p-4 rounded-[--radius-md] border border-[--vc-border] flex flex-col gap-3">
            <h3 className="text-[--text-xs] font-bold text-[--vc-text-primary] tracking-wider uppercase flex items-center gap-1.5 font-[--font-heading]">
              <ShieldWarning size={15} className="text-[--vc-warning]" /> Active Legal Holds
            </h3>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto text-[--text-xs]">
              {legalHolds.map((h) => (
                <div key={h.id} className="p-2.5 bg-[--vc-warning-bg] rounded-[--radius-sm] border border-[--vc-warning]/30">
                  <div className="font-bold text-[--vc-warning-text] truncate">{h.title}</div>
                  <div className="text-[10px] text-[--vc-warning-text] font-mono mt-0.5">Ref: {h.case_reference}</div>
                  <div className="text-[10px] text-[--vc-text-tertiary] mt-1">{h.hold_assets?.length || 0} document(s) bound</div>
                </div>
              ))}
            </div>
          </div>

          {/* Retention Policies Overview */}
          <div className="bg-[--vc-surface-raised] p-4 rounded-[--radius-md] border border-[--vc-border] flex flex-col gap-3">
            <h3 className="text-[--text-xs] font-bold text-[--vc-text-primary] tracking-wider uppercase flex items-center gap-1.5 font-[--font-heading]">
              <CheckCircle size={15} className="text-[--vc-brand]" /> Statutory Policies
            </h3>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto text-[--text-xs]">
              {policies.map((p) => (
                <div key={p.id} className="p-2 bg-[--vc-bg-base] rounded-[--radius-sm] border border-[--vc-border] flex items-center justify-between">
                  <span className="font-semibold text-[--vc-text-primary] truncate">{p.name}</span>
                  <span className="text-[10px] bg-[--vc-brand-subtle] text-[--vc-brand] px-1.5 py-0.5 rounded-[--radius-sm] font-bold font-mono">{p.retention_days}d</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Assets Repository Table */}
          <div className="bg-[--vc-surface-raised] rounded-[--radius-md] border border-[--vc-border] overflow-hidden">
            <div className="p-4 border-b border-[--vc-border] flex items-center justify-between">
              <h3 className="text-[--text-sm] font-bold text-[--vc-text-primary] font-[--font-heading]">Governance & Records Workspace</h3>
              <span className="text-[--text-xs] text-[--vc-text-tertiary] font-medium">Showing {assets.length} Asset(s)</span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-[--text-xs] text-[--vc-text-tertiary]">Querying Governance Engine...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[--text-xs]">
                  <thead>
                    <tr className="bg-[--vc-bg-base] text-[--vc-text-secondary] border-b border-[--vc-border] font-semibold">
                      <th className="py-3 px-4">Document Title</th>
                      <th className="py-3 px-4">Lifecycle State</th>
                      <th className="py-3 px-4">Legal Hold</th>
                      <th className="py-3 px-4">Disposition Status</th>
                      <th className="py-3 px-4 text-right">Governance Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[--vc-border]">
                    {assets.map((item) => {
                      const aId = item.assetId || item.asset_id;
                      const hasHold = item.legal_hold_flag || item.legalHoldFlag;
                      return (
                        <tr key={aId} className="hover:bg-[--vc-bg-base]/60 transition-all">
                          <td className="py-3 px-4 font-bold text-[--vc-text-primary]">{item.title}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-[--radius-sm] text-[10px] font-bold bg-[--vc-brand-subtle] text-[--vc-brand] border border-[--vc-brand]/20 font-mono">
                              {item.lifecycle_state || item.lifecycleState || 'ACTIVE'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {hasHold ? (
                              <span className="px-2 py-0.5 rounded-[--radius-sm] text-[10px] font-bold bg-[--vc-warning-bg] text-[--vc-warning-text] border border-[--vc-warning]/30 flex items-center gap-1 w-fit">
                                <ShieldWarning size={13} /> ACTIVE HOLD
                              </span>
                            ) : (
                              <span className="text-[--vc-text-tertiary] font-medium">Clear</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[--vc-text-secondary]">
                            {item.disposition_status || item.dispositionStatus || 'NONE'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedAsset(item);
                                  setShowPolicyModal(true);
                                }}
                                className="px-2.5 py-1 bg-[--vc-brand-subtle] text-[--vc-brand] rounded-[--radius-sm] font-bold hover:bg-[--vc-brand-subtle]/80 border border-[--vc-brand]/20 text-[11px]"
                              >
                                Policy
                              </button>
                              <button
                                onClick={() => setConfirmModal({ open: true, type: 'archive', assetId: aId })}
                                className="px-2.5 py-1 bg-[--vc-bg-base] text-[--vc-text-primary] rounded-[--radius-sm] font-bold hover:bg-[--vc-bg-muted] border border-[--vc-border] flex items-center gap-1 text-[11px]"
                              >
                                <Archive size={13} /> Archive
                              </button>
                              <button
                                onClick={() => setConfirmModal({ open: true, type: 'disposition', assetId: aId })}
                                className="px-2.5 py-1 bg-[--vc-error-bg] text-[--vc-error-text] rounded-[--radius-sm] font-bold hover:bg-[--vc-error-bg]/80 border border-[--vc-error]/20 flex items-center gap-1 text-[11px]"
                              >
                                <Trash size={13} /> Dispose
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legal Hold Modal */}
      {showLegalHoldModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
          <div className="bg-[--vc-surface-overlay] rounded-[--radius-md] max-w-md w-full p-6 border border-[--vc-border] flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[--vc-border] pb-3">
              <h3 className="text-[--text-base] font-bold text-[--vc-text-primary] flex items-center gap-2 font-[--font-heading]">
                <ShieldWarning size={20} className="text-[--vc-warning]" /> Create Legal Hold
              </h3>
              <button onClick={() => setShowLegalHoldModal(false)} className="text-[--vc-text-tertiary] hover:text-[--vc-text-primary]">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateLegalHold} className="flex flex-col gap-3 text-[--text-xs]">
              <div>
                <label className="block text-[--vc-text-primary] font-semibold mb-1">Hold Title</label>
                <input
                  type="text"
                  placeholder="e.g. Revenue Tax Investigation 2026"
                  value={holdTitle}
                  onChange={(e) => setHoldTitle(e.target.value)}
                  className="w-full p-2.5 bg-[--vc-surface] border border-[--vc-border] rounded-[--radius-md] text-[--vc-text-primary]"
                  required
                />
              </div>
              <div>
                <label className="block text-[--vc-text-primary] font-semibold mb-1">Case Reference</label>
                <input
                  type="text"
                  placeholder="e.g. CASE_2026_9901"
                  value={caseReference}
                  onChange={(e) => setCaseReference(e.target.value)}
                  className="w-full p-2.5 bg-[--vc-surface] border border-[--vc-border] rounded-[--radius-md] text-[--vc-text-primary]"
                  required
                />
              </div>
              <div>
                <label className="block text-[--vc-text-primary] font-semibold mb-1">Reason / Scope</label>
                <textarea
                  placeholder="Reason for statutory legal hold..."
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                  className="w-full p-2.5 bg-[--vc-surface] border border-[--vc-border] rounded-[--radius-md] text-[--vc-text-primary]"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-[--vc-warning] hover:bg-[--vc-warning-text] text-white font-semibold rounded-[--radius-md]">
                  Place Legal Hold
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Policy Modal */}
      {showPolicyModal && selectedAsset && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
          <div className="bg-[--vc-surface-overlay] rounded-[--radius-md] max-w-md w-full p-6 border border-[--vc-border] flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[--vc-border] pb-3">
              <h3 className="text-[--text-base] font-bold text-[--vc-text-primary] flex items-center gap-2 font-[--font-heading]">
                <CheckCircle size={20} className="text-[--vc-brand]" /> Assign Retention Policy
              </h3>
              <button onClick={() => setShowPolicyModal(false)} className="text-[--vc-text-tertiary] hover:text-[--vc-text-primary]">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAssignPolicy} className="flex flex-col gap-3 text-[--text-xs]">
              <div>
                <label className="block text-[--vc-text-primary] font-semibold mb-1">Select Policy</label>
                <select
                  value={selectedPolicyId}
                  onChange={(e) => setSelectedPolicyId(e.target.value)}
                  className="w-full p-2.5 bg-[--vc-surface] border border-[--vc-border] rounded-[--radius-md] text-[--vc-text-primary]"
                  required
                >
                  <option value="">-- Choose Retention Policy --</option>
                  {policies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.retention_days} Days)
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-[--vc-brand] hover:bg-[--vc-brand-hover] text-white font-semibold rounded-[--radius-md]">
                  Assign Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reusable Confirmation Dialog for Destructive Governance Actions */}
      <ConfirmDialog
        open={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, type: null, assetId: null })}
        onConfirm={confirmModal.type === 'archive' ? executeArchiveAsset : executeQueueDisposition}
        title={confirmModal.type === 'archive' ? 'Archive Document Record' : 'Queue Governed Disposition'}
        message={
          confirmModal.type === 'archive'
            ? 'Are you sure you want to move this statutory record to archival storage? Archived assets remain read-only for audit compliance.'
            : 'Are you sure you want to queue this document record for governed statutory disposition? This action is tracked by the audit log.'
        }
        confirmText={confirmModal.type === 'archive' ? 'Archive Asset' : 'Queue Disposition'}
        variant={confirmModal.type === 'archive' ? 'warning' : 'destructive'}
      />
    </div>
  );
}
