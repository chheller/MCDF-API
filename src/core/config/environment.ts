import { homedir } from 'os';

const { env } = process;
const { MONGO_ADMIN_PASSWORD, MONGO_ADMIN_USERNAME, JWT_SECRET, MONGO_HOSTNAME } = env;

const environment: Environment = {
  MONGO_ADMIN_PASSWORD,
  MONGO_ADMIN_USERNAME,
  JWT_SECRET,
  MONGO_HOSTNAME,
  MONGO_PORT: parseInt(env.MONGO_PORT),
  SSL_CERT_PATH: env.SSL_CERT_PATH.replace('~', homedir()),
  SSL_KEY_PATH: env.SSL_KEY_PATH.replace('~', homedir())
};
export default environment;

export interface Environment {
  MONGO_PORT: number;
  MONGO_HOSTNAME: string;
  MONGO_ADMIN_PASSWORD: string;
  MONGO_ADMIN_USERNAME: string;
  JWT_SECRET: string;
  SSL_KEY_PATH: string;
  SSL_CERT_PATH: string;
}
