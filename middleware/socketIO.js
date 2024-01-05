const asyncHandler = require('express-async-handler')
const Music = require('../model/MusicModel');
const Room = require('../model/RoomModel');

const roomTimers = {};
const getNextMusicInQueue = async (roomId) => {
    try {
      // Tìm room theo roomId
      const room = await Room.findById(roomId);
  
      // Kiểm tra nếu room và danh sách musicInQueue tồn tại
      if (room && room.musicInQueue && room.musicInQueue.length > 0) {
        // Lấy currentMusicPlay hiện tại
        const currentMusicPlayIndex = room.musicInQueue.indexOf(room.currentMusicPlay);
  
        // Kiểm tra nếu currentMusicPlayIndex không tồn tại hoặc là bài cuối cùng trong danh sách
        if (currentMusicPlayIndex === -1 || currentMusicPlayIndex === room.musicInQueue.length - 1) {
          // Lấy bài hát đầu tiên trong danh sách
          const nextMusicId = room.musicInQueue[0];
          const nextMusic = await Music.findById(nextMusicId);
          return nextMusic;
        } else {
          // Lấy bài hát tiếp theo trong danh sách
          const nextMusicId = room.musicInQueue[currentMusicPlayIndex + 1];
          const nextMusic = await Music.findById(nextMusicId);
          return nextMusic;
        }
      }
      return null; // Trả về null nếu không có bài hát nào trong danh sách hoặc room không tồn tại
    } catch (error) {
      console.error('Error getting next music:', error);
      throw error;
    }
};
// Hàm để cập nhật thời gian và thông tin nhạc cho một room cụ thể
// const updateRoomInfo = asyncHandler(async(socket,room) => {
//   if (!roomInfo.hasOwnProperty(room._id)) {
//     const newTime = room.currentTime+1;
//     if(room.currentMusicPlay && newTime >= room.currentMusicPlay.duration)
//     {
//         const music = await getNextMusicInQueue(room._id);
//         const room = await Room.updateOne({_id: room._id}, {$set: {currentMusicPlay: music, currentTime: 0}}, {new: true} );

