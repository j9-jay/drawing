export const theme = {
  colors: {
    primary: {
      main: 'rgb(94, 106, 210)',
      light: 'rgb(108, 120, 224)',
      dark: 'rgb(80, 92, 196)',
    },
    background: {
      primary: 'rgb(8, 9, 10)',
      secondary: 'rgb(20, 21, 22)',
      header: 'rgba(10, 10, 10, 0.8)',
      transparent: 'rgba(0, 0, 0, 0)',
    },
    text: {
      primary: 'rgb(247, 248, 248)',
      secondary: 'rgb(138, 143, 152)',
      tertiary: 'rgb(208, 214, 224)',
      white: 'rgb(255, 255, 255)',
    },
    border: {
      primary: 'rgba(255, 255, 255, 0.08)',
      secondary: 'rgb(30, 30, 30)',
      tertiary: 'rgb(230, 230, 230)',
    },
    neutral: {
      gray100: 'rgb(230, 230, 230)',
      gray200: 'rgb(138, 143, 152)',
      gray300: 'rgb(30, 30, 30)',
    },
  },

  typography: {
    fontFamily: {
      primary: "'Inter Variable', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    },
    fontSize: {
      xs: '13px',
      sm: '14px',
      base: '16px',
      md: '17px',
      lg: '21px',
      xl: '56px',
      '2xl': '64px',
    },
    fontWeight: {
      normal: '400',
      medium: '510',
      semibold: '538',
    },
    lineHeight: {
      tight: '24px',
      normal: '27.2px',
      relaxed: '28px',
    },
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
    '4xl': '64px',
  },

  borderRadius: {
    none: '0px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '30px',
    round: '50%',
  },

  transitions: {
    fast: 'all 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    medium: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    slow: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    button: 'color 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94), background 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },

  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
    ultraWide: '1536px',
  },
} as const;

export type Theme = typeof theme;
