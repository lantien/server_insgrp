const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    firstname: String,
    lastname: String,
    email: { type: String, unique: true },
    username: { type: String, unique: true },
    password: String,
    albumList: [String]
},{
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
