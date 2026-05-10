/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Be Vietnam Pro', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      colors: {
        forest: {
          50:  '#f0f7f0',
          100: '#d8edd8',
          200: '#b3dbb3',
          300: '#7fc27f',
          400: '#4fa34f',
          500: '#2d8a2d',
          600: '#1e6e1e',
          700: '#175517',
          800: '#124012',
          900: '#0a280a',
        },
        earth: {
          50:  '#faf7f2',
          100: '#f0e9db',
          200: '#e0d0b6',
          300: '#ccb088',
          400: '#b88f5c',
          500: '#a47340',
          600: '#8a5e32',
          700: '#6e4a27',
          800: '#52371d',
          900: '#362312',
        }
      }
    },
  },
  plugins: [],
}
