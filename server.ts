export default {
  // This function is called when a client connects to the server.
  async onConnect(connection, room, context) {
    // You can send messages to the client using the connection object
    connection.send("hello from room: " + room.id);
    console.log(`Connection URL: ${context.request.url}`);

    // You can also listen for messages from the client
    connection.addEventListener("message", (evt) => {
      console.log(evt.data, connection.id); // "hello from client (id)"

      // You can also broadcast messages to all clients in the room
      room.broadcast(
        `message from client: ${evt.data} (id: ${connection.id}")`,
        // You can exclude any clients from the broadcast
        [connection.id] // in this case, we exclude the client that sent the message
      );
    });
    connection.addEventListener("updateLetters", (evt) => {
      console.log("updateLetters"); // "hello from client (id)"

      // You can also broadcast messages to all clients in the room
      room.broadcast(
        `message from client: ${evt.data} (id: ${connection.id}")`,
        // You can exclude any clients from the broadcast
        [connection.id] // in this case, we exclude the client that sent the message
      );
    });
  },
  // optionally, you can respond to HTTP requests as well
  async onRequest(request, room) {
    return new Response("hello from room: " + room.id);
  },
};
