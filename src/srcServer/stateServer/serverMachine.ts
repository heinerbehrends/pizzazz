import { createMachine, forwardTo } from "xstate";
import { serverGameMachine } from "./serverGameMachine";
import { serverMachineSchema } from "../../../server.types";

export function serverMachine() {
  return createMachine({
    id: "serverMachine",
    initial: "idle",
    states: {
      idle: {
        on: {
          firstUserConnected: {
            target: "connected",
          },
        },
      },
      connected: {
        entry: forwardTo("serverGameMachine"),
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
    ...serverMachineSchema,
    tsTypes: {} as import("./serverMachine.typegen").Typegen0,
    predictableActionArguments: true,
  });
}
