// /pages/api/auth/[...nextauth].js yoki .ts
import { config } from "@/config";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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
          const res = await fetch(`${config.JAVA_API_URL}authenticate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
          });

          if (!res.ok) {
            console.error("Failed login response:", res.status);
            return null;
          }

          const data = await res.json();

          if (data.token) {
            return {
              id: 1,
              name: username,
              token: data.token,
            };
          }
          console.log("API URL: ", config.JAVA_API_URL);

          console.log("Credentials:", username, password);
          console.log("API response status:", res.status);
          return null;
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.token;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.name = token.name;
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 kun = 86400 soniya
  },

  jwt: {
    maxAge: 24 * 60 * 60, // 1 kun
  },

  pages: {
    signIn: "/", // login sahifangiz
    signOut: "http://10.20.6.60:3000/",
  },

  secret: process.env.NEXTAUTH_SECRET || "some-hardcoded-secret",
};

export default NextAuth(authOptions);
