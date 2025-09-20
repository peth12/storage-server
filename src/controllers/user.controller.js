import Joi from "joi";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { createUser, listUsers } from "../services/user.service.js";

const userSchema = Joi.object({
  appId: Joi.string().optional(),
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid("admin", "staff").default("staff")
});

export const UserController = {
  create: asyncHandler(async (req, res) => {
    const { error, value } = userSchema.validate(req.body);
    if (error) throw Object.assign(new Error(error.message), { status: 400 });
    const user = await createUser(value);
    res.status(201).json(user);
  }),
  list: asyncHandler(async (req, res) => {
    const data = await listUsers(req.query);
    res.json(data);
  })
};
