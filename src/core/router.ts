import { Router } from 'express';
import { AuthController } from '../api/authentication/interface/controller';
import { AdminController } from '../api/administration/interface/controller.administration';
export default async function mapRoutes(router = Router()) {
  new AuthController(router);
  new AdminController(router);
  return router;
}
