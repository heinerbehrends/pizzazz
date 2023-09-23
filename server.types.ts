import { SolutionMessage, UpdateLettersMessage } from "./src/state/gameMachine";

export type validLengthAndDefMessage = {
  type: "validLengthAndDef";
  length: number;
  definition: string;
};

export type TimeAndLettersReply = {
  type: "timeAndLettersReply";
  letters: string;
  time: number;
};

export type StartNewGameMessage = {
  type: "startNewGame";
  letters: string;
};

export type NewPlayerMessage = { type: "newPlayer"; name: string };

export type ServerToClientMessage =
  | validLengthAndDefMessage
  | TimeAndLettersReply
  | StartNewGameMessage
  | SolutionMessage;

export type ClientToServerMessage = UpdateLettersMessage | NewPlayerMessage;
