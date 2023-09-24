import PartySocket from "partysocket";
import { assign, createMachine } from "xstate";
import { forwardTo } from "xstate/lib/actions";
import { animationMachine } from "./animationMachine";
import { dragAndDropMachine } from "./dragAndDropMachine";
import { gameDuration } from "../srcServer/serverGameMachine";
import {
  countdownUpdateTime,
  updateLetters,
  showNextFrame,
  updateValidLengthAndDef,
  setTimeAndLetters,
  setupNewGame,
  setupJoinGame,
  setupWaitingGame,
  displaySolution,
} from "./gameMachine.assignFunctions";
import { gameMachineSchema } from "./gameMachine.types";
import { type TimeAndLettersReply } from "../../server.types";

export type GameMachineContext = {
  letters: string;
  lettersStatic: string;
  validWordLength: number;
  message: string;
  definition: string;
  time: number;
  name: string;
};

export function gameMachine(socket: PartySocket) {
  return createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5RQIYFswFkUGMAWAlgHZgB0A9kQEbkoBOExUAxCkQWigC5gDaADAF1EoAA7lYBLgUoiQAD0QAWJaQBsAdgBMarVu1L+ARiUAOJQBoQAT0QBmOwE5SdpQFYjp00btu13-QBfQKtUDGx8YjJKGnpGIhYAdxQpAWEkEHFJaVkMxQQtHxc1O35TYzdHDw07UytbBCUnUg0TPSUtY00dYND0LFxCElJkqSZmACtyYgBxfrS5LLHc0HylNX4Wu0L+LTcNJU8dN3rlf1JKjxKNUzsTUzVekDCByOHR6QTmWC56LjmMAsMksckQ5GsNlsdnsDkc1CcbPYDqQjJ5HOi3EoNI5dm4ni8IkMyBA6CgoABBIgQAAidHIomYABswFweHRafTRJAgWIJMswXlEBs1KQmioNBo3G5CloqqcEK4tKRHBo1D4JVoOkd8f1CVFSCSyZSaXSGQA3FCMggQAAyYASXDwxupYAAZjzMnzQeChcYofxHDocY5TBL5ZrTKL0SrXF4VZ0NDrwoN9YaKVSOQyfn8AHJgRIAvhCRZemQC1ZCzqi1UmWuHI7yoyY0i7WoBvZ2bSVRNPIjkCBwOQElMkEvZMs+hAAWjsLn0ne0kpDHj8dUR05F-C325325MSdeRIo1FoDCYY-5k6x8qakdMhV8Wk77YOB717xSnygF+9goVzScUNbnMQCNBvXRSE6J9+DUTQbkxcw3xHYlSXTE16R-Cc-10SMjE1KodFRENwMjNVTBjPQ3C3IxJWCYIgA */
      id: "gameMachine",
      initial: "onboarding",
      invoke: [
        {
          id: "socket",
          src: "socketCallback",
        },
        {
          id: "dragAndDropMachine",
          src: dragAndDropMachine,
          data: {
            letters: (context: GameMachineContext) => context.letters,
            socket: () => socket,
          },
        },
      ],
      states: {
        onboarding: {
          invoke: [
            {
              id: "animationMachine",
              src: animationMachine,
              data: {
                index: 0,
              },
            },
          ],
          on: {
            animate: {
              actions: ["showNextFrame"],
            },
            timeAndLettersReply: [
              {
                target: "waiting",
                actions: ["setupWaitingGame"],
                cond: "isLittleTimeLeft",
              },
              {
                target: "dragAndDrop",
                actions: ["setupGame"],
                cond: "isEnoughTimeLeft",
              },
            ],
          },
        },
        waiting: {
          after: {
            1000: {
              target: "waiting",
              actions: ["countdown"],
            },
          },
          on: {
            joinGame: { target: "dragAndDrop", actions: ["setupJoinGame"] },
            startNewGame: {
              actions: ["setupGame"],
              target: "dragAndDrop",
            },
          },
        },
        dragAndDrop: {
          invoke: {
            id: "animationMachine",
            src: animationMachine,
            data: {
              index: 0,
            },
          },
          on: {
            animate: { actions: ["showNextFrame"] },
            letterDropped: {
              actions: ["updateLetters", "sendLettersToServer"],
            },
            validLengthAndDef: {
              actions: ["setValidLengthAndDef"],
            },
            startNewGame: {
              actions: ["setupNewGame", forwardTo("animationMachine")],
            },
            solution: {
              actions: ["sendToServer"],
            },
            playerSolution: {
              actions: ["displaySolution"],
            },
          },
        },
      },
      context: {
        letters: "pizzazz",
        lettersStatic: "pizzazz",
        validWordLength: 0,
        message: "Welcome to Pizzazz",
        definition: "a micro-scrabble word game",
        time: gameDuration,
        name: "",
      },
      ...gameMachineSchema,
      tsTypes: {} as import("./gameMachine.typegen").Typegen0,
      predictableActionArguments: true,
    },
    {
      actions: {
        sendToServer: (_, event) => {
          socket.send(JSON.stringify(event));
        },
        sendLettersToServer: (context) => {
          socket.send(
            JSON.stringify({ type: "updateLetters", letters: context.letters })
          );
        },
        countdown: assign(countdownUpdateTime),
        updateLetters: assign(updateLetters),
        showNextFrame: assign(showNextFrame),
        setValidLengthAndDef: assign(updateValidLengthAndDef),
        setupGame: assign(setTimeAndLetters),
        setupNewGame: assign(setupNewGame),
        setupJoinGame: assign(setupJoinGame),
        setupWaitingGame: assign(setupWaitingGame),
        displaySolution: assign(displaySolution),
      },
      guards: {
        isLittleTimeLeft: (_, event: TimeAndLettersReply) => event.time > 0,
        isEnoughTimeLeft: (_, event: TimeAndLettersReply) => event.time > 20,
      },
      services: {
        // subscribe to messages from the
        socketCallback: () => (callback) => {
          socket.addEventListener("message", (event) => {
            console.log("message from server: ", event.data);
            callback(JSON.parse(event.data));
          });
        },
      },
    }
  );
}

const abc = "abcdefghijklmnopqrstuvwxyz";

const getRandomIndex = (string: string) =>
  Math.floor(Math.random() * string.length);
const getRandomLetter = (string: string) => string[getRandomIndex(string)];
export const getRandomAbc = () => getRandomLetter(abc);
