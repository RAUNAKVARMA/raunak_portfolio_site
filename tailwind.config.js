/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bgPrimary: 'var(--bg-primary)',
        bgSecondary: 'var(--bg-secondary)',
        bgCard: 'var(--bg-card)',
        accentPrimary: 'var(--accent-primary)',
        accentSecondary: 'var(--accent-secondary)',
        textPrimary: 'var(--text-primary)',
        textMuted: 'var(--text-muted)',
        borderColor: 'var(--border)',
      },
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        cyan: '0 0 30px rgba(0, 212, 255, 0.22)',
        card: '0 12px 38px rgba(0, 0, 0, 0.35)',
      },
      backgroundImage: {
        hero: 'var(--gradient-hero)',
      },
      transitionTimingFunction: {
        neural: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      animation: {
        glowPulse: 'glowPulse 2.2s ease-in-out infinite',
        slowSpin: 'slowSpin 20s linear infinite',
        reverseSpin: 'reverseSpin 14s linear infinite',
        floatY: 'floatY 4s ease-in-out infinite',
        meshShift: 'meshShift 18s ease-in-out infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: '0.65', transform: 'scale(0.95)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
        },
        slowSpin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        reverseSpin: {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        meshShift: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1) translate(0, 0)' },
          '50%': { opacity: '0.85', transform: 'scale(1.05) translate(2%, -1%)' },
        },
      },
    },
  },
  plugins: [],
}

