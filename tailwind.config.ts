/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",   // 👈 Quan trọng: quét folder src
  ],
  theme: {
    extend: {
      colors: {
        customDark: "#28a33cff",      // 💡 custom màu mới
      },
    },
  },
  plugins: [],
};
