import { useState, useEffect } from 'react';
import { getMsmeProfile, createMsmeProfile, updateMsmeProfile } from '../services/api';
import { useAuth } from './useAuth';

export function useMsmeProfile() {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMsmeProfile();
      setProfile(data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setProfile(null);
      } else {
        setError(err.response?.data?.error || 'Failed to fetch business profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const createProfile = async (profileData) => {
    setError(null);
    try {
      const response = await createMsmeProfile(profileData);
      await refreshUser();
      await fetchProfile();
      return response;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to create business profile.';
      setError(message);
      throw err;
    }
  };

  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const updatedData = await updateMsmeProfile(profileData);
      setProfile(updatedData);
      await refreshUser();
      return updatedData;
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to update business profile.';
      setError(message);
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    createProfile,
    updateProfile,
  };
}
