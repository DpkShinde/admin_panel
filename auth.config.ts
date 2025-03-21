
import type { NextAuthConfig } from "next-auth";

export default {
    secret: process.env.NEXTAUTH_SECRET,
  providers: [
  
  ],
} satisfies NextAuthConfig;
