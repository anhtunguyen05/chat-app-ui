/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",   
  ],
  theme: {
    extend: {
      colors: {
        customDark: "#28a33cff", 
      },
    },
  },
  plugins: [],
};
