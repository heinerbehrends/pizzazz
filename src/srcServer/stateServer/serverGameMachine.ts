import { assign, createMachine } from "xstate";
import { serverGameMachineSchema } from "../../../server.types";
import { choose, log, sendParent } from "xstate/lib/actions";
import { generateLettersWithValidWords } from "../logicServer/generateRandomLetters";
import {
  countdownTime,
  reactToClient,
  removeNameAndId,
  saveId,
  saveNameAndId,
  saveSolution,
  setNewGame,
} from "./serverGameMachine.functions";

export const gameDuration = 20;

export type ServerGameMachineContext = {
  time: number;
  randomLetters: string;
  players: Record<string, string>;
  solutions: Record<string, string>;
  validWords: string[];
};

const [initialLetters, initialValidWords] = generateLettersWithValidWords(5);

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
            firstUserConnected: {
              actions: ["saveId"],
            },
            newPlayer: {
              actions: ["saveId"],
            },
            screenName: {
              actions: [
                choose([{ cond: "isFirstPlayer", actions: ["setupNewGame"] }]),
                "reactToClient",
                "saveNameAndId",
              ],
            },
            userDisconnected: {
              actions: ["removeNameAndId"],
            },
            lettersChanged: {
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
        randomLetters: initialLetters,
        validWords: initialValidWords,
        players: {},
        solutions: {},
      },
      predictableActionArguments: true,
      ...serverGameMachineSchema,
      tsTypes: {} as import("./serverGameMachine.typegen").Typegen0,
    },
    {
      actions: {
        reactToClient: sendParent(reactToClient),
        setupNewGame: assign(setNewGame),
        updateTime: assign(countdownTime),
        saveId: assign(saveId),
        saveNameAndId: assign(saveNameAndId),
        removeNameAndId: assign(removeNameAndId),
        saveSolution: assign(saveSolution),
        logSolutions: log(
          (context: ServerGameMachineContext) => context.solutions
        ),
      },
      guards: {
        isTimeOver: (context: ServerGameMachineContext) => context.time === -1,
        isFirstPlayer: (context: ServerGameMachineContext) =>
          Object.keys(context.players).length === 0,
      },
    }
  );
}
