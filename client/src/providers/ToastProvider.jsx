/**
 * ToastProvider.jsx
 * Configures react-hot-toast Toaster with VerifyChain design system styles.
 * DESIGN_SYSTEM.md: minimal, no rounded cards, subtle borders.
 */
import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--vc-text-primary)',
          background: 'var(--vc-surface-overlay)',
          border: '1px solid var(--vc-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          padding: '10px 14px',
          maxWidth: '360px',
          lineHeight: 'var(--lh-normal)',
        },
        success: {
          iconTheme: {
            primary: 'var(--vc-success)',
            secondary: 'var(--vc-surface-overlay)',
          },
        },
        error: {
          iconTheme: {
            primary: 'var(--vc-error)',
            secondary: 'var(--vc-surface-overlay)',
          },
        },
        loading: {
          iconTheme: {
            primary: 'var(--vc-brand)',
            secondary: 'var(--vc-surface-overlay)',
          },
        },
      }}
    />
  );
}
