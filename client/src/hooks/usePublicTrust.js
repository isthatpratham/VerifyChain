/**
 * usePublicTrust.js
 * Custom hook fetching public supplier trust profile, metadata,
 * health summaries, and verification timeline for unauthenticated visitors.
 */
import { useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import axios from 'axios';

export function usePublicTrust(slug) {
  const [profile, setProfile] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPublicTrust = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      let res;
      try {
        res = await api.get(`/supplier-trust/public/${slug}`);
      } catch (primaryErr) {
        if (primaryErr.response && primaryErr.response.status === 404) {
          throw primaryErr;
        }
        res = await axios.get(`http://localhost:5000/api/supplier-trust/public/${slug}`);
      }

      if (res.data && res.data.data) {
        setProfile(res.data.data);
        if (res.data.data.trust_metadata) setMetadata(res.data.data.trust_metadata);
        if (res.data.data.timeline_events) setTimeline(res.data.data.timeline_events);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Supplier Trust Profile not found or private.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPublicTrust();
  }, [fetchPublicTrust]);

  return {
    profile,
    metadata,
    timeline,
    loading,
    error,
    refetch: fetchPublicTrust,
  };
}
