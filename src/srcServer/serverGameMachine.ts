import { assign, createMachine } from "xstate";
import {
  ClientToServerMessageWithId,
  ServerGameMachineContext,
  UserDisconnectedEvent,
  WithConnectionId,
} from "../../server.types";
import { sendParent } from "xstate/lib/actions";
import { generateRandomLetters } from "./generateRandomLetters";
import {
  countdownTime,
  reactToClient,
  removeNameAndId,
  saveId,
  saveNameAndId,
  setRandomLetters,
} from "./serverGameMachine.functions";

export const gameDuration = 50;

export function serverGameMachine() {
  return createMachine(
    {
      id: "serverGameMachine",
      initial: "playing",
      states: {
        playing: {
          after: {
            1000: {
              actions: ["updateTime"],
              target: "playing",
            },
          },
          always: {
            actions: ["newRandomLetters", "reactToClient"],
            cond: "isTimeOver",
          },

          on: {
            newPlayer: {
              actions: ["saveId"],
            },
            screenName: {
              actions: ["reactToClient", "saveNameAndId"],
            },
            userDisconnected: {
              actions: ["removeNameAndId"],
            },
            updateLetters: {
              actions: ["reactToClient"],
            },
            solution: {
              actions: ["reactToClient"],
            },
          },
        },
      },
      context: {
        time: gameDuration,
        randomLetters: generateRandomLetters(),
        players: {},
      },
      schema: {
        events: {} as
          | { type: "updateTime" }
          | WithConnectionId<{ type: "newPlayer" }>
          | UserDisconnectedEvent
          | ClientToServerMessageWithId,
        actions: {} as
          | { type: "updateTime" }
          | { type: "newRandomLetters" }
          | { type: "reactToClient" }
          | { type: "removeNameAndId" }
          | { type: "saveNameAndId" }
          | { type: "saveId" },
        context: {
          time: 50 as number,
          randomLetters: "" as string,
          players: {} as Record<string, string>,
        },
      },
      predictableActionArguments: true,
      tsTypes: {} as import("./serverGameMachine.typegen").Typegen0,
    },
    {
      actions: {
        newRandomLetters: assign(setRandomLetters),
        updateTime: assign(countdownTime),
        saveId: assign(saveId),
        saveNameAndId: assign(saveNameAndId),
        removeNameAndId: assign(removeNameAndId),
        reactToClient: sendParent(reactToClient),
      },
      guards: {
        isTimeOver: (context: ServerGameMachineContext) => context.time === -1,
      },
    }
  );
}
