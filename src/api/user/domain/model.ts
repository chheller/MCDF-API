import { object, string } from "joi";

export interface IUser {
  id: string;
  username: string;
  roles: string[];
}

export interface INewUserDetails {
  username: string;
  password: string;
}

export const signupSchema = object().keys({
  username: string().required(),
  password: string().required()
});
