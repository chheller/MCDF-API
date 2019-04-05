import { Router } from "express";
import { AuthController } from "../resources/authorization/controller";
export default async function mapRoutes(router = Router()) {
  new AuthController(router);
  return router;
}
