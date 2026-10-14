import { z } from "zod";

const email = z.email("Enter a valid email");

const bodyRegister = z
  .object({
    name: z.string().trim().min(2).max(60).optional(),
    fullName: z.string().trim().min(2).max(60).optional(),
    email,
    password: z.string().min(8, "Password must be at least 8 characters").max(128),
  })
  .refine((value) => value.name || value.fullName, {
    message: "Name is required",
    path: ["fullName"],
  });

const bodyLogin = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

const bodyGoogle = z.object({
  credential: z.string().min(1, "Missing Google credential"),
});

export const authValidators = {
  register: { body: bodyRegister },
  login: { body: bodyLogin },
  google: { body: bodyGoogle },
};
