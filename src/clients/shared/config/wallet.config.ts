import { ThemeVars } from "@mysten/dapp-kit";

export const WALLET_PROVIDER_DARK_THEME: ThemeVars = {
  blurs: {
    modalOverlay: "blur(10px)",
  },
  backgroundColors: {
    primaryButton: "#1a1a1a",
    primaryButtonHover: "#2a2a2a",
    outlineButtonHover: "#1f1f1f",
    modalOverlay: "rgba(0, 0, 0, 0.7)",
    modalPrimary: "#0D1117",
    modalSecondary: "#161b22",
    iconButton: "transparent",
    iconButtonHover: "#1f1f1f",
    dropdownMenu: "#161b22",
    dropdownMenuSeparator: "#21262d",
    walletItemSelected: "#1f1f1f",
    walletItemHover: "rgba(255, 255, 255, 0.05)",
  },
  borderColors: {
    outlineButton: "rgba(255, 255, 255, 0.1)",
  },
  colors: {
    primaryButton: "#ffffff",
    outlineButton: "#ffffff",
    iconButton: "#ffffff",
    body: "#e6edf3",
    bodyMuted: "#8b949e",
    bodyDanger: "#ff6b6b",
  },
  radii: {
    small: "0.375rem",
    medium: "0.5rem",
    large: "0.75rem",
    xlarge: "1rem",
  },
  shadows: {
    primaryButton: "0 0.25rem 0.75rem rgba(0, 0, 0, 0.3)",
    walletItemSelected: "0 0.125rem 0.375rem rgba(0, 0, 0, 0.2)",
  },
  fontWeights: {
    normal: "400",
    medium: "500",
    bold: "600",
  },
  fontSizes: {
    small: "0.75rem",
    medium: "0.875rem",
    large: "1rem",
    xlarge: "1.125rem",
  },
  typography: {
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    fontStyle: "normal",
    lineHeight: "1.3",
    letterSpacing: "1",
  },
};
