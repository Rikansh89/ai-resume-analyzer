/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fef6ee',
          100: '#fdebd7',
          200: '#fad3ab',
          300: '#f7b37a',
          400: '#f38b47',
          500: '#eF6B20',
          600: '#e05a15',
          700: '#ba4414',
          800: '#933719',
          900: '#772f17',
        },
        sage: {
          50: '#f5f7f2',
          100: '#e6ebe0',
          200: '#cdd8c2',
          300: '#aabe99',
          400: '#85a170',
          500: '#678554',
          600: '#506b41',
          700: '#3f5535',
          800: '#35452d',
          900: '#2e3a28',
        },
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-2deg)' },
          '75%': { transform: 'rotate(2deg)' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        wiggle: 'wiggle 3s ease-in-out infinite',
        rise: 'rise 0.4s ease-out',
        pop: 'pop 0.25s ease-out',
      },
    },
  },
  plugins: [],
};
