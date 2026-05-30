/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#7F77DD',
        'primary-dark': '#534AB7',
      }
    }
  },
  plugins: []
}