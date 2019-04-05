import { Router } from "express";
import { AuthController } from "../resources/authentication/controller";
export default async function mapRoutes(router = Router()) {
  new AuthController(router);
  return router;
}
