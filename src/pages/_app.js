import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Hydrate, QueryClientProvider } from "@tanstack/react-query";
import ClientOnlyToaster from "@/components/toast";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import reactQueryClient from "@/config/react-query";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider as NextThemeProvider, useTheme } from "next-themes";
import { CacheProvider } from "@emotion/react";
import { emotionCache } from "@/config/emotion-cache";
import "@/styles/globals.css";
import "@/styles/loader.css";
import { useSettingsStore } from "@/store";

// Session error handler component
function SessionErrorHandler() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      // Token refresh failed, sign out user
      signOut({ callbackUrl: "/" });
    }
  }, [session]);

  return null;
}

// Component to sync next-themes with MUI
function MuiThemeSync({ children }) {
  const { theme: nextTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { highContrast, fontScale, fontFamily } = useSettingsStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolvedFontFamily = useMemo(() => {
    if (fontFamily === "Inter") return '"Inter", sans-serif';
    if (fontFamily === "Nunito Sans") return '"Nunito Sans", sans-serif';
    return fontFamily;
  }, [fontFamily]);

  useEffect(() => {
    if (!mounted) return;
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--app-font-family", resolvedFontFamily);
    root.style.setProperty("--app-font-scale", String(Number(fontScale || 1)));
  }, [mounted, resolvedFontFamily, fontScale]);

  const currentTheme = nextTheme === "system" ? systemTheme : nextTheme;

  const muiTheme = useMemo(() => {
    const isDark = mounted ? currentTheme === "dark" : false;
    const lightPalette = highContrast
      ? {
          primary: { main: "#000" },
          background: { default: "#fff", paper: "#fff" },
          text: { primary: "#000", secondary: "#000" },
          divider: "#000",
        }
      : {
          primary: { main: "#A877FD" },
          background: { default: "#fff", paper: "#fff" },
          text: { primary: "#000", secondary: "#666" },
        };

    const darkPalette = highContrast
      ? {
          primary: { main: "#fff" },
          background: { default: "#000", paper: "#000" },
          text: { primary: "#fff", secondary: "#fff" },
          divider: "#fff",
        }
      : {
          primary: { main: "#A877FD" },
          background: { default: "#121212", paper: "#1e1e1e" },
          text: { primary: "#fff", secondary: "#aaa" },
        };

    return createTheme({
      palette: {
        mode: isDark ? "dark" : "light",
        ...(isDark ? darkPalette : lightPalette),
      },
      typography: {
        fontFamily: resolvedFontFamily,
        fontSize: 14 * Number(fontScale || 1),
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            ":root": {
              "--app-font-family": resolvedFontFamily,
              "--app-font-scale": Number(fontScale || 1),
            },
            body: {
              backgroundColor: isDark
                ? darkPalette.background.default
                : lightPalette.background.default,
              color: isDark ? darkPalette.text.primary : lightPalette.text.primary,
              fontFamily: resolvedFontFamily,
            },
          },
        },
      },
    });
  }, [currentTheme, mounted, highContrast, fontScale, resolvedFontFamily]);

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
  pageProps: { session, emotionCache: pageEmotionCache, ...pageProps },
}) {
  const [queryClient] = useState(() => reactQueryClient);
  const cache = pageEmotionCache || emotionCache;

  return (
    <CacheProvider value={cache}>
      <SessionProvider session={session}>
        <QueryClientProvider client={queryClient}>
          <Hydrate state={pageProps?.dehydratedState}>
            <NextThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
            >
              <MuiThemeSync>
                <SessionErrorHandler />
                <Component {...pageProps} />
              </MuiThemeSync>
            </NextThemeProvider>

            <ClientOnlyToaster />
          </Hydrate>
        </QueryClientProvider>
      </SessionProvider>
    </CacheProvider>
  );
}
