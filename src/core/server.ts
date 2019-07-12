import { json, urlencoded } from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import { Application } from 'express';
import { createServer, Server } from 'http';
import { AllAuthUsers } from '../api/authentication/infrastructure/repository';
import { logger } from '../global/logger';
import { handleResponse, responseTime } from './middleware';
import routes from './router';
import * as compression from 'compression';
import * as Environment from '../core/config/environment';
import { AdminInfrastructure } from '../api/administration/repository/repository.administration';

export default class MCDFServer {
  private server: Server;
  private app: Application;
  constructor(private env: typeof Environment) {
    this.app = this.app || express();
    process.on('exit', async (code: number) => {
      await this.teardown();
      process.exit(code);
    });
  }

  public async init() {
    try {
      await Promise.all([AllAuthUsers.setup(), AdminInfrastructure.setup()]);
      await this.composeMiddleware();
    } catch (err) {
      logger.crit(err.toString());
      process.exit(-1);
    }
  }

  public async teardown() {
    try {
      await Promise.all([AdminInfrastructure.teardown()]);
    } catch (err) {
      logger.crit(err.toString());
      process.exit(-1);
    }
  }

  private async composeMiddleware() {
    this.app.use(responseTime);
    this.app.use(compression());
    this.app.use(urlencoded({ extended: true }));
    this.app.use(json());
    this.app.use(cookieParser(this.env.COOKIE_SECRET));
    this.app.use(cors({ credentials: true, origin: this.env.CORS_HOSTS }));
    this.app.use('/api', await routes());
    this.app.use(handleResponse);
  }

  public async start() {
    const { port, hostname } = { port: this.env.SERVER_PORT, hostname: this.env.HOST_NAME };
    try {
      this.server = createServer(this.app);
      this.server.listen(port, hostname, undefined, () => {
        const address = this.server.address() as any;
        logger.info(`listening at ${address.address}:${address.port}`);
      });
    } catch (err) {
      logger.error('[server] ', err);
    }
  }
  public async stop() {
    this.server.close();
  }
}
