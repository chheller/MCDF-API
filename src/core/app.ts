import { urlencoded, json } from 'body-parser';
import { join } from 'path';
import * as express from 'express';
import { Application } from 'express';
import { logger } from './logger';
import { NextFunction } from 'connect';

function App(app: Application) {
  app.use(urlencoded({ extended: true }));

  app.use(json());
  app.use('/cats', express.static(join(__dirname, '../cats')));
  app.use((err: Error, req: express.Request, res: express.Response, next: NextFunction) => {
    logger.crit(err.stack);
    res.status(500).send('Internal server error');
  });
  return app;
}

export default App(express());
