/**
 * PageTransition.jsx
 * Reusable Page Transition component for route transitions.
 * Applies GPU-accelerated fade + slide-in using vc-page-enter and vc-page-enter-active.
 * Respects prefers-reduced-motion.
 */
import { useLocation } from 'react-router-dom';
import { usePageTransition } from './usePageTransition';

/**
 * @param {Object} props
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export function PageTransition({ className = '', children }) {
  const location = useLocation();
  const entered = usePageTransition(16);

  return (
    <div
      key={location.pathname}
      className={[
        'vc-page-enter',
        entered ? 'vc-page-enter-active' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
