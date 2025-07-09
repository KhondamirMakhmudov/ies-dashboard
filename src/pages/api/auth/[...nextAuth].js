// // /pages/api/auth/[...nextauth].js yoki .ts
// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";

// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       id: "credentials",
//       name: "Credentials",
//       credentials: {
//         username: { label: "Username", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         const { username, password } = credentials;

//         const res = await fetch("http://10.40.9.115:8080/authenticate", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ username, password }),
//         });

//         const data = await res.json();

//         if (res.ok && data.token) {
//           // Foydalanuvchi obyektini token bilan qaytarish
//           return {
//             id: 1, // unique ID (hardcoded bo'lsa ham bo'ladi)
//             name: username,
//             token: data.token,
//           };
//         }

//         return null;
//       },
//     }),
//   ],

//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.accessToken = user.token;
//         token.name = user.name;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       session.accessToken = token.accessToken;
//       session.user.name = token.name;
//       return session;
//     },
//   },

//   session: {
//     strategy: "jwt",
//   },

//   secret: process.env.NEXTAUTH_SECRET || "some-hardcoded-secret",
// };

// export default NextAuth(authOptions);
