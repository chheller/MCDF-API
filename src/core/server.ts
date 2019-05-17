import { json, urlencoded } from "body-parser";
import * as cookieParser from "cookie-parser";
import * as cors from "cors";
import * as express from "express";
import { Application } from "express";
import { readFile } from "fs";
import { createServer, Server } from "http";
import { promisify } from "util";
import { AllAuthUsers } from "../api/authentication/infrastructure/repository";
import { logger } from "../global/logger";
import { Environment } from "./config/environment";
import { handleResponse, responseTime } from "./middleware";
import routes from "./router";
import * as compression from "compression";

// DB setup, move

export default class MCDFServer {
  private server: Server;
  private app: Application;
  constructor(private env: Environment) {
    this.app = this.app || express();
  }
  public async init() {
    try {
      await Promise.all([AllAuthUsers.setup()]);
      await this.composeMiddleware();
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
    this.app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
    this.app.use("/api", await routes());
    this.app.use(handleResponse);
  }

  public async start(options: {
    port: number;
    hostname?: string;
    backlog?: number;
  }) {
    const { port, hostname, backlog } = options;
    try {
      this.server = createServer(this.app);
      this.server.listen(port, hostname, backlog, () => {
        const address = this.server.address() as any;
        logger.info(`listening at ${address.address}:${address.port}`);
      });
    } catch (err) {
      logger.error("[server] ", err);
    }
  }
  public async stop() {
    this.server.close();
  }
}
