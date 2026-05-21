/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        medical: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2e",
        },
      },
      boxShadow: {
        medical: "0 4px 24px -4px rgba(13, 148, 136, 0.15)",
        "medical-lg": "0 12px 40px -8px rgba(13, 148, 136, 0.2)",
        card: "0 1px 3px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.06)",
      },
      backgroundImage: {
        "mesh-medical":
          "radial-gradient(at 40% 20%, rgba(45, 212, 191, 0.12) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(14, 165, 233, 0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(13, 148, 136, 0.08) 0px, transparent 50%)",
      },
      keyframes: {
        "pulse-emergency": {
          "0%, 100%": {
            opacity: "1",
            boxShadow: "0 0 0 0 rgba(220, 38, 38, 0.5)",
          },
          "50%": {
            opacity: "0.92",
            boxShadow: "0 0 0 8px rgba(220, 38, 38, 0)",
          },
        },
        "skeleton-pulse": {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "1" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-emergency": "pulse-emergency 1.5s ease-in-out infinite",
        "skeleton-pulse": "skeleton-pulse 1.4s ease-in-out infinite",
        "fade-up": "fade-up 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};
