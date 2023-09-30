import type { PartyKitServer } from "partykit/server";
import { interpret } from "xstate";
import { serverMachine } from "./src/srcServer/stateServer/serverMachine";
import { ServerToClientMessage, ServerConnectionEvent } from "./server.types";
import {
  ClientToServerMessage,
  SolutionMessage,
} from "./src/state/gameMachine.types";

const serverService = interpret(serverMachine()).start();

export default {
  async onConnect(connection, room) {
    serverService.send({ type: "newPlayer", connectionId: connection.id });
    if ([...room.getConnections()].length === 1) {
      serverService.send({ type: "firstUserConnected" });
    }
    // listen for client messages
    connection.addEventListener("message", (event) => {
      if (typeof event.data !== "string") {
        return;
      }
      const message: ClientToServerMessage = JSON.parse(event.data);
      console.log("clientToServerMessage: ", message.type);
      serverService.send({ ...message, connectionId: connection.id });
    });

    // send machine events to the client
    serverService.onEvent((evt) => {
      if (
        (
          [
            "solution",
            "newPlayer",
            "firstUserConnected",
            "userDisconnected",
            "lastUserDisconnected",
          ] satisfies Array<
            ServerConnectionEvent["type"] | SolutionMessage["type"]
          >
        ).includes(evt.type as ServerConnectionEvent["type"])
      ) {
        return;
      }
      const event = evt as ServerToClientMessage;
      room.broadcast(JSON.stringify(event), event?.excludedPlayers);
    });

    connection.addEventListener("close", () => {
      if ([...room.getConnections()].length === 0) {
        serverService.send("lastUserDisconnected");
      }
      serverService.send({
        type: "userDisconnected",
        connectionId: connection.id,
      } satisfies ServerConnectionEvent);
    });
  },
} satisfies PartyKitServer;
