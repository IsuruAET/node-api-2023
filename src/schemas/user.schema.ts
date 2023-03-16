import { object, string, TypeOf } from "zod";

export const createUserSchema = object({
  body: object({
    name: string({
      required_error: "Name is required",
    }),
    password: string({
      required_error: "Password is required",
    }).regex(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$"
      ),
      "Password must contain at least one digit from 1 to 9, one lowercase letter, one uppercase letter, one special character and it must be 8-16 characters long."
    ),
    passwordConfirmation: string({
      required_error: "Password confirmation is required",
    }),
    email: string({ required_error: "Email is required" }).email(
      "Not a valid email"
    ),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: "Password do not match",
    path: ["passwordConfirmation"],
  }),
});

export type CreateUserInput = TypeOf<typeof createUserSchema>;
