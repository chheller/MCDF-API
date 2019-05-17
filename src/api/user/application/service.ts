import { AllUsersMongo } from "../repository/allUsersMongo";

export interface AllUsersService {}

export class UsersService {
  constructor(private allUsersService = new AllUsersMongo()) {}
}
