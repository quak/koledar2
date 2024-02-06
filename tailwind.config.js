/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['sans-serif'],
      },
      colors: {
        "kred": "#952A5A",
        "kblue": "#007A91",
        
      },
    },
  },
  plugins: [],
}