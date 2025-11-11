import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#C9A227", contrastText: "#111111" },
    secondary: { main: "#000000", contrastText: "#ffffff" },
    background: { default: "#ffffff", paper: "#ffffff" },
    text: { primary: "#111111", secondary: "#444444" },

    success: {
      main: "#17B26A",
      dark: "#079455",
      light: "#ABEFC6",
      contrastText: "#ffffff",
    },
    error: {
      main: "#F04438",
      dark: "#D92D20",
      light: "#FEE4E2",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#F79009",
      dark: "#DC6803",
      light: "#FEF0C7",
      contrastText: "#111111",
    },
    info: {
      main: "#2E90FA",
      dark: "#1570EF",
      light: "#D1E9FF",
      contrastText: "#ffffff",
    },
  },
  typography: {
    fontFamily: ["Inter", "system-ui", "Segoe UI", "Arial", "sans-serif"].join(
      ","
    ),
    h1: { fontWeight: 800, letterSpacing: "-0.02em" },
    h2: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiAppBar: {
      styleOverrides: { colorPrimary: { backgroundColor: "#000000" } },
    },
    MuiButton: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiContainer: { defaultProps: { maxWidth: "lg" } },

    MuiAlert: {
      defaultProps: { variant: "filled" },
      styleOverrides: {
        root: { borderRadius: 12, fontWeight: 600 },
        icon: { alignItems: "center" },
        filledSuccess: { color: "#ffffff" },
        filledError: { color: "#ffffff" },
        filledInfo: { color: "#ffffff" },
        filledWarning: { color: "#111111" },
      },
    },
    MuiSnackbarContent: {
      styleOverrides: { root: { borderRadius: 12 } },
    },
  },
});

export default theme;
