import { assign, createMachine } from "xstate";
import { serverGameMachineSchema } from "../../server.types";
import { log, sendParent } from "xstate/lib/actions";
import { generateRandomLetters } from "./generateRandomLetters";
import {
  countdownTime,
  reactToClient,
  removeNameAndId,
  saveId,
  saveNameAndId,
  saveSolution,
  setNewGame,
} from "./serverGameMachine.functions";

export const gameDuration = 50;

export type ServerGameMachineContext = {
  time: number;
  randomLetters: string;
  players: Record<string, string>;
  solutions: Record<string, string>;
};

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
            actions: ["setupNewGame", "reactToClient"],
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
              actions: ["reactToClient", "saveSolution", "logSolutions"],
            },
          },
        },
      },
      context: {
        time: gameDuration,
        randomLetters: generateRandomLetters(),
        players: {},
        solutions: {},
      },
      predictableActionArguments: true,
      ...serverGameMachineSchema,
      tsTypes: {} as import("./serverGameMachine.typegen").Typegen0,
    },
    {
      actions: {
        setupNewGame: assign(setNewGame),
        updateTime: assign(countdownTime),
        saveId: assign(saveId),
        saveNameAndId: assign(saveNameAndId),
        removeNameAndId: assign(removeNameAndId),
        reactToClient: sendParent(reactToClient),
        saveSolution: assign(saveSolution),
        logSolutions: log(
          (context: ServerGameMachineContext) => context.solutions
        ),
      },
      guards: {
        isTimeOver: (context: ServerGameMachineContext) => context.time === -1,
      },
    }
  );
}
