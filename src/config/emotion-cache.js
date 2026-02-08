import createCache from "@emotion/cache";

export const emotionCache = createCache({
  key: "css",
  insertionPoint: typeof document !== "undefined"
    ? document.querySelector('meta[name="emotion-insertion-point"]')
    : undefined,
});
