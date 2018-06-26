const Album = require('../models/album.model.js');
const User = require('../models/user.model.js');

const fs = require('fs');
const formidable = require('formidable');
const path = require('path');

const rimraf = require('rimraf');

exports.create = (req, res) => {

  //Validate request
    if(!req.body.name) {
      return res.status(400).send({
          message: "Pas tout les champs recu"
      });
    }

  //Create album
    const album = new Album({
      creator: req.decoded.userID,
      name: req.body.name,
      memberList: [],
      images: []
    });

  //Save album and add ref to user
      album.save()
      .then(data => {
          var path = './albums/' + data._id;
          fs.mkdir(path, function (err) {
              if (err) {
                  throw err;
              }
          });
          return User.findByIdAndUpdate(req.decoded.userID,
            {
               $addToSet: { albumList: data._id }
            }, {new: true});

      })
      .then(data => {

        res.send(data);
      })
      .catch(err => {
          res.status(500).send({
              message: err.message || "Some error occurred while creating the album."
          });
      });
};

exports.upload = (req, res) => {

  var form = new formidable.IncomingForm();
  var pathname;

  form.uploadDir = './albums/' + req.params.albumID;//path.join(__dirname, '/uploads');

    form.on('file', function(field, file) {

      pathname = path.join(form.uploadDir, file.name);
      fs.rename(file.path, pathname);

    });

    // log any errors that occur
      form.on('error', function(err) {
        console.log('An error has occured: \n' + err);
      });

    // once all the files have been uploaded, send a response to the client
      form.on('end', function() {

        Album.findOneAndUpdate(
        {
          _id: req.params.albumID,
          $or:[ {'creator':req.decoded.userID}, {'memberList':req.decoded.userID} ]
        },
        {
          $addToSet: { images: pathname }
        }, {new: true})
        .then(data => {
          res.send(data);
        })
        .catch(err => {
          res.status(500).send({
            message: err.message || "Some error occurred while uploading the image."
          });
        });

      });

    // parse the incoming request containing the form data
      form.parse(req);
};

exports.deleteImage = (req, res) => {

  var albumID = req.params.albumID;
  var imgName = req.params.imgName;

  Album.findOneAndUpdate(
  {
    _id: req.params.albumID,
    $or:[ {'creator':req.decoded.userID}, {'memberList':req.decoded.userID} ]
  },
  {
    $pull: { images: 'albums/' + req.params.albumID + '/' + req.params.imgName}
  }, {new: true})
  .then(data => {
    console.log(process.cwd());

    fs.unlinkSync('./albums/' + albumID + '/' + imgName);
    res.send({message: "Image deleted Successfully"});
  })
  .catch(err => {
    res.status(500).send({
      message: err.message || "Some error occurred while deleting image."
    });
  });
};

exports.getImage = (req, res) => {

  var albumID = req.params.albumID;
  var imgName = req.params.imgName;

  fs.readFile('./albums/' + albumID + '/' + imgName, function (err, content) {
        if (err) {
            res.writeHead(400, {'Content-type':'text/html'})
            console.log(err);
            res.end("No such image");
        } else {
            //specify the content type in the response will be an image
            res.writeHead(200,{'Content-type':'image/jpg'});
            res.end(content);
        }
    });
};

exports.update = (req, res) => {

  //Validate request
    if(!req.body.name) {
      return res.status(400).send({
          message: "Pas tout les champs recu"
      });
    }

  Album.findOneAndUpdate(
  {
    _id: req.params.albumID,
    $or:[ {'creator':req.decoded.userID}, {'memberList':req.decoded.userID} ]
  },
  {
    name: req.body.name
  }, {new: true})
  .then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message: err.message || "Some error occurred while updating album name."
    });
  });

};

/*
TODO delete ref user
*/
exports.delete = (req, res) => {

  Album.findOneAndRemove(
  {
    _id: req.params.albumID,
    $or:[ {'creator':req.decoded.userID}, {'memberList':req.decoded.userID} ]
  })
  .then(data => {
    if(!data) {
      return res.status(404).send({
        message: "Album not found"
      });
    }
    var filePath = './albums/' + req.params.albumID;

    rimraf(filePath,
      function () {
        res.send({message: "Album deleted Successfully"});
      }
    );
  })
  .catch(err => {
    res.status(500).send({
      message: err.message || "Some error occurred while updating album name."
    });
  });

};
