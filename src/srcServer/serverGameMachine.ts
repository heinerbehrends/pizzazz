import { assign, createMachine } from "xstate";
import {
  PlayerSolutionMessage,
  StartNewGameMessage,
  TimeAndLettersReply,
  UserDisconnectedEvent,
  ValidLengthAndDefMessage,
} from "../../server.types";
import { sendParent } from "xstate/lib/actions";
import { generateRandomLetters } from "./generateRandomLetters";
import { findValidWords, getValidWordLength } from "./findValidWords";
import dictionary from "./dictionary.json";
import dictWithSortedKeys from "./associative.json";
import { ClientToServerMessageWithId, withConnectionId } from "./serverMachine";
import { ScreenNameMessage } from "../components/Buttons";

export const gameDuration = 50;

export function serverGameMachine() {
  return createMachine(
    {
      id: "serverGameMachine",
      initial: "playing",
      states: {
        playing: {
          after: {
            1000: {
              actions: ["updateTime"],
              target: "playing",
            },
          },
          always: {
            actions: ["newRandomLetters", "reactToClient"],
            cond: "isTimeOver",
          },

          on: {
            newPlayer: {
              actions: ["saveId"],
            },
            screenName: {
              actions: ["reactToClient", "saveNameAndId"],
            },
            userDisconnected: {
              actions: ["removeNameAndId"],
            },
            updateLetters: {
              actions: ["reactToClient"],
            },
            solution: {
              actions: ["reactToClient"],
            },
          },
        },
      },
      context: {
        time: gameDuration,
        randomLetters: generateRandomLetters(),
        players: {},
      },
      schema: {
        events: {} as
          | { type: "updateTime" }
          | withConnectionId<{ type: "newPlayer" }>
          | UserDisconnectedEvent
          | ClientToServerMessageWithId,
        actions: {} as
          | { type: "updateTime" }
          | { type: "newRandomLetters" }
          | { type: "reactToClient" }
          | { type: "removeNameAndId" }
          | { type: "saveNameAndId" }
          | { type: "saveId" },
        context: {
          time: 50 as number,
          randomLetters: "" as string,
          players: {} as Record<string, string>,
        },
      },
      predictableActionArguments: true,
      tsTypes: {} as import("./serverGameMachine.typegen").Typegen0,
    },
    {
      actions: {
        newRandomLetters: assign(setRandomLetters),
        updateTime: assign(countdownTime),
        saveId: assign(saveId),
        saveNameAndId: assign(saveNameAndId),
        removeNameAndId: assign(removeNameAndId),
        reactToClient: sendParent(reactToClient),
      },
      guards: {
        isTimeOver: (context: ServerGameMachineContext) => context.time === -1,
      },
    }
  );
}

type SendToParentEvent =
  | ClientToServerMessageWithId
  | {
      type: "";
    };

function reactToClient(
  context: ServerGameMachineContext,
  event: SendToParentEvent
) {
  switch (event.type) {
    case "screenName":
      return {
        type: "timeAndLettersReply",
        time: context.time,
        letters: context.randomLetters,
        excludePlayers: Object.keys(context.players).filter(
          (id) => id !== event.connectionId
        ),
      } as TimeAndLettersReply;

    case "updateLetters":
      const validWordLength = getValidWordLength(event.letters);
      return {
        type: "validLengthAndDef",
        length: validWordLength,
        definition: retrieveDefinition(event.letters, validWordLength),
        excludePlayers: Object.keys(context.players).filter(
          (id) => id !== event.connectionId
        ),
      } as ValidLengthAndDefMessage;

    case "solution":
      console.log(context.players);
      return {
        type: "playerSolution",
        name: context.players[event.connectionId],
        length: event.solution.length,
        score: event.score,
        excludePlayers: [event.connectionId],
      } as PlayerSolutionMessage;

    case "":
      const validWords = findValidWords(
        context.randomLetters,
        dictWithSortedKeys
      );
      return {
        type: "startNewGame",
        letters: context.randomLetters,
        time: context.time,
        validWords,
      } as StartNewGameMessage;
  }
}

type ServerGameMachineContext = {
  time: number;
  randomLetters: string;
  players: Record<string, string>;
};

function setRandomLetters(context: ServerGameMachineContext) {
  return {
    ...context,
    time: gameDuration,
    randomLetters: generateRandomLetters(),
  };
}

function countdownTime(context: ServerGameMachineContext) {
  return {
    ...context,
    time: context.time - 1,
  };
}

function saveNameAndId(
  context: ServerGameMachineContext,
  event: withConnectionId<ScreenNameMessage>
) {
  return {
    ...context,
    players: { ...context.players, [event.connectionId]: event.name },
  };
}
function saveId(
  context: ServerGameMachineContext,
  event: withConnectionId<{ type: "newPlayer" }>
) {
  return {
    ...context,
    players: { ...context.players, [event.connectionId]: "" },
  };
}

function removeNameAndId(
  context: ServerGameMachineContext,
  event: UserDisconnectedEvent
) {
  const { [event.connectionId]: removedName, ...newPlayers } = context.players;
  console.log(newPlayers);
  return {
    ...context,
    players: newPlayers,
  };
}

function retrieveDefinition(letters: string, validWordLength: number) {
  if (validWordLength > 0) {
    return (
      dictionary?.[
        letters
          .substring(0, validWordLength)
          .toUpperCase() as keyof typeof dictionary
      ] || null
    );
  }
  return null;
}
