import cors from "cors";
import express from "express";
import { adminRoutes } from "./adminRoutes.js";
import { publicRoutes } from "./publicRoutes.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/public", publicRoutes);
  app.use("/api/admin", adminRoutes);

  return app;
}
