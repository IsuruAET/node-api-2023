import { PORT, NODE_ENV } from "config";
import connect from "utils/db.utils";
import logger from "utils/logger.utils";
import createServer from "utils/server.utils";

const app = createServer();

app.listen(PORT, async () => {
  logger.info(
    `${NODE_ENV.toUpperCase()} Api is running at http://localhost:${PORT}`
  );

  await connect();
});
