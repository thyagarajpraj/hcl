/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#14213d",
        accent: "#f59e0b",
        accent2: "#ea580c",
      },
      backdropBlur: {
        sm: "4px",
        md: "12px",
      },
    },
  },
  plugins: [],
}
