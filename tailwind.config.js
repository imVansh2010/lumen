/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050B1A',
          900: '#081127',
          800: '#0C1B39',
          700: '#12264C',
          600: '#1A3563',
          500: '#24467F',
        },
        danger: {
          400: '#FF7A7A',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        glow: '#9CC8FF',
      },
      fontFamily: {
        display: ['"Baloo 2"', 'ui-rounded', '"Segoe UI"', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'ui-rounded', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-white': '0 0 18px rgba(255,255,255,0.35), 0 0 40px rgba(156,200,255,0.25)',
        'glow-red': '0 0 18px rgba(239,68,68,0.5), 0 0 44px rgba(239,68,68,0.28)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '60%': { opacity: '1', transform: 'scale(1.04)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'float-slow': {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'orb-pulse': {
          '0%,100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.06)', opacity: '1' },
        },
        shake: {
          '0%,100%': { transform: 'translate(0,0)' },
          '20%': { transform: 'translate(-4px,2px)' },
          '40%': { transform: 'translate(4px,-2px)' },
          '60%': { transform: 'translate(-3px,-2px)' },
          '80%': { transform: 'translate(3px,2px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out both',
        'pop-in': 'pop-in 0.45s cubic-bezier(0.16, 1, 0.3, 1) both',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'orb-pulse': 'orb-pulse 3.5s ease-in-out infinite',
        shake: 'shake 0.4s ease-in-out both',
      },
    },
  },
  plugins: [],
}
