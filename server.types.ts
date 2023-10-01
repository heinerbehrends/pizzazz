import { ClientToServerMessage } from "./src/state/gameMachine.types";

export type DefinitionMessage = {
  type: "definition";
  definition: string | null;
  excludedPlayers?: string[];
};

export type TimeAndLettersReply = {
  type: "timeAndLettersReply";
  letters: string;
  validWords: string[];
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
};

export type NewPlayerEvent = {
  type: "newPlayer";
};

export type ServerConnectionEvent =
  | WithConnectionId<{ type: "firstUserConnected" }>
  | { type: "lastUserDisconnected" }
  | WithConnectionId<UserDisconnectedEvent>
  | WithConnectionId<NewPlayerEvent>;

export type ServerToClientMessage =
  | DefinitionMessage
  | TimeAndLettersReply
  | StartNewGameMessage
  | PlayerSolutionMessage;

export type WithConnectionId<Type extends { type: string }> = Type & {
  connectionId: string;
};

type addId<Events extends { type: string }> = {
  [Event in Events as Event["type"]]: WithConnectionId<Event>;
}[Events["type"]];

type ClientToServerMessageWithId = addId<ClientToServerMessage>;

export type SendToParentEvent =
  | ClientToServerMessageWithId
  | {
      type: "";
    };

export const serverGameMachineSchema = {
  schema: {
    events: {} as
      | { type: "updateTime" }
      | WithConnectionId<NewPlayerEvent>
      | ServerConnectionEvent
      | ClientToServerMessageWithId,
    actions: {} as
      | { type: "updateTime" }
      | { type: "setupNewGame" }
      | { type: "reactToClient" }
      | { type: "removeNameAndId" }
      | { type: "saveNameAndId" }
      | { type: "saveId" }
      | { type: "saveSolution" }
      | { type: "logSolutions" },
    context: {
      time: 50 as number,
      randomLetters: "" as string,
      players: {} as Record<string, string>,
      solutions: {} as Record<string, string>,
      validWords: [] as string[],
    },
  },
};

export const serverMachineSchema = {
  schema: {
    context: {} as { value: string },
    events: {} as
      | WithConnectionId<NewPlayerEvent>
      | ServerConnectionEvent
      | WithConnectionId<TimeAndLettersReply>
      | ClientToServerMessageWithId,
  },
};
