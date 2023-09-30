import { ServerToClientMessage } from "../../server.types";
import { ScreenNameMessage } from "../components/Buttons";

export type GetDefinitionMessage = {
  type: "getDefinition";
  letters: string;
};

export type LetterDroppedEvent = {
  type: "letterDropped";
  dragIndex: number;
  dropIndex: number;
};

// export type StartGameMessage = {
//   type: "startGame";
//   time: number;
//   letters: string;
//   validWords: string[];
// };

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
  | GetDefinitionMessage
  | ScreenNameMessage
  | SolutionMessage;

export const gameMachineSchema = {
  schema: {
    services: {
      animationMachine: {} as {
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
      | { type: "displaySolution" }
      | { type: "setDefinition" }
      | { type: "setValidLength" },

    context: {
      letters: "pizzazz" as string,
      lettersStatic: "pizzazz" as string,
      validWordLength: 0 as number,
      message: "" as string,
      definition: "" as string,
      time: 50 as number,
      name: "" as string,
      validWords: [] as string[],
    },
    events: {} as
      | ServerToClientMessage
      | ClientToServerMessage
      | WaitMessage
      | LetterDroppedEvent
      | { type: "animate"; index: number }
      | MouseEvent
      | JoinGameEvent,
  },
};
