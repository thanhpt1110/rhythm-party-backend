const mongoose = require('mongoose');
const PlaylistTable = require('../entity/PlaylistTable')
const playlistSchema = mongoose.Schema({
    playListName:{
        type: String,
        required: [true, "Please add your playlist name"]
    },
    listMusic:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Music'
    },
    avatarPlaylist:{
        type: String,
        default: ''
    },
    ownerPlaylistID:{
        type: mongoose.Schema.Types.ObjectId,
        require: [true, "Please add your owner playlist id"]
    },
    privacyStatus:{
        type: String,
        default: PlaylistTable.PLAYLIST_PRIVACY_PRIVATE
    },
    view: {
        type: Number,
        default: 0
    },
    description: {
        type: String
    }
},  
{
    timestamps: true,
}
)
module.exports = mongoose.model("Playlist", playlistSchema);
