const Room = require('../../model/RoomModel')
const RoomTable = require('../../entity/RoomTable')
const MessageRoom = require('../../model/MessageModel')
const asyncHandler = require('express-async-handler')
const getRoomByID =asyncHandler(async (req,res) =>{
    try{
        if(req.isAuthenticated())
        {
            const room = await Room.findById(req.params.id).populate({
                path: 'messages',
                options: { sort: { date: -1 } },
                populate: {
                    path: 'userId',
                    model: 'User',
                    select: ['_id','avatar','displayName'] // Chọn các trường bạn muốn hiển thị, ví dụ 'avatar'
                }
            })  
            .populate({
                path: 'musicInQueue',
                select: ['author','musicName','_id','url','imgUrl','duration']
            })
            .populate({
                path: 'messages',
                options: { sort: { date: 1 } },
                populate: {
                    path: 'userId',
                    model: 'User',
                    select: ['avatar','displayName'] // Chọn các trường bạn muốn hiển thị, ví dụ 'avatar'
                }
            })
            .populate({
                path: "currentMusicPlay",
                select: ['author','musicName','_id','url','imgUrl','duration']
            });
            if(room)
                res.status(200).json({message: "Success", data: room})
            else
                res.sendStatus(404)
        }
        else{
            res.sendStatus(401);
        }
    }
    catch(e)
    {
        console.log(e);
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
            const result = await Room.findOneAndUpdate({ _id: _id }, {$addToSet: {musicInQueue: musicId}}, {new: true})            
            .populate({
                path: 'musicInQueue',
                select: ['author','musicName','_id','url','imgUrl','duration']
            }); 
            return res.status(200).json({message: "Success", data:result})
        }
        else
            return res.sendStatus(401);
    }
    catch(e)
    {
        console.log(e)
        return res.sendStatus(500)
    }
})
const removeMusicToRoomPlaylist = asyncHandler(async(req,res) =>{
    try{
        if(req.isAuthenticated())
        {
            const {musicId} = req.body;
            const _id = req.params.id;
            const result = await Room.findOneAndUpdate({ _id: _id }, {$pull: {musicInQueue: musicId}}, {new: true})            
            .populate({
                path: 'musicInQueue',
                select: ['author','musicName','_id','url','imgUrl','duration']
            }); 
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
const getCurrentRoomMusic = asyncHandler(async(req,res)=>{
    try{
        if(req.isAuthenticated())
        {
            const ownerId  = req.user.user._id;
            const room = await Room.find({roomOwner: ownerId})            
            .populate({
                path: 'musicInQueue',
                select: ['author','musicName','_id','url','imgUrl','duration']
            });
            return res.status(200).json({message: "success", data: room})
        }
        else{
            res.sendStatus(401)
        }
    }
    catch(e)
    {
        console.log(e);
        res.sendStatus(500)
    }
})
const musicMessageUpload = asyncHandler(async(req,res)=>{
    try{
        if(req.isAuthenticated())
        {
           const {message} = req.body;
           const newMessage = await MessageRoom.create({
                userId:req.user.user._id,
                message:message
            })
            const Message = await MessageRoom.findById(newMessage._id)
            .populate({
                path: 'userId',
                model: 'User',
                select: ['avatar', 'displayName'],
            })
            .exec();
            const room = await Room.findById(req.params.id);
            if (!room) {
                res.status(404).json({message: "Music not existed", data: null})
                return;
            }
            room.messages.push(newMessage._id);
            room.save();
            return res.status(200).json({message: "Success", data: Message});
        }
        else
            return  res.status(401).json({message: "Unauthorize"})
    }
    catch(e)
    {
        console.log(e)
        return res.status(500).json({message: "Server error"})            

    }
})
module.exports = {getRoomByID, postNewRoom, postNewMusicToRoomPlaylist, getCurrentRoomMusic, musicMessageUpload, removeMusicToRoomPlaylist}