import { object, string, validate } from "joi";
import { IUser } from "../../user/domain/model";
export interface IUserCredentials {
  username: string;
  password: string;
}

type IUserAuth = "id" | "roles";

export type IUserWithAuth = Pick<IUser, IUserAuth>;

export const loginSchema = object()
  .keys({
    username: string().required(),
    password: string().required()
  })
  .or("username", "email");
