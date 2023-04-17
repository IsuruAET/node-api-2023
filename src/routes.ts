import { Express } from "express";
import {
  createUserSessionHandler,
  deleteSessionHandler,
  getUserSessionsHandler,
} from "controllers/session.controller";
import {
  createUserHandler,
  getCurrentUserHandler,
} from "controllers/user.controller";
import validateResource from "middleware/validateResource";
import { createSessionSchema } from "schemas/session.schema";
import { createUserSchema } from "schemas/user.schema";
import deserializeUser from "middleware/deserializeUser";

const routes = (app: Express) => {
  // User
  app.post("/api/users", validateResource(createUserSchema), createUserHandler);

  app.get("/api/auth", deserializeUser, getCurrentUserHandler);

  // Session
  app.post(
    "/api/sessions",
    validateResource(createSessionSchema),
    createUserSessionHandler
  );

  app.get("/api/sessions", deserializeUser, getUserSessionsHandler);

  app.delete("/api/sessions", deserializeUser, deleteSessionHandler);
};

export default routes;
