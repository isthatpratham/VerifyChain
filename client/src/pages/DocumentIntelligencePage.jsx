/**
 * DocumentIntelligencePage.jsx
 * Dedicated Workspace Component for Phase 9.3 AI Document Intelligence Platform.
 * Displays uploaded document list, classification badges, extracted fields, validation results, fraud indicators, AI summary, and human review approval workflow.
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  UploadSimple,
  CheckCircle,
  XCircle,
  WarningCircle,
  ShieldCheck,
  Brain,
  Sparkle,
  PencilSimple,
  MagnifyingGlass,
  ArrowRight,
  ShieldWarning,
  ListChecks,
} from '@phosphor-icons/react';
import axios from 'axios';

export function DocumentIntelligencePage() {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [selectedDocType, setSelectedDocType] = useState('GST_CERTIFICATE');

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/v1/document-intelligence/documents').catch(() => ({ data: { data: [] } }));
      const docs = res.data.data || [];
      setDocuments(docs);
      if (docs.length > 0 && !selectedDoc) {
        setSelectedDoc(docs[0]);
      }
    } catch (err) {
      console.error('Failed to fetch analyzed documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerAnalysis = async () => {
    setAnalyzing(true);
    try {
      const fileNameMap = {
        GST_CERTIFICATE: 'GST_Registration_Certificate_2024.pdf',
        PAN: 'Permanent_Account_Number_Card.pdf',
        UDYAM_CERTIFICATE: 'Udyam_Registration_Certificate.pdf',
        COMMERCIAL_INVOICE: 'Tax_Invoice_INV9901.pdf',
      };
      await axios.post('/api/v1/document-intelligence/analyze', {
        fileName: fileNameMap[selectedDocType] || 'Statutory_Document.pdf',
        documentType: selectedDocType,
      });
      await fetchDocuments();
    } catch (err) {
      console.error('Failed to trigger document analysis:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.post(`/api/v1/document-intelligence/documents/${id}/approve`, {
        overriddenFields: editFields,
        notes: 'Approved via Human Review Workflow Drawer',
      });
      await fetchDocuments();
    } catch (err) {
      console.error('Failed to approve document:', err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(`/api/v1/document-intelligence/documents/${id}/reject`, {
        notes: 'Rejected due to validation mismatch',
      });
      await fetchDocuments();
    } catch (err) {
      console.error('Failed to reject document:', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center gap-3">
          <FileText className="w-10 h-10 text-blue-600 animate-pulse" />
          <span className="text-sm font-semibold text-gray-700">Loading Document Intelligence Platform...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Sparkle size={16} weight="fill" /> Phase 9.3 Document Understanding
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            AI Document Intelligence Platform
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Automated document OCR, field extraction, validation, fraud detection, and human review approval workflow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedDocType}
            onChange={(e) => setSelectedDocType(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-medium text-gray-800 shadow-xs"
          >
            <option value="GST_CERTIFICATE">GST Certificate</option>
            <option value="PAN">PAN Card</option>
            <option value="UDYAM_CERTIFICATE">Udyam Certificate</option>
            <option value="COMMERCIAL_INVOICE">Commercial Invoice</option>
          </select>

          <button
            onClick={handleTriggerAnalysis}
            disabled={analyzing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-50"
          >
            <UploadSimple size={18} className={analyzing ? 'animate-spin' : ''} />
            {analyzing ? 'Processing Document...' : 'Analyze New Document'}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Analyzed Document History */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Analyzed Documents</h3>
            <span className="text-xs text-gray-500 font-medium">{documents.length} Records</span>
          </div>

          <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto">
            {documents.map((doc) => (
              <div
                key={doc.analysis_id || doc.id}
                onClick={() => {
                  setSelectedDoc(doc);
                  setEditFields({});
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                  selectedDoc?.analysis_id === doc.analysis_id
                    ? 'bg-blue-50/70 border-blue-600 shadow-xs'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 truncate">{doc.document_name}</span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                      doc.review_status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : doc.review_status === 'REJECTED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {doc.review_status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span>Type: {doc.document_type}</span>
                  <span>Confidence: {((doc.overall_confidence || 0.95) * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Selected Document Analysis Details (2 cols) */}
        {selectedDoc ? (
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Classification & Quality Banner */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                    {selectedDoc.category || 'STATUTORY_RECORD'}
                  </span>
                  <span className="text-xs text-slate-400">Quality Score: {((selectedDoc.quality_score || 0.98) * 100).toFixed(0)}%</span>
                </div>
                <h2 className="text-lg font-bold text-white">{selectedDoc.document_name}</h2>
                <p className="text-xs text-slate-300 mt-1">Authority: {selectedDoc.issuing_authority}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleReject(selectedDoc.analysis_id)}
                  className="px-4 py-2 rounded-xl border border-red-500/40 text-red-300 text-xs font-semibold hover:bg-red-500/20"
                >
                  Reject Document
                </button>
                <button
                  onClick={() => handleApprove(selectedDoc.analysis_id)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm"
                >
                  Approve & Map Record
                </button>
              </div>
            </div>

            {/* Extracted Fields Editor */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">Extracted Fields & Attributes</h3>
                <span className="text-xs text-gray-500 font-medium">Human Field Overrides Enabled</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(selectedDoc.extracted_fields || []).map((f) => (
                  <div key={f.id || f.field_key} className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-700">{f.field_label || f.field_key}</label>
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        Confidence {((f.confidence_score || 0.95) * 100).toFixed(0)}%
                      </span>
                    </div>

                    <input
                      type="text"
                      defaultValue={f.field_value}
                      onChange={(e) =>
                        setEditFields((prev) => ({ ...prev, [f.field_key]: e.target.value }))
                      }
                      className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs text-gray-900 font-medium focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Validation & Fraud Risk Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Validation Rules */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex flex-col gap-4">
                <h3 className="text-sm font-bold text-gray-900">Validation Checks</h3>
                <div className="flex flex-col gap-2.5">
                  {(selectedDoc.validations || []).map((v, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-start gap-2 text-xs">
                      <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-gray-900">{v.rule_name}</strong>
                        <p className="text-gray-600 text-[11px] mt-0.5">{v.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fraud Indicators */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex flex-col gap-4">
                <h3 className="text-sm font-bold text-gray-900">Fraud & Anomaly Indicators</h3>
                <div className="flex flex-col gap-2.5">
                  {(selectedDoc.fraud_indicators || []).map((fi, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/60 flex items-start gap-2 text-xs">
                      <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-emerald-900">{fi.title}</strong>
                        <p className="text-emerald-800 text-[11px] mt-0.5">{fi.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white rounded-2xl p-12 border border-gray-200 flex flex-col items-center justify-center text-center">
            <FileText size={48} className="text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-800">No Document Selected</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">Select an existing document from the history list or click "Analyze New Document" to process a record.</p>
          </div>
        )}
      </div>
    </div>
  );
}
