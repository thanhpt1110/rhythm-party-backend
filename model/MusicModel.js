const mongoose = require('mongoose');
const MusicTable = require('../entity/MusicTable')
const musicSchema = mongoose.Schema({
    musicName:{
        type: String,
        required: [true, "Please add your music name"]
    },
    view: {
        type: Number,
        default: 0
    },
    genre: {
        type: [String],
        require: [true, "Please add your music Genre"]
    },
    author: {
        type: String,
        require: [true, "Please add author"],
        default: "unknown"
    },
    musicPostOwnerID: {
        type: mongoose.Schema.Types.ObjectId,
        require: [true, "Please add id post music user"],
        ref: 'User'
    },
    lyrics: {
        type: String,
        default: ''
    },
    duration: {
        type: String,
        required: [true, "Please add the duration of your music"]
    },
    description: {
        type: String,
        required: [true, "Please add a description for your music"]
    },
    url: {
        type: String,
        default: ''
    },
    imgUrl:{
        type: String,
        default: ''
    },
    releaseYear: {
        type: Number,
        required: [true, "Please add the release year of your music"]
    },
    musicPrivacyType: {
        type: String,
        enum: [MusicTable.MUSIC_PRIVACY_PRIVATE, MusicTable.MUSIC_PRIVACY_PUBLIC],
        default: MusicTable.MUSIC_PRIVACY_PRIVATE
    },
    musicAuthorize: {
        type: String,
        enum: [MusicTable.MUSIC_AUTHENTICATION_AUTHORIZE,MusicTable.MUSIC_AUTHENTICATION_UNAUTHORIZE],
        default: MusicTable.MUSIC_AUTHENTICATION_UNAUTHORIZE
    }
},  
{
    timestamps: true,
}
)
module.exports = mongoose.model("Music", musicSchema);