import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Utilisateur', type: 'text' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        const { username, password } = credentials as {
          username: string;
          password: string;
        };
        const users = [
          { id: 'chris', name: 'Chris', username: 'chris', password: process.env.CHRIS_PASSWORD! },
          { id: 'alex', name: 'Alex', username: 'alex', password: process.env.ALEX_PASSWORD! },
        ];
        const user = users.find(
          (u) => u.username === username && u.password === password
        );
        return user ?? null;
      },
    }),
  ],
  pages: { signIn: '/login' },
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.userId = user.id;
      return token;
    },
    session({ session, token }) {
      session.user.id = token.userId as string;
      return session;
    },
  },
};
