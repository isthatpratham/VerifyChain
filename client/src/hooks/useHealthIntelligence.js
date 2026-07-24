/**
 * useHealthIntelligence.js
 * Production hook managing Compliance Health Intelligence Workspace state,
 * API connections, score calculations, category breakdowns, and snapshots.
 */
import { useState, useCallback, useEffect } from 'react';
import api from '../services/api';

export function useHealthIntelligence() {
  const [currentScore, setCurrentScore] = useState(null);
  const [insights, setInsights] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState(null);

  const fetchIntelligence = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [intelRes, snapshotsRes] = await Promise.all([
        api.get('/compliance/health/insights'),
        api.get('/compliance/health/snapshots'),
      ]);

      if (intelRes.data && intelRes.data.data) {
        setInsights(intelRes.data.data);
        setCurrentScore(intelRes.data.data.scoreBreakdown);
      }

      if (snapshotsRes.data && snapshotsRes.data.data) {
        setSnapshots(snapshotsRes.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load compliance health intelligence.');
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateScore = useCallback(async () => {
    setCalculating(true);
    setError(null);
    try {
      const res = await api.post('/compliance/health/calculate', {});
      if (res.data && res.data.success) {
        await fetchIntelligence();
        return res.data.data;
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to calculate compliance health score.');
      throw err;
    } finally {
      setCalculating(false);
    }
  }, [fetchIntelligence]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchIntelligence();
    }
  }, [fetchIntelligence]);

  return {
    currentScore,
    insights,
    snapshots,
    loading,
    calculating,
    error,
    fetchIntelligence,
    calculateScore,
  };
}
