/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        },
        dark: {
          400: '#475569',
          500: '#334155',
          600: '#1e293b',
          700: '#0f172a',
          800: '#0a0f1e',
          900: '#060b14',
        },
      },
      fontFamily: {
        body: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'pulse-glow': 'pulseGlow 1.5s ease-in-out infinite',
      },
      keyframes: {
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        pulseGlow: { '0%,100%': { boxShadow: '0 0 8px rgba(14,165,233,0.4)' }, '50%': { boxShadow: '0 0 20px rgba(14,165,233,0.8)' } },
      },
    },
  },
  plugins: [],
}
