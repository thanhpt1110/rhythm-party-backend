const socketInit = (io) => {
    io.on("connection", (socket) =>{
    console.log(`User connected: ${socket.id}`);
    socket.on('join_music', (musicId) =>{
        socket.join("music"+musicId)
        console.log(`User with id: ${socket.id} joined room ${musicId}`)
    })
    socket.on('leave_music', (musicId) =>{
        socket.leave("music"+musicId);
        console.log(`User with id: ${socket.id} leave room ${musicId}`)
    })
    socket.on('disconnect', () =>{
        console.log('User disconnected ', socket.id)
    })
    socket.on('send_message',(data) =>{
        console.log(data)
        socket.to(data.room).emit('receive_message',data)
    })
    socket.on("send_message_music", (data) => {
        console.log("data")
        console.log(  data)
        socket.to("music"+data.musicId).emit("receive_message_music", data);
      });
    socket.on("send_message_room", (data) => {
    socket.to(data.musicID).emit("receive_message_room", data);
    });
})}
module.exports = {socketInit}