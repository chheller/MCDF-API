import { Router } from "express";
import { AuthController } from "../api/authentication/interface/controller";
export default async function mapRoutes(router = Router()) {
  new AuthController(router);
  return router;
}
