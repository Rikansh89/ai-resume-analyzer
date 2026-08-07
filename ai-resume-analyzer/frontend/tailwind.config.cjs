/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#E0E5EC',
          soft: '#E8EDF4',
          deep: '#D3D9E2',
        },
        accent: {
          DEFAULT: '#6C63FF',
          light: '#8B84FF',
          dark: '#5A52E0',
        },
        ink: {
          DEFAULT: '#3D4852',
          muted: '#6B7280',
          faint: '#8A94A6',
        },
        placeholder: '#A0AEC0',
        ok: {
          DEFAULT: '#38B2AC',
          soft: '#4FD1C5',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        night: {
          950: '#04060c',
          900: '#070b15',
          850: '#0a1020',
          800: '#0d1526',
          700: '#131d33',
          600: '#1b2845',
        },
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
      },
      borderRadius: {
        card: '2rem',
        btn: '1rem',
      },
      boxShadow: {
        extruded: '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255,0.5)',
        'extruded-hover': '12px 12px 20px rgb(163,177,198,0.7), -12px -12px 20px rgba(255,255,255,0.6)',
        'extruded-sm': '5px 5px 10px rgb(163,177,198,0.6), -5px -5px 10px rgba(255,255,255,0.5)',
        inset: 'inset 6px 6px 10px rgb(163,177,198,0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
        'inset-deep': 'inset 10px 10px 20px rgb(163,177,198,0.7), inset -10px -10px 20px rgba(255,255,255,0.6)',
        'inset-sm': 'inset 3px 3px 6px rgb(163,177,198,0.6), inset -3px -3px 6px rgba(255,255,255,0.5)',
        'btn-pressed': 'inset 3px 3px 8px rgba(90,80,190,0.45), inset -3px -3px 8px rgba(255,255,255,0.4)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #6C63FF 0%, #8B84FF 100%)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(24px, -24px)' },
        },
        float2: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-30px, 18px) scale(1.08)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      },
      animation: {
        rise: 'rise 0.5s ease-out both',
        pop: 'pop 0.25s ease-out both',
        float: 'float 14s ease-in-out infinite',
        float2: 'float2 18s ease-in-out infinite',
        shimmer: 'shimmer 6s linear infinite',
      },
    },
  },
  plugins: [],
};
