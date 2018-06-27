module.exports = (app) => {
    const user = require('../controllers/user.controller.js');

    app.post('/create', user.create);

    app.post('/login', user.login);

    app.get('/me/profil', user.getMyProfil);

    /*TODO update and delete user */

}
