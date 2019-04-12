import { compare } from "bcrypt";
import { Collection, Db } from "mongodb";
import environment from "../../../core/config/environment";
import {
  ErrorResponse,
  NotFoundResponse,
  Response,
  SuccessResponse
} from "../../../global/interfaces";
import { connectToMongo, getCollection } from "../../../global/mongodb-utils";
import { createJWToken } from "../../../global/utils";
import { IUser } from "../../user/domain/model";
import { IAuthInfrastructure } from "../application/service";
import { IUserCredentials, IUserWithAuth } from "../domain/model";
import { IUserAuthn } from "./model";
import { logger } from "../../../global/logger";

export class AllAuthUsers implements IAuthInfrastructure {
  private static db: Db;
  private static collection: Collection<IUserAuthn>;

  constructor(private authUsersCollection = AllAuthUsers.collection) {}

  public static async setup(usersDb = environment.USERS_DB_URI) {
    AllAuthUsers.db = await connectToMongo(usersDb);
    // TODO: Refactor into envvar
    AllAuthUsers.collection = getCollection(AllAuthUsers.db, "auths");
  }

  public async authenticateUser(
    userCredentials: IUserCredentials
  ): Promise<Response<IUser, {}>> {
    try {
      const { username, password } = userCredentials;

      const authUser = await this.authUsersCollection.findOne({ username });
      const isAuthorized = await compare(password, authUser.password);

      if (isAuthorized) {
        const { username, roles, id } = authUser;
        return new SuccessResponse({ username, roles, id } as IUser);
      } else {
        return new NotFoundResponse();
      }
    } catch (err) {
      logger.error(err);
      return new ErrorResponse();
    }
  }

  public async generateClaimToken(
    refreshToken: string
  ): Promise<Response<string>> {
    try {
      const mongoResponse = await this.authUsersCollection.findOne({
        refreshTokens: refreshToken
      });
      const claimToken = await createJWToken<IUserWithAuth>({
        id: mongoResponse.id,
        roles: mongoResponse.roles
      });

      return new SuccessResponse(claimToken);
    } catch (err) {
      // TODO: Handle errors like 'token not found' or errors creating the JWT
      logger.error(err);
      return new ErrorResponse(err);
    }
  }

  public async saveRefreshTokenToUser(
    userId: string,
    token: string
  ): Promise<Response<string>> {
    try {
      const mongoResponse = await this.authUsersCollection.findOneAndUpdate(
        { id: userId },
        { $push: { refreshTokens: token } }
      );
      if (mongoResponse.ok) {
        return new SuccessResponse(token);
      }
    } catch (err) {
      // TODO: Handle more specific errors
      logger.error(err);
      return new ErrorResponse(userId);
    }
  }
}
