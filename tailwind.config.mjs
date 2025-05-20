/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },

      container: {
        center: true,
        padding: {
          DEFAULT: "10px", // Mobil ekranlar uchun kichik padding
          sm: "15px", // Kichik ekranlar (640px) uchun
          md: "20px", // O'rta ekranlar (768px) uchun
          lg: "25px", // Katta ekranlar (1024px) uchun
          xl: "30px", // Juda katta ekranlar (1280px) uchun
          "2xl": "40px", // Eng katta ekranlar (1440px+) uchun
        },
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1440px",
      },
    },
  },
  plugins: [],
};
