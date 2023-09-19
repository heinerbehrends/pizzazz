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
};

export type UpdateLettersMessage = {
  type: "updateLetters";
  letters: string;
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
                console.log(
                  "Random letters: ",
                  message.letters,
                  "\nTime: ",
                  message.time
                );
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
          },
        },
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
        actions: {} as { type: "animate"; index: number },
        context: {
          letters: "pizzazz" as string,
          validWordLength: 0 as number,
          message: "" as string,
          definition: "" as string,
        },
        events: {} as
          | ServerMessage
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
      },
    }
  );
}

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

type AnimateEvent = {
  type: "animate";
  index: number;
};

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
