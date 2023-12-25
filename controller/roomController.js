const Room = require('../model/RoomModel')
const RoomTable = require('../entity/RoomTable')
const asyncHandler = require('express-async-handler')
const getRoomByID =asyncHandler(async (req,res) =>{
    try{
        if(req.isAuthenticated())
        {
            const room = await Room.findbyId(req.params.id).populate({
                path: 'messages',
                options: { sort: { date: -1 } },
                populate: {
                    path: 'userId',
                    model: 'User',
                    select: ['_id','avatar','displayName'] // Chọn các trường bạn muốn hiển thị, ví dụ 'avatar'
                }
            })
            .populate({
                path: 'roomOwner',
                select: ['avatar', 'displayName']})
            .populate({
                path: 'musicInQueue',
                select: ['author','musicName','_id','url','imgUrl']
            })
            .populate({
                path: "peopleInRoom",
                select: ['avatar','_id','displayName']
            })
            .populate({
                path: "currentMusicPlay",
                select: ['author','musicName','_id','url','imgUrl']
            });
            res.status(200).json({message: "Success", data: room})
        }
        else{
            res.sendStatus(401);
        }
    }
    catch(e)
    {
        res.sendStatus(500);
    }
})
const postNewRoom =asyncHandler(async (req,res) =>{
    try{
        if(req.isAuthenticated())
        {
        const {roomName, roomType} = req.body;
        const room = await Room.create({
            roomName: roomName,
            roomOwner: req.user.user._id,
            roomType: roomType ? roomType : RoomTable.PRIVATE_ROOM
        })
        return res.status(200).json({data: room, message:"Success"})
        }
        else{
            return res.sendStatus(500);
        }
    }
    catch(e)
    {
        res.sendStatus(500);
    }
})
const postNewMusicToRoomPlaylist = asyncHandler(async(req,res) =>{
    try{
        if(req.isAuthenticated())
        {
            const {musicId} = req.body;
            const _id = req.params.id;
            const result = await Room.findOneAndUpdate({ _id: _id }, {$push: {musicInQueue: musicId}}, {new: true}); 
            return res.status(200).json({message: "Success", data:result})
        }
        else
            return res.sendStatus(401);
    }
    catch(e)
    {
        return res.sendStatus(500)
    }
})
const putMusicCurrent = asyncHandler(async(req,res)=>{
    
})