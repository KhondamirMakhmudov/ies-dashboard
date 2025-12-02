// utils/api.js
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export class ApiClient {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL;
  }

  async request(url, options = {}) {
    const session = await this.getSession();
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (session?.accessToken) {
      headers["Authorization"] = `${session.tokenType || "Bearer"} ${
        session.accessToken
      }`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${url}`, config);

      // If 401, try to refresh token
      if (response.status === 401 && session?.refreshToken) {
        return this.handle401Error(url, config, session);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request error:", error);
      throw error;
    }
  }

  async handle401Error(url, originalConfig, session) {
    // If already refreshing, add to queue
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalConfig.headers["Authorization"] = `${
            session.tokenType || "Bearer"
          } ${token}`;
          return fetch(`${this.baseURL}${url}`, originalConfig);
        })
        .then((res) => res.json())
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      // Refresh token
      const newTokens = await this.refreshToken(session.refreshToken);

      // Update session
      await this.updateSession(newTokens);

      // Process queued requests
      processQueue(null, newTokens.accessToken);

      // Retry original request
      originalConfig.headers["Authorization"] = `${
        newTokens.tokenType || "Bearer"
      } ${newTokens.accessToken}`;
      const response = await fetch(`${this.baseURL}${url}`, originalConfig);
      return await response.json();
    } catch (error) {
      // If refresh fails, redirect to login
      processQueue(error, null);
      await this.signOut();
      throw error;
    } finally {
      isRefreshing = false;
    }
  }

  async refreshToken(refreshToken) {
    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    return await response.json();
  }

  async getSession() {
    // We'll use NextAuth's getSession in a client component wrapper
    return null; // This will be implemented in hook
  }

  async updateSession(tokens) {
    // We'll update session via NextAuth
  }

  async signOut() {
    // Sign out logic
  }
}

export const api = new ApiClient();
