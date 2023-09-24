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
