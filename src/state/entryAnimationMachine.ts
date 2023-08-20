import { assign, createMachine } from "xstate";

export const entryAnimationMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5RgHYBcBOBPAgiglgLYCGa+A9igHSxgBuqASuQDYv4pQDEsa5ADgDkwADzQAZMGjRgMAbQAMAXUSh+5WPjKVVIEYgCMCgCxUAbAA4AzFeNmA7AoCcTgwasBWADQgshhQZU9tZWzh5mZgoATB5WBgC+8T6omLgEJNrUmiLMbBzcvALCYpLSsooqSCDqmpm6+gjGAVQG9gbGdm0eTsYWTj5+CEaBwTZhEdGxCUng6Nh4RKQU1ABm+Ay57Jw8fEKiElIy8sq6NVrL9YiOVlQWFh72NlYOTs5RA-4jIeORMXGJyTmaUWmSoK3IAFcMJt8jsivtSkcKqcNOcdFUGkZnFQrFEzFEDDF7OEPBYPkNmqNQk5wr8pgDZqkFhlllQ0AALDBgMAw7aFPYlQ7lE5VM51DGGXE3BztWIKGyOBRmcnDILfGkTP7TQFM9JLShsgDu5F5BV2xQOZWOlTUqPFoEx+LMQQMrwsRjMz2JKsp6tpk3+DJQ5AgcF0KXmevt1TtFwlCAAtH0qB5jFF7q0PAZLFFvb5JSmnrZjG5gh5nNrGZGQazaAwUKaUbU4w7EAmSym0xnidmLLnvPmKVEqOmxhq6emGRHgSyDdlG6LY+jWwhc-ZzFErH2zO5gh0nMrB0Zh6Pqf6YpOZtPmfrVuseawtlAm2iUJcEA9TG5XXj2lvtz6J5+pqHiXjq1azqskLQo++QvtGDQWPYzrbgSuY0hYXaASOwF0rYU5AjeoIclyD55Jw8EtnohgGH2I4RGYThRAo8rdK02GnuE9jMVETjUgRuo1gaaDGgutrNsu1FDMYB7mG4fFRHY2a2FYHG4QGxgCRBt5UJQZFPpRkmYvYLjmN04QmK4kR3D6gTyk8HSlvcziJIkQA */
    id: "entryAnimation",
    initial: "running",
    states: {
      running: {
        invoke: [
          {
            id: "sendUpdateLetters",
            src: "sendUpdateLetters",
          },
        ],
        initial: "7",
        onDone: { target: "ended" },
        states: {
          7: {
            after: {
              400: "6",
            },
            entry: "updateIndex",
            on: {
              updateLetters: {
                actions: ["updateLetters"],
              },
            },
          },
          6: {
            after: {
              400: "5",
            },
            entry: "updateIndex",
            on: {
              updateLetters: {
                actions: ["updateLetters"],
              },
            },
          },
          5: {
            after: {
              400: "4",
            },
            entry: "updateIndex",
            on: {
              updateLetters: {
                actions: ["updateLetters"],
              },
            },
          },
          4: {
            after: {
              400: "3",
            },
            entry: "updateIndex",
            on: {
              updateLetters: {
                actions: [{ type: "updateLetters" }],
              },
            },
          },
          3: {
            after: {
              400: "2",
            },
            entry: "updateIndex",
            on: {
              updateLetters: {
                actions: ["updateLetters"],
              },
            },
          },
          2: {
            after: {
              400: "1",
            },
            entry: "updateIndex",
            on: {
              updateLetters: {
                actions: ["updateLetters"],
              },
            },
          },
          1: {
            after: {
              400: "0",
            },
            entry: "updateIndex",
            on: {
              updateLetters: {
                actions: ["updateLetters"],
              },
            },
          },
          0: {
            type: "final",
          },
        },
      },
      ended: {
        type: "final",
      },
    },
    context: {
      letters: "ipzzazz",
      index: 0,
    },
    schema: {
      actions: {
        type: "updateLetters",
        updateLetters: () => {},
      },
      services: {
        sendStopNextLetter: {} as {
          src: () => (callback: ({}) => {}) => void;
          data: null;
        },
        sendUpdateLetters: {} as {
          src: () => (callback: ({}) => {}) => void;
          data: null;
        },
      },
      context: {
        letters: "pizzazz" as string,
        index: 0 as number,
      },
      events: {} as { type: "updateLetters" } | { type: "stopNextLetter" },
    },
    tsTypes: {} as import("./entryAnimationMachine.typegen").Typegen0,
    predictableActionArguments: true,
  },
  {
    actions: {
      updateLetters: assign((context: { letters: string; index: number }) => {
        const abc = "abcdefghijklmnopqrstuvwxyz";

        const getRandomIndex = (string: string) =>
          Math.floor(Math.random() * string.length);
        const getRandomLetter = (string: string) =>
          string[getRandomIndex(string)];
        const getRandomAbc = () => getRandomLetter(abc);

        const staticPart = "pizzazz".substring(0, context.index);
        const randomPart = Array(7 - context.index)
          .fill(null)
          .map(getRandomAbc)
          .join("");

        return {
          ...context,
          letters: staticPart + randomPart,
        };
      }),
      updateIndex: assign((context) => ({
        ...context,
        index: context.index + 1,
      })),
    },
    services: {
      sendUpdateLetters: () => (send) => {
        const intervalId = setInterval(() => {
          console.log("send updateLetters");
          send("updateLetters");
        }, 20);
        return () => clearInterval(intervalId);
      },
    },
  }
);
