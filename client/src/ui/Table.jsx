/**
 * Table.jsx
 * Data table system. DESIGN_SYSTEM.md: prefer tables over cards for structured data.
 * Clear spacing, readable typography, subtle borders, sticky headers.
 */

export function Table({ children, className = '' }) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={[
          'w-full border-collapse text-[--text-sm]',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </table>
    </div>
  );
}

export function Thead({ children, sticky = false }) {
  return (
    <thead
      className={[
        'bg-[--vc-bg-subtle] border-b border-[--vc-border]',
        sticky ? 'sticky top-0 z-[--z-raised]' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </thead>
  );
}

export function Tbody({ children }) {
  return (
    <tbody className="divide-y divide-[--vc-border-subtle]">
      {children}
    </tbody>
  );
}

export function Tr({ children, className = '', onClick }) {
  return (
    <tr
      className={[
        'transition-colors duration-[--duration-fast]',
        onClick ? 'cursor-pointer hover:bg-[--vc-bg-subtle]' : 'hover:bg-[--vc-bg-subtle]/50',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function Th({ children, className = '', align = 'left', ...props }) {
  const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' }[align];
  return (
    <th
      scope="col"
      className={[
        'px-4 py-3 font-medium text-[--vc-text-secondary] tracking-[--ls-wide] uppercase text-[--text-xs]',
        alignClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </th>
  );
}

export function Td({ children, className = '', align = 'left', ...props }) {
  const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' }[align];
  return (
    <td
      className={[
        'px-4 py-3 text-[--vc-text-primary] leading-[--lh-normal]',
        alignClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </td>
  );
}
