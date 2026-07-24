/**
 * useCompliance.js
 * Production hook managing Compliance Workspace state, APIs, pagination, filters,
 * detailed lookup, Rules Engine evaluations, and Orchestration sync.
 */
import { useState, useCallback, useEffect } from 'react';
import api from '../services/api';

export function useCompliance() {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [metrics, setMetrics] = useState({ total: 0, compliant: 0, due: 0, overdue: 0, exempt: 0 });
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecords = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/compliance', { params });

      if (res.data && res.data.data) {
        setRecords(res.data.data);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }

        // Calculate Overview Metrics
        const allRecs = res.data.data;
        setMetrics({
          total: allRecs.length,
          compliant: allRecs.filter((r) => r.status === 'COMPLIANT').length,
          due: allRecs.filter((r) => r.status === 'DUE').length,
          overdue: allRecs.filter((r) => r.status === 'OVERDUE').length,
          exempt: allRecs.filter((r) => r.status === 'EXEMPT').length,
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load compliance workspace records.');
    } finally {
      setLoading(false);
    }
  }, []);

  const getComplianceDetail = useCallback(async (id) => {
    try {
      const res = await api.get(`/compliance/${id}`);
      return res.data?.data || null;
    } catch (err) {
      console.error(`Failed to fetch compliance detail for ID ${id}:`, err);
      return null;
    }
  }, []);

  const evaluateRules = useCallback(async () => {
    setEvaluating(true);
    setError(null);
    try {
      const res = await api.post('/compliance/rules/evaluate', {});
      if (res.data && res.data.success) {
        await fetchRecords();
        return res.data.data;
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to execute compliance rules evaluation.');
      throw err;
    } finally {
      setEvaluating(false);
    }
  }, [fetchRecords]);

  const syncOrchestration = useCallback(async () => {
    setEvaluating(true);
    setError(null);
    try {
      const res = await api.post('/compliance/orchestrate/sync', {});
      if (res.data && res.data.success) {
        await fetchRecords();
        return res.data.data;
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to synchronize orchestration layer.');
      throw err;
    } finally {
      setEvaluating(false);
    }
  }, [fetchRecords]);

  const getExplanation = useCallback(async (authority) => {
    try {
      const res = await api.get('/compliance/rules/explain', {
        params: { authority },
      });
      return res.data?.data?.explanations || [];
    } catch (err) {
      console.error('Failed to load compliance decision explanation:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchRecords();
    }
  }, [fetchRecords]);

  return {
    records,
    pagination,
    metrics,
    loading,
    evaluating,
    error,
    fetchRecords,
    getComplianceDetail,
    evaluateRules,
    syncOrchestration,
    getExplanation,
  };
}
