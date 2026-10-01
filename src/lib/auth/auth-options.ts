import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        otp: { label: 'OTP', type: 'text' },
        isOTPLogin: { label: 'Is OTP Login', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error('Email is required')
        }

        const email = credentials.email.toLowerCase().trim()

        // OTP-based login
        if (credentials.isOTPLogin === 'true' && credentials.otp) {
          const hashedOTP = crypto.createHash('sha256').update(credentials.otp).digest('hex')

          const verificationToken = await prisma.verificationToken.findFirst({
            where: {
              identifier: email,
              token: hashedOTP,
            },
          })

          if (!verificationToken || new Date() > verificationToken.expires) {
            throw new Error('Invalid or expired OTP')
          }

          // Delete the used token
          await prisma.verificationToken.delete({
            where: {
              identifier_token: {
                identifier: email,
                token: hashedOTP,
              },
            },
          })

          const user = await prisma.user.findUnique({
            where: { email },
          })

          if (!user) {
            throw new Error('User not found')
          }

          if (user.isBlocked) {
            throw new Error('Account is blocked')
          }

          // Update as verified
          if (!user.isVerified) {
            await prisma.user.update({
              where: { id: user.id },
              data: { isVerified: true },
            })
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        }

        // Password-based login
        if (!credentials.password) {
          throw new Error('Password is required')
        }

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.passwordHash) {
          throw new Error('Invalid credentials')
        }

        if (user.isBlocked) {
          throw new Error('Account is blocked')
        }

        const isValid = await compare(credentials.password, user.passwordHash)
        if (!isValid) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        // Create or update user for Google sign-in
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              avatar: user.image,
              isVerified: true,
              role: 'CUSTOMER',
            },
          })
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
