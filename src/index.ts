import env from './core/config/environment';
import app from './core/app';
import Stator from './core/server';

(async () => {
  const server = new Stator(app, env);
  await server.init();
  await server.start({ port: 8081, hostname: 'localhost' });
})();
