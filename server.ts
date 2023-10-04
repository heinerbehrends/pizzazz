import type { PartyKitServer } from "partykit/server";
import { interpret } from "xstate";
import { serverMachine } from "./src/srcServer/stateServer/serverMachine";
import type {
  ServerToClientMessage,
  ServerConnectionEvent,
  AddExcludedPlayers,
} from "./server.types";
import type {
  ClientToServerMessage,
  LettersChangedMessage,
  SolutionMessage,
} from "./src/state/gameMachine.types";
import type { ScreenNameMessage } from "./src/components/Buttons";

const serverService = interpret(serverMachine()).start();

export default {
  async onConnect(connection, room) {
    if ([...room.getConnections()].length === 1) {
      serverService.send({
        type: "firstUserConnected",
        connectionId: connection.id,
      });
    } else {
      serverService.send({ type: "newPlayer", connectionId: connection.id });
    }
    // listen for client messages
    connection.addEventListener("message", (event) => {
      if (typeof event.data !== "string") {
        return;
      }
      const message: ClientToServerMessage = JSON.parse(event.data);
      console.log("clientToServerMessage: ", message);
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
            "screenName",
            "lettersChanged",
          ] satisfies Array<
            | ServerConnectionEvent["type"]
            | SolutionMessage["type"]
            | ScreenNameMessage["type"]
            | LettersChangedMessage["type"]
          >
        ).includes(evt.type as ServerConnectionEvent["type"])
      ) {
        return;
      }
      console.log("serverToClientMessage: ", evt);
      const { excludedPlayers, ...event } =
        evt as AddExcludedPlayers<ServerToClientMessage>;
      room.broadcast(JSON.stringify(event), excludedPlayers);
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
