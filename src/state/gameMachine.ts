import PartySocket from "partysocket";
import { assign, createMachine } from "xstate";
import { forwardTo } from "xstate/lib/actions";
import { animationMachine } from "./animationMachine";
import { dragAndDropMachine } from "./dragAndDropMachine";
import {
  countdownUpdateTime,
  updateLetters,
  showNextFrame,
  setValidLengthAndDefinition,
  setTimeAndLetters,
  setupNewGame,
  setupJoinGame,
  setupWaitingGame,
  displaySolution,
} from "./gameMachine.assignFunctions";
import { LettersChangedMessage, gameMachineSchema } from "./gameMachine.types";
import { gameDuration } from "../srcServer/stateServer/serverGameMachine";
import { type TimeAndLettersMessage } from "../../server.types";

export type GameMachineContext = {
  letters: string;
  lettersStatic: string;
  validWordLength: number;
  message: string;
  definition: string | null;
  time: number;
  name: string;
};

export function gameMachine(socket: PartySocket) {
  return createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5RQIYFswFkUGMAWAlgHZgB0A9kQEbkoBOExUAxCkQWigC5gDaADAF1EoAA7lYBLgUoiQAD0QAWJaQBsAdgBMarVu1L+ARiUAOJQBoQAT0QBmOwE5SdpQFYjp00btu13-QBfQKtUDGx8YjJKGnpGIhYAdxQpAWEkEHFJaVkMxQQtHxc1O35TYzdHDw07UytbBCUnUg0TPSUtY00dYND0LFxCElJkqSZmACtyYgBxfrS5LLHc0HylNX4Wu0L+LTcNJU8dN3rlf1JKjxKNUzsTUzVekDCByOHR6QTmWC56LjmMAsMksckQ5GsNlsdnsDkc1CcbPYDqQjJ5HOi3EoNI5dm4ni8IkMyBA6CgoABBIgQAAidHIomYABswFweHRafTRJAgWIJMswXlEBs1KQmioNBo3G5CloqqcEK4tKRHBo1D4JVoOkd8f1CVFSCSyZSaXSGQA3FCMggQAAyYASXDwxupYAAZjzMnzQeChcYofxHDocY5TBL5ZrTKL0SrXF4VZ0NDrwoN9YaKVSOQyfn8AHJgRIAvhCRZemQC1ZCzqi1UmWuHI7yoyY0i7WoBvZ2bSVRNPIjkCBwOQElMkEvZMs+hAAWjsLn0ne0kpDHj8dUR05F-C325325MSdeRIo1FoDCYY-5k6x8qakdMhV8Wk77YOB717xSnygF+9goVzScUNbnMQCNBvXRSE6J9+DUTQbkxcw3xHYlSXTE16R-Cc-10SMjE1KodFRENwMjNVTBjPQ3C3IxJWCYIgA */
      id: "gameMachine",
      initial: "onboarding",
      invoke: [
        {
          id: "socket",
          src: "socketCallback",
        },
        {
          id: "dragAndDropMachine",
          src: dragAndDropMachine,
          data: {
            letters: (context: GameMachineContext) => context.letters,
            socket: () => socket,
          },
        },
      ],
      states: {
        onboarding: {
          invoke: [
            {
              id: "animationMachine",
              src: animationMachine,
              data: {
                index: 0,
              },
            },
          ],
          on: {
            animate: {
              actions: ["showNextFrame"],
            },
            timeAndLetters: [
              {
                target: "dragAndDrop",
                actions: ["setupGame"],
                cond: "isEnoughTimeLeft",
              },
              {
                target: "waiting",
                actions: ["setupWaitingGame"],
                cond: "isLittleTimeLeft",
              },
            ],
          },
        },
        waiting: {
          after: {
            1000: {
              target: "waiting",
              actions: ["countdown"],
            },
          },
          on: {
            joinGame: { target: "dragAndDrop", actions: ["setupJoinGame"] },
            newTimeAndLetters: {
              actions: ["setupGame"],
              target: "dragAndDrop",
            },
          },
        },
        dragAndDrop: {
          invoke: {
            id: "animationMachine",
            src: animationMachine,
            data: {
              index: 0,
            },
          },
          on: {
            animate: { actions: ["showNextFrame"] },
            letterDropped: {
              actions: ["updateLetters", "sendLettersChanged"],
            },
            validLengthDefinition: {
              actions: ["setValidLengthAndDefinition"],
            },
            newTimeAndLetters: {
              actions: ["setupNewGame", forwardTo("animationMachine")],
            },
            solution: {
              actions: ["sendToServer"],
            },
            playerSolution: {
              actions: ["displaySolution"],
            },
          },
        },
      },
      context: {
        letters: "PIZZAZZ",
        lettersStatic: "PIZZAZZ",
        validWordLength: 0,
        message: "Welcome to Pizzazz",
        definition: "a micro-scrabble word game",
        time: gameDuration,
        name: "",
      },
      ...gameMachineSchema,
      tsTypes: {} as import("./gameMachine.typegen").Typegen0,
      predictableActionArguments: true,
    },
    {
      actions: {
        sendToServer: (_, event) => {
          console.log("sending to server: ", event);
          socket.send(JSON.stringify(event));
        },
        sendLettersChanged: (context) => {
          socket.send(
            JSON.stringify({
              type: "lettersChanged",
              letters: context.letters,
            } as LettersChangedMessage)
          );
        },
        // todo: create reducer functions for each state property state describe how they change with events
        countdown: assign(countdownUpdateTime),
        updateLetters: assign(updateLetters),
        showNextFrame: assign(showNextFrame),
        setValidLengthAndDefinition: assign(setValidLengthAndDefinition),
        setupGame: assign(setTimeAndLetters),
        setupNewGame: assign(setupNewGame),
        setupJoinGame: assign(setupJoinGame),
        setupWaitingGame: assign(setupWaitingGame),
        displaySolution: assign(displaySolution),
      },
      guards: {
        isLittleTimeLeft: (_, event: TimeAndLettersMessage) => event.time < 40,
        isEnoughTimeLeft: (_, event: TimeAndLettersMessage) => event.time > 40,
      },
      services: {
        // subscribe to messages from the server
        socketCallback: () => (callback) => {
          socket.addEventListener("message", (event) => {
            console.log("message from server: ", event.data);
            callback(JSON.parse(event.data));
          });
        },
      },
    }
  );
}
