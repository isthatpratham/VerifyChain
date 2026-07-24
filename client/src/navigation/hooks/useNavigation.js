/**
 * useNavigation.js
 * Hook to consume NavigationContext.
 * Separated for react-refresh compliance.
 */
import { useContext } from 'react';
import { NavigationContext } from '../NavigationContext';

export function useNavigation() {
  return useContext(NavigationContext);
}
