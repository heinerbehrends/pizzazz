import { getValidWordLength } from "./src/srcServer/findValidWords";
import { UpdateLettersMessage } from "./src/state/gameMachine";
import type { PartyConnection, PartyKitServer } from "partykit/server";
import sqlite3 from "sqlite3";

export type validWordLengthMessage = {
  type: "validWordLength";
  length: number;
};
export type ServerMessage =
  | validWordLengthMessage
  | { type: "randomLetters"; letters: string };
type ClientMessage = UpdateLettersMessage;
// does not work because server.js is not run on a node process
// let dictionaryDB = new sqlite3.Database(
//   "./src/srcServer/eng_dictionary.db",
//   sqlite3.OPEN_READWRITE,
//   (err) => {
//     if (err) {
//       console.error(err.message);
//     }
//     console.log("Connected to the dictionary database.");
//   }
// );
export default {
  async onConnect(connection, room, context) {
    connection.send(
      JSON.stringify({
        type: "randomLetters",
        letters: "dsfsdfs",
      })
    );
    console.log(`Connection URL: ${context.request.url}`);

    connection.addEventListener("message", (event) => {
      if (typeof event.data !== "string") {
        return;
      }
      const message = JSON.parse(event.data) as ClientMessage;
      console.log(getValidWordLength(message.letters)); // "hello from client (id)"
      if (message.type === "updateLetters") {
        room.broadcast(
          JSON.stringify({
            type: "validWordLength",
            length: getValidWordLength(message.letters),
          }),
          Array.from(room.getConnections())
            .filter((bla: PartyConnection) => bla.id !== connection.id)
            .map((connection) => connection.id)
        );
      }

      room.broadcast(
        `message from client: ${event.data} (id: ${connection.id}")`,
        // You can exclude any clients from the broadcast
        [connection.id] // in this case, we exclude the client that sent the message
      );
    });
  },
  // todo: return index.html from dist folder
  // async onRequest(request, room) {
  //   return new Response("hello from room: " + room.id);
  // },
} satisfies PartyKitServer;
