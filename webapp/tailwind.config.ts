import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,ts,scss}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        black: {
          950: '#000000',
          900: '#121212',
          800: '#1E1E1E',
          700: '#2C2C2C',
          600: '#3D3D3D',
          500: '#505050',
          400: '#6B6B6B',
          300: '#9B9B9B',
          200: '#C6C6C6',
          100: '#E1E1E1',
          50: '#F5F5F5',
        },
        gray: {
          950: '#0E1111',
          900: '#1A1D1E',
          800: '#2A2D2E',
          700: '#3C4042',
          600: '#54585A',
          500: '#73777A',
          400: '#A0A4A8',
          300: '#C7CACD',
          200: '#E1E3E5',
          100: '#F0F2F3',
          50: '#F9FAFA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': 'var(--text-xs)',
        'sm': 'var(--text-sm)',
        'md': 'var(--text-md)',
        'xl': 'var(--text-xl)',
        '2xl': 'var(--text-xxl)',
      },
      keyframes: {
        fadeIn: {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        fadeOut: {
          '0%': {
            opacity: '1',
          },
          '100%': {
            opacity: '0',
          },
        },
        slideInUp: {
          '0%': {
            transform: 'translateY(20px)',
          },
          '100%': {
            transform: 'translateY(0)',
          },
        },
        slideOutDown: {
          '0%': {
            transform: 'translateY(0)',
          },
          '100%': {
            transform: 'translateY(20px)',
          },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.3s ease-in forwards',
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'slide-out-down': 'slideOutDown 0.3s ease-in forwards',
      },
      gridTemplateColumns: {
        'auto-max': 'auto max-content',
        'max-auto': 'max-content auto',
        'max-max-auto': 'max-content max-content auto',
      },
      gridTemplateRows: {
        'max-auto': 'max-content auto', 
        'auto-max': 'auto max-content', 
        'max-auto-auto': 'max-content auto auto', 
        'max-auto-max': 'max-content auto max-content',
        'max-max-auto': 'max-content max-content auto',
      },
    },
  },
  plugins: [],
} satisfies Config;
