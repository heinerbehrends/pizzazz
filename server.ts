import type { Party, PartyConnection, PartyKitServer } from "partykit/server";
import { interpret } from "xstate";
import { serverMachine } from "./src/srcServer/serverMachine";
import { ServerToClientMessage, UserDisconnectedEvent } from "./server.types";
import { ClientToServerMessage } from "./src/state/gameMachine";

const serverService = interpret(serverMachine()).start();

export default {
  async onConnect(connection, room) {
    console.log("onConnect room", room);
    const connectionId = connection.id;
    serverService.send({ type: "newPlayer", connectionId });
    handleIdleConnected({
      serverService,
      connection,
      room,
    });
    // listen for client messages
    connection.addEventListener("message", (event) => {
      if (typeof event.data !== "string") {
        return;
      }
      const message: ClientToServerMessage = JSON.parse(event.data);
      console.log("clientToServerMessage: ", message.type);
      serverService.send({ ...message, connectionId });
    });
    // listen for client messages
    // send machine events to the client
    serverService.onEvent((evt) => {
      console.log("serverToClientMessage", evt.type);
      if (evt.type === "solution") {
        return;
      }
      const event = evt as ServerToClientMessage;
      room.broadcast(JSON.stringify(event), event?.excludePlayers);
      // if (event.type === "timeAndLettersReply") {
      //   console.log("timeAndLettersReply", event.excludePlayers);
      //   return;
      // }
      // sendToClient({
      //   toSender: ["validLengthAndDef"],
      //   toEveryoneElse: ["playerSolution"],
      //   toEveryone: ["startNewGame"],
      //   event: event as ServerToClientMessage,
      //   connection,
      //   room,
      // });
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
    console.log("to everyone");
    room.broadcast(JSON.stringify(event));
  }
  if (toSender?.includes(event.type)) {
    console.log("to sender");
    room.broadcast(JSON.stringify(event), reply(room, connection));
  }
  if (toEveryoneElse?.includes(event.type)) {
    console.log("to everyone else", connection.id);
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
    console.log("onClose");
    if ([...room.getConnections()].length === 0) {
      serverService.send("lastUserDisconnected");
    }
    serverService.send({
      type: "userDisconnected",
      connectionId: connection.id,
    } as UserDisconnectedEvent);
  });
}
