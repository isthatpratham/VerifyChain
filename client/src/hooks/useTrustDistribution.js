/**
 * useTrustDistribution.js
 * Custom hook managing Trust Distribution Identity, Dynamic QR, Assets, Share links, and Embed snippets.
 *
 * Architecture:
 * - Fetches identity + timeline (critical path) first
 * - Supplementary data (share, widget, badge) is fetched independently and degrades gracefully
 * - A single sub-request failure no longer kills the entire workspace
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useTrustDistribution() {
  const [identity, setIdentity] = useState(null);
  const [config, setConfig] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [qrData, setQrData] = useState(null);
  const [assets, setAssets] = useState(null);
  const [shareConfig, setShareConfig] = useState(null);
  const [widgetConfig, setWidgetConfig] = useState(null);
  const [badgeConfig, setBadgeConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDistributionData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ── Critical path: identity + config + timeline ──
      // These three must succeed for the workspace to be usable.
      const [identityRes, configRes, timelineRes] = await Promise.all([
        api.get('/trust-distribution/identity'),
        api.get('/trust-distribution/config'),
        api.get('/trust-distribution/timeline'),
      ]);

      setIdentity(identityRes.data.data);
      setConfig(configRes.data.data);
      setTimeline(timelineRes.data.data || []);

      // ── Supplementary path: experience endpoints (graceful degradation) ──
      // Failures here must NOT prevent the workspace from rendering.
      const [shareRes, widgetRes, badgeRes] = await Promise.allSettled([
        api.get('/trust-distribution/experience/share-link'),
        api.get('/trust-distribution/experience/widget-config'),
        api.get('/trust-distribution/experience/badge-config'),
      ]);

      if (shareRes.status === 'fulfilled') setShareConfig(shareRes.value.data.data);
      if (widgetRes.status === 'fulfilled') setWidgetConfig(widgetRes.value.data.data);
      if (badgeRes.status === 'fulfilled') setBadgeConfig(badgeRes.value.data.data);
    } catch (err) {
      // Only set error if the critical path failed
      setError(err.response?.data?.error || 'Failed to load Trust Distribution workspace.');
    } finally {
      setLoading(false);
    }
  }, []);

  const generateQRCode = async () => {
    setActionLoading(true);
    try {
      const res = await api.post('/trust-distribution/qr/generate');
      setQrData(res.data.data);
      await fetchDistributionData();
    } catch (err) {
      setError(err.response?.data?.error || 'QR generation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const regenerateQRCode = async () => {
    setActionLoading(true);
    try {
      const res = await api.post('/trust-distribution/qr/regenerate');
      setQrData(res.data.data);
      await fetchDistributionData();
    } catch (err) {
      setError(err.response?.data?.error || 'QR regeneration failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const generateAssets = async () => {
    setActionLoading(true);
    try {
      const res = await api.post('/trust-distribution/assets/generate');
      setAssets(res.data.data.assets);
      await fetchDistributionData();
    } catch (err) {
      setError(err.response?.data?.error || 'Asset generation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchDistributionData();
  }, [fetchDistributionData]);

  return {
    identity,
    config,
    timeline,
    qrData,
    assets,
    shareConfig,
    widgetConfig,
    badgeConfig,
    loading,
    error,
    actionLoading,
    refetch: fetchDistributionData,
    generateQRCode,
    regenerateQRCode,
    generateAssets,
  };
}
