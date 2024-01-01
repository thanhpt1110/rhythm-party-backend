const asyncHandler = require('express-async-handler')

const socketInit = (io) => {
    io.on("connection", (socket) =>{
    console.log(`User connected: ${socket.id}`);
    socket.on('join_music', (musicId) =>{
        socket.join("music"+musicId)
        console.log(`User with id: ${socket.id} joined music ${musicId}`)
    })
    socket.on('leave_music', (musicId) =>{
        socket.leave("music"+musicId);
        console.log(`User with id: ${socket.id} leave music ${musicId}`)
    })
    socket.on('join_room', (roomId) =>{
        try{
            socket.join("room"+roomId)
            const roomSize = io.sockets.adapter.rooms.get("room"+roomId).size;
            console.log(`User with id: ${socket.id} joined room ${roomId} with ${roomSize} people`)
            io.to("room"+roomId).emit('update-people-in-room', roomSize);
        }
        catch(e)
        {
            console.log(e)
        }
    })
    socket.on('leave_room', asyncHandler(async(roomId) =>{
        try{
            if (socket.rooms.has("room" + roomId)) {
            socket.leave("room"+roomId);
            const roomSize = io.sockets.adapter.rooms.get("room" + roomId)?.size || 0;
            console.log(`User with id: ${socket.id} leaved room ${roomId} with ${roomSize} people`)
             socket.to("room"+roomId).emit('update-people-in-room', roomSize);
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
    socket.on("on_playlist_change_room", (data) => {
        socket.to("room" + data.roomId).emit("receive_playlist_change_room", data);
    });
})}
module.exports = {socketInit}