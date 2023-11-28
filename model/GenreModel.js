const mongoose = require('mongoose');

const musicGenreSchema = mongoose.Schema({
    musicGenre:{
        type: String,
        required: [true, "Please add your music genre"]
    },
    musicQuantity: {
        type: Number,
        default: 1
    }
},  
{
    timestamps: true,
}
)
module.exports = mongoose.model("MusicGenre", musicGenreSchema);