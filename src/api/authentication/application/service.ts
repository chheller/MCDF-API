import { NotImplementedResponse, Response } from "../../../global/interfaces";
import { IUser } from "../../user/domain/model";
import { IUserCredentials } from "../domain/model";
import { AllAuthUsers } from "../infrastructure/repository";
import { randomBytes } from "crypto";

export interface IAuthInfrastructure {
  saveRefreshTokenToUser(
    userId: string,
    token: string
  ): Promise<Response<string>>;
  generateClaimToken(refreshToken: string): Promise<Response<string>>;
  authenticateUser(
    userCredentials: IUserCredentials
  ): Promise<Response<IUser, {}>>;
}

export class AuthService {
  constructor(private allAuthUsers = new AllAuthUsers()) {}

  async generateClaimToken(refreshToken: string): Promise<Response<string>> {
    return await this.allAuthUsers.generateClaimToken(refreshToken);
  }

  async authenticateUser(
    userCredentials: IUserCredentials
  ): Promise<Response<IUser, {}>> {
    return await this.allAuthUsers.authenticateUser(userCredentials);
  }
  async saveRefreshTokenToUser(userId: string): Promise<Response<string>> {
    const refreshToken = this.generateRefreshToken();
    return await this.allAuthUsers.saveRefreshTokenToUser(userId, refreshToken);
  }
  private generateRefreshToken(): string {
    return randomBytes(128).toString("hex");
  }
}
