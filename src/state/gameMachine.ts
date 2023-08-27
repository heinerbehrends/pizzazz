import { assign, createMachine } from "xstate";
import { entryAnimationMachine } from "./entryAnimationMachine";
import { dragAndDropMachine } from "./dragAndDropMachine";
import { swapLetters } from "./dragAndDropLogic";
import { forwardTo } from "xstate/lib/actions";

type GameMachineContext = {
  letters: string;
  index: number;
};

export const gameMachine = createMachine(
  {
    id: "gameMachine",
    initial: "entryAnimation",
    states: {
      entryAnimation: {
        invoke: [
          {
            id: "entryAnimationMachine",
            src: entryAnimationMachine,
            data: {
              letters: (context: GameMachineContext) => context.letters,
              index: (context: GameMachineContext) => context.index,
            },
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
        invoke: {
          id: "dragAndDropMachine",
          src: dragAndDropMachine,
          data: {
            letters: (context: GameMachineContext) => context.letters,
          },
        },
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
  console.log(
    "Hooray!!!!!!!!!!!!!!!!!!!!!!\nHello from game/assign/updateLetters"
  );
  if (event.dropIndex === null) {
    return context;
  }
  return {
    ...context,
    letters: swapLetters(context.letters, event.dragIndex, event.dropIndex),
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
