const express = require('express'),
  app = express(),
  bodyParser = require('body-parser');
path = require('path');

app.use(bodyParser.urlencoded({ extend: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 8180;
const router = require('./router/router.js');

app.use('/api', router);
app.use('/cats', express.static(path.join(__dirname, '../cats')));
app.listen(port);
console.log(`Listening on ${port}`);

// DB setup, move

const mongoose = require('mongoose');
mongoose
  .connect(
    `mongodb://${process.env['MONGO_ADMIN_USERNAME']}:${
      process.env['MONGO_ADMIN_PASSWORD']
    }@ds251799.mlab.com:51799/rotor`
  )
  .catch(err => console.error(err));

mongoose.connection.on('open', function() {});
