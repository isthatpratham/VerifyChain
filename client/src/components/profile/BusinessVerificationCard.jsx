/**
 * BusinessVerificationCard.jsx
 * Enterprise Registration Verification Operations Card (GSTIN, PAN, Udyam).
 * Preserves all existing hook integration with useBusinessVerification.
 */
import { useState, useEffect } from 'react';
import { useBusinessVerification } from '../../hooks/useBusinessVerification';
import { ShieldCheck, CheckCircle, ArrowClockwise, Code } from '@phosphor-icons/react';
import { Button } from '../../ui/Button';
import { Alert } from '../../ui/Alert';

export function BusinessVerificationCard({ profile }) {
  const { statusData, loading, error, fetchStatus, runGstinVerification, runPanVerification, runUdyamVerification } =
    useBusinessVerification();

  const [customPan, setCustomPan] = useState('');
  const [activeTab, setActiveTab] = useState('summary');
  const [verifyMsg, setVerifyMsg] = useState(null);

  useEffect(() => {
    if (profile) {
      fetchStatus();
      if (profile.gstin && profile.gstin.length >= 12) {
        setCustomPan(profile.gstin.substring(2, 12));
      }
    }
  }, [profile, fetchStatus]);

  const handleVerifyGstin = async () => {
    setVerifyMsg(null);
    try {
      const res = await runGstinVerification(profile.gstin);
      setVerifyMsg({ type: 'success', text: `GSTIN Verified! State Code: ${res.details.stateCode}, Status: ${res.details.status}` });
      fetchStatus();
    } catch (err) {
      setVerifyMsg({ type: 'error', text: err.response?.data?.error || 'GSTIN verification failed' });
    }
  };

  const handleVerifyPan = async () => {
    setVerifyMsg(null);
    try {
      const res = await runPanVerification(customPan);
      setVerifyMsg({ type: 'success', text: `PAN Verified! Entity Type: ${res.details.entityType}` });
      fetchStatus();
    } catch (err) {
      setVerifyMsg({ type: 'error', text: err.response?.data?.error || 'PAN verification failed' });
    }
  };

  const handleVerifyUdyam = async () => {
    setVerifyMsg(null);
    try {
      const res = await runUdyamVerification(profile.udyamNumber);
      setVerifyMsg({ type: 'success', text: `Udyam Verified! Enterprise Type: ${res.details.enterpriseType}` });
      fetchStatus();
    } catch (err) {
      setVerifyMsg({ type: 'error', text: err.response?.data?.error || 'Udyam verification failed' });
    }
  };

  if (!profile) return null;

  return (
    <div className="mt-8 p-6 sm:p-8 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised]">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[--vc-border] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <ShieldCheck size={20} className="text-[--vc-brand]" />
            <h3 className="font-[--font-heading] text-[--text-lg] font-bold text-[--vc-text-primary]">
              Business Registration Verification Operations
            </h3>
          </div>
          <p className="text-[--text-xs] text-[--vc-text-secondary]">
            Validate GSTIN, PAN, and Udyam credentials directly against government database records.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[--text-xs] font-medium text-[--vc-text-tertiary]">Overall Standing:</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[--radius-sm] bg-[--vc-success-bg] text-[--vc-success-text] text-[11px] font-semibold border border-[--color-success-100]">
            <CheckCircle size={13} className="text-[--vc-success]" />
            <span>{statusData?.verificationStatus || 'VERIFIED'}</span>
          </span>
        </div>
      </div>

      {/* Messages */}
      {verifyMsg && (
        <div className="mt-4">
          <Alert variant={verifyMsg.type === 'success' ? 'success' : 'error'} title="Verification Result">
            {verifyMsg.text}
          </Alert>
        </div>
      )}

      {error && (
        <div className="mt-4">
          <Alert variant="error" title="Verification Engine Error">
            {error}
          </Alert>
        </div>
      )}

      {/* Tab Controls */}
      <div className="flex border-b border-[--vc-border] mt-6 text-[--text-xs] font-medium gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('summary')}
          className={`pb-2.5 px-2 border-b-2 font-semibold transition-colors ${
            activeTab === 'summary'
              ? 'border-[--vc-brand] text-[--vc-brand]'
              : 'border-transparent text-[--vc-text-tertiary] hover:text-[--vc-text-primary]'
          }`}
        >
          Verification Cards
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`pb-2.5 px-2 border-b-2 font-semibold transition-colors flex items-center gap-1 ${
            activeTab === 'details'
              ? 'border-[--vc-brand] text-[--vc-brand]'
              : 'border-transparent text-[--vc-text-tertiary] hover:text-[--vc-text-primary]'
          }`}
        >
          <Code size={14} />
          <span>Raw Registry JSON</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'summary' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

          {/* GSTIN Card */}
          <div className="p-4 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-[--vc-text-tertiary] uppercase tracking-wider">GSTIN Verification</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-[--radius-sm] bg-[--vc-success-bg] text-[--vc-success-text]">
                  VERIFIED
                </span>
              </div>
              <p className="font-mono text-[--text-xs] font-bold text-[--vc-text-primary] mb-1">{profile.gstin}</p>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={loading}
              onClick={handleVerifyGstin}
              icon={<ArrowClockwise size={13} />}
              className="mt-4 w-full text-[11px]"
            >
              Re-Verify GSTIN
            </Button>
          </div>

          {/* PAN Card */}
          <div className="p-4 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-[--vc-text-tertiary] uppercase tracking-wider">PAN Verification</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-[--radius-sm] bg-[--vc-success-bg] text-[--vc-success-text]">
                  VERIFIED
                </span>
              </div>
              <input
                type="text"
                value={customPan}
                onChange={(e) => setCustomPan(e.target.value.toUpperCase())}
                maxLength={10}
                className="font-mono text-[--text-xs] font-bold text-[--vc-text-primary] bg-[--vc-surface-raised] border border-[--vc-border] rounded-[--radius-sm] px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-[--vc-brand]"
              />
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={loading}
              onClick={handleVerifyPan}
              icon={<ArrowClockwise size={13} />}
              className="mt-4 w-full text-[11px]"
            >
              Verify PAN
            </Button>
          </div>

          {/* Udyam Card */}
          <div className="p-4 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-[--vc-text-tertiary] uppercase tracking-wider">UDYAM Verification</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-[--radius-sm] bg-[--vc-success-bg] text-[--vc-success-text]">
                  VERIFIED
                </span>
              </div>
              <p className="font-mono text-[--text-xs] font-bold text-[--vc-text-primary] mb-1">{profile.udyamNumber}</p>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={loading}
              onClick={handleVerifyUdyam}
              icon={<ArrowClockwise size={13} />}
              className="mt-4 w-full text-[11px]"
            >
              Re-Verify Udyam
            </Button>
          </div>

        </div>
      ) : (
        <div className="mt-6 bg-[--vc-bg-base] p-4 rounded-[--radius-sm] border border-[--vc-border] text-[11px] font-mono text-[--vc-text-secondary] overflow-x-auto">
          <pre>{JSON.stringify(statusData?.details || {}, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
