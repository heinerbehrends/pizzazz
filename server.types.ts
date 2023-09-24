import { ClientToServerMessage } from "./src/state/gameMachine.types";

export type ValidLengthAndDefMessage = {
  type: "validLengthAndDef";
  length: number;
  definition: string | null;
  excludedPlayers?: string[];
};

export type TimeAndLettersReply = {
  type: "timeAndLettersReply";
  letters: string;
  time: number;
  excludedPlayers: string[];
};

export type StartNewGameMessage = {
  type: "startNewGame";
  letters: string;
  time: number;
  validWords: string[];
  excludedPlayers?: string[];
};

export type PlayerSolutionMessage = {
  type: "playerSolution";
  name: string;
  length: number;
  score: number;
  excludedPlayers: string[];
};

export type UserDisconnectedEvent = {
  type: "userDisconnected";
  connectionId: string;
};

export type ServerToClientMessage =
  | ValidLengthAndDefMessage
  | TimeAndLettersReply
  | StartNewGameMessage
  | PlayerSolutionMessage;

export type WithConnectionId<Type extends { type: string }> = Type & {
  connectionId: string;
};

type addId<Events extends { type: string }> = {
  [Event in Events as Event["type"]]: WithConnectionId<Event>;
}[Events["type"]];

export type ClientToServerMessageWithId = addId<ClientToServerMessage>;

export type SendToParentEvent =
  | ClientToServerMessageWithId
  | {
      type: "";
    };

export type ServerGameMachineContext = {
  time: number;
  randomLetters: string;
  players: Record<string, string>;
  solutions: Record<string, string>;
};
