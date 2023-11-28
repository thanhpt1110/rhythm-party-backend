const mongoose = require('mongoose')
const RoomTable = require('../entity/RoomTable.js')
const RoomSchema = mongoose.Schema({
    roomOwnerID: {
        type: mongoose.Schema.Types.ObjectId,
        require: [true, "Please add your room Owner ID"]
    },
    peopleInRoom: {
        type: [mongoose.Schema.Types.ObjectId],
        default: []
    },
    musicInQueue: {
        type: [mongoose.Schema.Types.ObjectId],
        default: []
    },
    roomType: {
        type: String,
        enum: [RoomTable.PUBLIC_ROOM, RoomTable.PRIVATE_ROOM],
        default: RoomTable.PRIVATE_ROOM
    },
},  
{
    timestamps: true,
})
module.exports = mongoose.model("Room", RoomSchema)