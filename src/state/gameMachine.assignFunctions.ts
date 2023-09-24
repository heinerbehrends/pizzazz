import * as R from "remeda";
import {
  type ValidLengthAndDefMessage,
  type StartNewGameMessage,
  type TimeAndLettersReply,
  type PlayerSolutionMessage,
} from "../../server.types";
import {
  type AnimateEvent,
  type LetterDroppedEvent,
  type StartGameMessage,
} from "./gameMachine.types";
import { gameDuration } from "../srcServer/serverGameMachine";
import { swapLetters } from "./dragAndDropMachine.functions";
import { GameMachineContext, getRandomAbc } from "./gameMachine";

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

export function updateValidLengthAndDef(
  context: GameMachineContext,
  event: ValidLengthAndDefMessage
) {
  function getDefinition(event: ValidLengthAndDefMessage) {
    const isValid = event.length > 0;
    if (event.definition) {
      return event.definition;
    }
    if (isValid) {
      return "no definition found";
    }
    return "find a valid word";
  }
  return {
    ...context,
    validWordLength: event.length,
    definition: getDefinition(event),
  };
}

export function setTimeAndLetters(
  context: GameMachineContext,
  event: StartGameMessage
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
  event: StartNewGameMessage | TimeAndLettersReply
): GameMachineContext {
  console.log("Hello from setupNewGame: ", event);
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
  };
}
export function setupJoinGame(
  context: GameMachineContext,
  event: StartNewGameMessage | TimeAndLettersReply
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
