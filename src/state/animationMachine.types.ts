import { NewTimeAndLettersMessage } from "../../server.types";

export const animationMachineSchema = {
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
      | NewTimeAndLettersMessage,
  },
};
