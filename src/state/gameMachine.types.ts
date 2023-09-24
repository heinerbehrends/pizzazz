import { ScreenNameMessage } from "../components/Buttons";

export type UpdateLettersMessage = {
  type: "updateLetters";
  letters: string;
};

export type LetterDroppedEvent = {
  type: "letterDropped";
  dragIndex: number;
  dropIndex: number;
};

export type StartGameMessage = {
  type: "startGame";
  time: number;
  letters: string;
};

export type WaitMessage = {
  type: "wait";
  time: number;
};

export type AnimateEvent = {
  type: "animate";
  index: number;
};

export type JoinGameEvent = {
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
