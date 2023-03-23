import express from "express";
import routes from "../routes";

const createServer = () => {
  const app = express();

  app.use(express.json());

  routes(app);

  return app;
};

export default createServer;
