import * as R from "remeda";
import {
  type ValidLengthDefinitionMessage,
  type TimeAndLettersMessage,
  type PlayerSolutionMessage,
} from "../../server.types";
import {
  type AnimateEvent,
  type LetterDroppedEvent,
} from "./gameMachine.types";
import { swapLetters } from "./dragAndDropMachine.functions";
import { GameMachineContext } from "./gameMachine";
import { ABC, GAME_DURATION } from "../srcServer/logicServer/constants";

const getRandomIndex = (string: string) =>
  Math.floor(Math.random() * string.length);
const getRandomLetter = (string: string) => string[getRandomIndex(string)];
export const getRandomAbc = () => getRandomLetter(ABC);

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

export function setValidLengthAndDefinition(
  context: GameMachineContext,
  event: ValidLengthDefinitionMessage
) {
  return {
    ...context,
    validWordLength: event.validWordLength,
    definition: event.definition,
  };
}

export function setTimeAndLetters(
  context: GameMachineContext,
  event: TimeAndLettersMessage
): GameMachineContext {
  console.log("setTimeAndLetters event: ", event);
  return {
    ...context,
    time: event.time,
    lettersStatic: event.letters,
  };
}

export function setupWaitingGame(
  context: GameMachineContext,
  event: TimeAndLettersMessage
): GameMachineContext {
  console.log("Hello from setupWaitingGame: ", event);
  return {
    ...context,
    message: `A new game will start in ${event.time} seconds`,
    validWordLength: 0,
    lettersStatic: event.letters,
    time: event.time,
  };
}

export function setupNewGame(
  context: GameMachineContext,
  event: TimeAndLettersMessage
): GameMachineContext {
  console.log("Hello from setupNewGame: ", event);
  return {
    ...context,
    message: `Move the letters to find valid words`,
    validWordLength: 0,
    letters: event.letters,
    lettersStatic: event.letters,
    time: GAME_DURATION,
  };
}
export function setupJoinGame(
  context: GameMachineContext,
  event: { type: "joinGame" }
): GameMachineContext {
  console.log("Hello from setupJoinGame: ", event);
  return {
    ...context,
    message: "Move the letters to find valid words",
    validWordLength: 0,
    // time: context.time,
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
