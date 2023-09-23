import { createMachine } from "xstate";
import { serverGameMachine } from "./serverGameMachine";
import { NewPlayerMessage, TimeAndLettersReply } from "../../server.types";
import { UpdateLettersMessage } from "../state/gameMachine";

export function serverMachine() {
  return createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5SzAJwG5oLIEMDGAFgJYB2YAdERADZgDEAriqgMID2JZeALpANoAGALqJQABzawi3Ih1EgAHogCMANgAc5AMw6tygOxaBAVi0AmAJwD9AGhABPRGYHLyxi6ecAWVReer9LwBfILtmTFRcQlIKPA4uXgg6ahxYbgBVZgARIlg4zjAefmF5CSkZOSRFFQ1tXQMjTytbBxVjM3IBL31A5WVjVTMvCy0QsLQIqOIycnyEyDoyAHcABRT7NEERKrLpWRJ5JQQva06PM2V1fT9u52M7RwR1VzNVZRHu-QCtY1MQ0JAJDYEDg8nC2Hw0zApUke0qoCOAFpVA9EMixiBwZFITFKDRoTtYRUDlUjl4zKiEO8tG4ftdVIMzMYrmYMVipri5oVEjDyvtDogtBZXEKzOphsYBP4vJTLgJyIZnlp9K91DpxcZ-kEgA */
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
        | NewPlayerMessage
        | TimeAndLettersReply
        | UpdateLettersMessage,
    },
    tsTypes: {} as import("./serverMachine.typegen").Typegen0,
    predictableActionArguments: true,
  });
}
