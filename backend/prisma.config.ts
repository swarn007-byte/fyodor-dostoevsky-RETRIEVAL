import { defineConfig, env } from "prisma/config";
import dotenv from "dotenv";

// Explicitly load the .env file into memory
dotenv.config();

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    // If process.env fails, fallback to Prisma's internal env resolver
    url: process.env.DATABASE_URL,
  },
});