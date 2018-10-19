const Cat = require('../models/cats/cat');
import { extname } from 'path';
import * as express from 'express';
const router = express.Router();

router.route('/cat').post(function(req, res) {
  //create a cat or something
  const imgPath = extname(req.body.path) !== '' ? req.body.path : `${req.body.path}.jpg`;
  const cat = new Cat({
    title: req.body.title,
    description: req.body.description,
    img: `http://localhost:8180/cats/${imgPath}`
  });
  cat.save(function(err: Error, savedObj: any) {
    if (err) {
      return res.send(err);
    }
    return res.json({ message: `Cat created! ${savedObj}` });
  });
});

router.get('/cats', function(req, res) {
  Cat.find(function(err: Error, cats: string) {
    if (err) {
      res.send(err);
    }
    res.json(cats);
  });
});

router.get('/', function(req, res) {
  res.json({ message: 'Smoke test' });
});

export default router;
