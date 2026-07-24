/**
 * Toast.jsx
 * Thin wrapper around react-hot-toast exposing design-system-styled helpers.
 * Actual Toaster component lives in providers/ToastProvider.jsx.
 */
import toast from 'react-hot-toast';

export const Toast = {
  success: (message) => toast.success(message),
  error:   (message) => toast.error(message),
  info:    (message) => toast(message),
  loading: (message) => toast.loading(message),
  dismiss: (id)      => toast.dismiss(id),
};
