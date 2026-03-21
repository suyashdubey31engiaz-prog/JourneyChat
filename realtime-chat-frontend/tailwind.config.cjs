/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        primary: "#00F5FF", // neon cyan
        secondary: "#FFEB3B", // neon gold
        dark: "#0A0A0A",
        light: "#F5F5F5",
        glass: "rgba(255,255,255,0.06)",
      },
      backgroundImage: {
        "glass-gradient":
          "linear-gradient(135deg, rgba(0,245,255,0.08), rgba(255,235,59,0.06))",
      },
      boxShadow: {
        "neon-blue": "0 6px 24px rgba(0,245,255,0.14), 0 0 30px rgba(0,245,255,0.08)",
        "neon-gold": "0 6px 24px rgba(255,235,59,0.12), 0 0 28px rgba(255,235,59,0.06)",
        glass: "0 10px 40px rgba(0,0,0,0.45)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
