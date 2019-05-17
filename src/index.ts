import env from './core/config/environment';
import Server from './core/server';
import { logger } from './global/logger';

process.on('unhandledRejection', (reason, listener) => {
  logger.crit('Unhandled promise rejection ' + reason);
});

(async () => {
  const server = new Server(env);
  await server.init();
  await server.start({ port: 5000 });
})();
