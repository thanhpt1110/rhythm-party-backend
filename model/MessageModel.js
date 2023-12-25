const mongoose = require('mongoose')
const messageMusicSchema = mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    message: {
        type: String,
        required: [true, "Please add a message"]
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Please add user ID"],
        ref: 'User'
    }
},  
{
    timestamps: true,
});
module.exports = mongoose.model("Message", messageMusicSchema);
