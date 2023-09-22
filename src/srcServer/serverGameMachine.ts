import { assign, createMachine } from "xstate";
import { NewPlayerMessage, ServerMessage } from "../../server";
import { sendParent } from "xstate/lib/actions";
import { generateRandomLetters } from "./generateRandomLetters";

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
          on: {
            updateTime: [
              {
                actions: ["newRandomLetters", "startNewGame"],
                cond: "isTimeOver",
              },
              { actions: "updateTime" },
            ],
            newPlayer: {
              actions: ["sendTimeAndRandomLetters"],
            },
          },
        },
      },
      context: {
        time: 50,
        randomLetters: generateRandomLetters(),
      },
      schema: {
        events: {} as { type: "updateTime" } | NewPlayerMessage,
        actions: {} as
          | { type: "updateTime" }
          | { type: "sendTimeAndRandomLetters" }
          | { type: "newRandomLetters" },
        services: {
          updateTimeInterval: {} as {
            src: () => (callback: ({}) => {}) => void;
            data: null;
          },
        },
        context: {
          time: 50 as number,
          randomLetters: "" as string,
        },
      },
      predictableActionArguments: true,
      tsTypes: {} as import("./serverGameMachine.typegen").Typegen0,
    },
    {
      services: {
        updateTimeInterval: () => (callback) => {
          const intervalId = setInterval(() => {
            callback({ type: "updateTime" });
          }, 1000);
          return () => {
            clearInterval(intervalId);
          };
        },
      },
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
            } as ServerMessage;
          }
        ),
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
