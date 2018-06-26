const mongoose = require('mongoose');

const AlbumSchema = mongoose.Schema({
    memberList: [String],
    creator: String,
    name: String,
    images: [String]
},{
    timestamps: true
});

module.exports = mongoose.model('Album', AlbumSchema);
