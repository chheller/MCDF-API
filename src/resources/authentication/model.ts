import { Schema, model, Document } from "mongoose";
import { hash, compare } from "bcrypt";
import { createJWToken } from "./utils";
import {
  UnauthorizedAccessError,
  NotFoundError,
  ApiError
} from "../../global/errors";
import * as v4 from "uuid/v4";

const authSchema = new Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  id: String
});

export interface AuthDocument extends Document {
  username: string;
  email: string;
  password: string;
  role: string;
  id: string;
}

export const AuthModel = model("auth", authSchema);

export interface IAuthSvc {
  login(user: IUser): Promise<string>;
  createNewUser(user: INewUserDetails): Promise<Document>;
}

export interface IUser {
  email: string;
  username: string;
  id?: string;
  password: string;
}

export interface INewUserDetails {
  email: string;
  username: string;
  password: string;
}
class AuthSvc implements IAuthSvc {
  constructor() {}

  public async login({ email, username, password }: IUser): Promise<string> {
    const user = (await AuthModel.findOne(
      (email && { email }) || { username }
    )) as AuthDocument;
    if (!user) throw new NotFoundError(`User not found`);
    const isAuthorized = compare(password, user.password);

    if (isAuthorized) {
      const token = (await createJWToken({
        payload: { userId: user.id, role: user.role }
      })) as string;
      return token;
    } else {
      throw new UnauthorizedAccessError("Invalid credentials");
    }
  }

  public async createNewUser({
    username,
    email,
    password
  }: IUser): Promise<Document> {
    let unique = (await AuthModel.count({ email })) === 0;
    if (!unique) {
      throw new ApiError({
        statusCode: 409,
        error: {
          name: "user_exists",
          message: "User with this email already exists"
        }
      });
    }

    password = await hash(password, 15);
    const newAuthorizedUser = new AuthModel({
      username,
      email,
      password,
      id: v4()
    });
    return await newAuthorizedUser.save();
  }
}

export default new AuthSvc() as IAuthSvc;
