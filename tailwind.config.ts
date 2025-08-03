import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        norwester: ["Norwester", "sans-serif"],
        "dm-sans": ["DM Sans", "sans-serif"],
      },
      backgroundImage: {
        "culosai-gradient":
          "linear-gradient(180deg, #2A2A2A 43.27%, #513238 77.88%)",
      },
      colors: {
        culosai: {
          gold: "rgb(240, 200, 132)",
          "form-bg": "rgb(255, 235, 182)",
          "form-text": "rgb(253, 251, 244)",
          "create-btn": "rgb(129, 53, 33)",
          "create-btn-text": "rgb(245, 237, 208)",
          "login-btn": "rgb(205, 130, 70)",
          "register-btn": "rgb(248, 240, 211)",
          "google-bg": "rgb(250, 250, 250)",
          "facebook-bg": "rgb(69, 88, 146)",
          // Tokens page colors
          "milk-text": "rgb(66, 16, 11)",
          "price-text": "rgb(248, 198, 121)",
          "token-card-from": "rgb(74, 38, 47)",
          "token-card-to": "rgb(56, 46, 48)",
          "modal-bg": "rgb(245, 237, 208)",
          "paypal-selected": "rgb(246, 202, 128)",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
