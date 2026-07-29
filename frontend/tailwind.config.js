/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B6FF6',
          hover: '#2D5FD9',
          light: '#EFF3FF',
        },
        accent: '#6366F1',
        dark: {
          DEFAULT: '#101B34',
          2: '#16223f',
          3: '#0b1226',
        },
        bg: 'var(--color-bg)',
        card: 'var(--color-card)',
        sidebar: '#101B34',
        border: 'var(--color-border)',
        muted: 'var(--color-text-muted)',
        danger: 'var(--color-danger)',
        success: '#16A34A',
        warning: '#F59E0B',
        purple: '#8B5CF6',
        txt: {
          primary: 'var(--color-text-primary)',
          muted: 'var(--color-text-muted)',
        },
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        'text-danger': 'var(--color-danger)',
        'bg-card': 'var(--color-card)',
        'bg-sidebar': '#101B34',
        'primary-hover': '#2D5FD9',
        'card-hover': 'var(--color-card)',
        red: {
          DEFAULT: '#DC2626',
          light: '#FEF2F2',
          border: '#FECACA',
        },
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      fontSize: {
        h1: ['1.75rem', { lineHeight: '1.2', fontWeight: '600' }],
        h2: ['1.375rem', { lineHeight: '1.3', fontWeight: '600' }],
        h3: ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
      },
      borderRadius: {
        xl: '10px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(16,27,52,0.04), 0 8px 24px rgba(16,27,52,0.06)',
        'card-hover': '0 1px 3px rgba(16,27,52,0.06), 0 12px 32px rgba(16,27,52,0.1)',
        btn: '0 1px 2px rgba(59,111,246,0.24)',
        premium: '0 4px 24px rgba(16,27,52,0.08), 0 1px 4px rgba(16,27,52,0.04)',
        'premium-lg': '0 8px 40px rgba(16,27,52,0.12), 0 2px 8px rgba(16,27,52,0.06)',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.25s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}