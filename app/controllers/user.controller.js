const User = require('../models/user.model.js');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const jwt = require('jsonwebtoken');

exports.create = (req, res) => {

    // Validate request
      if(!req.body.firstname || !req.body.lastname ||
       !req.body.email || !req.body.username || !req.body.password) {
          return res.status(400).send({
              message: "Pas tout les champs recu"
          });
      }

    //Hash password
      bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        // Create a Scanner
          const user = new User({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email : req.body.email,
            username: req.body.username,
            password: hash,
            albumList: []
          });

          // Save Scanner in the database
            user.save()
            .then(data => {
                res.send(data);
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while creating the user."
                });
            });
      });

};

exports.login = (req, res) => {

  // Validate request
    if(!req.body.login || !req.body.password) {
        return res.status(400).send({
            message: "Pas tout les champs recu"
        });
    }

    User.findOne({ $or:[ {'email':req.body.login}, {'username':req.body.login} ]})
    .then(data => {
      if(!data) {
        return res.status(404).send({
            message: "Il semble de que cette utilisateur n'existe pas"
        });
      }

      bcrypt.compare( req.body.password, data.password, function(err, isOk) {
          var dataForToken = {
            isGoodPassword : isOk,
            userID: data._id
          };
          var token = jwt.sign(dataForToken, 'shhhhh');

          res.send(token);
      });
    })
    .catch(err => {
      return res.status(500).send({
        message: "Une erreur est survenue"
      });
    });

};

exports.getMyProfil = (req, res) => {

  User.find({'_id' : req.decoded.userID})
  .then(data => {
    if(!data) {
      return res.status(404).send({
          message: "Il semble de que cette utilisateur n'existe pas"
      });
    }

    res.send(data);
  })
  .catch(err => {
    return res.status(500).send({
      message: "Une erreur est survenue"
    });
  });

};
