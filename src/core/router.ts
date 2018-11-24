import { Router } from 'express';
import { AuthController } from '../resources/authorization/controller';
import { CatController } from '../resources/cats/controller';
export default async function mapRoutes(router = Router()) {
  new AuthController(router);
  new CatController(router);
  return router;
}
