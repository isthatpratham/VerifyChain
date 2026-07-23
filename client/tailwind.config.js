/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    // Override defaults entirely for semantic clarity
    screens: {
      sm:  '640px',
      md:  '768px',
      lg:  '1024px',
      xl:  '1280px',
      '2xl': '1536px',
    },

    extend: {
      // ─── FONTS ───────────────────────────────────────────────────────────
      fontFamily: {
        // Headings: Plus Jakarta Sans (DESIGN_SYSTEM.md)
        heading: ['var(--font-heading)'],
        // Body: IBM Plex Sans as General Sans licensed substitute
        body:    ['var(--font-body)'],
        sans:    ['var(--font-body)'],
        mono:    ['var(--font-mono)'],
      },

      // ─── COLORS ──────────────────────────────────────────────────────────
      colors: {
        // Prussian Blue scale
        prussian: {
          50:  'var(--color-prussian-50)',
          100: 'var(--color-prussian-100)',
          200: 'var(--color-prussian-200)',
          300: 'var(--color-prussian-300)',
          400: 'var(--color-prussian-400)',
          500: 'var(--color-prussian-500)',
          600: 'var(--color-prussian-600)',
          700: 'var(--color-prussian-700)',
          800: 'var(--color-prussian-800)',
          900: 'var(--color-prussian-900)',
          DEFAULT: 'var(--color-prussian-500)',
        },
        // Semantic aliases used across components
        'vc-brand':         'var(--vc-brand)',
        'vc-brand-hover':   'var(--vc-brand-hover)',
        'vc-success':       'var(--vc-success)',
        'vc-warning':       'var(--vc-warning)',
        'vc-error':         'var(--vc-error)',
        'vc-info':          'var(--vc-info)',
        // Trust score tier colors (kept for backward compat)
        high:   { DEFAULT: 'var(--vc-success)',  bg: 'var(--vc-success-bg)' },
        medium: { DEFAULT: 'var(--vc-warning)',  bg: 'var(--vc-warning-bg)' },
        low:    { DEFAULT: 'var(--vc-error)',     bg: 'var(--vc-error-bg)'   },
      },

      // ─── SPACING ─────────────────────────────────────────────────────────
      // Tailwind's default spacing scale is sufficient; we map section padding
      spacing: {
        'section':    'var(--section-py)',
        'section-sm': 'var(--section-py-sm)',
        'section-lg': 'var(--section-py-lg)',
      },

      // ─── BORDER RADIUS ───────────────────────────────────────────────────
      // Maximum 4px per DESIGN_SYSTEM.md
      borderRadius: {
        none:    'var(--radius-none)',
        sm:      'var(--radius-sm)',    /* 2px preferred */
        DEFAULT: 'var(--radius-md)',    /* 4px maximum   */
        md:      'var(--radius-md)',
        pill:    'var(--radius-pill)',
        // Remove large Tailwind defaults
        lg:      'var(--radius-md)',
        xl:      'var(--radius-md)',
        '2xl':   'var(--radius-md)',
        full:    'var(--radius-pill)',
      },

      // ─── BOX SHADOWS ─────────────────────────────────────────────────────
      // Minimal — depth via spacing, layering, contrast (DESIGN_SYSTEM.md)
      boxShadow: {
        none:   'var(--shadow-none)',
        xs:     'var(--shadow-xs)',
        sm:     'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-sm)',
        md:     'var(--shadow-md)',
        card:   'var(--shadow-card)',
        // Wipe out large Tailwind defaults
        lg:     'var(--shadow-md)',
        xl:     'var(--shadow-md)',
        '2xl':  'var(--shadow-md)',
        inner:  'inset 0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },

      // ─── Z-INDEX ─────────────────────────────────────────────────────────
      zIndex: {
        base:     'var(--z-base)',
        raised:   'var(--z-raised)',
        dropdown: 'var(--z-dropdown)',
        sticky:   'var(--z-sticky)',
        overlay:  'var(--z-overlay)',
        modal:    'var(--z-modal)',
        toast:    'var(--z-toast)',
        tooltip:  'var(--z-tooltip)',
      },

      // ─── MAX WIDTHS ──────────────────────────────────────────────────────
      maxWidth: {
        'container-xs':  'var(--container-xs)',
        'container-sm':  'var(--container-sm)',
        'container-md':  'var(--container-md)',
        'container-lg':  'var(--container-lg)',
        'container-xl':  'var(--container-xl)',
        'container-2xl': 'var(--container-2xl)',
      },

      // ─── TYPOGRAPHY ──────────────────────────────────────────────────────
      fontSize: {
        xs:      ['var(--text-xs)',   { lineHeight: 'var(--lh-normal)' }],
        sm:      ['var(--text-sm)',   { lineHeight: 'var(--lh-normal)' }],
        base:    ['var(--text-base)', { lineHeight: 'var(--lh-normal)' }],
        md:      ['var(--text-md)',   { lineHeight: 'var(--lh-normal)' }],
        lg:      ['var(--text-lg)',   { lineHeight: 'var(--lh-snug)'   }],
        xl:      ['var(--text-xl)',   { lineHeight: 'var(--lh-snug)'   }],
        '2xl':   ['var(--text-2xl)', { lineHeight: 'var(--lh-tight)'  }],
        '3xl':   ['var(--text-3xl)', { lineHeight: 'var(--lh-tight)'  }],
        '4xl':   ['var(--text-4xl)', { lineHeight: 'var(--lh-tight)'  }],
        '5xl':   ['var(--text-5xl)', { lineHeight: 'var(--lh-tight)'  }],
        display: ['var(--text-display)', { lineHeight: 'var(--lh-tight)', letterSpacing: 'var(--ls-tight)' }],
      },

      letterSpacing: {
        tight:   'var(--ls-tight)',
        snug:    'var(--ls-snug)',
        normal:  'var(--ls-normal)',
        wide:    'var(--ls-wide)',
        wider:   'var(--ls-wider)',
        caps:    'var(--ls-caps)',
      },

      lineHeight: {
        tight:   'var(--lh-tight)',
        snug:    'var(--lh-snug)',
        normal:  'var(--lh-normal)',
        relaxed: 'var(--lh-relaxed)',
        loose:   'var(--lh-loose)',
      },

      // ─── TRANSITIONS ─────────────────────────────────────────────────────
      transitionDuration: {
        instant:    'var(--duration-instant)',
        fast:       'var(--duration-fast)',
        normal:     'var(--duration-normal)',
        slow:       'var(--duration-slow)',
        deliberate: 'var(--duration-deliberate)',
        reveal:     'var(--duration-reveal)',
        page:       'var(--duration-page)',
      },

      transitionTimingFunction: {
        'ease-out':    'var(--ease-out)',
        'ease-in':     'var(--ease-in)',
        'ease-in-out': 'var(--ease-in-out)',
        'spring':      'var(--ease-spring)',
        'reveal':      'var(--ease-reveal)',
      },
    },
  },
  plugins: [],
};

