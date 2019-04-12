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

const signupSchema = object().keys({
  username: string().required(),
  email: string()
    .email()
    .required(),
  password: string().required()
});
