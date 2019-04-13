import { compare, hash } from "bcrypt";
import { Collection, Db } from "mongodb";
import { v4 } from "uuid";
import environment from "../../../core/config/environment";
import {
  ErrorResponse,
  NotFoundResponse,
  Response,
  ServiceResponse,
  SuccessResponse,
  UnauthorizedResponse
} from "../../../global/interfaces";
import { connectToMongo, getCollection } from "../../../global/mongodb-utils";
import { createJWToken } from "../../../global/utils";
import { INewUserDetails, IUser } from "../../user/domain/model";
import { IAuthInfrastructure } from "../application/service";
import { IUserCredentials, IUserWithAuth } from "../domain/model";
import { IUserAuthn } from "./model";

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
  ): Promise<Response<IUser, null>> {
    try {
      const { username, password } = userCredentials;

      const authUser = await this.authUsersCollection.findOne({ username });
      if (!authUser) return new NotFoundResponse(null, 404, "User not found");

      const isAuthorized = await compare(password, authUser.password);

      if (isAuthorized) {
        const { username, roles, id } = authUser;
        return new SuccessResponse({ username, roles, id } as IUser);
      } else {
        return new UnauthorizedResponse(null);
      }
    } catch (err) {
      return new ErrorResponse(null);
    }
  }

  public async generateClaimToken(
    refreshToken: string
  ): Promise<ServiceResponse<string>> {
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
      return new ErrorResponse(err);
    }
  }

  public async saveRefreshTokenToUser(
    userId: string,
    token: string
  ): Promise<ServiceResponse<string>> {
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
      return new ErrorResponse(userId);
    }
  }
  async createNewUser(newUser: INewUserDetails): Promise<Response<IUser, {}>> {
    const { username, password } = newUser;
    let unique = await this.authUsersCollection.countDocuments({
      username: newUser.username
    });
    if (unique > 0) {
      return new ErrorResponse({}, 409, "Username already exists");
    }

    const passwordHash: string = await hash(password, 15);
    const newUserAccount = {
      username,
      roles: [""],
      id: v4()
    };
    const newAuthorizedUser = {
      ...newUserAccount,
      refreshTokens: [""],
      password: passwordHash
    };

    const mongoResponse = await this.authUsersCollection.insertOne(
      newAuthorizedUser
    );
    if (mongoResponse.result.ok) {
      return new SuccessResponse(newUserAccount);
    } else {
      return new ErrorResponse({});
    }
  }
}
