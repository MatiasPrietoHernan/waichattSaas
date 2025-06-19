import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { use } from "react";
//import { validarUser } from "@/lib/auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials:any) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = {email:"martin@gmail.com",pass:"123",name:"martin",role:"user",_id:"123"}//await validarUser(credentials.email, credentials.password);
          const userCompare=user.email==credentials.email && user.pass==credentials.password
          if (!userCompare ) {
            return null;
          }

          return {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role
          };
        } catch (error) {
          console.error("Error en la autenticación:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.accessToken = account?.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {

      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };