import { DefaultSession, DefaultUser, Profile } from "next-auth";
import { DbUser } from "@/lib/db/types";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
    } & DefaultSession["user"];
  }

  interface Profile {
    dbUser?: DbUser;
  }
}
