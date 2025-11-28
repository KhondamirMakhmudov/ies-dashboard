import { useTheme } from "next-themes";
import { useTheme as useMuiTheme } from "@mui/material";

export default function useAppTheme() {
  const { theme, setTheme, systemTheme } = useTheme();
  const muiTheme = useMuiTheme();

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  return {
    theme: currentTheme,
    isDark,
    muiTheme,
    setTheme,
    // Helper functions for common use cases
    bg: (light, dark) => (isDark ? dark : light),
    text: (light, dark) => (isDark ? dark : light),
    border: (light, dark) => (isDark ? dark : light),
  };
}
