import { createMachine } from "xstate";
import { serverGameMachine } from "./serverGameMachine";
import { TimeAndLettersReply, UserDisconnectedEvent } from "../../server.types";
import { ClientToServerMessage } from "../state/gameMachine";

export function serverMachine() {
  return createMachine({
    id: "serverMachine",
    initial: "idle",
    states: {
      idle: {
        on: {
          userConnected: {
            target: "connected",
          },
        },
      },
      connected: {
        invoke: [
          {
            id: "serverGameMachine",
            src: serverGameMachine,
            autoForward: true,
          },
        ],
        on: {
          lastUserDisconnected: {
            target: "idle",
          },
        },
      },
    },
    schema: {
      context: {} as { value: string },
      events: {} as
        | { type: "userConnected" }
        | { type: "lastUserDisconnected" }
        | withConnectionId<{ type: "newPlayer" }>
        | UserDisconnectedEvent
        | withConnectionId<TimeAndLettersReply>
        | ClientToServerMessageWithId,
    },
    tsTypes: {} as import("./serverMachine.typegen").Typegen0,
    predictableActionArguments: true,
  });
}

export type withConnectionId<Type extends { type: string }> = Type & {
  connectionId: string;
};

type addId<Events extends { type: string }> = {
  [Event in Events as Event["type"]]: withConnectionId<Event>;
}[Events["type"]];

export type ClientToServerMessageWithId = addId<ClientToServerMessage>;
