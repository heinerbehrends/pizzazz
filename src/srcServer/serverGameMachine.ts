import { assign, createMachine } from "xstate";

export function serverGameMachine() {
  return createMachine(
    {
      id: "serverGameMachine",
      initial: "playing",
      invoke: {
        id: "updateTimeInterval",
        src: "updateTimeInterval",
      },
      states: {
        playing: {
          on: {
            updateTime: {
              actions: ["updateTime"],
            },
          },
        },
      },
      context: {
        time: 50,
      },
      schema: {
        events: {} as { type: "updateTime" },
        actions: {} as { type: "updateTime" },
        services: {
          updateTimeInterval: {} as {
            src: () => (callback: ({}) => {}) => void;
            data: null;
          },
        },
        context: {
          time: 50 as number,
        },
      },
      predictableActionArguments: true,
      tsTypes: {} as import("./serverGameMachine.typegen").Typegen0,
    },
    {
      services: {
        updateTimeInterval: () => (callback) => {
          const intervalId = setInterval(() => {
            callback({ type: "updateTime" });
          }, 1000);
          return () => {
            clearInterval(intervalId);
          };
        },
      },
      actions: {
        updateTime: assign((context) => ({
          ...context,
          time: context.time - 1,
        })),
      },
    }
  );
}
