import * as express from 'express';
const router = express.Router();

router.post('/login', (req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log(req);
});

export default router;
