import { assign, createMachine } from "xstate";
import { entryAnimationMachine } from "./entryAnimationMachine";
import { dragAndDropMachine } from "./dragAndDropMachine";
import { swapLetters } from "./dragAndDropLogic";
import PartySocket from "partysocket";
import { ServerMessage, validLengthAndDefMessage } from "../../server";
import * as R from "remeda";

type GameMachineContext = {
  letters: string;
  validWordLength: number;
  message: string;
  definition: string;
  time: number;
};

export function gameMachine(socket: PartySocket) {
  return createMachine(
    {
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
                console.log(
                  "Random letters: ",
                  message.letters,
                  "\nTime: ",
                  message.time
                );
                if (message.time >= 20) {
                  callback({ type: "wait", time: message.time });
                }
                callback({
                  type: "startGame",
                  time: message.time,
                  randomLetters: message.letters,
                });
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
              // onDone: { target: "dragAndDrop" },
            },
          ],
          on: {
            animate: {
              actions: ["showNextFrame"],
            },
            wait: { target: "waiting", actions: ["setTime"] },
            startGame: {
              actions: ["setupGame"],
              target: "waiting",
            },
          },
        },
        waiting: {},
        dragAndDrop: {
          on: {
            letterDropped: {
              target: "dragAndDrop",
              actions: ["updateLetters", "sendLettersToServer"],
            },
            validLengthAndDef: {
              actions: ["setValidLengthAndDef"],
            },
          },
        },
      },
      context: {
        letters: "pizzazz",
        validWordLength: 0,
        message: "Welcome to Pizzazz",
        definition: "—",
        time: 40,
      },
      schema: {
        services: {
          entryAnimationMachine: {} as {
            src: () => (callback: ({}) => {}) => void;
            data: {
              letters: string;
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
          validWordLength: 0 as number,
          message: "" as string,
          definition: "" as string,
          time: 40 as number,
        },
        events: {} as
          | ServerMessage
          | StartGameMessage
          | WaitMessage
          | LetterDroppedEvent
          | { type: "animate"; index: number }
          | MouseEvent,
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
      },
    }
  );
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

type AnimateEvent = {
  type: "animate";
  index: number;
};

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

function showNextFrame(context: GameMachineContext, event: AnimateEvent) {
  const abc = "abcdefghijklmnopqrstuvwxyz";
  const getRandomIndex = (string: string) =>
    Math.floor(Math.random() * string.length);
  const getRandomLetter = (string: string) => string[getRandomIndex(string)];
  const getRandomAbc = () => getRandomLetter(abc);
  const staticPart = "pizzazz".substring(0, event.index);
  const randomPart = R.pipe(
    Array(7 - event.index).fill(null),
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
) {
  return { ...context, time: event.time, letters: event.randomLetters };
}
