import { Request, Response } from "express";
import { CreateUserInput } from "schemas/user.schema";
import { createUser } from "services/user.service";
import logger from "utils/logger.utils";

export const createUserHandler = async (
  req: Request<{}, {}, CreateUserInput["body"]>,
  res: Response
) => {
  try {
    const user = await createUser(req.body);
    return res.status(201).send(user);
  } catch (error: any) {
    logger.error(error);
    return res.status(409).send(error.message);
  }
};
