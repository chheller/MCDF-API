import * as express from 'express';
import { CatRoutes } from './cats.routes';
import authRoutes from './auth.routes';
import { IMiddleware, Middleware } from '../core/middleware';
const router = express.Router();

router.use(authRoutes);

export interface Router {
  initializeRoutes(): void;
}

export class CoreRouter implements Router {
  constructor(private middleware: IMiddleware) {}
  initializeRoutes() {
    const routes = [new CatRoutes(this.middleware)];
    routes.forEach(route => router.use(route.initializeRoutes()));
    return router;
  }
}
