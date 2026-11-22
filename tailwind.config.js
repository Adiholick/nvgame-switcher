/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nv: {
          bg: "#1C1C1E",
          card: "#252525",
          subcard: "#191919",
          input: "#0D0D0D",
          border: "#3F3F3F",
          accent: "#00AAFF",
          accentHover: "#00C3FF",
          cyan: "#00FFFF",
          textMuted: "#8E8E93",
          danger: "#FF453A",
          success: "#30D158",
        }
      },
      fontFamily: {
        sans: ["'Segoe UI Variable'", "Segoe UI", "-apple-system", "BlinkMacSystemFont", "Roboto", "sans-serif"],
      }
    },
  },
  plugins: [],
}
