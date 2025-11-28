import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Hydrate, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import ClientOnlyToaster from "@/components/toast";
import { SessionProvider } from "next-auth/react";
import reactQueryClient from "@/config/react-query";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider as NextThemeProvider, useTheme } from "next-themes";
import "@/styles/globals.css";
import "@/styles/loader.css";

// Component to sync next-themes with MUI
function MuiThemeSync({ children }) {
  const { theme: nextTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = nextTheme === "system" ? systemTheme : nextTheme;

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: mounted ? currentTheme : "light",
          ...(currentTheme === "light"
            ? {
                // Light mode colors
                primary: { main: "#A877FD" },
                background: { default: "#fff", paper: "#fff" },
                text: { primary: "#000", secondary: "#666" },
              }
            : {
                // Dark mode colors
                primary: { main: "#A877FD" },
                background: { default: "#121212", paper: "#1e1e1e" },
                text: { primary: "#fff", secondary: "#aaa" },
              }),
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: currentTheme === "dark" ? "#121212" : "#fff",
                color: currentTheme === "dark" ? "#fff" : "#000",
              },
            },
          },
        },
      }),
    [currentTheme, mounted]
  );

  // Prevent flash during SSR
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  const [queryClient] = useState(() => reactQueryClient);

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps?.dehydratedState}>
          <NextThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
          >
            <MuiThemeSync>
              <Component {...pageProps} />
            </MuiThemeSync>
          </NextThemeProvider>
          <ReactQueryDevtools initialIsOpen={false} />
          <ClientOnlyToaster />
        </Hydrate>
      </QueryClientProvider>
    </SessionProvider>
  );
}
