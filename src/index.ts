import env from './core/config/environment';
import Stator from './core/server';
import { logger } from './core/logger';

process.on('unhandledRejection', (reason, listener) => {
  logger.crit('Unhandled promise rejection ' + reason);
});

(async () => {
  const server = new Stator(env);
  await server.init();
  await server.start({ port: 8081, hostname: 'localhost' });
})();
