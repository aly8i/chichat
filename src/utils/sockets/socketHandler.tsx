export default (io, socket) => {
  const createdMessage = (msg) => {
    socket.to(msg.room).emit("newIncomingMessage", msg);
  };
  const enterRoomFn = (room) => {
    socket.join(room, () => {
      console.log("joined")
    });
  };

  socket.on("createdMessage", createdMessage);
  socket.on("enterRoom", enterRoomFn);

};
