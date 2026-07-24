/**
 * useSupplierTrust.js
 * Custom hook to fetch and manage Supplier Trust Profile, Timeline, and Evaluation state.
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useSupplierTrust() {
  const [profile, setProfile] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  const fetchTrustData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, timelineRes] = await Promise.all([
        api.get('/supplier-trust/profile'),
        api.get('/supplier-trust/timeline'),
      ]);

      setProfile(profileRes.data.data);
      setTimeline(timelineRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch Supplier Trust information.');
    } finally {
      setLoading(false);
    }
  }, []);

  const evaluateTrust = async () => {
    setEvaluating(true);
    try {
      await api.post('/supplier-trust/evaluate');
      await fetchTrustData();
    } catch (err) {
      setError(err.response?.data?.error || 'Trust evaluation failed.');
    } finally {
      setEvaluating(false);
    }
  };

  useEffect(() => {
    fetchTrustData();
  }, [fetchTrustData]);

  return {
    profile,
    timeline,
    loading,
    error,
    evaluating,
    refetch: fetchTrustData,
    evaluateTrust,
  };
}
