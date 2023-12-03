const Room = require('../model/RoomModel')
const asyncHandler = require('express-async-handler')
const getRoomByID =asyncHandler(async (req,res) =>{
    try{
        const room = await Room.findbyId(req.params.id)
    }
    catch(e)
    {
        
    }
})
const createNewRoom = (req,res) =>{

}
const addNewMusicToRoomPlaylist = () =>{

}