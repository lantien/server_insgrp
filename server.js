const express = require('express');
const bodyParser = require('body-parser');

const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');

const jwt = require('jsonwebtoken');

// create express app
const app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

mongoose.Promise = global.Promise;

var options = {
		keepAlive: 120
		};

// Connecting to the database
mongoose.connect(dbConfig.url, options)
.then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...');
    process.exit();
});

// parse requests of content-type - application/json
app.use(bodyParser.json())

// define a simple route
app.get('/', (req, res) => {
    res.json({"message": "Welcome to instaGroupe."});
});

var meRoutes = express.Router();
meRoutes.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, 'shhhhh', function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({
        success: false,
        message: 'No token provided.'
    });

  }
});
// apply the routes to our application with the prefix /api
app.use('/me', meRoutes);

require('./app/routes/user.route.js')(app);
require('./app/routes/album.route.js')(app);

// listen for requests
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});
