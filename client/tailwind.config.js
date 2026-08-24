/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0B1020',
          card: '#111827',
          cardHover: '#1F2937',
          primary: '#00E5A8',
          secondary: '#4F8CFF',
          danger: '#FF4D6D',
          warning: '#F59E0B',
          muted: '#9CA3AF',
          darkBorder: '#1F293D'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace']
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'scan-line': 'scanLine 3s linear infinite',
        'float': 'float 4s ease-in-out infinite'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(0, 229, 168, 0.25)' },
          '50%': { boxShadow: '0 0 35px rgba(0, 229, 168, 0.55)' }
        },
        scanLine: {
          '0%': { top: '0%' },
          '100%': { top: '100%' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    },
  },
  plugins: [],
}
