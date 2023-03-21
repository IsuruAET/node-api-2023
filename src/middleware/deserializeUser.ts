import { Request, Response, NextFunction } from "express";
import { get } from "lodash";
import { verifyJwt } from "utils/jwt.utils";
import { reIssueAccessToken } from "services/session.service";

const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = get(req, "headers.authorization", "").replace(
    /^Bearer\s/,
    ""
  );

  if (accessToken) {
    const refreshToken: any = get(req, "headers.x-refresh");

    const { decoded, expired } = verifyJwt(accessToken, "accessTokenPublicKey");

    if (decoded) {
      res.locals.user = decoded;
      return next();
    }

    if (expired && refreshToken) {
      const newAccessToken = await reIssueAccessToken({ refreshToken });

      if (newAccessToken) {
        res.setHeader("x-access-token", newAccessToken);
      }

      const result = verifyJwt(
        newAccessToken as string,
        "accessTokenPublicKey"
      );

      res.locals.user = result.decoded;
      return next();
    }
  }
  return next();
};

export default deserializeUser;
