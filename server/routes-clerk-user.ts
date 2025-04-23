import type { Express } from "express";
import { setupClerkUserRoutes } from "./clerk-user";

export function registerClerkUserRoutes(app: Express) {
  setupClerkUserRoutes(app);
}
