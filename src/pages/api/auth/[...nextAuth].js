// /pages/api/auth/[...nextauth].js
import { config } from "@/config";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// decode JWT token
function decodeJWT(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

// Helper function to fetch user details including roles
async function fetchUserDetails(accessToken) {
  try {
    const response = await fetch(`${config.GENERAL_AUTH_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("User details response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Failed to fetch user details:",
        response.status,
        errorText,
      );
      return null;
    }

    const userDetails = await response.json();
    console.log("User details fetched successfully");
    console.log("User roles:", userDetails.roles);

    return userDetails;
  } catch (error) {
    console.error("Error fetching user details:", error);
    return null;
  }
}

// Helper function to extract role names from the roles array format
function extractRoles(rolesArray) {
  if (!Array.isArray(rolesArray)) {
    return [];
  }
  return rolesArray.map((role) => role.name);
}

// Helper function to extract all permissions from roles
function extractPermissions(rolesArray) {
  if (!Array.isArray(rolesArray)) {
    return [];
  }

  const allPermissions = [];
  rolesArray.forEach((role) => {
    if (Array.isArray(role.permissions)) {
      role.permissions.forEach((permission) => {
        allPermissions.push({
          name: permission.name,
          types: permission.types || [],
          role: role.name, // Keep track of which role granted this permission
        });
      });
    }
  });

  return allPermissions;
}

// Helper function to check if user has admin privileges
function isAdmin(rolesArray) {
  if (!Array.isArray(rolesArray)) {
    return false;
  }

  return rolesArray.some(
    (role) =>
      role.name === "admin" ||
      role.permissions?.some((p) => p.name === "*" && p.types?.includes("*")),
  );
}

// Track ongoing refresh operations to prevent race conditions
const refreshPromises = new Map();

// Helper function to refresh access token with proper error handling
async function refreshAccessToken(token) {
  // Prevent multiple simultaneous refresh attempts for the same token
  const refreshKey = token.refreshToken;
  if (refreshPromises.has(refreshKey)) {
    console.log("Refresh already in progress, waiting...");
    return refreshPromises.get(refreshKey);
  }

  const refreshPromise = (async () => {
    try {
      console.log("=== STARTING TOKEN REFRESH ===");

      if (!token.refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${config.GENERAL_AUTH_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.refreshToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Refresh response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Refresh token failed:", response.status, errorText);

        if (response.status === 401) {
          throw new Error("RefreshTokenExpired");
        }

        throw new Error(`Refresh failed: ${response.status}`);
      }

      const refreshedTokens = await response.json();
      console.log("Refresh successful, got new tokens");

      if (!refreshedTokens.access_token) {
        throw new Error("No access token in refresh response");
      }

      // Decode new token to get expiration
      const newDecoded = decodeJWT(refreshedTokens.access_token);

      if (!newDecoded || !newDecoded.exp) {
        throw new Error("Invalid token received - no expiration");
      }

      const accessTokenExpires = newDecoded.exp * 1000;
      const expiresIn = Math.floor((accessTokenExpires - Date.now()) / 1000);
      console.log(`New token expires in ${expiresIn} seconds`);

      // Fetch updated user details with new token
      console.log("Fetching updated user details after token refresh...");
      const userDetails = await fetchUserDetails(refreshedTokens.access_token);

      return {
        ...token,
        accessToken: refreshedTokens.access_token,
        refreshToken: refreshedTokens.refresh_token || token.refreshToken,
        tokenType: refreshedTokens.token_type || token.tokenType || "Bearer",
        accessTokenExpires: accessTokenExpires,
        userData: newDecoded,
        userDetails: userDetails, // Store updated user details
        error: undefined,
      };
    } catch (error) {
      console.error("=== TOKEN REFRESH FAILED ===");
      console.error("Error:", error.message);

      return {
        ...token,
        error:
          error.message === "RefreshTokenExpired"
            ? "RefreshTokenExpired"
            : "RefreshAccessTokenError",
      };
    } finally {
      refreshPromises.delete(refreshKey);
    }
  })();

  refreshPromises.set(refreshKey, refreshPromise);
  return refreshPromise;
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
          console.log("=== STARTING LOGIN PROCESS ===");
          console.log("Attempting login for user:", username);

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

          if (!data.access_token || !data.refresh_token) {
            console.error("Missing tokens in login response");
            return null;
          }

          console.log("=== STEP 1: LOGIN SUCCESSFUL ===");

          // Decode token to get user data and expiration
          const decoded = decodeJWT(data.access_token);

          if (!decoded || !decoded.exp) {
            console.error("Invalid token structure");
            return null;
          }

          console.log("=== STEP 2: TOKEN DECODED ===");
          console.log("User ID (sub):", decoded.sub);
          console.log("Username:", decoded.username);
          console.log("Employee ID:", decoded.employee_id);
          console.log("Unit Code:", decoded.unit_code);

          const accessTokenExpires = decoded.exp * 1000;

          // Fetch user details including roles
          console.log("=== STEP 3: FETCHING USER DETAILS ===");
          const userDetails = await fetchUserDetails(data.access_token);

          if (!userDetails) {
            console.error("Failed to fetch user details");
            return null;
          }

          console.log("=== STEP 4: USER DETAILS FETCHED ===");
          console.log("Full user details retrieved with roles");

          return {
            id: decoded.sub,
            name: decoded.username || username,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            tokenType: data.token_type || "Bearer",
            accessTokenExpires: accessTokenExpires,
            userData: decoded, // Token payload
            userDetails: userDetails, // Full user details from API
          };
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign in
      if (user) {
        console.log("=== INITIAL JWT CREATION ===");
        console.log("User:", user.name);
        console.log("User ID:", user.id);
        console.log(
          "Token expires:",
          new Date(user.accessTokenExpires).toLocaleString(),
        );

        return {
          ...token,
          ...user,
        };
      }

      // No access token means something is wrong
      if (!token.accessToken) {
        console.error("JWT callback: No access token found");
        return {
          ...token,
          error: "NoAccessToken",
        };
      }

      // If there's already an error, keep it
      if (token.error === "RefreshTokenExpired") {
        console.log(
          "JWT callback: Refresh token expired, user needs to re-login",
        );
        return token;
      }

      // Check token expiration
      const now = Date.now();
      const expiresAt = token.accessTokenExpires;
      const timeUntilExpiry = expiresAt - now;
      const secondsUntilExpiry = Math.floor(timeUntilExpiry / 1000);

      console.log(
        `JWT callback: Token expires in ${secondsUntilExpiry} seconds`,
      );

      // Refresh if token expires in less than 5 minutes (300 seconds)
      const shouldRefresh = secondsUntilExpiry < 300;

      if (!shouldRefresh) {
        return token;
      }

      // Token needs refresh
      console.log("=== TOKEN REFRESH NEEDED ===");
      const refreshedToken = await refreshAccessToken(token);

      if (refreshedToken.error) {
        console.error(
          "JWT callback: Refresh failed with error:",
          refreshedToken.error,
        );
      } else {
        console.log("JWT callback: Token refreshed successfully");
      }

      return refreshedToken;
    },

    async session({ session, token }) {
      console.log("=== BUILDING SESSION ===");

      // If refresh token expired, clear session
      if (token.error === "RefreshTokenExpired") {
        console.log("Session callback: Refresh token expired");
        return {
          ...session,
          error: "RefreshTokenExpired",
          user: null,
        };
      }

      // If there's an error but not expired, keep minimal session
      if (token.error) {
        session.error = token.error;
      }

      // Build session with token data
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.tokenType = token.tokenType;
      session.accessTokenExpires = token.accessTokenExpires;

      // Extract roles and permissions from userDetails (from API)
      const roles = token.userDetails?.roles || [];
      const roleNames = extractRoles(roles);
      const permissions = extractPermissions(roles);
      const hasAdminAccess = isAdmin(roles);

      console.log("Session roles extracted:", roleNames);
      console.log("Session permissions count:", permissions.length);
      console.log("Session has admin access:", hasAdminAccess);

      session.user = {
        id: token.id,
        name: token.name,
        username: token.userData?.username,
        employee_id: token.userData?.employee_id,
        unit_code: token.userData?.unit_code,
        // Role structure from API
        roles: roleNames, // Array of role names: ["admin"]
        rolesDetail: roles, // Full roles array with permissions
        permissions: permissions, // Flattened permissions array
        isAdmin: hasAdminAccess, // Boolean flag for easy access checking
      };

      console.log("=== SESSION BUILT SUCCESSFULLY ===");

      return session;
    },
  },

  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token.project2"
          : "next-auth.session-token.project2",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  events: {
    async signOut({ token }) {
      console.log("=== USER SIGNED OUT ===");
      // Optionally call logout endpoint to invalidate tokens on server
      try {
        await fetch(`${config.GENERAL_AUTH_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `${token.tokenType || "Bearer"} ${
              token.accessToken
            }`,
          },
        });
        console.log("Logout API called successfully");
      } catch (error) {
        console.error("Logout error:", error);
      }
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day
  },

  pages: {
    signIn: "/",
    signOut: "localhost:3001",
    error: "/auth/error",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);

console.log("=== NEXTAUTH CONFIGURATION LOADED ===");
console.log("NEXTAUTH_SECRET loaded:", !!process.env.NEXTAUTH_SECRET);
console.log("Secret length:", process.env.NEXTAUTH_SECRET?.length);
console.log("Auth API URL:", config.GENERAL_AUTH_URL);
