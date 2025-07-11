export const baseTheme = {
  colors: {
    primary: "#949aff", // New button and accent color
    secondary: "#E6EAFE", // Soft purple (cards, containers)
    background: "#FFFFFF", // White background
    card: "#E6EAFE", // Soft purple for cards/containers
    text: "#2C3176", // Deep blue for main text
    textSecondary: "#B0B6D9", // Muted blue for secondary text
    success: "#4CAF50",
    error: "#FF3B30",
    warning: "#FFC107",
    inactive: "#B0B6D9", // Muted blue for inactive elements
    border: "#949aff", // Darker violet for borders
    shadow: "#E6EAFE", // Soft blue/gray for shadows
    buttonText: "#FFFFFF", // White text for buttons
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 5,
    md: 8,
    lg: 16,
    xl: 24,
    round: 9999,
  },
  shadows: {
    small: {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    medium: {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
  },
  fonts: {
    thin: "Inter-Thin",
    extraLight: "Inter-ExtraLight",
    light: "Inter-Light",
    regular: "Inter-Regular",
    medium: "Inter-Medium",
    semiBold: "Inter-SemiBold",
    bold: "Inter-Bold",
    extraBold: "Inter-ExtraBold",
    black: "Inter-Black",
  },
  fontWeights: {
    thin: "100",
    extraLight: "200",
    light: "300",
    regular: "400",
    medium: "500",
    semiBold: "600",
    bold: "700",
    extraBold: "800",
    black: "900",
  },
}; 