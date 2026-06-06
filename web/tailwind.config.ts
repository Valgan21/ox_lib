import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        bg: 'var(--rs-bg)',
        'surface-01': 'var(--rs-surface-01)',
        'surface-02': 'var(--rs-surface-02)',
        'surface-03': 'var(--rs-surface-03)',
        panel: 'var(--rs-panel)',
        'panel-hi': 'var(--rs-panel-hi)',
        fg: 'var(--rs-fg)',
        'fg-soft': 'var(--rs-fg-soft)',
        'fg-mute': 'var(--rs-fg-mute)',
        sep: 'var(--rs-sep)',
        accent: 'rgb(245 165 36 / <alpha-value>)',
        'accent-hi': 'rgb(255 193 83 / <alpha-value>)',
        'accent-soft': 'var(--rs-accent-soft)',
        danger: 'rgb(255 69 58 / <alpha-value>)',
        success: 'rgb(52 199 123 / <alpha-value>)',
        info: 'rgb(71 159 250 / <alpha-value>)',
      },
      borderRadius: {
        sm: 'var(--rs-radius-sm)',
        md: 'var(--rs-radius-md)',
        lg: 'var(--rs-radius-lg)',
        xl: 'var(--rs-radius-xl)',
        pill: 'var(--rs-radius-pill)',
        icon: 'var(--rs-radius-icon)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
        mono: 'var(--font-mono)',
      },
      transitionTimingFunction: {
        out: 'var(--ease-out)',
      },
    },
  },
  plugins: [],
} satisfies Config
