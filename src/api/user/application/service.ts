import { Response, NotImplementedResponse } from "../../../global/interfaces";
import { IUser, INewUserDetails } from "../domain/model";
import { AllUsersMongo } from "../repository/allUsersMongo";

export interface AllUsersService {
  createNewUser(
    user: INewUserDetails
  ): Promise<Response<IUser, INewUserDetails>>;
}

export class UsersService {
  constructor(private allUsersService = new AllUsersMongo()) {}

  async createNewUser(
    user: INewUserDetails
  ): Promise<Response<IUser, INewUserDetails>> {
    return new NotImplementedResponse();
  }
}
