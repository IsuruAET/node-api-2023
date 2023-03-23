import { PORT, NODE_ENV, ORIGIN } from "config";
import cors from "cors";
import connect from "utils/db.utils";
import logger from "utils/logger.utils";
import createServer from "utils/server.utils";

const app = createServer();

app.use(
  cors({
    origin: ORIGIN,
    credentials: true,
  })
);

app.listen(PORT, async () => {
  logger.info(
    `${NODE_ENV.toUpperCase()} Api is running at http://localhost:${PORT}`
  );

  await connect();
});
