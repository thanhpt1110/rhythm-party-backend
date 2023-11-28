const mongoose = require('mongoose');
const playlistSchema = mongoose.Schema({
    playListName:{
        type: String,
        required: [true, "Please add your playlist name"]
    },
    listMusic:{
        type: [mongoose.Schema.Types.ObjectId]
    },
    avatarPlaylist:{
        
    }
},  
{
    timestamps: true,
}
)
module.exports = mongoose.model("Playlist", playlistSchema);
