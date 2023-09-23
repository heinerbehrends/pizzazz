import { assign, createMachine } from "xstate";
import { NewPlayerMessage, ServerToClientMessage } from "../../server.types";
import { sendParent } from "xstate/lib/actions";
import { generateRandomLetters } from "./generateRandomLetters";
import { UpdateLettersMessage } from "../state/gameMachine";
import { getValidWordLength } from "./findValidWords";
import dictionary from "./dictionary.json";

export function serverGameMachine() {
  return createMachine(
    {
      id: "serverGameMachine",
      initial: "playing",
      invoke: {
        id: "updateTimeInterval",
        src: "updateTimeInterval",
      },
      states: {
        playing: {
          after: {
            1000: {
              actions: ["updateTime"],
              target: "playing",
            },
          },
          always: {
            actions: ["newRandomLetters", "startNewGame"],
            cond: "isTimeOver",
          },

          on: {
            newPlayer: {
              actions: ["sendTimeAndRandomLetters"],
            },
            updateLetters: {
              actions: ["sendValidLengthAndDef"],
            },
          },
        },
      },
      context: {
        time: 50,
        randomLetters: generateRandomLetters(),
      },
      schema: {
        events: {} as
          | { type: "updateTime" }
          | NewPlayerMessage
          | UpdateLettersMessage,
        actions: {} as
          | { type: "updateTime" }
          | { type: "sendTimeAndRandomLetters" }
          | { type: "newRandomLetters" }
          | { type: "validLengthAndDef" },
        context: {
          time: 50 as number,
          randomLetters: "" as string,
        },
      },
      predictableActionArguments: true,
      tsTypes: {} as import("./serverGameMachine.typegen").Typegen0,
    },
    {
      actions: {
        updateTime: assign((context) => {
          return {
            ...context,
            time: context.time - 1,
          };
        }),
        sendTimeAndRandomLetters: sendParent(
          (context: ServerGameMachineContext) => {
            return {
              type: "timeAndLettersReply",
              time: context.time,
              letters: context.randomLetters,
            } as ServerToClientMessage;
          }
        ),
        sendValidLengthAndDef: sendParent((_, event) => {
          const validWordLength = getValidWordLength(event.letters);
          return {
            type: "validLengthAndDef",
            length: validWordLength,
            definition: retrieveDefinition(event.letters, validWordLength),
          };
        }),
        newRandomLetters: assign(setRandomLetters),
        startNewGame: sendParent((context) => ({
          type: "startNewGame",
          letters: context.randomLetters,
        })),
      },
      guards: {
        isTimeOver: (context: ServerGameMachineContext) => context.time === -1,
      },
    }
  );
}

type ServerGameMachineContext = { time: number; randomLetters: string };

function setRandomLetters(context: ServerGameMachineContext) {
  return { ...context, time: 50, randomLetters: generateRandomLetters() };
}
function retrieveDefinition(letters: string, validWordLength: number) {
  if (validWordLength > 0) {
    return (
      dictionary?.[
        letters
          .substring(0, validWordLength)
          .toUpperCase() as keyof typeof dictionary
      ] || null
    );
  }
  return null;
}
