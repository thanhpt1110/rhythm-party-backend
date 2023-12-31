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
        socket.join("room"+roomId)
        console.log(`User with id: ${socket.id} joined room ${roomId}`)
    })
    socket.on('leave_room', (roomId) =>{
        socket.leave("room"+roomId);
        console.log(`User with id: ${socket.id} leave room ${roomId}`)
    })
    socket.on('disconnect', () =>{
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