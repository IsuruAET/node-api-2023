import mongoose from "mongoose";
import { userId } from "./user.fixture";

export const sessionPayload = {
  _id: new mongoose.Types.ObjectId().toString(),
  user: userId,
  valid: true,
  userAgent: "PostmanRuntime/x.x.x",
  createdAt: new Date("2000-09-30T13:31:07.674Z"),
  updatedAt: new Date("2000-09-30T13:31:07.674Z"),
  __v: 0,
};

export const deleteSessionPayload = {
  accessToken: null,
  refreshToken: null,
};
