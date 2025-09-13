/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  prefix: 'gas-',
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: ['class'],
  safelist: ['dark'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    fontFamily: {
      display: 'DM Sans, sans-serif',
    },
    extend: {
      spacing: {
        88: '22rem',
        120: '30rem',
      },
      borderRadius: {
        lg: 'var(--gas-radius)',
        md: 'calc(var(--gas-radius) - 2px)',
        sm: 'calc(var(--gas-radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--gas-background))',
        foreground: 'hsl(var(--gas-foreground))',
        card: {
          DEFAULT: 'hsl(var(--gas-card))',
          foreground: 'hsl(var(--gas-card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--gas-popover))',
          foreground: 'hsl(var(--gas-popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--gas-primary))',
          foreground: 'hsl(var(--gas-primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--gas-secondary))',
          foreground: 'hsl(var(--gas-secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--gas-muted))',
          foreground: 'hsl(var(--gas-muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--gas-accent))',
          foreground: 'hsl(var(--gas-accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--gas-destructive))',
          foreground: 'hsl(var(--gas-destructive-foreground))',
        },
        border: 'hsl(var(--gas-border))',
        input: 'hsl(var(--gas-input))',
        ring: 'hsl(var(--gas-ring))',
        chart: {
          1: 'hsl(var(--gas-chart-1))',
          2: 'hsl(var(--gas-chart-2))',
          3: 'hsl(var(--gas-chart-3))',
          4: 'hsl(var(--gas-chart-4))',
          5: 'hsl(var(--gas-chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--gas-sidebar-background))',
          foreground: 'hsl(var(--gas-sidebar-foreground))',
          primary: 'hsl(var(--gas-sidebar-primary))',
          'primary-foreground': 'hsl(var(--gas-sidebar-primary-foreground))',
          accent: 'hsl(var(--gas-sidebar-accent))',
          'accent-foreground': 'hsl(var(--gas-sidebar-accent-foreground))',
          border: 'hsl(var(--gas-sidebar-border))',
          ring: 'hsl(var(--gas-sidebar-ring))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [tailwindcssAnimate, require('tailwindcss-animate'), require('@tailwindcss/typography')],
};
