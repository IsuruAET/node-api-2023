import { PORT, NODE_ENV } from "config";
import express from "express";
import deserializeUser from "middleware/deserializeUser";
import routes from "./routes";
import connect from "utils/db.utils";
import logger from "utils/logger.utils";

const app = express();

app.use(express.json());

app.use(deserializeUser);

app.listen(PORT, async () => {
  logger.info(
    `${NODE_ENV.toUpperCase()} Api is running at http://localhost:${PORT}`
  );

  await connect();

  routes(app);
});
