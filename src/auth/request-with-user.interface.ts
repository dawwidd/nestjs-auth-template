import { Request } from "express";
import { User } from "src/user/user.model";

export default interface RequestWithUser extends Request {
  user: User
}