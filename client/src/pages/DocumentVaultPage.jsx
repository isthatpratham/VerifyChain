/**
 * DocumentVaultPage.jsx
 * Enterprise Workspace for Phase 10.1 & Phase 10.2 Enterprise Document Vault & Version Control.
 * Features Repository Overview, Storage Statistics, Document Library, Version History, Interactive Timeline,
 * Side-by-side Comparison, Lineage Graph, and Soft Rollback.
 */

import React, { useState, useEffect } from 'react';
import {
  Folder,
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
  Tag,
  Database,
  Sparkle,
  X,
  LockKey,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Scales,
} from '@phosphor-icons/react';
import axios from 'axios';

export function DocumentVaultPage() {
  const [assets, setAssets] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Phase 10.2 Versioning State
  const [activeTab, setActiveTab] = useState('DETAILS'); // DETAILS | VERSIONS | TIMELINE | LINEAGE
  const [versionHistory, setVersionHistory] = useState([]);
  const [assetTimeline, setAssetTimeline] = useState(null);
  const [assetLineage, setAssetLineage] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [versionASelect, setVersionASelect] = useState('v1.0');
  const [versionBSelect, setVersionBSelect] = useState('v1.1');
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [rollbackTargetVersion, setRollbackTargetVersion] = useState('');
  const [rollbackReason, setRollbackReason] = useState('');

  // Upload Form State
  const [fileTitle, setFileTitle] = useState('');
  const [docCategory, setDocCategory] = useState('BUSINESS');
  const [docType, setDocType] = useState('BUSINESS_CERTIFICATE');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchVaultData();
  }, [selectedCategory, selectedStatus]);

  const fetchVaultData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'ALL') params.category = selectedCategory;
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (searchQuery) params.search = searchQuery;

      const [assetsRes, metricsRes] = await Promise.all([
        axios.get('/api/v1/vault/assets', { params }),
        axios.get('/api/v1/vault/metrics'),
      ]);

      setAssets(assetsRes.data.data || []);
      setMetrics(metricsRes.data.data || null);
    } catch (err) {
      console.error('[DocumentVault] Error loading vault data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInspectAsset = async (asset) => {
    setSelectedAsset(asset);
    setActiveTab('DETAILS');
    try {
      const [versRes, timeRes, linRes] = await Promise.all([
        axios.get(`/api/v1/vault/assets/${asset.assetId}/versions`),
        axios.get(`/api/v1/vault/assets/${asset.assetId}/timeline`),
        axios.get(`/api/v1/vault/assets/${asset.assetId}/lineage`),
      ]);
      setVersionHistory(versRes.data.data || []);
      setAssetTimeline(timeRes.data.data || null);
      setAssetLineage(linRes.data.data || null);
      if (versRes.data.data && versRes.data.data.length >= 2) {
        setVersionASelect(versRes.data.data[versRes.data.data.length - 1].version_number);
        setVersionBSelect(versRes.data.data[0].version_number);
      }
    } catch (err) {
      console.error('[DocumentVault] Error fetching version control details:', err.message);
    }
  };

  const handleCompareSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAsset) return;
    try {
      const res = await axios.get(`/api/v1/vault/assets/${selectedAsset.assetId}/compare`, {
        params: { versionA: versionASelect, versionB: versionBSelect },
      });
      setComparisonResult(res.data.data);
      setShowCompareModal(true);
    } catch (err) {
      alert(`Comparison failed: ${err.message}`);
    }
  };

  const handleRollbackSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAsset || !rollbackTargetVersion) return;
    try {
      await axios.post(`/api/v1/vault/assets/${selectedAsset.assetId}/rollback`, {
        targetVersionNumber: rollbackTargetVersion,
        reason: rollbackReason,
      });
      setShowRollbackModal(false);
      setRollbackReason('');
      fetchVaultData();
      handleInspectAsset(selectedAsset);
      alert(`Successfully restored version '${rollbackTargetVersion}' as a new minor revision.`);
    } catch (err) {
      alert(`Rollback failed: ${err.message}`);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVaultData();
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      formData.append('title', fileTitle || selectedFile?.name || 'New Vault Asset');
      formData.append('category', docCategory);
      formData.append('documentType', docType);

      await axios.post('/api/v1/vault/assets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowUploadModal(false);
      setFileTitle('');
      setSelectedFile(null);
      fetchVaultData();
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (asset) => {
    try {
      const response = await axios.get(`/api/v1/vault/assets/${asset.assetId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', asset.originalFileName || 'document.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert(`Download failed: ${err.message}`);
    }
  };

  const handleArchive = async (assetId) => {
    try {
      await axios.post(`/api/v1/vault/assets/${assetId}/archive`);
      fetchVaultData();
    } catch (err) {
      alert(`Archive failed: ${err.message}`);
    }
  };

  const handleRestore = async (assetId) => {
    try {
      await axios.post(`/api/v1/vault/assets/${assetId}/restore`);
      fetchVaultData();
    } catch (err) {
      alert(`Restore failed: ${err.message}`);
    }
  };

  const handleDelete = async (assetId) => {
    if (!window.confirm('Are you sure you want to delete this asset from the Enterprise Vault?')) return;
    try {
      await axios.delete(`/api/v1/vault/assets/${assetId}`);
      fetchVaultData();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
            <Folder size={28} weight="bold" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Enterprise Document Vault & Version Control</h1>
            <p className="text-xs text-gray-600 font-medium mt-0.5">
              Immutable Document Repository, Metadata Intelligence, Lineage Graph & Version History
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchVaultData}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowClockwise size={15} />
            Refresh
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <UploadSimple size={16} weight="bold" />
            Upload Asset
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Database size={24} />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium">Total Repository Assets</span>
              <h3 className="text-xl font-bold text-gray-900 mt-0.5">{metrics.totalAssets}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <HardDrive size={24} />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium">Vault Storage Used</span>
              <h3 className="text-xl font-bold text-gray-900 mt-0.5">{metrics.mbUsed} MB</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <GitBranch size={24} />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium">Version Control Engine</span>
              <h3 className="text-xl font-bold text-gray-900 mt-0.5">Immutable</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <LockKey size={24} />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium">Encrypted Storage</span>
              <h3 className="text-xl font-bold text-gray-900 mt-0.5">AES-256</h3>
            </div>
          </div>
        </div>
      )}

      {/* Controls Bar: Search & Category Filters */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, filename, or document type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Funnel size={15} className="text-gray-500" />
            <span className="text-xs text-gray-600 font-semibold">Category:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-1.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="BUSINESS">Business</option>
            <option value="COMPLIANCE">Compliance</option>
            <option value="LEGAL">Legal</option>
            <option value="FINANCIAL">Financial</option>
            <option value="IDENTITY">Identity</option>
            <option value="SUPPLIER">Supplier</option>
            <option value="AI_REPORT">AI Reports</option>
            <option value="EXECUTIVE">Executive</option>
            <option value="AUDIT">Audit</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="py-1.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="VERIFIED">Verified</option>
            <option value="ANALYZED">Analyzed</option>
            <option value="PROCESSING">Processing</option>
            <option value="APPROVED">Approved</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Vault Assets Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Document Vault Library</h3>
          <span className="text-xs text-gray-500 font-medium">Showing {assets.length} Asset(s)</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
            <ArrowClockwise size={18} className="animate-spin text-blue-600" />
            Loading Enterprise Vault Asset Repository...
          </div>
        ) : assets.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No assets found matching the selected repository filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/70 text-gray-600 border-b border-gray-100 font-semibold">
                  <th className="py-3.5 px-5">Asset Identifier / Title</th>
                  <th className="py-3.5 px-4">Version</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Document Type</th>
                  <th className="py-3.5 px-4">Size</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assets.map((item) => (
                  <tr key={item.assetId} className="hover:bg-gray-50/60 transition-all">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <FileText size={18} />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{item.title}</div>
                          <div className="text-[11px] text-gray-600">{item.originalFileName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {item.currentVersion || 'v1.0'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-gray-100 text-gray-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-700 font-medium">{item.documentType}</td>
                    <td className="py-3.5 px-4 text-gray-600 font-medium">{formatBytes(item.fileSize)}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          item.status === 'VERIFIED' || item.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.status === 'ARCHIVED'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleInspectAsset(item)}
                          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Inspect Details & Version History"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDownload(item)}
                          className="p-1.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Download"
                        >
                          <DownloadSimple size={16} />
                        </button>
                        {item.status === 'ARCHIVED' ? (
                          <button
                            onClick={() => handleRestore(item.assetId)}
                            className="p-1.5 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="Restore"
                          >
                            <ArrowClockwise size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleArchive(item.assetId)}
                            className="p-1.5 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="Archive"
                          >
                            <Archive size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.assetId)}
                          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Asset Version Control Inspector Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-xl border border-gray-200 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <FileText size={24} className="text-blue-600" />
                <div>
                  <h3 className="text-base font-bold text-gray-900">{selectedAsset.title}</h3>
                  <span className="text-xs text-gray-500 font-mono">Current Version: {selectedAsset.currentVersion || 'v1.0'}</span>
                </div>
              </div>
              <button onClick={() => setSelectedAsset(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Sub Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
              {['DETAILS', 'VERSIONS', 'TIMELINE', 'LINEAGE'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* TAB 1: DETAILS */}
            {activeTab === 'DETAILS' && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 font-semibold block">Asset UUID</span>
                    <span className="text-gray-900 font-mono text-[11px]">{selectedAsset.assetId}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold block">Storage Provider</span>
                    <span className="text-gray-900 font-medium">{selectedAsset.storageProvider}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold block">Category / Type</span>
                    <span className="text-gray-900 font-medium">{selectedAsset.category} / {selectedAsset.documentType}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold block">MIME Type & Size</span>
                    <span className="text-gray-900 font-medium">{selectedAsset.mimeType} ({formatBytes(selectedAsset.fileSize)})</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400 font-semibold block">Checksum (SHA-256)</span>
                    <span className="text-gray-900 font-mono text-[11px] break-all">{selectedAsset.checksum}</span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs flex flex-col gap-2">
                  <span className="font-bold text-gray-900 flex items-center gap-1.5">
                    <Sparkle size={14} className="text-blue-600" /> Active Version Metadata
                  </span>
                  <pre className="text-[11px] text-gray-700 bg-white p-3 rounded-lg border border-gray-200 overflow-x-auto max-h-40">
                    {JSON.stringify(selectedAsset.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 2: VERSIONS */}
            {activeTab === 'VERSIONS' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-900">Immutable Version Snapshots</h4>
                  <button
                    onClick={() => setShowRollbackModal(true)}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-lg border border-amber-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowClockwise size={14} /> Soft Rollback
                  </button>
                </div>

                <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden text-xs">
                  {versionHistory.map((v) => (
                    <div key={v.id} className="p-3.5 bg-white hover:bg-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {v.version_number}
                        </span>
                        <div>
                          <div className="font-bold text-gray-900">{v.change_summary}</div>
                          <div className="text-[11px] text-gray-500">
                            By {v.changed_by} on {new Date(v.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-100 text-gray-700 rounded-full">
                        {v.version_tag}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Compare Bar */}
                {versionHistory.length >= 2 && (
                  <form onSubmit={handleCompareSubmit} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs gap-3">
                    <span className="font-bold text-gray-900 flex items-center gap-1">
                      <Scales size={16} className="text-blue-600" /> Compare:
                    </span>
                    <div className="flex items-center gap-2">
                      <select
                        value={versionASelect}
                        onChange={(e) => setVersionASelect(e.target.value)}
                        className="py-1 px-2 bg-white border border-gray-300 rounded-lg text-xs"
                      >
                        {versionHistory.map((v) => (
                          <option key={v.id} value={v.version_number}>
                            {v.version_number}
                          </option>
                        ))}
                      </select>
                      <span className="text-gray-400 font-semibold">vs</span>
                      <select
                        value={versionBSelect}
                        onChange={(e) => setVersionBSelect(e.target.value)}
                        className="py-1 px-2 bg-white border border-gray-300 rounded-lg text-xs"
                      >
                        {versionHistory.map((v) => (
                          <option key={v.id} value={v.version_number}>
                            {v.version_number}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg">
                      Compare Diff
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB 3: TIMELINE */}
            {activeTab === 'TIMELINE' && assetTimeline && (
              <div className="flex flex-col gap-3 text-xs">
                <h4 className="text-xs font-bold text-gray-900">Chronological History Timeline</h4>
                <div className="relative pl-6 border-l-2 border-blue-200 flex flex-col gap-4 my-2">
                  {assetTimeline.events?.map((ev) => (
                    <div key={ev.id} className="relative">
                      <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white" />
                      <div className="font-bold text-gray-900">{ev.summary || ev.type}</div>
                      <div className="text-[11px] text-gray-500">
                        {new Date(ev.timestamp).toLocaleString()} • Actor: {ev.actor || 'SYSTEM'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: LINEAGE */}
            {activeTab === 'LINEAGE' && assetLineage && (
              <div className="flex flex-col gap-3 text-xs">
                <h4 className="text-xs font-bold text-gray-900">Document Ancestry Lineage Nodes</h4>
                <div className="grid grid-cols-1 gap-2">
                  {assetLineage.lineageNodes?.map((node) => (
                    <div key={node.versionNumber} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GitCommit size={18} className="text-blue-600" />
                        <div>
                          <span className="font-bold text-gray-900">{node.versionNumber}</span>
                          {node.parentVersion && <span className="text-gray-400 text-[11px]"> (Parent: {node.parentVersion})</span>}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 rounded-full">
                        {node.lineageType}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={() => setSelectedAsset(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => handleDownload(selectedAsset)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                <DownloadSimple size={15} /> Download Binary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Diff Modal */}
      {showCompareModal && comparisonResult && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-gray-200 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Scales size={20} className="text-blue-600" /> Version Comparison Diff
              </h3>
              <button onClick={() => setShowCompareModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-3 bg-blue-50 text-blue-900 rounded-xl text-xs font-semibold border border-blue-200">
              {comparisonResult.humanReadableSummary}
            </div>

            <div className="overflow-y-auto max-h-60 flex flex-col gap-2 text-xs">
              <h4 className="font-bold text-gray-900">Field Level Deltas ({comparisonResult.fieldDeltas?.length || 0})</h4>
              {comparisonResult.fieldDeltas?.map((d, i) => (
                <div key={i} className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-3 gap-2">
                  <span className="font-bold text-gray-800">{d.fieldName}</span>
                  <span className="text-red-600 font-mono text-[11px] truncate">Prev: {d.previousValue || 'null'}</span>
                  <span className="text-emerald-600 font-mono text-[11px] truncate">New: {d.newValue || 'null'}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl text-xs"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Soft Rollback Modal */}
      {showRollbackModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ArrowClockwise size={20} className="text-amber-600" /> Execute Soft Rollback
              </h3>
              <button onClick={() => setShowRollbackModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRollbackSubmit} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Target Historical Version</label>
                <select
                  value={rollbackTargetVersion}
                  onChange={(e) => setRollbackTargetVersion(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  required
                >
                  <option value="">Select Version to Restore...</option>
                  {versionHistory.map((v) => (
                    <option key={v.id} value={v.version_number}>
                      {v.version_number} — {v.change_summary}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Rollback Reason / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Reason for restoring this version..."
                  value={rollbackReason}
                  onChange={(e) => setRollbackReason(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-medium">
                Note: Soft rollback will create a NEW restored revision without overwriting or deleting any existing historical version snapshots.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRollbackModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl"
                >
                  Execute Rollback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Asset Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <UploadSimple size={22} className="text-blue-600" />
                <h3 className="text-base font-bold text-gray-900">Upload to Enterprise Vault</h3>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Asset Title / Name</label>
                <input
                  type="text"
                  placeholder="e.g. Annual GST Certificate 2026"
                  value={fileTitle}
                  onChange={(e) => setFileTitle(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Category</label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                  >
                    <option value="BUSINESS">BUSINESS</option>
                    <option value="COMPLIANCE">COMPLIANCE</option>
                    <option value="LEGAL">LEGAL</option>
                    <option value="FINANCIAL">FINANCIAL</option>
                    <option value="IDENTITY">IDENTITY</option>
                    <option value="SUPPLIER">SUPPLIER</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Document Type</label>
                  <input
                    type="text"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Select File</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center gap-2"
                >
                  {uploading && <ArrowClockwise size={14} className="animate-spin" />}
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
