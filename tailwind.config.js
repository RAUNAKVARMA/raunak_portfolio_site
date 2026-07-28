/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bgPrimary: 'var(--bg-primary)',
        bgSecondary: 'var(--bg-secondary)',
        bgCard: 'var(--bg-card)',
        bgElevated: 'var(--bg-elevated)',
        accentPrimary: 'var(--accent-primary)',
        accentSecondary: 'var(--accent-secondary)',
        textPrimary: 'var(--text-primary)',
        textMuted: 'var(--text-muted)',
        textSubtle: 'var(--text-subtle)',
        borderColor: 'var(--border)',
        mBlue: 'var(--m-blue)',
        'm-blue': '#1c69d4',
        mRed: 'var(--m-red)',
        'm-red': '#e22718',
      },
      fontFamily: {
        heading: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Syne', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        studio: [
          'Fragment Mono',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji',
        ],
      },
      letterSpacing: {
        cinematic: '0.22em',
        wide: '0.12em',
      },
      transitionTimingFunction: {
        neural: 'cubic-bezier(0.22, 1, 0.36, 1)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        slowSpin: 'slowSpin 20s linear infinite',
      },
      keyframes: {
        slowSpin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
