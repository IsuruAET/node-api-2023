import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from "config";
import { Request, Response } from "express";
import {
  createSession,
  findSessions,
  updateSession,
} from "services/session.service";
import { validatePassword } from "services/user.service";
import { signJwt } from "utils/jwt.utils";

export const createUserSessionHandler = async (req: Request, res: Response) => {
  // Validate the user's password
  const user = await validatePassword(req.body);

  if (!user) {
    return res.status(401).send("Invalid email or password");
  }

  // Create a session
  const session = await createSession(user._id, req.get("user-agent") || "");

  // Create an access token
  const accessToken = signJwt(
    { ...user, session: session._id },
    "accessTokenPrivateKey",
    { expiresIn: ACCESS_TOKEN_TTL } // 15 minutes,
  );

  // Create a refresh token
  const refreshToken = signJwt(
    { ...user, session: session._id },
    "refreshTokenPrivateKey",
    { expiresIn: REFRESH_TOKEN_TTL } // 1 year
  );

  // Return access and refresh token
  return res.send({ accessToken, refreshToken });
};

export const getUserSessionsHandler = async (req: Request, res: Response) => {
  const userId = res.locals.user._id;

  const sessions = await findSessions({ user: userId, valid: true });

  return res.send(sessions);
};

export const deleteSessionHandler = async (req: Request, res: Response) => {
  const sessionId = res.locals.user.session;

  await updateSession({ _id: sessionId }, { valid: false });

  return res.send({
    accessToken: null,
    refreshToken: null,
  });
};
