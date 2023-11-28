const mongoose = require('mongoose')

const MessageSchema = mongoose.Schema({
    message:{
        type: String,
        required: [true, 'Please add your new message']
    },
    roomID:{
        type: mongoose.Schema.Types.ObjectId,
        require: [true, "Please add your roomID"],
        ref: 'Room'
    },
    senderID:{
        type: mongoose.Schema.Types.ObjectId,
        require: [true, "Please add your senderID"],
        ref: 'User'
    }
},
{
    timestamps: true,
})