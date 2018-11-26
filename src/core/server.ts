import { connect, connection } from 'mongoose';
import { Application } from 'express';
import { Server, createServer } from 'https';
import * as express from 'express';
import { Environment } from './config/environment';
import { readFile } from 'fs';
import { promisify } from 'util';
import { logger } from './logger';
import { handleResponse } from './middleware';
import { json, urlencoded } from 'body-parser';
import { join } from 'path';
import { NextFunction } from 'connect';
import routes from './router';
const readFileAsync = promisify(readFile);

// DB setup, move

export default class Stator {
  private server: Server;
  private app: Application;
  constructor(private env: Environment) {
    this.app = this.app || express();
  }
  public async init() {
    await this.initDB();
    await this.composeMiddleware();
  }

  private initLogger() {}

  private async composeMiddleware() {
    this.app.use(urlencoded({ extended: true }));
    this.app.use(json());
    this.app.use('/cats', express.static(join(__dirname, '../cats')));
    this.app.use('/api', await routes());
    this.app.use(handleResponse);
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
