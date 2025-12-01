// /pages/api/auth/[...nextauth].js
import { config } from "@/config";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Helper function to refresh access token
async function refreshAccessToken(token) {
  try {
    console.log("Attempting to refresh token...");
    console.log("Current token type:", token.tokenType);
    console.log("Current refresh token exists:", !!token.refreshToken);

    // Some OAuth servers expect Bearer prefix, some don't
    const authHeader =
      token.tokenType && token.tokenType !== "Bearer"
        ? `${token.tokenType} ${token.refreshToken}`
        : `Bearer ${token.refreshToken}`;

    const response = await fetch(`${config.GENERAL_AUTH_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      // Some refresh endpoints don't need a body, just the token in header
    });

    console.log("Refresh response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Refresh token failed:", response.status, errorText);
      throw new Error(`Refresh failed: ${response.status}`);
    }

    const refreshedTokens = await response.json();
    console.log("Refresh response data:", refreshedTokens);

    if (!refreshedTokens.access_token) {
      throw new Error("No access token in refresh response");
    }

    // Calculate new expiration time
    const expiresIn = refreshedTokens.expires_in || 300; // Default 5 minutes if not provided
    const accessTokenExpires = Date.now() + expiresIn * 1000;

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token || token.refreshToken,
      tokenType: refreshedTokens.token_type || token.tokenType,
      accessTokenExpires: accessTokenExpires,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);

    // Return token with error so session knows to handle it
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { username, password } = credentials;
          console.log("Attempting login for user:", username);

          // Use URLSearchParams for x-www-form-urlencoded format
          const params = new URLSearchParams();
          params.append("username", username);
          params.append("password", password);

          const res = await fetch(`${config.GENERAL_AUTH_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params,
          });

          console.log("Login response status:", res.status);

          if (!res.ok) {
            const errorText = await res.text();
            console.error("Login failed:", res.status, errorText);
            return null;
          }

          const data = await res.json();
          console.log("Login response data:", data);

          if (data.access_token) {
            // Calculate expiration time (5 minutes = 300 seconds)
            const expiresIn = data.expires_in || 300;
            const accessTokenExpires = Date.now() + expiresIn * 1000;

            return {
              id: username,
              name: username,
              email: `${username}@company.com`,
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
              tokenType: data.token_type,
              accessTokenExpires: accessTokenExpires,
            };
          }

          console.log("No access token in response");
          return null;
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      console.log("JWT callback triggered");

      // Initial sign in
      if (user) {
        console.log("Initial JWT creation for user:", user.name);
        console.log(
          "Token expires at:",
          new Date(user.accessTokenExpires).toLocaleString()
        );
        return {
          ...token,
          ...user, // Spread all user properties including accessTokenExpires
        };
      }

      // Check if token has expired
      const now = Date.now();
      const shouldRefresh =
        token.accessTokenExpires && now > token.accessTokenExpires - 30000; // Refresh 30 seconds before expiry

      console.log("Current time:", new Date(now).toLocaleString());
      console.log(
        "Token expires at:",
        new Date(token.accessTokenExpires).toLocaleString()
      );
      console.log("Should refresh:", shouldRefresh);

      // If token is still valid, return it
      if (!shouldRefresh) {
        console.log("Token still valid, returning existing token");
        return token;
      }

      // Token has expired or about to expire, refresh it
      console.log("Token needs refresh, calling refreshAccessToken");
      const refreshedToken = await refreshAccessToken(token);

      if (refreshedToken.error) {
        console.log("Refresh failed, signing out");
        // Force sign out if refresh fails
        throw new Error("RefreshFailed");
      }

      console.log("Token refreshed successfully");
      console.log(
        "New token expires at:",
        new Date(refreshedToken.accessTokenExpires).toLocaleString()
      );
      return refreshedToken;
    },

    async session({ session, token }) {
      console.log("Session callback triggered");
      console.log("Token has error:", token.error);

      if (token.error) {
        session.error = token.error;
      }

      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.tokenType = token.tokenType;
      session.user = {
        name: token.name,
        email: token.email,
      };

      console.log("Session created for user:", session.user.name);
      console.log("Has access token:", !!session.accessToken);

      return session;
    },
  },

  events: {
    async signOut({ token }) {
      console.log("User signed out, clearing tokens");
      // Optionally call logout endpoint on backend
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day - session cookie expiry
  },

  pages: {
    signIn: "/",
    signOut: "/",
    error: "/auth/error",
  },

  debug: true, // Enable debug for testing
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
