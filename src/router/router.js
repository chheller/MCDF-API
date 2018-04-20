const router = require('express').Router();
const Cat = require('../models/cats/cat');
const path = require('path');
router.get('/', function(req, res) {
  res.json({ message: 'Smoke test' });
});

router.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

router.route('/cat').post(function(req, res) {
  //create a cat or something
  const imgPath =
    path.extname(req.body.path) !== '' ? req.body.path : `${req.body.path}.jpg`;
  const cat = new Cat({
    title: req.body.title,
    description: req.body.description,
    img: `http://localhost:8180/cats/${imgPath}`
  });
  cat.save(function(err, savedObj) {
    if (err) {
      return res.send(err);
    }
    return res.json({ message: `Cat created! ${savedObj}` });
  });
});

router.route('/cats').get(function(req, res) {
  Cat.find(function(err, cats) {
    if (err) {
      res.send(err);
    }
    res.json(cats);
  });
});

module.exports = router;
