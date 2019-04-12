import { IUser } from "../../user/domain/model";

export interface IUserAuthn extends IUser {
  password: string;
  refreshTokens: string[];
  id: string;
}
