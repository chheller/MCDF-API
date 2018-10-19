import * as express from 'express';
import catRoutes from './cats.routes';
import authRoutes from './auth.routes';
const router = express.Router();

router.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.use(catRoutes);
router.use(authRoutes);

export default router;
