import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

// Admin emails - users with these emails get admin access
const ADMIN_EMAILS = [
  "elainph@gmail.com",
  "taylor.andreas.elaine@gmail.com",
  "shabnazy@gmail.com",
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        })

        if (!user) {
          throw new Error("No user found with this email")
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isValidPassword) {
          throw new Error("Invalid password")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          isAdmin: user.isAdmin,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id
        token.isAdmin = (user as any).isAdmin
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const sessionUser = session.user as any
        sessionUser.id = token.userId
        sessionUser.isAdmin = token.isAdmin
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}
