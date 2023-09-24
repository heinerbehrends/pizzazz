import { assign, createMachine } from "xstate";
import { entryAnimationMachine } from "./entryAnimationMachine";
import { dragAndDropMachine } from "./dragAndDropMachine";
import { swapLetters } from "./dragAndDropLogic";
import PartySocket from "partysocket";
import * as R from "remeda";
import { forwardTo } from "xstate/lib/actions";
import {
  PlayerSolutionMessage,
  ServerToClientMessage,
  StartNewGameMessage,
  TimeAndLettersReply,
  ValidLengthAndDefMessage,
} from "../../server.types";
import { gameDuration } from "../srcServer/serverGameMachine";
import { ScreenNameMessage } from "../components/Buttons";

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
          | { type: "showNextFrame" }
          | { type: "sendToServer" }
          | { type: "countdown" }
          | { type: "setupJoinGame" }
          | { type: "setupWaitingGame" }
          | { type: "displaySolution" },

        context: {
          letters: "pizzazz" as string,
          lettersStatic: "pizzazz" as string,
          validWordLength: 0 as number,
          message: "" as string,
          definition: "" as string,
          time: 50 as number,
          name: "" as string,
        },
        events: {} as
          | ServerToClientMessage
          | ClientToServerMessage
          | StartGameMessage
          | WaitMessage
          | LetterDroppedEvent
          | { type: "animate"; index: number }
          | MouseEvent
          | JoinGameEvent,
      },
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
  event: ValidLengthAndDefMessage
) {
  function getDefinition(event: ValidLengthAndDefMessage) {
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

function setTimeAndLetters(
  context: GameMachineContext,
  event: StartGameMessage
): GameMachineContext {
  console.log("setTimeAndLetters event: ", event);
  return {
    ...context,
    time: event.time,
    lettersStatic: event.letters,
  };
}

function setupWaitingGame(
  context: GameMachineContext,
  event: StartNewGameMessage | TimeAndLettersReply
): GameMachineContext {
  console.log("Hello from setupNewGame: ", event);
  return {
    ...context,
    message: `A new game will start in ${event.time} seconds`,
    validWordLength: 0,
    lettersStatic: event.letters,
    time: event.time,
  };
}

function setupNewGame(
  context: GameMachineContext,
  event: StartNewGameMessage | TimeAndLettersReply
): GameMachineContext {
  console.log("Hello from setupNewGame: ", event);
  return {
    ...context,
    message: `Move the letters to find valid words`,
    validWordLength: 0,
    letters: event.letters,
    lettersStatic: event.letters,
    time: gameDuration,
  };
}
function setupJoinGame(
  context: GameMachineContext,
  event: StartNewGameMessage | TimeAndLettersReply
): GameMachineContext {
  console.log("Hello from setupNewGame: ", event);
  return {
    ...context,
    message: "Move the letters to find valid words",
    validWordLength: 0,
    time: context.time,
  };
}

function countdownUpdateTime(context: GameMachineContext) {
  return {
    ...context,
    time: context.time - 1,
    message: `A new game will start in ${context.time - 1} seconds`,
  };
}

function displaySolution(
  context: GameMachineContext,
  event: PlayerSolutionMessage
) {
  return {
    ...context,
    message: `${event.name} played a ${event.length}-letter-word for ${event.score} points`,
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
  letters: string;
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

export type SolutionMessage = {
  type: "solution";
  solution: string;
  score: number;
};

export type ClientToServerMessage =
  | UpdateLettersMessage
  | ScreenNameMessage
  | SolutionMessage;
