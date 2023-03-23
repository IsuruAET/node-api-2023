import { Express } from "express";
import {
  createProductHandler,
  deleteProductHandler,
  getProductHandler,
  updateProductHandler,
} from "controllers/product.controller";
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
import {
  createProductSchema,
  deleteProductSchema,
  getProductSchema,
  updateProductSchema,
} from "schemas/product.schema";
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

  // Product
  app.post(
    "/api/products",
    [deserializeUser, validateResource(createProductSchema)],
    createProductHandler
  );

  app.put(
    "/api/products/:productId",
    [deserializeUser, validateResource(updateProductSchema)],
    updateProductHandler
  );

  app.get(
    "/api/products/:productId",
    validateResource(getProductSchema),
    getProductHandler
  );

  app.delete(
    "/api/products/:productId",
    [deserializeUser, validateResource(deleteProductSchema)],
    deleteProductHandler
  );
};

export default routes;
