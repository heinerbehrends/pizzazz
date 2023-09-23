import type { Party, PartyConnection, PartyKitServer } from "partykit/server";
import { interpret } from "xstate";
import { serverMachine } from "./src/srcServer/serverMachine";
import { ClientToServerMessage, ServerToClientMessage } from "./server.types";

const serverService = interpret(serverMachine()).start();

export default {
  async onConnect(connection, room) {
    handleIdleConnected({
      serverService,
      connection,
      room,
    });
    connection.addEventListener("message", (event) => {
      if (typeof event.data !== "string") {
        return;
      }
      const message: ClientToServerMessage = JSON.parse(event.data);
      console.log("clientToServerMessage: ", message);
      serverService.send(message);
    });
    serverService.onEvent((event) => {
      if (
        [
          "timeAndLettersReply",
          "validLengthAndDef",
          "solution",
          "startNewGame",
        ].includes(event.type)
      ) {
        console.log("serverToClientMessage", event);
      }
      sendToClient({
        toSender: ["timeAndLettersReply", "validLengthAndDef"],
        toEveryoneElse: ["solution"],
        toEveryone: ["startNewGame"],
        event: event as ServerToClientMessage,
        connection,
        room,
      });
    });
  },
} satisfies PartyKitServer;

type ServerMessageTypeArray = Array<ServerToClientMessage["type"]>;

type SendToClientArgs = {
  toSender?: ServerMessageTypeArray;
  toEveryoneElse?: ServerMessageTypeArray;
  toEveryone?: ServerMessageTypeArray;
  event: ServerToClientMessage;
  connection: PartyConnection;
  room: Party;
};

function reply(room: Party, connection: PartyConnection) {
  return Array.from(room.getConnections())
    .filter((bla: PartyConnection) => bla.id !== connection.id)
    .map((connection) => connection.id);
}

function sendToClient({
  toEveryone,
  toSender,
  toEveryoneElse,
  event,
  connection,
  room,
}: SendToClientArgs) {
  if (toEveryone?.includes(event.type)) {
    room.broadcast(JSON.stringify(event));
  }
  if (toSender?.includes(event.type)) {
    room.broadcast(JSON.stringify(event), reply(room, connection));
  }
  if (toEveryoneElse?.includes(event.type)) {
    room.broadcast(JSON.stringify(event), [connection.id]);
  }
}

type HandleIdleConnectedArgs = {
  connection: PartyConnection;
  room: Party;
  serverService: typeof serverService;
};

function handleIdleConnected({
  connection,
  room,
  serverService,
}: HandleIdleConnectedArgs) {
  if ([...room.getConnections()].length === 1) {
    serverService.send({ type: "userConnected" });
  }
  connection.addEventListener("close", () => {
    if ([...room.getConnections()].length === 0) {
      serverService.send("lastUserDisconnected");
    }
  });
}
