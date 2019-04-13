import { NotImplementedResponse, Response } from "../../../global/interfaces";
import { INewUserDetails, IUser } from "../domain/model";

export class AllUsersMongo {
  constructor() {}

  async createNewUser(
    newUser: INewUserDetails
  ): Promise<Response<IUser, INewUserDetails>> {
    return new NotImplementedResponse();
  }
  // public async createNewUser({
  //   username,
  //   email,
  //   password
  // }: IUser): Promise<Document> {
  //   let unique = (await AuthModel.count({ email })) === 0;
  //   if (!unique) {
  //     throw new ApiError({
  //       statusCode: 409,
  //       error: {
  //         name: "user_exists",
  //         message: "User with this email already exists"
  //       }
  //     });
  //   }

  //   password = await hash(password, 15);
  //   const newAuthorizedUser = new AuthModel({
  //     username,
  //     email,
  //     password,
  //     id: v4()
  //   });
  //   return await newAuthorizedUser.save();
  // }
}
