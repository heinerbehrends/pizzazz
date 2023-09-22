import { assign, createMachine } from "xstate";
import { entryAnimationMachine } from "./entryAnimationMachine";
import { dragAndDropMachine } from "./dragAndDropMachine";
import { swapLetters } from "./dragAndDropLogic";
import PartySocket from "partysocket";
import {
  ServerMessage,
  StartNewGameMessage,
  validLengthAndDefMessage,
} from "../../server";
import * as R from "remeda";
import { forwardTo } from "xstate/lib/actions";

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
          // src: (context, event) => (callback, onEvent) => {
          src: () => (callback) => {
            socket.addEventListener("message", (event) => {
              const message = JSON.parse(event.data) as ServerMessage;
              console.log(message);
              if (message.type === "validLengthAndDef") {
                callback(message);
              }
              if (message.type === "timeAndLettersReply") {
                // callback(message)
                if (message.time >= 20) {
                  callback({ type: "wait", time: message.time });
                }
                callback({
                  type: "startGame",
                  time: message.time,
                  randomLetters: message.letters,
                });
              }
              if (message.type === "startNewGame") {
                callback(message);
              }
            });
          },
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
              id: "entryAnimationMachine",
              src: entryAnimationMachine,
              data: {
                index: 0,
              },
            },
          ],
          on: {
            animate: {
              actions: ["showNextFrame"],
            },
            wait: { target: "waiting", actions: ["setTime"] },
          },
        },
        waiting: {
          on: {
            joinGame: { target: "dragAndDrop" },
            startGame: {
              actions: ["setupGame"],
              target: "dragAndDrop",
            },
          },
        },
        dragAndDrop: {
          invoke: {
            id: "entryAnimationMachine",
            src: entryAnimationMachine,
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
              actions: ["setupNewGame", forwardTo("entryAnimationMachine")],
            },
            sendSolution: {
              actions: ["sendSolutionToServer"],
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
        time: 0,
        name: "",
      },
      schema: {
        services: {
          entryAnimationMachine: {} as {
            src: () => (callback: ({}) => {}) => void;
            data: {
              letters: string;
              index: number;
            };
          },
          dragAndDropMachine: {} as {
            src: () => (callback: ({}) => {}) => void;
            data: {
              letters: string;
            };
          },
        },
        actions: {} as
          | { type: "animate"; index: number }
          | { type: "updateLetters" }
          | { type: "sendLettersToServer" }
          | { type: "setTime" }
          | { type: "showNextFrame" },
        context: {
          letters: "pizzazz" as string,
          lettersStatic: "pizzazz" as string,
          validWordLength: 0 as number,
          message: "" as string,
          definition: "" as string,
          time: 40 as number,
          name: "" as string,
        },
        events: {} as
          | ServerMessage
          | StartGameMessage
          | WaitMessage
          | LetterDroppedEvent
          | { type: "animate"; index: number }
          | MouseEvent
          | JoinGameEvent
          | StartNewGameMessage
          | SolutionMessage,
      },
      tsTypes: {} as import("./gameMachine.typegen").Typegen0,
      predictableActionArguments: true,
    },
    {
      actions: {
        updateLetters: assign(updateLetters),
        sendLettersToServer: (context) => {
          socket.send(
            JSON.stringify({ type: "updateLetters", letters: context.letters })
          );
        },
        showNextFrame: assign(showNextFrame),
        setValidLengthAndDef: assign(updateValidLengthAndDef),
        setTime: assign(setTime),
        setupGame: assign(setTimeAndLetters),
        setupNewGame: assign(setupNewGame),
        sendSolutionToServer: (context) => {
          socket.send(
            JSON.stringify({
              type: "solution",
              solution: context.letters.substring(0, context.validWordLength),
            })
          );
        },
      },
    }
  );
}

function updateLetters(context: GameMachineContext, event: LetterDroppedEvent) {
  if (event.dropIndex === null) {
    return context;
  }
  const letters = swapLetters(
    context.letters,
    event.dragIndex,
    event.dropIndex
  );
  return {
    ...context,
    letters,
  };
}

const abc = "abcdefghijklmnopqrstuvwxyz";

const getRandomIndex = (string: string) =>
  Math.floor(Math.random() * string.length);
const getRandomLetter = (string: string) => string[getRandomIndex(string)];
const getRandomAbc = () => getRandomLetter(abc);

function showNextFrame(context: GameMachineContext, event: AnimateEvent) {
  const staticPart = context.lettersStatic.substring(0, event.index);
  const randomPart = R.pipe(
    Array(7 - event.index),
    R.map(getRandomAbc),
    (array) => array.join("")
  );

  return {
    ...context,
    letters: staticPart + randomPart,
  };
}

function updateValidLengthAndDef(
  context: GameMachineContext,
  event: validLengthAndDefMessage
) {
  function getDefinition(event: validLengthAndDefMessage) {
    const isValid = event.length > 0;
    if (event.definition) {
      return event.definition;
    }
    if (isValid) {
      return "no definition found";
    }
    return "find a valid word";
  }
  return {
    ...context,
    validWordLength: event.length,
    definition: getDefinition(event),
  };
}

function setTime(context: GameMachineContext, event: WaitMessage) {
  return { ...context, time: event.time };
}

function setTimeAndLetters(
  context: GameMachineContext,
  event: StartGameMessage
): GameMachineContext {
  return {
    ...context,
    time: event.time,
    letters: event.randomLetters,
    lettersStatic: event.randomLetters,
  };
}

function setupNewGame(
  context: GameMachineContext,
  event: StartNewGameMessage
): GameMachineContext {
  console.log("Hello from setupNewGame: ", event);
  return {
    ...context,
    validWordLength: 0,
    letters: event.letters,
    lettersStatic: event.letters,
    time: 50,
  };
}
export type UpdateLettersMessage = {
  type: "updateLetters";
  letters: string;
};

type LetterDroppedEvent = {
  type: "letterDropped";
  dragIndex: number;
  dropIndex: number;
};

type StartGameMessage = {
  type: "startGame";
  time: number;
  randomLetters: string;
};

type WaitMessage = {
  type: "wait";
  time: number;
};

export type AnimateEvent = {
  type: "animate";
  index: number;
};

type JoinGameEvent = {
  type: "joinGame";
};

type SolutionMessage = {
  type: "solution";
  solution: string;
};
