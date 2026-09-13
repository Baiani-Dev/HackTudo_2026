/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#061226",
          900: "#07152f",
          800: "#0d2145",
          700: "#163460"
        },
        emeraldLocal: "#10b981",
        mintLocal: "#d8f7e7",
        yellowLocal: "#f8d66d",
        lavenderLocal: "#8b7cf6"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(16, 185, 129, 0.22)",
        laptop: "0 18px 42px rgba(0, 0, 0, 0.35)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
};
