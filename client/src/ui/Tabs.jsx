/**
 * Tabs.jsx
 * Accessible tab navigation. ARIA tablist/tab/tabpanel roles.
 */
import { useState } from 'react';

/**
 * @param {Object} props
 * @param {{ id: string, label: string, content: React.ReactNode }[]} props.tabs
 * @param {string} [props.defaultTab] — id of default active tab
 */
export function Tabs({ tabs, defaultTab }) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id);

  return (
    <div>
      {/* Tab list */}
      <div
        role="tablist"
        className="flex border-b border-[--vc-border] gap-0"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-controls={`panel-${tab.id}`}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActive(tab.id)}
              onKeyDown={(e) => {
                const idx = tabs.findIndex((t) => t.id === active);
                if (e.key === 'ArrowRight') setActive(tabs[(idx + 1) % tabs.length].id);
                if (e.key === 'ArrowLeft') setActive(tabs[(idx - 1 + tabs.length) % tabs.length].id);
              }}
              className={[
                'px-4 py-2.5 text-[--text-sm] font-medium transition-colors duration-[--duration-normal]',
                'border-b-2 -mb-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--vc-brand] rounded-t-[--radius-sm]',
                isActive
                  ? 'border-[--vc-brand] text-[--vc-text-brand]'
                  : 'border-transparent text-[--vc-text-secondary] hover:text-[--vc-text-primary] hover:border-[--vc-border-strong]',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          hidden={tab.id !== active}
          className="pt-5"
        >
          {tab.id === active && tab.content}
        </div>
      ))}
    </div>
  );
}
