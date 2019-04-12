import { IUser, INewUserDetails } from '../domain/model';
import { Response, ErrorResponse } from '../../../global/interfaces';

export interface IAuthInfrastructure {
  generateRefreshToken(userId: string): Promise<Response<string>>;
  generateClaimToken(refreshToken: string): Promise<Response<string>>;
  createNewUser(user: INewUserDetails): Promise<Response<IUser, INewUserDetails>>;
}

export class AuthService {
  constructor(private infrastructure: IAuthInfrastructure) {}

  async generateRefreshToken(userId: string): Promise<Response<string>> {
    return new ErrorResponse(500, userId, 'not_implemented');
  }

  async generateClaimToken(refreshToken: string): Promise<Response<string>> {
    return new ErrorResponse(500, refreshToken, 'not_implemented');
  }

  async createNewUser(user: INewUserDetails): Promise<Response<IUser, INewUserDetails>> {
    return new ErrorResponse(500, user, 'not_implemented');
  }
}
