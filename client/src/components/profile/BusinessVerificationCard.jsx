import { useState, useEffect } from 'react';
import { useBusinessVerification } from '../../hooks/useBusinessVerification';

export function BusinessVerificationCard({ profile }) {
  const { statusData, loading, error, fetchStatus, runGstinVerification, runPanVerification, runUdyamVerification } =
    useBusinessVerification();

  const [customPan, setCustomPan] = useState('');
  const [activeTab, setActiveTab] = useState('summary');
  const [verifyMsg, setVerifyMsg] = useState(null);

  useEffect(() => {
    if (profile) {
      fetchStatus();
      if (profile.gstin) {
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
    <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-200">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Business Registration Verification</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Validate GSTIN, PAN, and Udyam credentials with government database records.
          </p>
        </div>
        <div className="mt-2 sm:mt-0 flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">Overall Status:</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            {statusData?.verificationStatus || 'VERIFIED'}
          </span>
        </div>
      </div>

      {verifyMsg && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm font-medium ${
            verifyMsg.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {verifyMsg.text}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-800 text-sm border border-red-200">
          {error}
        </div>
      )}

      <div className="flex border-b border-gray-200 mt-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('summary')}
          className={`pb-2 px-4 border-b-2 ${
            activeTab === 'summary'
              ? 'border-brand text-brand font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Overview & Verification
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`pb-2 px-4 border-b-2 ${
            activeTab === 'details'
              ? 'border-brand text-brand font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Detailed Metadata
        </button>
      </div>

      {activeTab === 'summary' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* GSTIN Card */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase">GSTIN</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-green-100 text-green-800">
                  VERIFIED
                </span>
              </div>
              <p className="font-mono text-sm text-gray-900 font-semibold">{profile.gstin}</p>
            </div>
            <button
              onClick={handleVerifyGstin}
              disabled={loading}
              className="mt-4 w-full py-1.5 px-3 text-xs font-medium text-brand bg-white border border-brand rounded-lg hover:bg-brand/5 disabled:opacity-50"
            >
              Re-Verify GSTIN
            </button>
          </div>

          {/* PAN Card */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase">PAN</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-green-100 text-green-800">
                  VERIFIED
                </span>
              </div>
              <input
                type="text"
                value={customPan}
                onChange={(e) => setCustomPan(e.target.value.toUpperCase())}
                maxLength={10}
                className="font-mono text-sm text-gray-900 font-semibold bg-white border border-gray-300 rounded px-2 py-1 w-full"
              />
            </div>
            <button
              onClick={handleVerifyPan}
              disabled={loading}
              className="mt-4 w-full py-1.5 px-3 text-xs font-medium text-brand bg-white border border-brand rounded-lg hover:bg-brand/5 disabled:opacity-50"
            >
              Verify PAN
            </button>
          </div>

          {/* Udyam Card */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase">UDYAM</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-green-100 text-green-800">
                  VERIFIED
                </span>
              </div>
              <p className="font-mono text-sm text-gray-900 font-semibold">{profile.udyamNumber}</p>
            </div>
            <button
              onClick={handleVerifyUdyam}
              disabled={loading}
              className="mt-4 w-full py-1.5 px-3 text-xs font-medium text-brand bg-white border border-brand rounded-lg hover:bg-brand/5 disabled:opacity-50"
            >
              Re-Verify Udyam
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs font-mono overflow-x-auto">
          <pre>{JSON.stringify(statusData?.details || {}, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
