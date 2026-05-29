const nodeEnv = process.env.NODE_ENV ?? "development";
const isLocalRuntime = nodeEnv === "development" || nodeEnv === "test";

export const env = {
  nodeEnv,
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? "file:./dev.db",
  adminSessionToken: process.env.ADMIN_SESSION_TOKEN ?? (isLocalRuntime ? "dev-admin-token" : undefined)
};