//         roomInfo[room._id].currentTime = 0;
//         roomInfo[room._id].currentMusicPlay = music
//     }
//     else{
//         await Room.updateOne({_id:room._id},{ $inc: { view: 1 } })
//         roomInfo[room._id] = {
//             currentTime: newTime ,
//             currentMusicPlay: room.currentMusicPlay,
//           };
//     }
//   }
//   // Cập nhật thời gian và gửi thông tin đến clients trong room
//   socket.to("room" + room._id).emit('updateTimeRoom', { currentTime: roomInfo[room._id].currentTime, currentMusicPlay: roomInfo[room._id].currentTime });
// })
const socketInit = (io) => {
    io.on("connection", (socket) =>{
    console.log(`User connected: ${socket.id}`);
    socket.on('join_music', (musicId) =>{
        socket.join("music"+musicId)
        console.log(`User with id: ${socket.id} joined music ${musicId}`)
    })
    const createTimer = async(id) => {
        console.log("Create timer");
        const timer = setInterval(async () => {
            try{
                if(!roomTimers[id])
            return;
        const roomSize = io.sockets.adapter.rooms.get("room" + id)?.size || 0;
        if(roomSize === 0)
             {
                console.log("clear")
                const roomNew = await Room.findOneAndUpdate({_id: id}, {$set: {currentTime: 0}}, {new: true} )
                await clearInterval(roomTimers[id].timer);
                delete roomTimers[id];
                return;
        }
        if(!roomTimers[id])
        {
            console.log("clear")
            const roomNew = await Room.findOneAndUpdate({_id: id}, {$set: {currentTime: 0}}, {new: true} )
            await clearInterval(roomTimers[id].timer);
            delete roomTimers[id];
            return;
        }
        const roomCurrent = roomTimers[id].room;
        const newTime = roomTimers[id].room.currentTime+1;
        if(roomCurrent.currentMusicPlay && newTime >= roomCurrent.currentMusicPlay.duration)
        {
            const music = await getNextMusicInQueue(roomCurrent._id);
            const roomNew = await Room.findOneAndUpdate({_id: roomCurrent._id}, {$set: {currentMusicPlay: music, currentTime: 0}}, {new: true} )
            .populate({
                path: 'musicInQueue',
                select: ['author','musicName','_id','url','imgUrl','duration']
            })
            .populate({
                path: "currentMusicPlay",
                select: ['author','musicName','_id','url','imgUrl','duration']
            });
            roomTimers[roomCurrent._id].room = roomNew;
            io.to("room"+roomNew._id).emit('update_music_current', roomNew);
        }
        else if(!roomCurrent.currentMusicPlay)
        {
            clearInterval(roomTimers[id].timer);
        }
        else{
            const roomNew = await Room.findOneAndUpdate({_id:id},{ $inc: { currentTime: 1 } }, {new: true}) 
            .populate({
                path: 'musicInQueue',
                select: ['author','musicName','_id','url','imgUrl','duration']
            })
            .populate({
                path: "currentMusicPlay",
                select: ['author','musicName','_id','url','imgUrl','duration']
            });
            if(!roomTimers[roomNew._id])
                return;
            roomTimers[roomNew._id].room = roomNew;
        }
        console.log(id,roomTimers[id].room.currentTime);
            }
        catch(e)
        {
            console.log(e);
        }
      }, 1000)
      return timer;
    }
    socket.on('leave_music', (musicId) =>{
        socket.leave("music"+musicId);
        console.log(`User with id: ${socket.id} leave music ${musicId}`)
    })
    socket.on('join_room', asyncHandler(async(room) =>{
        try{
            socket.join("room"+room._id)
            const roomSize = io.sockets.adapter.rooms.get("room"+room._id).size;
            console.log(`User with id: ${socket.id} joined room ${room._id} with ${roomSize} people`)
            io.to("room"+room._id).emit('update-people-in-room', roomSize);
            const loadRoom = asyncHandler(async()=>{
                if (!roomTimers[room._id]) {
                    const newRoom = await Room.findOneAndUpdate({_id: room._id}, {$set: {currentTime: 0}}, {new: true} )            .populate({
                        path: 'musicInQueue',
                        select: ['author','musicName','_id','url','imgUrl','duration']
                    })
                    .populate({
                        path: "currentMusicPlay",
                        select: ['author','musicName','_id','url','imgUrl','duration']
                    });;
                    if(!newRoom.currentMusicPlay)
                    {
                        roomTimers[room._id] = {
                            time:0,
                            room: newRoom,
                            timer: null
                          };
                        return;
                    }
                    if(roomTimers[room._id])
                    {
                        console.log("already hay timer");
                        return;
                    }
                    else{
                        roomTimers[room._id] = {
                            time:0,
                            room: newRoom,
                            timer: await createTimer(room._id)
                          };
                    }
                    console.log('Hello')
                  }
                  else{
                    roomTimers[room._id].time = roomTimers[room._id].time + 1
                    console.log(roomTimers[room._id].time)
                  }
            })
            await loadRoom();
        }
        catch(e)
        {
            console.log(e)
        }
    }))
    socket.on('leave_room', asyncHandler(async(room) =>{
        try{
            if (socket.rooms.has("room" + room._id)) {
            socket.leave("room"+room._id);
            const roomSize = io.sockets.adapter.rooms.get("room" + room._id)?.size || 0;
            console.log(`User with id: ${socket.id} leaved room ${room._id} with ${roomSize} people`)
             socket.to("room"+room._id).emit('update-people-in-room', roomSize);
             if(roomTimers[room._id] && roomTimers[room._id].time>0)
             {
                roomTimers[room._id].time = roomTimers[room._id].time - 1
             }
             else if(roomSize === 0  )
             {
                const roomNew = await Room.findOneAndUpdate({_id: room._id}, {$set: {currentTime: 0}}, {new: true} )
                if(roomTimers[room._id] && roomTimers[room._id].time === 0)
                {
                    clearInterval(roomTimers[room._id].timer);
                    delete roomTimers[room._id];
                    console.log("clear")
                }

             }
            }
        }
        catch(e)
        {
            console.log(e);
        }
    }))
    socket.on('disconnect', () =>{
        try{
            const rooms = Array.from(socket.rooms);
            // Rời khỏi tất cả các phòng mà người dùng đang tham gia
            rooms.forEach(room => {
                socket.leave(room);
                const roomSize = io.sockets.adapter.rooms.get(room).size;
                console.log(`User with id: ${socket.id} left room ${room} with ${roomSize} people`);
                io.to(room).emit('update-people-in-room', roomSize);
            });
        }
        catch(e)
        {
            console.log(e)
        }
        console.log('User disconnected ', socket.id)
    })
    socket.on("send_message_music", (data) => {
        socket.to("music"+data.musicId).emit("receive_message_music", data);
      });
    socket.on("send_message_room", (data) => {
        console.log(data)
        socket.to("room" + data.roomId).emit("receive_message_room", data);
    });
    socket.on("on_playlist_change_room", async (data) => {
        try{
            if(!data.room.currentMusicPlay)
        {
           console.log(data.room._id); 
           const newRoom = await Room.findById(data.room._id)
           console.log(newRoom)
           const newRoomUpdate = await Room.findOneAndUpdate({_id:newRoom._id},{$set:{currentMusicPlay:newRoom.musicInQueue[0]._id}},{new:true})           
           .populate({
            path: 'musicInQueue',
            select: ['author','musicName','_id','url','imgUrl','duration']
            })
            .populate({
                path: "currentMusicPlay",
                select: ['author','musicName','_id','url','imgUrl','duration']
            });
           roomTimers[data.room._id].room = newRoomUpdate;
           if(!roomTimers[data.room._id].timer)
            roomTimers[data.room._id].timer = await createTimer(newRoomUpdate._id)
           io.to("room"+newRoomUpdate._id).emit('update_music_current', newRoomUpdate);
           io.to("room" + newRoom.roomId).emit("receive_playlist_change_room", newRoomUpdate);
        }
        else
           io.to("room" + data.room.roomId).emit("receive_playlist_change_room", data.room);
        }
        catch(e)
        {
            console.log(e);
        }
    });
})}
module.exports = {socketInit}