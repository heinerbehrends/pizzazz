import { ClientToServerMessage } from "./src/state/gameMachine.types";

export type ValidLengthDefinitionMessage = {
  type: "validLengthDefinition";
  validWordLength: number;
  definition: string | null;
};

export type TimeAndLettersMessage = {
  type: "timeAndLetters";
  time: number;
  letters: string;
};
export type NewTimeAndLettersMessage = {
  type: "newTimeAndLetters";
  time: number;
  letters: string;
};

export type PlayerSolutionMessage = {
  type: "playerSolution";
  name: string;
  length: number;
  score: number;
};

export type WithExcludedPlayers<Message extends { type: string }> = Message & {
  excludedPlayers: string[];
};

export type AddExcludedPlayers<Messages extends { type: string }> = {
  [Message in Messages as Message["type"]]: WithExcludedPlayers<Message>;
}[Messages["type"]];

export type UserDisconnectedNotification = {
  type: "userDisconnected";
};

export type NewPlayerNotification = {
  type: "newPlayer";
};

export type ServerConnectionEvent =
  | WithConnectionId<{ type: "firstUserConnected" }>
  | { type: "lastUserDisconnected" }
  | WithConnectionId<UserDisconnectedNotification>
  | WithConnectionId<NewPlayerNotification>;

export type ServerToClientMessage =
  | ValidLengthDefinitionMessage
  | TimeAndLettersMessage
  | NewTimeAndLettersMessage
  | PlayerSolutionMessage;

export type WithConnectionId<Type extends { type: string }> = Type & {
  connectionId: string;
};

type AddId<Events extends { type: string }> = {
  [Event in Events as Event["type"]]: WithConnectionId<Event>;
}[Events["type"]];

type ExtendedClientToServerMessage = AddExcludedPlayers<
  AddId<ClientToServerMessage>
>;

export type SendToParentEvent =
  | ExtendedClientToServerMessage
  | {
      type: "";
    };

export const serverGameMachineSchema = {
  schema: {
    events: {} as
      | { type: "updateTime" }
      | WithConnectionId<NewPlayerNotification>
      | ServerConnectionEvent
      | ExtendedClientToServerMessage,
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
      | WithConnectionId<NewPlayerNotification>
      | ServerConnectionEvent
      | WithConnectionId<TimeAndLettersMessage>
      | AddId<ClientToServerMessage>,
  },
};
