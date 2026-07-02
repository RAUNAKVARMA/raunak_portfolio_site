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
        heading: ['Space Grotesk', 'Inter', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        cyan: '0 0 30px rgba(99, 102, 241, 0.22)',
        card: '0 12px 38px rgba(0, 0, 0, 0.35)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        glassHover: '0 16px 48px rgba(99, 102, 241, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
      backgroundImage: {
        hero: 'var(--gradient-hero)',
        ambient: 'var(--gradient-ambient)',
      },
      transitionTimingFunction: {
        neural: 'cubic-bezier(0.22, 1, 0.36, 1)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        glowPulse: 'glowPulse 2.2s ease-in-out infinite',
        slowSpin: 'slowSpin 20s linear infinite',
        floatY: 'floatY 4s ease-in-out infinite',
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
        floatY: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
