import { getValidWordLength, findValidWords } from "./findValidWords";
import { generateRandomLetters } from "./generateRandomLetters";
import { ServerGameMachineContext, gameDuration } from "./serverGameMachine";
import dictionary from "./dictionary.json";
import dictWithSortedKeys from "./associative.json";
import { type ScreenNameMessage } from "../components/Buttons";
import {
  type TimeAndLettersReply,
  type ValidLengthAndDefMessage,
  type PlayerSolutionMessage,
  type StartNewGameMessage,
  type UserDisconnectedEvent,
  type SendToParentEvent,
  type WithConnectionId,
} from "../../server.types";
import { SolutionMessage } from "../state/gameMachine.types";

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

export function setNewGame(context: ServerGameMachineContext) {
  return {
    ...context,
    time: gameDuration,
    solutions: {},
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
  event: WithConnectionId<ScreenNameMessage>
) {
  return {
    ...context,
    players: { ...context.players, [event.connectionId]: event.name },
  };
}
export function saveId(
  context: ServerGameMachineContext,
  event: WithConnectionId<{ type: "newPlayer" }>
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

export function saveSolution(
  context: ServerGameMachineContext,
  event: WithConnectionId<SolutionMessage>
) {
  return {
    ...context,
    solutions: { ...context.solutions, [event.connectionId]: event.solution },
  };
}
