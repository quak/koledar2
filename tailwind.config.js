/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: ["./*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['sans-serif'],
      },
      colors: {
        "kred": "#952A5A",
        "kblue": "#007A91",
        "kgrey": "#bababa",
        
      },
    },
  },
  plugins: [],
}