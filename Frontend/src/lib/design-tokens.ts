// VHQ Design System - Centralized Design Tokens
// Based on logo red #ca2026 and dark theme

export const designTokens = {
  // Brand Colors - Primary is logo red
  colors: {
    brand: {
      red: "#ca2026",        // Logo red (primary)
      redDark: "#a01a1f",    // Darker red for hover states
      redLight: "#dc2626",   // Lighter red for accents
    },
    
    // Semantic color mappings using CSS variables
    primary: "hsl(var(--primary))",
    primaryForeground: "hsl(var(--primary-foreground))",
    secondary: "hsl(var(--secondary))",
    secondaryForeground: "hsl(var(--secondary-foreground))",
    background: "hsl(var(--background))",
    foreground: "hsl(var(--foreground))",
    card: "hsl(var(--card))",
    cardForeground: "hsl(var(--card-foreground))",
    muted: "hsl(var(--muted))",
    mutedForeground: "hsl(var(--muted-foreground))",
    accent: "hsl(var(--accent))",
    accentForeground: "hsl(var(--accent-foreground))",
    border: "hsl(var(--border))",
    input: "hsl(var(--input))",
    ring: "hsl(var(--ring))",
  },

  // Background gradients for cards and components
  gradients: {
    card: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)",
    cardHover: "linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--muted)) 100%)",
    dashboard: "linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--card)) 100%)",
    primary: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 100%)",
    primarySubtle: "linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, hsl(var(--primary) / 0.05) 100%)",
  },

  // Border radius - Sharp edges per design requirement
  borderRadius: {
    none: "0",
    sm: "0",
    md: "0", 
    lg: "0",
    full: "9999px", // Keep for circular elements like avatars
  },

  // Spacing scale
  spacing: {
    xs: "0.25rem",   // 4px
    sm: "0.5rem",    // 8px
    md: "1rem",      // 16px
    lg: "1.5rem",    // 24px
    xl: "2rem",      // 32px
    "2xl": "3rem",   // 48px
    "3xl": "4rem",   // 64px
  },

  // Typography
  typography: {
    fontFamily: {
      sans: "var(--font-sans)",
      mono: "var(--font-mono)",
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem", 
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
    },
  },

  // Shadows
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },

  // Animation
  animation: {
    duration: {
      fast: "150ms",
      normal: "200ms",
      slow: "300ms",
    },
    easing: {
      default: "cubic-bezier(0.4, 0, 0.2, 1)",
      out: "cubic-bezier(0, 0, 0.2, 1)",
      in: "cubic-bezier(0.4, 0, 1, 1)",
    },
  },
} as const;

// Utility functions for consistent styling
export const getCardGradient = () => designTokens.gradients.card;
export const getCardHoverGradient = () => designTokens.gradients.cardHover;
export const getPrimaryGradient = () => designTokens.gradients.primary;

// Common component styles
export const componentStyles = {
  card: {
    base: `bg-gradient-to-br from-card to-muted border border-border text-card-foreground shadow-md`,
    hover: `hover:bg-gradient-to-br hover:from-accent hover:to-muted transition-all duration-200`,
    interactive: `cursor-pointer hover:shadow-lg`,
  },
  
  button: {
    primary: `bg-primary text-primary-foreground hover:bg-primary/90`,
    secondary: `bg-secondary text-secondary-foreground hover:bg-secondary/80`,
    outline: `border border-border bg-background hover:bg-accent hover:text-accent-foreground`,
    ghost: `hover:bg-accent hover:text-accent-foreground`,
  },

  input: {
    base: `border border-input bg-background text-foreground placeholder:text-muted-foreground`,
    focus: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`,
  },

  text: {
    primary: `text-foreground`,
    secondary: `text-muted-foreground`, 
    accent: `text-primary`,
    muted: `text-muted-foreground`,
  },
} as const;

export type DesignTokens = typeof designTokens;
export type ComponentStyles = typeof componentStyles; 