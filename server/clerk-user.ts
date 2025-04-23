import { Express, Request, Response } from "express";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";

export function setupClerkUserRoutes(app: Express) {
  // Endpoint to get user info by Clerk ID (for login redirect)
  app.get("/api/clerk-user-info", async (req: Request, res: Response) => {
    const { clerkId } = req.query;
    if (!clerkId || typeof clerkId !== "string") {
      return res.status(400).json({ error: "Missing or invalid clerkId" });
    }
    try {
      const user = await storage.getUserByClerkId(clerkId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user info" });
    }
  });

  // Endpoint to create or update a user from Clerk
  app.post("/api/clerk-user", async (req: Request, res: Response) => {
    try {
      const { clerkId, email, role, ...rest } = req.body;
      console.log("Received Clerk user data:", { clerkId, email, role, ...rest });
      if (!clerkId || !email || !role) {
        return res.status(400).json({ error: "Missing required fields (clerkId, email, role)" });
      }

      // Check if user already exists
      let user = await storage.getUserByClerkId(clerkId);
      if (user) {
        // Optionally update user info
        user = await storage.updateUser(user.id, { email, role, ...rest });
        return res.status(200).json(user);
      } else {
        // Create a new user (no password)
        const newUser = await storage.createUser({
          clerkId,
          email,
          role,
          ...rest
        });
        console.log("Created Clerk user:", newUser);
        return res.status(201).json(newUser);
      }
    } catch (error) {
      console.error("Error creating/updating Clerk user:", error);
      res.status(500).json({ error: "Failed to create/update Clerk user" });
    }
  });
}
