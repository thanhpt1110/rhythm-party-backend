const mongoose = require('mongoose')
const RoomTable = require('../entity/RoomTable.js')
const RoomSchema = mongoose.Schema({
    roomName: {
        type: String,
        require: [true, "please add you room name"]
    },
    roomOwner: {
        type: mongoose.Schema.Types.ObjectId,
        require: [true, "Please add your room Owner ID"],
        ref: 'User'
    },
    peopleInRoom: {
        type: [mongoose.Schema.Types.ObjectId],
        default: [],
        ref: 'User'
    },
    musicInQueue: {
        type: [mongoose.Schema.Types.ObjectId],
        default: [],
        ref: 'Music'
    },
    roomType: {
        type: String,
        enum: [RoomTable.PUBLIC_ROOM, RoomTable.PRIVATE_ROOM],
        default: RoomTable.PRIVATE_ROOM
    },
    currentMusicPlay: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: 'Music'
    },
    currentTime:{
        type: Number,
        default: 0,
    },
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }]
},  
{
    timestamps: true,
})
module.exports = mongoose.model("Room", RoomSchema)