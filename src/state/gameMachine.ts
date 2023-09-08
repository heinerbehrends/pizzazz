import { assign, createMachine } from "xstate";
import { entryAnimationMachine } from "./entryAnimationMachine";
import { dragAndDropMachine } from "./dragAndDropMachine";
import { swapLetters } from "./dragAndDropLogic";
import PartySocket from "partysocket";

type GameMachineContext = {
  letters: string;
  index: number;
};

export function gameMachine(socket: PartySocket) {
  return createMachine(
    {
      id: "gameMachine",
      initial: "entryAnimation",
      invoke: {
        id: "socket",
        src: (context, event) => (callback, onEvent) => {
          console.log("Hello from src");
          socket.addEventListener("message", (evt) => {
            console.log(evt.data); // "hello from room: my-room"
          });
          // You can also send messages to the server
          socket.send(
            JSON.stringify({ type: "updateLetters", letters: "ipzzazz" })
          );
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
              actions: ["updateLetters"],
            },
          },
        },
      },
      context: {
        letters: "pizzazz",
        index: 0,
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
          | { type: "letterDropped"; dragIndex: number; dropIndex: number },
        context: {
          letters: "pizzazz" as string,
          index: 0 as number,
        },
        events: {} as
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
        showNextFrame: assign(showNextFrame),
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
