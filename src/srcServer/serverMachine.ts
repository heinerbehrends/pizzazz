import { createMachine } from "xstate";
import { serverGameMachine } from "./serverGameMachine";
import {
  ClientToServerMessageWithId,
  TimeAndLettersReply,
  UserDisconnectedEvent,
  WithConnectionId,
} from "../../server.types";

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
        | WithConnectionId<{ type: "newPlayer" }>
        | UserDisconnectedEvent
        | WithConnectionId<TimeAndLettersReply>
        | ClientToServerMessageWithId,
    },
    tsTypes: {} as import("./serverMachine.typegen").Typegen0,
    predictableActionArguments: true,
  });
}
