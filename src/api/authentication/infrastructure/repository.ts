import { IAuthInfrastructure } from '../application/service';

export class AuthImplementation implements IAuthInfrastructure {
  constructor() {}

  public async login({
    email,
    username,
    password
  }: IUser): Promise<{ claimToken: string; refreshToken: string }> {
    const user = (await AuthModel.findOne((email && { email }) || { username })) as AuthDocument;
    if (!user) throw new NotFoundError(`User not found`);
    const isAuthorized = compare(password, user.password);

    if (isAuthorized) {
      const claimToken = await createJWToken<{ userId: string; role: string }>({
        payload: { userId: user.id, role: user.role }
      });
      const refreshToken = await createJWToken<{
        userId: string;
        role: string;
      }>({
        payload: { userId: user.id, role: user.role }
      });
      return { claimToken, refreshToken };
    } else {
      throw new UnauthorizedAccessError('Invalid credentials');
    }
  }
  public async refresh(refreshToken: string): Promise<string> {
    try {
      const { userId } = await verifyJWToken<{ userId: string }>(refreshToken);
      const claimToken = await createJWToken<{ userId: string }>({
        payload: { userId }
      });
      return claimToken;
    } catch (err) {
      console.error(err);
    }
  }
  public async createNewUser({ username, email, password }: IUser): Promise<Document> {
    let unique = (await AuthModel.count({ email })) === 0;
    if (!unique) {
      throw new ApiError({
        statusCode: 409,
        error: {
          name: 'user_exists',
          message: 'User with this email already exists'
        }
      });
    }

    password = await hash(password, 15);
    const newAuthorizedUser = new AuthModel({
      username,
      email,
      password,
      id: v4()
    });
    return await newAuthorizedUser.save();
  }
}

export default new AuthSvc() as IAuthSvc;
