import { ServerToClientMessage } from "../../server.types";
import { ScreenNameMessage } from "../components/Buttons";

export type LettersChangedMessage = {
  type: "lettersChanged";
  letters: string;
};

export type LetterDroppedEvent = {
  type: "letterDropped";
  dragIndex: number;
  dropIndex: number;
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
  | LettersChangedMessage
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
      | { type: "setTime" }
      | { type: "showNextFrame" }
      | { type: "sendToServer" }
      | { type: "countdown" }
      | { type: "setupJoinGame" }
      | { type: "setupWaitingGame" }
      | { type: "displaySolution" }
      | { type: "setDefinition" }
      | { type: "sendLettersChanged" }
      | { type: "setValidLength" },

    context: {
      letters: "pizzazz" as string,
      lettersStatic: "pizzazz" as string,
      validWordLength: 0 as number,
      message: "" as string,
      definition: "" as string | null,
      time: 50 as number,
      name: "" as string,
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
