import { Router } from 'express';

/**
 * Base controller class for express decorators https://github.com/buunguyen/route-decorators
 */
export class BaseController {
  public router: Router;
  private $routes: any;
  constructor(router?: Router) {
    this.router = router || Router();
    for (let { method, url, middleware, fnName } of this.$routes) {
      let controllerMethod = (<any>this)[fnName].bind(this);
      (<any>this.router)[method](url, ...middleware, controllerMethod);
    }
  }
}
