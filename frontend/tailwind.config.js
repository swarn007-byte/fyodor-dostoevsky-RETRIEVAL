/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#0a0a0a",
        surface: "#111111",
        elevated: "#1a1a1a",
        panel: "#222222",
        border: "#333333",
        text: "#f5f5f5",
        "text-muted": "#a0a0a0",
        accent: "#4a9eff",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(74, 158, 255, 0.2)" },
          "50%": { boxShadow: "0 0 20px rgba(74, 158, 255, 0.45)" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
