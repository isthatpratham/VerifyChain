import { useState, useCallback } from 'react';
import { verifyGstin, verifyPan, verifyUdyam, getVerificationStatus } from '../services/api';

export function useBusinessVerification() {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVerificationStatus();
      setStatusData(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch verification status');
    } finally {
      setLoading(false);
    }
  }, []);

  const runGstinVerification = async (gstin) => {
    setLoading(true);
    setError(null);
    try {
      const res = await verifyGstin(gstin);
      return res;
    } catch (err) {
      const msg = err.response?.data?.error || 'GSTIN verification failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const runPanVerification = async (pan) => {
    setLoading(true);
    setError(null);
    try {
      const res = await verifyPan(pan);
      return res;
    } catch (err) {
      const msg = err.response?.data?.error || 'PAN verification failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const runUdyamVerification = async (udyamNumber) => {
    setLoading(true);
    setError(null);
    try {
      const res = await verifyUdyam(udyamNumber);
      return res;
    } catch (err) {
      const msg = err.response?.data?.error || 'Udyam verification failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    statusData,
    loading,
    error,
    fetchStatus,
    runGstinVerification,
    runPanVerification,
    runUdyamVerification,
  };
}
