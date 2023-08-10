import { createMachine, interpret } from "xstate";

export const dragAndDropMachine = createMachine({
  id: "dragAndDrop",
  initial: "idle",
  context: {
    letters: "pizzazz",
  },
  states: {
    idle: {
      on: {
        dragstart: {
          target: "dragging",
        },
      },
    },
    dragging: {
      on: {
        dragend: {
          target: "idle",
        },
      },
    },
  },
  schema: {
    context: {
      letters: "pizzazz",
    },
  },
  /** @xstate-layout N4IgpgJg5mDOIC5QQE4EMoEEB2EAiKA9gA4B0AlhADZgDEAtoQK6ySEDu2A2gAwC6iUMUKxyAF3KFsgkAA9EARgBsADlIBmBQBYATAFYtAdiU9DunQBoQAT0VL1G3SqVaAnK5471W9SoC+flaoGDj4RGTBUFDk2FAMzKxMxLwCSCDCohJSMvIICh6knip6eqpehuo8Rla2CCoKpHoBgSDYhBBwMpGhBCQyGeKS0mm5ALRKNYjjAUHoWLi9ZJQ0-SKD2SOIupN1ho0q6odHx4czIN0L4aSR0bGrmUM5iOo6PKQ67q6G+t4Khl87Ao8A4nUHNPxAA */
  tsTypes: {} as import("./dragAndDropMachine.typegen").Typegen0,
  predictableActionArguments: true,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const dragAndDropService = interpret(dragAndDropMachine);
