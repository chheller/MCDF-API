import { connect, connection } from "mongoose";
import { Application } from "express";
import { Server, createServer } from "http";
import * as express from "express";
import { Environment } from "./config/environment";
import { readFile } from "fs";
import { promisify } from "util";
import { logger } from "./logger";
import { handleResponse } from "./middleware";
import { json, urlencoded } from "body-parser";
import * as cors from "cors";

import routes from "./router";
const readFileAsync = promisify(readFile);

// DB setup, move

export default class MCDFServer {
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
    this.app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
    this.app.use("/api", await routes());
    this.app.use(handleResponse);
  }

  private async initDB() {
    try {
      const mongoConnectionString = `mongodb://${
        this.env.MONGO_ADMIN_USERNAME
      }${
        this.env.MONGO_ADMIN_PASSWORD && this.env.MONGO_ADMIN_USERNAME
          ? `:${this.env.MONGO_ADMIN_PASSWORD}@${this.env.MONGO_HOSTNAME}`
          : ``
      }:${this.env.MONGO_PORT}/rotor`;
      console.log({ mongoConnectionString });
      await connect(
        mongoConnectionString,
        { useNewUrlParser: true }
      );
    } catch (err) {
      console.error(err);
    }

    connection.on("open", function() {});
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
        console.log(`listening at ${address.address}:${address.port}`);
      });
    } catch (err) {
      console.error("[server] ", err);
    }
  }
  public async stop() {
    this.server.close();
  }
}
