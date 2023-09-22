import { assign, createMachine } from "xstate";
import { sendParent } from "xstate/lib/actions";
import { StartNewGameMessage } from "../../server";

export const entryAnimationMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5RgHYBcBOBPAgiglgLYCGa+A9igHSxgBuqASuQDYv4pQDEsa5ADgDkwADzQAZMGjRgMAbQAMAXUSh+5WPjKVVIEYgCMCgCxUAbAA4AzFeNmA7AoCcTgwasBWADQgshhQZU9tZWzh5mZgoATB5WBgC+8T6omLgEJNrUmiLMbBzcvALCYpLSsooqSCDqmpm6+gjGAVQG9gbGdm0eTsYWTj5+CEaBwTZhEdGxCUng6Nh4RKQU1ABm+Ay57Jw8fEKiElIy8sq6NVrL9YiOVlQWFh72NlYOTs5RA-4jIeORMXGJyTmaUWmSoK3IAFcMJt8jsivtSkcKqcNOcdFUGkZnFQrFEzFEDDF7OEPBYPkNmqNQk5wr8pgDZqkFhlllQ0AALDBgMAw7aFPYlQ7lE5VM51DGGXE3BztWIKGyOBRmcnDILfGkTP7TQFM9JLShsgDu5F5BV2xQOZWOlTUqPFoEx+LMQQMrwsRjMz2JKsp6tpk3+DJQ5AgcF0KXmevt1TtFwlCAAtH0qB5jFF7q0PAZLFFvb5JSmnrZjG5gh5nNrGZGQazaAwUKaUbU4w7EAmSym0xnidmLLnvPmKVEqOmxhq6emGRHgSyDdlG6LY+jWwhc-ZzFErH2zO5gh0nMrB0Zh6Pqf6YpOZtPmfrVuseawtlAm2iUJcEA9TG5XXj2lvtz6J5+pqHiXjq1azqskLQo++QvtGDQWPYzrbgSuY0hYXaASOwF0rYU5AjeoIclyD55Jw8EtnohgGH2I4RGYThRAo8rdK02GnuE9jMVETjUgRuo1gaaDGgutrNsu1FDMYB7mG4fFRHY2a2FYHG4QGxgCRBt5UJQZFPpRkmYvYLjmN04QmK4kR3D6gTyk8HSlvcziJIkQA */
    id: "entryAnimation",
    initial: "running",
    states: {
      running: {
        always: {
          cond: "isAnimationOver",
          target: "paused",
        },
        invoke: {
          id: "sendUpdateLetters",
          src: "sendUpdateLetters",
        },
        on: {
          updateLetters: {
            actions: ["sendAnimate"],
          },
        },
        after: {
          400: {
            target: "running",
            actions: ["updateIndex"],
          },
        },
      },
      paused: {
        on: {
          startNewGame: {
            target: "running",
            actions: ["resetIndex"],
          },
        },
      },
    },
    context: {
      index: 0,
    },
    schema: {
      actions: {} as
        | {
            type: "animate";
            index: number;
          }
        | { type: "updateLetters" }
        | { type: "resetIndex" },
      services: {
        sendUpdateLetters: {} as {
          src: () => (callback: ({}) => {}) => void;
          data: null;
        },
      },
      context: {
        index: 0 as number,
      },
      events: {} as
        | { type: "updateLetters" }
        | { type: "sendAnimate"; index: number }
        | StartNewGameMessage,
    },
    tsTypes: {} as import("./entryAnimationMachine.typegen").Typegen0,
    predictableActionArguments: true,
  },
  {
    actions: {
      updateIndex: assign((context) => {
        return {
          ...context,
          index: context.index + 1,
        };
      }),
      sendAnimate: sendParent((context) => {
        return {
          type: "animate",
          index: context.index,
        };
      }),
      resetIndex: assign(() => ({ index: 0 })),
    },
    services: {
      sendUpdateLetters: () => (callback) => {
        const intervalId = setInterval(
          () => callback({ type: "updateLetters" }),
          20
        );
        return () => clearInterval(intervalId);
      },
    },
    guards: {
      isAnimationOver: (context) => context.index > 7,
    },
  }
);

// function showNextFrame(context: { index: number; letters: string }) {
//   const staticPart = "pizzazz".substring(0, event.index);
//   const randomPart = R.pipe(
//     Array(7 - event.index).fill(null),
//     R.map(getRandomAbc),
//     (array) => array.join("")
//   );
//   return {
//     ...context,
//     letters: staticPart + randomPart,
//   };
// }
