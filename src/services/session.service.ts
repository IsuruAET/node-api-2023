import { ACCESS_TOKEN_TTL } from "config";
import { get } from "lodash";
import { FilterQuery, UpdateQuery } from "mongoose";
import SessionModel, { SessionDocument } from "models/session.model";
import { signJwt, verifyJwt } from "utils/jwt.utils";
import { findUser } from "./user.service";

export const createSession = async (userId: string, userAgent?: string) => {
  const session = await SessionModel.create({ user: userId, userAgent });

  return session.toJSON();
};

export const findSessions = async (query: FilterQuery<SessionDocument>) => {
  return SessionModel.find(query).lean();
};

export const updateSession = async (
  query: FilterQuery<SessionDocument>,
  update: UpdateQuery<SessionDocument>
) => {
  return SessionModel.updateOne(query, update);
};

export const reIssueAccessToken = async ({
  refreshToken,
}: {
  refreshToken: string;
}) => {
  const { decoded } = verifyJwt(refreshToken, "refreshTokenPublicKey");
  if (!decoded || !get(decoded, "session")) return false;

  const session = await SessionModel.findById(get(decoded, "session"));
  if (!session || !session.valid) return false;

  const user = await findUser({ _id: session.user });
  /* istanbul ignore next */
  if (!user) return false;

  const accessToken = signJwt(
    { ...user, session: session._id },
    "accessTokenPrivateKey",
    { expiresIn: ACCESS_TOKEN_TTL } // 15 minutes
  );

  return accessToken;
};
