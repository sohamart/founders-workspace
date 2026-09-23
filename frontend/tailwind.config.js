/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          obsidian: '#070B14',
          navy: '#0D1527',
          surface: '#111C38',
          card: '#0F1A30',
          cardHover: '#152445',
          indigo: '#6366F1',
          indigoDark: '#4F46E5',
          royal: '#2563EB',
          cyan: '#06B6D4',
          cyanLight: '#22D3EE',
          cyanBg: '#083344',
          emerald: '#10B981',
          green: '#22C55E',
          gold: '#F59E0B',
          amber: '#F59E0B',
          red: '#EF4444',
          rose: '#F43F5E',
        }
      },
      fontFamily: {
        sans: ['"Fira Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
      },
      boxShadow: {
        'dock': '0 20px 40px -15px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(226, 232, 240, 0.9)',
        'dock-active': '0 10px 25px -5px rgba(37, 99, 235, 0.35)',
        'glass': '0 8px 32px 0 rgba(15, 23, 42, 0.05)',
        'card': '0 4px 20px -4px rgba(15, 23, 42, 0.05)',
        'card-hover': '0 10px 30px -5px rgba(15, 23, 42, 0.08)',
        'glow-primary': '0 0 20px -3px rgba(37, 99, 235, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}
