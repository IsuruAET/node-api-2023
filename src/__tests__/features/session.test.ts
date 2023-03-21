import mongoose from "mongoose";
import * as UserService from "services/user.service";
import * as SessionService from "services/session.service";
import { createUserSessionHandler } from "controllers/session.controller";
import supertest from "supertest";
import createServer from "utils/server.utils";
import { signJwt } from "utils/jwt.utils";
import { MongoMemoryServer } from "mongodb-memory-server";
import { userInput, userPayload } from "../fixtures/user.fixture";
import {
  deleteSessionPayload,
  sessionPayload,
} from "../fixtures/session.fixture";

const app = createServer();

describe("session", () => {
  beforeEach(async () => {
    const mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri());
  });

  afterEach(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  describe("create user session", () => {
    describe("given the username and password are valid", () => {
      it("should return a 201 status and signed accessToken & refresh token", async () => {
        jest
          .spyOn(UserService, "validatePassword")
          // @ts-ignore
          .mockReturnValue(userPayload);
        jest
          .spyOn(SessionService, "createSession")
          // @ts-ignore
          .mockReturnValue(sessionPayload);
        const req = {
          get: () => {
            return "a user agent";
          },
          body: {
            email: "test@example.com",
            password: "Asdf123$",
          },
        };
        const send = jest.fn();
        const res = {
          send,
          status: jest.fn().mockReturnThis(),
        };
        // @ts-ignore
        await createUserSessionHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(send).toHaveBeenCalledWith({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        });
      });
    });

    describe("given the username and password are not valid", () => {
      it("should return a 401", async () => {
        jest
          .spyOn(UserService, "validatePassword")
          // @ts-ignore
          .mockReturnValue(false);

        const req = {
          body: {
            email: "test@example.com",
            password: "Asdf123$",
          },
        };
        const send = jest.fn();
        const res = {
          send,
          status: jest.fn().mockReturnThis(),
        };
        // @ts-ignore
        await createUserSessionHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(send).toHaveBeenCalledWith("Invalid email or password");
      });
    });
  });

  describe("get user session", () => {
    describe("given the user is logged in", () => {
      it("should return a 200 status and the valid sessions", async () => {
        const jwt = signJwt(userPayload, "accessTokenPrivateKey");

        jest
          .spyOn(SessionService, "findSessions")
          // @ts-ignore
          .mockReturnValue([sessionPayload]);

        const { statusCode, body } = await supertest(app)
          .get("/api/sessions")
          .set("Authorization", `Bearer ${jwt}`);

        expect(statusCode).toBe(200);
        expect(body).toEqual([
          {
            _id: expect.any(String),
            user: expect.any(String),
            valid: true,
            userAgent: "PostmanRuntime/x.x.x",
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            __v: 0,
          },
        ]);
      });

      it("should return valid sessions", async () => {
        const user = await UserService.createUser(userInput);

        const session = await SessionService.createSession(
          user._id,
          "PostmanRuntime/x.x.x"
        );

        const validSessions = await SessionService.findSessions({
          user: session.user,
          valid: true,
        });

        expect(validSessions).toEqual([session]);
      });
    });

    describe("given the user update session", () => {
      it("should return valid value as false", async () => {
        const user = await UserService.createUser(userInput);

        const session = await SessionService.createSession(
          user._id,
          "PostmanRuntime/x.x.x"
        );

        await SessionService.updateSession(
          { _id: session._id },
          { valid: false }
        );

        const validSessions = await SessionService.findSessions({
          user: session.user,
          valid: true,
        });

        expect(validSessions).toEqual([]);
      });
    });

    describe("given the user is not logged in", () => {
      it("should return a 403", async () => {
        const { statusCode } = await supertest(app).get("/api/sessions");

        expect(statusCode).toBe(403);
      });
    });
  });

  describe("delete user session", () => {
    describe("given the user is logged in", () => {
      it("should return a 200 status and access token and refresh token with null values", async () => {
        const jwt = signJwt(userPayload, "accessTokenPrivateKey");

        jest
          .spyOn(SessionService, "updateSession")
          // @ts-ignore
          .mockReturnValue(deleteSessionPayload);

        const { statusCode, body } = await supertest(app)
          .delete("/api/sessions")
          .set("Authorization", `Bearer ${jwt}`);

        expect(statusCode).toBe(200);
        expect(body).toEqual(deleteSessionPayload);
      });
    });

    describe("given the user is not logged in", () => {
      it("should return a 403", async () => {
        const { statusCode } = await supertest(app).delete("/api/sessions");

        expect(statusCode).toBe(403);
      });
    });
  });

  describe("deserialize user", () => {
    describe("given the user's access token expired", () => {
      it("should return a new Access token and 200 status", async () => {
        const accessJwt = signJwt(userPayload, "accessTokenPrivateKey", {
          expiresIn: -1,
        });

        const refreshJwt = signJwt(userPayload, "refreshTokenPrivateKey");

        const reIssuedAccessJwt = signJwt(userPayload, "accessTokenPrivateKey");

        jest
          .spyOn(SessionService, "findSessions")
          // @ts-ignore
          .mockReturnValue([sessionPayload]);

        jest
          .spyOn(SessionService, "reIssueAccessToken")
          // @ts-ignore
          .mockReturnValue(reIssuedAccessJwt);

        const { statusCode, body } = await supertest(app)
          .get("/api/sessions")
          .set("Authorization", `Bearer ${accessJwt}`)
          .set("x-refresh", `Bearer ${refreshJwt}`);

        expect(statusCode).toBe(200);
        expect(body).toEqual([
          {
            _id: expect.any(String),
            user: expect.any(String),
            valid: true,
            userAgent: "PostmanRuntime/x.x.x",
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            __v: 0,
          },
        ]);
      });
    });

    describe("given reissue access token", () => {
      it("should return a new Access token and 200 status", async () => {
        const user = await UserService.createUser(userInput);

        const session = await SessionService.createSession(
          user._id,
          "PostmanRuntime/x.x.x"
        );

        const refreshJwt = signJwt(
          { ...user, session: session._id },
          "refreshTokenPrivateKey"
        );

        const reIssuedJwt = await SessionService.reIssueAccessToken({
          refreshToken: refreshJwt,
        });

        const { statusCode, body } = await supertest(app)
          .get("/api/sessions")
          .set("Authorization", `Bearer ${reIssuedJwt}`);

        expect(statusCode).toBe(200);
      });
    });

    describe("given invalid refresh token", () => {
      it("should return false", async () => {
        const refreshJwt = signJwt(userPayload, "refreshTokenPrivateKey");

        const reIssuedJwt = await SessionService.reIssueAccessToken({
          refreshToken: refreshJwt,
        });

        expect(reIssuedJwt).toBe(false);
      });
    });

    describe("given logout session", () => {
      it("should return false", async () => {
        const user = await UserService.createUser(userInput);

        const session = await SessionService.createSession(
          user._id,
          "PostmanRuntime/x.x.x"
        );

        await SessionService.updateSession(
          { _id: session._id },
          { valid: false }
        );

        const refreshJwt = signJwt(
          { ...user, session: session._id },
          "refreshTokenPrivateKey"
        );

        const reIssuedJwt = await SessionService.reIssueAccessToken({
          refreshToken: refreshJwt,
        });

        expect(reIssuedJwt).toBe(false);
      });
    });
  });
});
