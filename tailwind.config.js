/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      colors: {
        brand: {
          50:  "#F0F9FF",
          100: "#E0F2FE",
          200: "#BAE6FD",
          300: "#7DD3FC",
          400: "#38BDF8",
          500: "#0EA5E9",
          600: "#0284C7",
          700: "#0369A1",
          800: "#075985",
          900: "#0C4A6E"
        },
        surface: {
          light: "#F8FAFC",
          dark: "#0B1220",
          card: "#111827"
        }
      },
      boxShadow: {
        soft: "0 4px 20px -4px rgba(15, 23, 42, 0.15)"
      }
    }
  },
  plugins: []
};
