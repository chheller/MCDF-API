import { urlencoded, json } from 'body-parser';
import { join } from 'path';
import * as express from 'express';
import { Application } from 'express';

function App(app: Application) {
  app.use(urlencoded({ extended: true }));
  app.use(json());
  app.use('/cats', express.static(join(__dirname, '../cats')));
  return app;
}

export default App(express());
