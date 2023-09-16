import { getValidWordLength } from "./src/srcServer/findValidWords";
import dictionary from "./src/srcServer/dictionary.json";
console.log(dictionary["ZIP"]);
import { UpdateLettersMessage } from "./src/state/gameMachine";
import type { Party, PartyConnection, PartyKitServer } from "partykit/server";

export type validLengthAndDefMessage = {
  type: "validLengthAndDef";
  length: number;
  definition: string;
};
export type ServerMessage =
  | validLengthAndDefMessage
  | { type: "randomLetters"; letters: string };
type ClientMessage = UpdateLettersMessage;

function reply(room: Party, connection: PartyConnection) {
  return Array.from(room.getConnections())
    .filter((bla: PartyConnection) => bla.id !== connection.id)
    .map((connection) => connection.id);
}

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

      if (message.type === "updateLetters") {
        const validWordLength = getValidWordLength(message.letters);

        room.broadcast(
          JSON.stringify({
            type: "validLengthAndDef",
            length: validWordLength,
            definition:
              validWordLength > 0
                ? dictionary?.[
                    message.letters
                      .substring(0, validWordLength)
                      .toUpperCase() as keyof typeof dictionary
                  ] || null
                : null,
          }),
          reply(room, connection)
        );
      }

      room.broadcast(
        `message from client: ${event.data} (id: ${connection.id}")`,
        // You can exclude any clients from the broadcast
        [connection.id] // in this case, we exclude the client that sent the message
      );
    });
  },
  // async onRequest(request, room) {
  //   return new Response("hello from room: " + room.id);
  // },
} satisfies PartyKitServer;
