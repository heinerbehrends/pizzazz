import {
  TimeAndLettersReply,
  ValidLengthAndDefMessage,
  PlayerSolutionMessage,
  StartNewGameMessage,
  UserDisconnectedEvent,
} from "../../server.types";
import { ScreenNameMessage } from "../components/Buttons";
import { getValidWordLength, findValidWords } from "./findValidWords";
import { generateRandomLetters } from "./generateRandomLetters";
import {
  ServerGameMachineContext,
  SendToParentEvent,
  gameDuration,
} from "./serverGameMachine";
import { withConnectionId } from "./serverMachine";
import dictionary from "./dictionary.json";
import dictWithSortedKeys from "./associative.json";

export function retrieveDefinition(letters: string, validWordLength: number) {
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
export function reactToClient(
  context: ServerGameMachineContext,
  event: SendToParentEvent
) {
  switch (event.type) {
    case "screenName":
      return {
        type: "timeAndLettersReply",
        time: context.time,
        letters: context.randomLetters,
        excludedPlayers: Object.keys(context.players).filter(
          (id) => id !== event.connectionId
        ),
      } satisfies TimeAndLettersReply;

    case "updateLetters":
      const validWordLength = getValidWordLength(event.letters);
      return {
        type: "validLengthAndDef",
        length: validWordLength,
        definition: retrieveDefinition(event.letters, validWordLength),
        excludedPlayers: Object.keys(context.players).filter(
          (id) => id !== event.connectionId
        ),
      } satisfies ValidLengthAndDefMessage;

    case "solution":
      console.log(context.players);
      return {
        type: "playerSolution",
        name: context.players[event.connectionId],
        length: event.solution.length,
        score: event.score,
        excludedPlayers: [event.connectionId],
      } satisfies PlayerSolutionMessage;

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
      } satisfies StartNewGameMessage;
  }
}

export function setRandomLetters(context: ServerGameMachineContext) {
  return {
    ...context,
    time: gameDuration,
    randomLetters: generateRandomLetters(),
  };
}

export function countdownTime(context: ServerGameMachineContext) {
  return {
    ...context,
    time: context.time - 1,
  };
}

export function saveNameAndId(
  context: ServerGameMachineContext,
  event: withConnectionId<ScreenNameMessage>
) {
  return {
    ...context,
    players: { ...context.players, [event.connectionId]: event.name },
  };
}
export function saveId(
  context: ServerGameMachineContext,
  event: withConnectionId<{ type: "newPlayer" }>
) {
  return {
    ...context,
    players: { ...context.players, [event.connectionId]: "" },
  };
}

export function removeNameAndId(
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
