import mongoose from "mongoose";
import supertest from "supertest";
import createServer from "utils/server.utils";
import * as UserService from "services/user.service";
import * as SessionService from "services/session.service";
import UserModel from "models/user.model";
import { MongoMemoryServer } from "mongodb-memory-server";
import { omit } from "lodash";
import { credInput, userInput, userPayload } from "../fixtures/user.fixture";
import { signJwt } from "utils/jwt.utils";

const app = createServer();

describe("user", () => {
  beforeEach(async () => {
    const mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri());
  });

  afterEach(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  // user registration
  describe("user registration", () => {
    describe("given the username and password are valid", () => {
      it("should return a 201 status and user payload", async () => {
        const { statusCode, body } = await supertest(app)
          .post("/api/users")
          .send(userInput);

        expect(statusCode).toBe(201);

        expect(body).toEqual({
          __v: 0,
          _id: expect.any(String),
          createdAt: expect.any(String),
          email: "test@example.com",
          name: "Test User",
          updatedAt: expect.any(String),
        });
      });
    });

    describe("given the passwords do not match", () => {
      it("should return a 400", async () => {
        const createUserServiceMock = jest
          .spyOn(UserService, "createUser")
          // @ts-ignore
          .mockReturnValueOnce(userPayload);

        const { statusCode } = await supertest(app)
          .post("/api/users")
          .send({ ...userInput, passwordConfirmation: "doesnotmatch" });

        expect(statusCode).toBe(400);

        expect(createUserServiceMock).not.toHaveBeenCalled();
      });
    });

    describe("given the user service throws", () => {
      it("should return a 409 error", async () => {
        await UserService.createUser(userInput);

        const { statusCode, body } = await supertest(app)
          .post("/api/users")
          .send(userInput);

        expect(statusCode).toBe(409);
      });
    });
  });

  describe("user validation", () => {
    describe("given the user password", () => {
      describe("given the user password when create user", () => {
        it("should execute next when password is modified", async () => {
          const user = new UserModel();
          const mNext = jest.fn();
          const mContext = {
            isModified: jest.fn(),
          };
          mContext.isModified.mockReturnValueOnce(false);
          await user.hashedPassword.call(mContext, mNext);
          expect(mContext.isModified).toBeCalledWith("password");
          expect(mNext).toBeCalledTimes(1);
        });

        it("should hashed", async () => {
          const user = new UserModel();
          const mNext = jest.fn();
          const mContext = {
            isModified: jest.fn(),
            password: "Asdf123$",
          };
          mContext.isModified.mockReturnValueOnce(true);
          await user.hashedPassword.call(mContext, mNext);
          expect(mContext.isModified).toBeCalledWith("password");
          expect(mNext).toBeCalledTimes(1);
          expect(mContext.password).not.toBe("Asdf123$");
        });

        describe("given user password validate", () => {
          describe("given valid password", () => {
            it("should return user object without password", async () => {
              const user = await UserService.createUser(userInput);

              const validatedUser: any = await UserService.validatePassword(
                credInput
              );

              expect(user).toEqual(validatedUser);
              expect(validatedUser.password).toBeUndefined();
            });
          });

          describe("given invalid email", () => {
            it("should return false", async () => {
              await UserService.createUser(userInput);

              const validatedUser: any = await UserService.validatePassword({
                ...credInput,
                email: "invalidemail@gmail.com",
              });

              expect(validatedUser).toEqual(false);
            });
          });

          describe("given invalid password", () => {
            it("should return false", async () => {
              await UserService.createUser(userInput);

              const validatedUser: any = await UserService.validatePassword({
                ...credInput,
                password: "invalidpassword",
              });

              expect(validatedUser).toEqual(false);
            });
          });
        });
      });

      describe("given the user password when validate user", () => {
        it("should return true when password is correct", async () => {
          const user = new UserModel();
          const mPassword = "Asdf123$";
          const mContext = {
            password:
              "$2b$10$1GkY9fj/WThgBAStqpk0UeZwT/TRwClM1NM9HSgdXFbf/LJxCmURO",
          };
          const isValid = await user.comparePassword.call(mContext, mPassword);
          expect(isValid).toBe(true);
        });

        it("should return false when password is incorrect", async () => {
          const user = new UserModel();
          const mPassword = "Asdf123";
          const mContext = {
            password:
              "$2b$10$1GkY9fj/WThgBAStqpk0UeZwT/TRwClM1NM9HSgdXFbf/LJxCmURO",
          };
          const isValid = await user.comparePassword.call(mContext, mPassword);
          expect(isValid).toBe(false);
        });
      });
    });
  });

  describe("find user", () => {
    describe("given find user", () => {
      it("should return user", async () => {
        const user = await UserService.createUser(userInput);

        const session = await SessionService.createSession(user._id);

        const sessionUser: any = await UserService.findUser({
          _id: session.user,
        });

        expect(omit(sessionUser, "password")).toEqual(user);
      });
    });
  });

  describe("get auth user", () => {
    it("should return a 200 status and user payload", async () => {
      const jwt = signJwt(userPayload, "accessTokenPrivateKey");

      const { statusCode, body } = await supertest(app)
        .get("/api/auth")
        .set("Authorization", `Bearer ${jwt}`);

      expect(statusCode).toBe(200);

      expect(body).toEqual({
        _id: expect.any(String),
        email: "test@example.com",
        name: "Test User",
        iat: expect.any(Number),
      });
    });
  });
});
