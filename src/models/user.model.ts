import bcrypt from "bcrypt";
import { SALT_WORK_FACTOR } from "config";
import mongoose from "mongoose";

export interface UserInput {
  email: string;
  name: string;
  password: string;
}

export interface UserDocument extends UserInput, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
  hashedPassword(next: any): Promise<Boolean>;
  comparePassword(candidatePassword: string): Promise<Boolean>;
}

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

userSchema.methods.hashedPassword = async function (next: any): Promise<any> {
  let user = this as UserDocument;

  if (!user.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
  const hash = await bcrypt.hashSync(user.password, salt);
  user.password = hash;

  return next();
};

userSchema.pre("save", userSchema.methods.hashedPassword);

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const user = this as UserDocument;
  return bcrypt.compare(candidatePassword, user.password);
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;
