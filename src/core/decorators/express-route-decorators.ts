const PREFIX = '$$route_';

function destruct(args: any[]) {
  const hasPath = typeof args[0] === 'string';
  const path = hasPath ? args[0] : '';
  const middleware = hasPath ? args.slice(1) : args;

  if (middleware.some(m => typeof m !== 'function')) {
    throw new Error('Middleware must be function');
  }

  return [path, middleware];
}

// @route(method, path: optional, ...middleware: optional)
export function route(method: string, ...args: any[]) {
  if (typeof method !== 'string') {
    throw new Error('The first argument must be an HTTP method');
  }

  const [path, middleware] = destruct(args);

  return function(target: any, name: string) {
    target[`${PREFIX}${name}`] = { method, path, middleware };
  };
}

// @[method](...args) === @route(method, ...args)
export const head = route.bind(null, 'head');
export const options = route.bind(null, 'options');
export const get = route.bind(null, 'get');
export const post = route.bind(null, 'post');
export const put = route.bind(null, 'put');
export const patch = route.bind(null, 'patch');
export const del = route.bind(null, 'delete');
export const all = route.bind(null, 'all');

// @controller(path: optional, ...middleware: optional)
export function controller(...args: any[]) {
  const [ctrlPath, ctrlMiddleware] = destruct(args);

  return function(target: any) {
    const proto = target.prototype;
    proto.$routes = Object.getOwnPropertyNames(proto)
      .filter(prop => prop.indexOf(PREFIX) === 0)
      .map(prop => {
        const { method, path, middleware: actionMiddleware } = proto[prop];
        const url = `${ctrlPath}${path}`;
        const middleware = ctrlMiddleware.concat(actionMiddleware);
        const fnName = prop.substring(PREFIX.length);
        return { method: method === 'del' ? 'delete' : method, url, middleware, fnName };
      });
  };
}
