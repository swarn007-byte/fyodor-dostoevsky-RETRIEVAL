import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

const authBaseURL =
  process.env.BETTER_AUTH_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const auth = betterAuth({
  baseURL: authBaseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID ?? "YOUR_TWITTER_CLIENT_ID",
      clientSecret: process.env.TWITTER_CLIENT_SECRET ?? "YOUR_TWITTER_CLIENT_SECRET",
    },
  },
  account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ["google", "twitter", "email-password"],
		},
  },
  trustedOrigins: [
    "http://localhost:*",
    "http://127.0.0.1:*",
    "https://fyodor-dostoevsky-retrieval.vercel.app",
    ...(process.env.FRONTEND_ORIGIN ? [process.env.FRONTEND_ORIGIN] : []),
  ],
});
