import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      fullName: string;
      role: string;
      staffId: string;
    }
  }

  interface User {
    id: string;
    username: string;
    email: string;
    fullName: string;
    role: string;
    staffId: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    email: string;
    fullName: string;
    role: string;
    staffId: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('Auth attempt for username:', credentials?.username)

        if (!credentials?.username || !credentials?.password) {
          console.log('Missing credentials')
          throw new Error('Username and password required');
        }

        try {
          // Try to find user by username or email
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { username: credentials.username },
                { email: credentials.username },
              ],
            },
            select: {
              id: true,
              username: true,
              email: true,
              fullName: true,
              passwordHash: true,
              role: true,
              staffId: true,
              isActive: true,
            }
          });

          if (user) {
            console.log('User found:', user.username)

            if (!user.isActive) {
              console.log('User account is inactive')
              throw new Error('Account is inactive');
            }

            const isPasswordValid = await bcrypt.compare(
              credentials.password,
              user.passwordHash
            );

            if (!isPasswordValid) {
              console.log('Password comparison failed')
              throw new Error('Invalid credentials');
            }

            console.log('Authentication successful for:', user.username)
            return {
              id: user.id,
              username: user.username,
              email: user.email,
              fullName: user.fullName,
              role: user.role,
              staffId: user.staffId,
            };
          }

          console.log('User not found for username')
          throw new Error('Invalid credentials');
        } catch (error) {
          console.error('Auth error:', error)
          throw error
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.fullName = user.fullName;
        token.role = user.role;
        token.staffId = user.staffId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.fullName = token.fullName;
        session.user.role = token.role;
        session.user.staffId = token.staffId;
      }
      return session;
    }
  },
  secret: process.env.AUTH_SECRET,
};
