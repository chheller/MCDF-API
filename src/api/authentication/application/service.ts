import { randomBytes } from 'crypto';
import { Response, ServiceResponse, ResponseTypes } from '../../../global/interfaces';
import { IUser, INewUserDetails } from '../../user/domain/model';
import { IUserCredentials } from '../domain/model';
import { AllAuthUsers } from '../infrastructure/repository';
import { IUserAuthn } from '../infrastructure/model';

export interface IAuthInfrastructure {
  saveRefreshTokenToUser(userId: string, token: string): Promise<ServiceResponse<string>>;
  generateClaimToken(user: IUserAuthn): Promise<ServiceResponse<string>>;
  findUserByRefreshToken(refreshToken: string): Promise<Response<IUserAuthn, string>>;
  authenticateUser(userCredentials: IUserCredentials): Promise<Response<IUser, {}>>;
  createNewUser(user: INewUserDetails): Promise<Response<IUser, {}>>;
}

export class AuthService {
  constructor(private allAuthUsers = new AllAuthUsers()) {}

  async generateClaimToken(refreshToken: string): Promise<ServiceResponse<string>> {
    const userResponse = await this.allAuthUsers.findUserByRefreshToken(refreshToken);
    if (userResponse.type === ResponseTypes.success) {
      return await this.allAuthUsers.generateClaimToken(userResponse.payload);
    } else {
      return userResponse;
    }
  }

  async findUserByRefreshToken(refreshToken: string): Promise<Response<IUserAuthn, string>> {
    return this.allAuthUsers.findUserByRefreshToken(refreshToken);
  }

  // async getRefreshTokens(userId)
  async authenticateUser(userCredentials: IUserCredentials): Promise<Response<IUser, {}>> {
    return await this.allAuthUsers.authenticateUser(userCredentials);
  }
  async saveRefreshTokenToUser(userId: string): Promise<ServiceResponse<string>> {
    const refreshToken = this.generateRefreshToken();
    return await this.allAuthUsers.saveRefreshTokenToUser(userId, refreshToken);
  }

  async createNewUser(newUser: INewUserDetails): Promise<Response<IUser, {}>> {
    return this.allAuthUsers.createNewUser(newUser);
  }

  private generateRefreshToken(): string {
    return randomBytes(32).toString('hex');
  }
}
