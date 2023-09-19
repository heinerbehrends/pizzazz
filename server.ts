import type { Party, PartyConnection, PartyKitServer } from "partykit/server";
import { interpret } from "xstate";
import { getValidWordLength } from "./src/srcServer/findValidWords";
import { UpdateLettersMessage } from "./src/state/gameMachine";
import dictionary from "./src/srcServer/dictionary.json";
import { serverMachine } from "./src/srcServer/serverMachine";

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

function retrieveDefinition(letters: string, validWordLength: number) {
  if (validWordLength > 0) {
    return (
      dictionary?.[
        letters
          .substring(0, validWordLength)
          .toUpperCase() as keyof typeof dictionary
      ] || null
    );
  }
  return null;
}

const serverService = interpret(serverMachine()).start();
serverService.onTransition((state) =>
  console.log(JSON.stringify(state.children))
);

export default {
  // async onConnect(connection, room, context) {
  async onConnect(connection, room) {
    connection.send(
      JSON.stringify({
        type: "randomLetters",
        letters: "dsfsdfs",
      })
    );
    console.log("on connect");
    if ([...room.getConnections()].length === 1) {
      serverService.send({ type: "userConnected" });
    }
    connection.addEventListener("close", () => {
      if ([...room.getConnections()].length === 0) {
        serverService.send("lastUserDisconnected");
      }
    });
    connection.addEventListener("message", (event) => {
      if (typeof event.data !== "string") {
        return;
      }
      const message: ClientMessage = JSON.parse(event.data);

      if (message.type === "updateLetters") {
        const validWordLength = getValidWordLength(message.letters);

        room.broadcast(
          JSON.stringify({
            type: "validLengthAndDef",
            length: validWordLength,
            definition: retrieveDefinition(message.letters, validWordLength),
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
