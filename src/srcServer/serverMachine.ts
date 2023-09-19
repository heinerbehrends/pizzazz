import { createMachine } from "xstate";
import { serverGameMachine } from "./serverGameMachine";

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
        invoke: {
          id: "serverGameMachine",
          src: serverGameMachine,
        },
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
        | { type: "lastUserDisconnected" },
    },
    tsTypes: {} as import("./serverMachine.typegen").Typegen0,
    predictableActionArguments: true,
  });
}
