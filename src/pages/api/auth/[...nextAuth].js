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

// Fetch user details including roles
async function fetchUserDetails(accessToken) {
  try {
    const response = await fetch(`${config.GENERAL_AUTH_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch user details:", response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user details:", error);
    return null;
  }
}

// Keep only essential role/permission fields to minimize JWT size
function sanitizeRoles(rolesArray) {
  if (!Array.isArray(rolesArray)) return [];

  return rolesArray.map((role) => ({
    name: role.name,
    permissions: Array.isArray(role.permissions)
      ? role.permissions.map((permission) => ({
          resource: permission.resource?.name
            ? { name: permission.resource.name }
            : null,
          action: permission.action?.name
            ? { name: permission.action.name }
            : null,
        }))
      : [],
  }));
}

function extractRoles(rolesArray) {
  if (!Array.isArray(rolesArray)) return [];
  return rolesArray.map((role) => role.name);
}

function extractPermissions(rolesArray) {
  if (!Array.isArray(rolesArray)) return [];

  const allPermissions = [];
  rolesArray.forEach((role) => {
    if (Array.isArray(role.permissions)) {
      role.permissions.forEach((permission) => {
        allPermissions.push({
          resource: permission.resource?.name || null,
          action: permission.action?.name || null,
          role: role.name,
        });
      });
    }
  });

  return allPermissions;
}

function isAdmin(rolesArray) {
  if (!Array.isArray(rolesArray)) return false;
  return rolesArray.some((role) => {
    const name = (role.name || "").toLowerCase();
    return name === "admin" || name === "super_admin";
  });
}

// Prevent race conditions on simultaneous refresh attempts
const refreshPromises = new Map();

async function refreshAccessToken(token) {
  const refreshKey = token.refreshToken;
  if (refreshPromises.has(refreshKey)) {
    // console.log("Refresh already in progress, waiting...");
    return refreshPromises.get(refreshKey);
  }

  const refreshPromise = (async () => {
    try {
      // console.log("=== STARTING TOKEN REFRESH ===");

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

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Refresh token failed:", response.status, errorText);
        if (response.status === 401) throw new Error("RefreshTokenExpired");
        throw new Error(`Refresh failed: ${response.status}`);
      }

      const refreshedTokens = await response.json();

      if (!refreshedTokens.access_token) {
        throw new Error("No access token in refresh response");
      }

      const newDecoded = decodeJWT(refreshedTokens.access_token);

      if (!newDecoded || !newDecoded.exp) {
        throw new Error("Invalid token received - no expiration");
      }

      const accessTokenExpires = newDecoded.exp * 1000;
      // console.log(
      //   `New token expires in ${Math.floor((accessTokenExpires - Date.now()) / 1000)} seconds`,
      // );

      const userDetails = await fetchUserDetails(refreshedTokens.access_token);
      const sanitizedRoles = sanitizeRoles(userDetails?.roles || []);

      return {
        ...token,
        accessToken: refreshedTokens.access_token,
        refreshToken: refreshedTokens.refresh_token || token.refreshToken,
        tokenType: refreshedTokens.token_type || token.tokenType || "Bearer",
        accessTokenExpires,
        userData: {
          username: newDecoded.username,
          employee_id: newDecoded.employee_id,
          unit_code: newDecoded.unit_code,
        },
        rolesDetail: sanitizedRoles,
        error: undefined,
      };
    } catch (error) {
      console.error("=== TOKEN REFRESH FAILED ===", error.message);
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
          // console.log("=== STARTING LOGIN PROCESS ===");
          // console.log("Attempting login for user:", username);

          const params = new URLSearchParams();
          params.append("username", username);
          params.append("password", password);

          const res = await fetch(`${config.GENERAL_AUTH_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params,
          });

          // console.log("Login response status:", res.status);

          if (!res.ok) {
            console.error("Login failed:", res.status);
            return null;
          }

          const data = await res.json();

          if (!data.access_token || !data.refresh_token) {
            console.error("Missing tokens in login response");
            return null;
          }

          const decoded = decodeJWT(data.access_token);

          if (!decoded || !decoded.exp) {
            console.error("Invalid token structure");
            return null;
          }

          // console.log("=== TOKEN DECODED ===");
          // console.log("Username:", decoded.username);

          const accessTokenExpires = decoded.exp * 1000;

          const userDetails = await fetchUserDetails(data.access_token);

          if (!userDetails) {
            console.error("Failed to fetch user details");
            return null;
          }

          const sanitizedRoles = sanitizeRoles(userDetails.roles || []);

          // console.log("=== LOGIN COMPLETE ===");
          // console.log(
          //   "Token size (bytes):",
          //   JSON.stringify({
          //     id: decoded.sub,
          //     accessToken: data.access_token,
          //     refreshToken: data.refresh_token,
          //     rolesDetail: sanitizedRoles,
          //   }).length,
          // );

          return {
            id: decoded.sub,
            name: decoded.username || username,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            tokenType: data.token_type || "Bearer",
            accessTokenExpires,
            // Only store minimal user data — recompute roles/permissions in session
            userData: {
              username: decoded.username,
              employee_id: decoded.employee_id,
              unit_code: decoded.unit_code,
            },
            rolesDetail: sanitizedRoles,
          };
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in — store only essential fields
      if (user) {
        // console.log("=== INITIAL JWT CREATION ===");
        // console.log("User:", user.name);
        return {
          id: user.id,
          name: user.name,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          tokenType: user.tokenType,
          accessTokenExpires: user.accessTokenExpires,
          userData: user.userData,
          rolesDetail: user.rolesDetail,
        };
      }

      if (!token.accessToken) {
        return { ...token, error: "NoAccessToken" };
      }

      if (token.error === "RefreshTokenExpired") {
        return token;
      }

      const now = Date.now();
      const secondsUntilExpiry = Math.floor(
        (token.accessTokenExpires - now) / 1000,
      );
      // console.log(
      //   `JWT callback: Token expires in ${secondsUntilExpiry} seconds`,
      // );

      if (secondsUntilExpiry >= 300) {
        return token;
      }

      // console.log("=== TOKEN REFRESH NEEDED ===");
      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      // console.log("=== BUILDING SESSION ===");

      if (token.error === "RefreshTokenExpired") {
        return { ...session, error: "RefreshTokenExpired", user: null };
      }

      if (token.error) {
        session.error = token.error;
      }

      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.tokenType = token.tokenType;
      session.accessTokenExpires = token.accessTokenExpires;

      // Compute roles/permissions fresh from rolesDetail (not stored in JWT)
      const roles = token.rolesDetail || [];

      session.user = {
        id: token.id,
        name: token.name,
        username: token.userData?.username,
        employee_id: token.userData?.employee_id,
        unit_code: token.userData?.unit_code,
        roles: extractRoles(roles),
        rolesDetail: roles,
        permissions: extractPermissions(roles),
        isAdmin: isAdmin(roles),
      };

      // console.log("Session roles:", session.user.roles);
      // console.log(
      //   "Session permissions count:",
      //   session.user.permissions.length,
      // );
      // console.log("=== SESSION BUILT SUCCESSFULLY ===");

      return session;
    },
  },

  cookies: {
    sessionToken: {
      name: "next-auth.session-token.project2",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false, // set to true only if you add HTTPS
      },
    },
  },

  events: {
    async signOut({ token }) {
      // console.log("=== USER SIGNED OUT ===");
      try {
        await fetch(`${config.GENERAL_AUTH_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `${token.tokenType || "Bearer"} ${token.accessToken}`,
          },
        });
        // console.log("Logout API called successfully");
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
    signOut: `${process.env.NEXTAUTH_URL}/` || "/",
    error: "/auth/error",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);

// console.log("=== NEXTAUTH CONFIGURATION LOADED ===");
// console.log("NEXTAUTH_SECRET loaded:", !!process.env.NEXTAUTH_SECRET);
// console.log("Auth API URL:", config.GENERAL_AUTH_URL);
