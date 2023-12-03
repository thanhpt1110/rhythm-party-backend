const socketInit = (io) => {
    io.on("connection", (socket) =>{
    console.log(`User connected: ${socket.id}`);
    socket.on('join_room', (data) =>{
        socket.join(data)
        console.log(`User with id: ${socket.id} joined room ${data}`)
    })
    socket.on('disconnect', () =>{
        console.log('User disconnected ', socket.id)
    })
    socket.on('send_message',(data) =>{
        console.log(data)
        socket.to(data.room).emit('receive_message',data)
    })
})}
module.exports = {socketInit}