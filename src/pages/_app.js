import * as React from "react";
import { useState } from "react";
import { Hydrate, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import ClientOnlyToaster from "@/components/toast";
import { SessionProvider } from "next-auth/react";
import reactQueryClient from "@/config/react-query";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "@/styles/globals.css";
import "@/styles/loader.css";
import theme from "@/components/theme/theme";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  const [queryClient] = useState(() => reactQueryClient);
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps?.dehydratedState}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Component {...pageProps} />

          </ThemeProvider>
          <ReactQueryDevtools initialIsOpen={false} />
          <ClientOnlyToaster />
        </Hydrate>
      </QueryClientProvider>
    </SessionProvider>
  );
}
