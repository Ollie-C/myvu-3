/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8f8f8',
          100: '#e5e5e5',
          200: '#cccccc',
          300: '#b3b3b3',
          400: '#999999',
          500: '#808080',
          600: '#666666',
          700: '#525252',
          800: '#424343',
          900: '#333333',
          950: '#161616',
        },
        background: {
          primary: '#161616',
          secondary: '#424343',
          tertiary: '#525252',
          quaternary: '#333333',
        },
        surface: {
          primary: '#424343',
          secondary: '#525252',
          tertiary: '#333333',
        },
        text: {
          primary: '#ffffff',
          secondary: '#e5e5e5',
          tertiary: '#cccccc',
          muted: '#999999',
        },
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
      },
    },
  },
  plugins: [],
};
