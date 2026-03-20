import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email || !account) return false;

      await connectDB();
      await User.findOneAndUpdate(
        { email: user.email },
        {
          name: user.name,
          email: user.email,
          image: user.image,
          googleId: account.providerAccountId,
        },
        { upsert: true, new: true }
      );

      return true;
    },
    async jwt({ token }) {
      if (token.email) {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
