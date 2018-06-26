module.exports = (app) => {
    const album = require('../controllers/album.controller.js');

    app.post('/me/album/create', album.create);

    app.post('/me/album/:albumID', album.upload);

    app.delete('/me/album/:albumID/:imgName', album.deleteImage);

    app.get('/album/:albumID/:imgName', album.getImage);

    app.put('/me/album/:albumsID', album.update);

    app.delete('/me/album/:albumID', album.delete);

}
