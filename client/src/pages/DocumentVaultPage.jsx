/**
 * DocumentVaultPage.jsx
 * Enterprise Workspace for Phase 10.1 - 10.5 Document Vault, Version Control, Smart Organization, Collaboration & Records Governance.
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

export function DocumentVaultPage() {
  const [assets, setAssets] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [governanceMetrics, setGovernanceMetrics] = useState(null);
  const [folders, setFolders] = useState([]);
  const [collections, setCollections] = useState([]);
  const [tags, setTags] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [legalHolds, setLegalHolds] = useState([]);
  const [dispositions, setDispositions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Bulk Selection State
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);

  // Modals & Drawers
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCommentDrawer, setShowCommentDrawer] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showLegalHoldModal, setShowLegalHoldModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showDispositionModal, setShowDispositionModal] = useState(false);

  // Form States
  const [holdTitle, setHoldTitle] = useState('');
  const [caseReference, setCaseReference] = useState('');
  const [holdReason, setHoldReason] = useState('');
  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const [shareTargetType, setShareTargetType] = useState('USER');
  const [shareTargetId, setShareTargetId] = useState('');
  const [shareAccessLevel, setShareAccessLevel] = useState('READ');
  const [newCommentText, setNewCommentText] = useState('');
  const [reviewers, setReviewers] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  // Collaboration / Governance details
  const [assetShares, setAssetShares] = useState([]);
  const [assetComments, setAssetComments] = useState([]);

  useEffect(() => {
    fetchVaultData();
    fetchOrganizationData();
  }, [selectedCategory, selectedStatus, selectedFolderId, selectedCollectionId]);

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
        if (searchQuery) params.query = searchQuery;

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
      fetchVaultData();
      fetchOrganizationData();
    } catch (err) {
      alert(`Legal Hold creation failed: ${err.message}`);
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
      fetchVaultData();
    } catch (err) {
      alert(`Policy assignment failed: ${err.message}`);
    }
  };

  const handleArchiveAsset = async (assetId) => {
    try {
      await axios.post(`/api/v1/vault/assets/${assetId}/archive`);
      fetchVaultData();
    } catch (err) {
      alert(`Archive failed: ${err.message}`);
    }
  };

  const handleQueueDisposition = async (assetId) => {
    try {
      await axios.post(`/api/v1/vault/assets/${assetId}/disposition`);
      fetchVaultData();
      fetchOrganizationData();
    } catch (err) {
      alert(`Disposition queue failed: ${err.message}`);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 bg-gray-50/50 min-h-screen">
      {/* Governance Metrics Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
              <Gavel size={28} weight="bold" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Records Management, Retention & Legal Hold</h1>
              <p className="text-xs text-gray-600 font-medium mt-0.5">
                Statutory Retention Policies, Legal Hold Protection, Archival & Governed Disposition
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLegalHoldModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <ShieldWarning size={16} weight="bold" /> Create Legal Hold
            </button>
          </div>
        </div>

        {/* Governance KPI Grid */}
        {governanceMetrics && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 border-t border-gray-100 pt-5 text-xs">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-gray-500 font-medium">Total Assets</span>
              <div className="text-lg font-bold text-gray-900 mt-1">{governanceMetrics.totalAssets}</div>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
              <span className="text-amber-700 font-medium">Active Legal Holds</span>
              <div className="text-lg font-bold text-amber-900 mt-1">{governanceMetrics.activeHolds}</div>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
              <span className="text-indigo-700 font-medium">Active Policies</span>
              <div className="text-lg font-bold text-indigo-900 mt-1">{governanceMetrics.activePolicies}</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
              <span className="text-blue-700 font-medium">Archived Assets</span>
              <div className="text-lg font-bold text-blue-900 mt-1">{governanceMetrics.archivedAssets}</div>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
              <span className="text-rose-700 font-medium">Pending Disposition</span>
              <div className="text-lg font-bold text-rose-900 mt-1">{governanceMetrics.pendingDispositions}</div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-emerald-700 font-medium">Compliance Health</span>
              <div className="text-lg font-bold text-emerald-900 mt-1">{governanceMetrics.complianceHealthScore}%</div>
            </div>
          </div>
        )}
      </div>

      {/* Main Split Layout: Sidebar & Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Governance Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Legal Holds Overview */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col gap-3">
            <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase flex items-center gap-1.5">
              <ShieldWarning size={15} className="text-amber-600" /> Active Legal Holds
            </h3>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto text-xs">
              {legalHolds.map((h) => (
                <div key={h.id} className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-200/60">
                  <div className="font-bold text-amber-900 truncate">{h.title}</div>
                  <div className="text-[10px] text-amber-700 font-mono mt-0.5">Ref: {h.case_reference}</div>
                  <div className="text-[10px] text-gray-500 mt-1">{h.hold_assets?.length || 0} document(s) bound</div>
                </div>
              ))}
            </div>
          </div>

          {/* Retention Policies Overview */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col gap-3">
            <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase flex items-center gap-1.5">
              <CheckCircle size={15} className="text-indigo-600" /> Statutory Policies
            </h3>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto text-xs">
              {policies.map((p) => (
                <div key={p.id} className="p-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <span className="font-semibold text-gray-800 truncate">{p.name}</span>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md font-bold">{p.retention_days}d</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Assets Repository Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Governance & Records Workspace</h3>
              <span className="text-xs text-gray-500 font-medium">Showing {assets.length} Asset(s)</span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-gray-500">Querying Governance Engine...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50/70 text-gray-600 border-b border-gray-100 font-semibold">
                      <th className="py-3.5 px-4">Document Title</th>
                      <th className="py-3.5 px-4">Lifecycle State</th>
                      <th className="py-3.5 px-4">Legal Hold</th>
                      <th className="py-3.5 px-4">Disposition Status</th>
                      <th className="py-3.5 px-4 text-right">Governance Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {assets.map((item) => {
                      const aId = item.assetId || item.asset_id;
                      const hasHold = item.legal_hold_flag || item.legalHoldFlag;
                      return (
                        <tr key={aId} className="hover:bg-gray-50/60 transition-all">
                          <td className="py-3.5 px-4 font-bold text-gray-900">{item.title}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {item.lifecycle_state || item.lifecycleState || 'ACTIVE'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {hasHold ? (
                              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit">
                                <ShieldWarning size={14} /> ACTIVE HOLD
                              </span>
                            ) : (
                              <span className="text-gray-400 font-medium">Clear</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-gray-700">
                            {item.disposition_status || item.dispositionStatus || 'NONE'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedAsset(item);
                                  setShowPolicyModal(true);
                                }}
                                className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-bold hover:bg-indigo-100 cursor-pointer"
                              >
                                Policy
                              </button>
                              <button
                                onClick={() => handleArchiveAsset(aId)}
                                className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold hover:bg-blue-100 flex items-center gap-1 cursor-pointer"
                              >
                                <Archive size={14} /> Archive
                              </button>
                              <button
                                onClick={() => handleQueueDisposition(aId)}
                                className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg font-bold hover:bg-rose-100 flex items-center gap-1 cursor-pointer"
                              >
                                <Trash size={14} /> Dispose
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ShieldWarning size={20} className="text-amber-600" /> Create Legal Hold
              </h3>
              <button onClick={() => setShowLegalHoldModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateLegalHold} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Hold Title</label>
                <input
                  type="text"
                  placeholder="e.g. Revenue Tax Investigation 2026"
                  value={holdTitle}
                  onChange={(e) => setHoldTitle(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Case Reference</label>
                <input
                  type="text"
                  placeholder="e.g. CASE_2026_9901"
                  value={caseReference}
                  onChange={(e) => setCaseReference(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Reason / Scope</label>
                <textarea
                  placeholder="Reason for statutory legal hold..."
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-amber-600 text-white font-semibold rounded-xl cursor-pointer">
                  Place Legal Hold
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Policy Modal */}
      {showPolicyModal && selectedAsset && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle size={20} className="text-indigo-600" /> Assign Retention Policy
              </h3>
              <button onClick={() => setShowPolicyModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAssignPolicy} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Select Policy</label>
                <select
                  value={selectedPolicyId}
                  onChange={(e) => setSelectedPolicyId(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  required
                >
                  <option value="">Select Retention Policy...</option>
                  {policies.map((p) => (
                    <option key={p.id} value={p.policy_id}>
                      {p.name} ({p.retention_days} days)
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl cursor-pointer">
                  Assign Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
