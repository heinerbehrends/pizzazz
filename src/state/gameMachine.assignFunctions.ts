import * as R from "remeda";
import {
  type DefinitionMessage,
  type StartNewGameMessage,
  type TimeAndLettersReply,
  type PlayerSolutionMessage,
} from "../../server.types";
import {
  type AnimateEvent,
  type LetterDroppedEvent,
} from "./gameMachine.types";
import { swapLetters } from "./dragAndDropMachine.functions";
import { GameMachineContext, getRandomAbc } from "./gameMachine";
import { gameDuration } from "../srcServer/stateServer/serverGameMachine";
import { getValidWordLength } from "../srcServer/stateServer/findValidWords";

export function showNextFrame(
  context: GameMachineContext,
  event: AnimateEvent
) {
  const staticPart = context.lettersStatic.substring(0, event.index);
  const randomPart = R.pipe(
    Array(7 - event.index),
    R.map(getRandomAbc),
    (array) => array.join("")
  );

  return {
    ...context,
    letters: staticPart + randomPart,
  };
}

export function updateLetters(
  context: GameMachineContext,
  event: LetterDroppedEvent
) {
  if (event.dropIndex === null) {
    return context;
  }
  const letters = swapLetters(
    context.letters,
    event.dragIndex,
    event.dropIndex
  );
  return {
    ...context,
    letters,
  };
}

export function setDefinition(
  context: GameMachineContext,
  event: DefinitionMessage
) {
  console.log("setDefinition event: ", event);
  return {
    ...context,
    definition: event.definition,
  };
}

export function setValidLength(
  context: GameMachineContext
): GameMachineContext {
  const validWordLength = getValidWordLength(
    context.letters,
    context.validWords
  );
  return {
    ...context,
    validWordLength,
  };
}

export function setTimeAndLetters(
  context: GameMachineContext,
  event: TimeAndLettersReply
): GameMachineContext {
  console.log("setTimeAndLetters event: ", event);
  return {
    ...context,
    time: event.time,
    lettersStatic: event.letters,
    validWords: event.validWords,
  };
}

export function setupWaitingGame(
  context: GameMachineContext,
  event: StartNewGameMessage | TimeAndLettersReply
): GameMachineContext {
  console.log("Hello from setupNewGame: ", event);
  return {
    ...context,
    message: `A new game will start in ${event.time} seconds`,
    validWordLength: 0,
    validWords: event.validWords,
    lettersStatic: event.letters,
    time: event.time,
  };
}

export function setupNewGame(
  context: GameMachineContext,
  event: StartNewGameMessage | TimeAndLettersReply
): GameMachineContext {
  console.log("Hello from setupNewGame: ", event);
  return {
    ...context,
    message: `Move the letters to find valid words`,
    validWordLength: 0,
    letters: event.letters,
    lettersStatic: event.letters,
    time: gameDuration,
    validWords: event.validWords,
  };
}
export function setupJoinGame(
  context: GameMachineContext,
  event: { type: "joinGame" }
): GameMachineContext {
  console.log("Hello from setupNewGame: ", event);
  return {
    ...context,
    message: "Move the letters to find valid words",
    validWordLength: 0,
    time: context.time,
  };
}

export function countdownUpdateTime(context: GameMachineContext) {
  return {
    ...context,
    time: context.time - 1,
    message: `A new game will start in ${context.time - 1} seconds`,
  };
}

export function displaySolution(
  context: GameMachineContext,
  event: PlayerSolutionMessage
) {
  return {
    ...context,
    message: `${event.name} played a ${event.length}-letter-word for ${event.score} points`,
  };
}
