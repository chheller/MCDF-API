import { connect, connection } from 'mongoose';
import { Application } from 'express';
import { Server, createServer } from 'https';
import { CoreRouter } from '../controllers';
import { Environment } from './config/environment';
import { readFile } from 'fs';
import { promisify } from 'util';
import { Middleware } from './middleware';
import { AccessControlService } from '../auth/access-control';
import Grants, { GrantDocument } from '../models/auth/access-control';
const readFileAsync = promisify(readFile);

// DB setup, move

export default class Stator {
  private server: Server;
  private accessControlService: AccessControlService;
  constructor(private app: Application, private env: Environment) {}
  public async init() {
    await this.initDB();
    // Initialize grants from database
    const grants = (await Grants.find()).map((grant: GrantDocument) => {
      const { role, resource, action, attributes, possession } = grant;
      return { role, resource, action, attributes, possession };
    });
    this.accessControlService = new AccessControlService(grants);
    this.initRoutes();
  }

  private initLogger() {}

  private initRoutes() {
    const middleware = new Middleware(this.accessControlService);
    const router = new CoreRouter(middleware);
    this.app.use('/api', router.initializeRoutes());
  }

  private async initDB() {
    try {
      await connect(
        `mongodb://${this.env.MONGO_ADMIN_USERNAME}:${this.env.MONGO_ADMIN_PASSWORD}@${
          this.env.MONGO_HOSTNAME
        }:${this.env.MONGO_PORT}/rotor`
      ).catch(err => console.error(err));
    } catch (err) {
      console.error(err);
    }

    connection.on('open', function() {});
  }

  public async start(options: { port: number; hostname?: string; backlog?: number }) {
    const { port, hostname, backlog } = options;
    try {
      const cert = (await readFileAsync(this.env.SSL_CERT_PATH)).toString();
      const key = (await readFileAsync(this.env.SSL_KEY_PATH)).toString();

      this.server = createServer(
        { cert, key, rejectUnauthorized: false, requestCert: false },
        this.app
      );
      this.server.listen(port, hostname, backlog, () => {
        const address = this.server.address() as any;
        console.log(`listening at ${address.address}:${address.port}`);
      });
    } catch (err) {
      console.error('[server] ', err);
    }
  }
  public async stop() {
    this.server.close();
  }
}
