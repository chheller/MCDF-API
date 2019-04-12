export interface IUser {
  email: string;
  username: string;
  id: string;
  password: string;
  refreshTokens: string[];
}

export interface INewUserDetails {
  email: string;
  username: string;
  password: string;
}
