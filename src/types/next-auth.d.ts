import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: string;
      memberType?: string;
      clinicianStatus?: string;
      nickname?: string;
      profileComplete?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: string;
    memberType?: string;
    clinicianStatus?: string;
    nickname?: string;
    profileComplete?: boolean;
  }
}
