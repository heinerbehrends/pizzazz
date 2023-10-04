import {
  getValidWordLength,
  retrieveDefinition,
} from "../logicServer/findValidWordsAndDefinitions";
import { generateLettersWithValidWords } from "../logicServer/generateRandomLetters";
import { ServerGameMachineContext } from "./serverGameMachine";
import type { ScreenNameMessage } from "../../components/Buttons";
import type {
  TimeAndLettersMessage,
  PlayerSolutionMessage,
  SendToParentEvent,
  WithConnectionId,
  UserDisconnectedNotification,
  NewPlayerNotification,
  WithExcludedPlayers,
  ValidLengthDefinitionMessage,
  NewTimeAndLettersMessage,
} from "../../../server.types";
import type { SolutionMessage } from "../../state/gameMachine.types";
import { GAME_DURATION } from "../logicServer/constants";

export function reactToClient(
  context: ServerGameMachineContext,
  event: SendToParentEvent
) {
  switch (event.type) {
    case "screenName":
      return {
        type: "timeAndLetters",
        time: context.time,
        letters: context.randomLetters,
        excludedPlayers: Object.keys(context.players).filter(
          (id) => id !== event.connectionId
        ),
      } satisfies WithExcludedPlayers<TimeAndLettersMessage>;

    case "":
      return {
        type: "newTimeAndLetters",
        letters: context.randomLetters,
        time: context.time,
      } satisfies NewTimeAndLettersMessage;

    case "lettersChanged":
      const validWordLength = getValidWordLength(
        event.letters,
        context.validWords
      );
      const validWord = event.letters.substring(0, validWordLength);
      return {
        type: "validLengthDefinition",
        definition: retrieveDefinition(validWord),
        validWordLength,
        excludedPlayers: Object.keys(context.players).filter(
          (id) => id !== event.connectionId
        ),
      } satisfies WithExcludedPlayers<ValidLengthDefinitionMessage>;

    case "solution":
      return {
        type: "playerSolution",
        name: context.players[event.connectionId],
        length: event.solution.length,
        score: event.score,
        excludedPlayers: [event.connectionId],
      } satisfies WithExcludedPlayers<PlayerSolutionMessage>;

    default:
      const exhaustiveCheck: never = event;
      return exhaustiveCheck;
  }
}

export function setNewGame(
  context: ServerGameMachineContext
): ServerGameMachineContext {
  const [randomLetters, validWords] = generateLettersWithValidWords(7);
  return {
    ...context,
    time: GAME_DURATION,
    solutions: {},
    randomLetters,
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
  event: WithConnectionId<NewPlayerNotification>
): ServerGameMachineContext {
  return {
    ...context,
    players: { ...context.players, [event.connectionId]: "" },
  };
}

export function removeNameAndId(
  context: ServerGameMachineContext,
  event: WithConnectionId<UserDisconnectedNotification>
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
