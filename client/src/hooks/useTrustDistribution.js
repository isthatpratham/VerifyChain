/**
 * useTrustDistribution.js
 * Custom hook managing Trust Distribution Identity, Dynamic QR, Assets, Share links, and Embed snippets.
 *
 * Architecture:
 * - Fetches identity + timeline (critical path) first
 * - Auto-generates/fetches Dynamic QR code on load so QR code is immediately available
 * - Provides direct blob download for PDF verification certificate
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
      const [identityRes, configRes, timelineRes] = await Promise.all([
        api.get('/trust-distribution/identity'),
        api.get('/trust-distribution/config'),
        api.get('/trust-distribution/timeline'),
      ]);

      setIdentity(identityRes.data.data);
      setConfig(configRes.data.data);
      setTimeline(timelineRes.data.data || []);

      // ── Dynamic QR Code Generation / Fetch ──
      try {
        const qrRes = await api.post('/trust-distribution/qr/generate');
        const payload = qrRes.data.data;
        setQrData({
          ...payload,
          qr_image_url: payload.qrDataUrl || payload.qr_image_url,
        });
      } catch (qrErr) {
        console.warn('[useTrustDistribution] Dynamic QR auto-fetch notice:', qrErr.message);
      }

      // ── Supplementary path: experience endpoints (graceful degradation) ──
      const [shareRes, widgetRes, badgeRes] = await Promise.allSettled([
        api.get('/trust-distribution/experience/share-link'),
        api.get('/trust-distribution/experience/widget-config'),
        api.get('/trust-distribution/experience/badge-config'),
      ]);

      if (shareRes.status === 'fulfilled') setShareConfig(shareRes.value.data.data);
      if (widgetRes.status === 'fulfilled') setWidgetConfig(widgetRes.value.data.data);
      if (badgeRes.status === 'fulfilled') setBadgeConfig(badgeRes.value.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load Trust Distribution workspace.');
    } finally {
      setLoading(false);
    }
  }, []);

  const generateQRCode = async () => {
    setActionLoading(true);
    try {
      const res = await api.post('/trust-distribution/qr/generate');
      const payload = res.data.data;
      setQrData({
        ...payload,
        qr_image_url: payload.qrDataUrl || payload.qr_image_url,
      });
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
      const payload = res.data.data;
      setQrData({
        ...payload,
        qr_image_url: payload.qrDataUrl || payload.qr_image_url,
      });
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
    } catch (err) {
      setError(err.response?.data?.error || 'Asset generation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const downloadCertificatePDF = async () => {
    setActionLoading(true);
    try {
      const response = await api.get('/trust-distribution/assets/download/certificate', {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const filename = `VerifyChain_Certificate_${identity?.public_slug || 'MSME'}.pdf`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Certificate download error:', err);
      setError('Failed to download certificate PDF.');
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
    downloadCertificatePDF,
  };
}
