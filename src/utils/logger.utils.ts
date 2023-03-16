import pino from "pino";
import dayjs from "dayjs";

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      translateTime: dayjs().format(),
      ignore: "pid,hostname",
    },
  },
});

export default logger;
