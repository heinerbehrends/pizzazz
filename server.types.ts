export type ValidLengthAndDefMessage = {
  type: "validLengthAndDef";
  length: number;
  definition: string;
  excludePlayers?: string[];
};

export type TimeAndLettersReply = {
  type: "timeAndLettersReply";
  letters: string;
  time: number;
  excludePlayers?: string[];
};

export type StartNewGameMessage = {
  type: "startNewGame";
  letters: string;
  time: number;
  validWords: string[];
  excludePlayers?: string[];
};

export type PlayerSolutionMessage = {
  type: "playerSolution";
  name: string;
  length: number;
  score: number;
  excludePlayers?: string[];
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
