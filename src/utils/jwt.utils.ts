import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_PRIVATE_KEY,
  REFRESH_TOKEN_PRIVATE_KEY,
  ACCESS_TOKEN_PUBLIC_KEY,
  REFRESH_TOKEN_PUBLIC_KEY,
} from "config";

type PrivateKEY = "accessTokenPrivateKey" | "refreshTokenPrivateKey";
type PublicKEY = "accessTokenPublicKey" | "refreshTokenPublicKey";

const setPrivateKey = (keyName: PrivateKEY): string => {
  if (keyName === "accessTokenPrivateKey") {
    return ACCESS_TOKEN_PRIVATE_KEY;
  }
  return REFRESH_TOKEN_PRIVATE_KEY;
};

const setPublicKey = (keyName: PublicKEY): string => {
  if (keyName === "accessTokenPublicKey") {
    return ACCESS_TOKEN_PUBLIC_KEY;
  }
  return REFRESH_TOKEN_PUBLIC_KEY;
};

export const signJwt = (
  object: Object,
  keyName: PrivateKEY,
  options?: jwt.SignOptions | undefined
) => {
  const signingKey = Buffer.from(setPrivateKey(keyName), "base64").toString(
    "ascii"
  );

  return jwt.sign(object, signingKey, {
    ...(options && options),
    algorithm: "RS256",
  });
};

export const verifyJwt = (token: string, keyName: PublicKEY) => {
  const publicKey = Buffer.from(setPublicKey(keyName), "base64").toString(
    "ascii"
  );

  try {
    const decoded = jwt.verify(token, publicKey);
    return {
      valid: true,
      expired: false,
      decoded,
    };
  } catch (e: any) {
    console.error(e);
    return {
      valid: false,
      expired: e.message === "jwt expired",
      decoded: null,
    };
  }
};
