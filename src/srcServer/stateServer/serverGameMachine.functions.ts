import { findValidWords } from "./findValidWords";
import { generateRandomLetters } from "./generateRandomLetters";
import { ServerGameMachineContext, gameDuration } from "./serverGameMachine";
import dictionary from "./dictionary.json";
import dictWithSortedKeys from "./associative.json";
import { type ScreenNameMessage } from "../../components/Buttons";
import {
  type TimeAndLettersReply,
  type DefinitionMessage,
  type PlayerSolutionMessage,
  type StartNewGameMessage,
  type SendToParentEvent,
  type WithConnectionId,
  type UserDisconnectedEvent,
  type NewPlayerEvent,
} from "../../../server.types";
import { SolutionMessage } from "../../state/gameMachine.types";

function retrieveDefinition(letters: string) {
  return dictionary?.[letters.toUpperCase() as keyof typeof dictionary] || null;
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
        validWords: context.validWords,
        excludedPlayers: Object.keys(context.players).filter(
          (id) => id !== event.connectionId
        ),
      } satisfies TimeAndLettersReply;

    case "getDefinition":
      return {
        type: "definition",
        definition: retrieveDefinition(event.letters),
        excludedPlayers: Object.keys(context.players).filter(
          (id) => id !== event.connectionId
        ),
      } satisfies DefinitionMessage;

    case "solution":
      return {
        type: "playerSolution",
        name: context.players[event.connectionId],
        length: event.solution.length,
        score: event.score,
        excludedPlayers: [event.connectionId],
      } satisfies PlayerSolutionMessage;

    case "":
      return {
        type: "startNewGame",
        letters: context.randomLetters,
        time: context.time,
        validWords: context.validWords,
      } satisfies StartNewGameMessage;
  }
}

export function setNewGame(
  context: ServerGameMachineContext
): ServerGameMachineContext {
  const randomLetters = generateRandomLetters();
  const validWords = findValidWords(randomLetters, dictWithSortedKeys);
  return {
    ...context,
    time: gameDuration,
    solutions: {},
    randomLetters: randomLetters,
    validWords,
  };
}

export function countdownTime(
  context: ServerGameMachineContext
): ServerGameMachineContext {
  return {
    ...context,
    time: context.time - 1,
  };
}

export function saveNameAndId(
  context: ServerGameMachineContext,
  event: WithConnectionId<ScreenNameMessage>
): ServerGameMachineContext {
  return {
    ...context,
    players: { ...context.players, [event.connectionId]: event.name },
  };
}
export function saveId(
  context: ServerGameMachineContext,
  event: WithConnectionId<NewPlayerEvent>
): ServerGameMachineContext {
  return {
    ...context,
    players: { ...context.players, [event.connectionId]: "" },
  };
}

export function removeNameAndId(
  context: ServerGameMachineContext,
  event: WithConnectionId<UserDisconnectedEvent>
): ServerGameMachineContext {
  const { [event.connectionId]: removedName, ...newPlayers } = context.players;
  return {
    ...context,
    players: newPlayers,
  };
}

export function saveSolution(
  context: ServerGameMachineContext,
  event: WithConnectionId<SolutionMessage>
): ServerGameMachineContext {
  return {
    ...context,
    solutions: { ...context.solutions, [event.connectionId]: event.solution },
  };
}
