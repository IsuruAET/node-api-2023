import { Request, Response } from "express";
import { CreateUserInput } from "schemas/user.schema";
import { createUser, findUserByEmail } from "services/user.service";

export const createUserHandler = async (
  req: Request<{}, {}, CreateUserInput["body"]>,
  res: Response
) => {
  const { email } = req.body;
  const user = await findUserByEmail(email);

  if (!user) {
    const newUser = await createUser(req.body);
    return res.status(201).send(newUser);
  }
  return res.status(409).send("User already exist");
};

export const getCurrentUserHandler = async (req: Request, res: Response) => {
  return res.send(res.locals.user);
};
