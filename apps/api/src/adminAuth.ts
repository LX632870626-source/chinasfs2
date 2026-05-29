import type { NextFunction, Request, Response } from "express";
import { env } from "./env.js";

const DEV_ADMIN_TOKEN = "dev-admin-token";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const isLocalRuntime = env.nodeEnv === "development" || env.nodeEnv === "test";

  if (!env.adminSessionToken || (!isLocalRuntime && env.adminSessionToken === DEV_ADMIN_TOKEN)) {
    res.status(500).json({ error: "CONFIG_ERROR" });
    return;
  }

  const token = req.header("x-admin-token");

  if (token !== env.adminSessionToken) {
    res.status(401).json({ error: "UNAUTHORIZED" });
    return;
  }

  next();
}
