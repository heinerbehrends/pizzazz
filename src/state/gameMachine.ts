import { assign, createMachine } from "xstate";
import { entryAnimationMachine } from "./entryAnimationMachine";
import { dragAndDropMachine } from "./dragAndDropMachine";
import { swapLetters } from "./dragAndDropLogic";
import PartySocket from "partysocket";
import { ServerMessage, validWordLengthMessage } from "../../server";

type GameMachineContext = {
  letters: string;
  validWordLength: number;
};

export type UpdateLettersMessage = {
  type: "updateLetters";
  letters: string;
};

export function gameMachine(socket: PartySocket) {
  return createMachine(
    {
      id: "gameMachine",
      initial: "entryAnimation",
      invoke: {
        id: "socket",
        // src: (context, event) => (callback, onEvent) => {
        src: () => (callback) => {
          socket.addEventListener("message", (event) => {
            const message = JSON.parse(event.data) as ServerMessage;
            if (message.type === "validWordLength") {
              callback(message);
              console.log(message.length);
            }
            if (message.type === "randomLetters") {
              console.log("Random letters: ", message.letters);
            }
          });
        },
      },
      states: {
        entryAnimation: {
          invoke: [
            {
              id: "entryAnimationMachine",
              src: entryAnimationMachine,
              onDone: { target: "dragAndDrop" },
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
          on: {
            animate: {
              actions: ["showNextFrame"],
            },
          },
        },
        dragAndDrop: {
          invoke: [
            {
              id: "dragAndDropMachine",
              src: dragAndDropMachine,
              data: {
                letters: (context: GameMachineContext) => context.letters,
                socket,
              },
            },
          ],
          on: {
            letterDropped: {
              target: "dragAndDrop",
              actions: ["updateLetters", "sendLettersToServer"],
            },
            validWordLength: {
              actions: ["setValidWordLength"],
            },
          },
        },
      },
      context: {
        letters: "pizzazz",
        validWordLength: 0,
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
        setValidWordLength: assign(updateValidWordLength),
      },
    }
  );
}

type LetterDroppedEvent = {
  type: "letterDropped";
  dragIndex: number;
  dropIndex: number;
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
  const randomPart = Array(7 - event.index)
    .fill(null)
    .map(getRandomAbc)
    .join("");
  return {
    ...context,
    letters: staticPart + randomPart,
  };
}

function updateValidWordLength(
  context: GameMachineContext,
  event: validWordLengthMessage
) {
  return {
    ...context,
    validWordLength: event.length,
  };
}
