/**
 * useCompliance.js
 * Production hook managing Compliance Workspace state, APIs, pagination, filters,
 * detailed lookup, Rules Engine evaluations, and Orchestration sync.
 */
import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

export function useCompliance() {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [metrics, setMetrics] = useState({ total: 0, compliant: 0, due: 0, overdue: 0, exempt: 0 });
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState(null);

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchRecords = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/compliance', {
        headers: getHeaders(),
        params,
      });

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
  }, [getHeaders]);

  const getComplianceDetail = useCallback(async (id) => {
    try {
      const res = await axios.get(`/api/compliance/${id}`, {
        headers: getHeaders(),
      });
      return res.data?.data || null;
    } catch (err) {
      console.error(`Failed to fetch compliance detail for ID ${id}:`, err);
      return null;
    }
  }, [getHeaders]);

  const evaluateRules = useCallback(async () => {
    setEvaluating(true);
    setError(null);
    try {
      const res = await axios.post('/api/compliance/rules/evaluate', {}, { headers: getHeaders() });
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
  }, [fetchRecords, getHeaders]);

  const syncOrchestration = useCallback(async () => {
    setEvaluating(true);
    setError(null);
    try {
      const res = await axios.post('/api/compliance/orchestrate/sync', {}, { headers: getHeaders() });
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
  }, [fetchRecords, getHeaders]);

  const getExplanation = useCallback(async (authority) => {
    try {
      const res = await axios.get('/api/compliance/rules/explain', {
        headers: getHeaders(),
        params: { authority },
      });
      return res.data?.data?.explanations || [];
    } catch (err) {
      console.error('Failed to load compliance decision explanation:', err);
      return [];
    }
  }, [getHeaders]);

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
