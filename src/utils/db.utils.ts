import { DB_URI } from "config";
import mongoose from "mongoose";
import logger from "./logger.utils";

const connect = async () => {
  try {
    await mongoose.connect(DB_URI);
    logger.info("DB connected");
  } catch (error) {
    logger.error("Could not connect to db");
  }
};

export default connect;
