import { NuxtAuthHandler } from "#auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  findOrCreateUserByOauthProfile,
  verifyUserPassword,
} from "@/lib/db/service/user";
import { DbUser } from "@/lib/db/types";

export default NuxtAuthHandler({
  secret: useRuntimeConfig().auth.secret,
  providers: [
    // @ts-expect-error Use .default here for it to work during SSR.
    CredentialsProvider.default({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<DbUser | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await verifyUserPassword(
          credentials.email,
          credentials.password,
        );
        return user;
      },
    }),
    // @ts-expect-error Use .default here for it to work during SSR.
    GithubProvider.default({
      clientId: useRuntimeConfig().github.clientId,
      clientSecret: useRuntimeConfig().github.clientSecret,
    }),
    // @ts-expect-error Use .default here for it to work during SSR.
    GoogleProvider.default({
      clientId: useRuntimeConfig().google.clientId,
      clientSecret: useRuntimeConfig().google.clientSecret,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ profile, account, user }) {
      if (account?.provider === "credentials") {
        // For credentials, user object is returned from authorize callback
        (profile as any) = { dbUser: user };
        return true;
      }

      if (profile && account) {
        profile.dbUser = await findOrCreateUserByOauthProfile(
          profile,
          account.provider,
        );
      }
      return true;
    },
    async jwt({ token, profile, account }) {
      // The user object is available on the first sign in
      if (profile?.dbUser) {
        const dbUser = profile.dbUser;
        token.id = dbUser.id;
        token.name = dbUser.name;
        token.email = dbUser.email;
      } else if (account?.provider === "credentials") {
        token.id = token.sub
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth",
  },
});
