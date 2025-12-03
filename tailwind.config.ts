import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#E1062C", // Crimson Neon
        background: "#0E0E11", // Carbon Black
        uiBase: "#1F1F26", // Metal Gray
        accent: "#FF2F92", // Plasma Pink
        textWhite: "#F5F7FA", // Ice White
      },
      fontFamily: {
        title: ['Space Grotesk', 'sans-serif'],
        body: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
