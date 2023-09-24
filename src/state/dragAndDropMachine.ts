import { assign, createMachine } from "xstate";
import { sendParent } from "xstate/lib/actions";
import {
  initializeDrag,
  resetDrag,
  setDistanceFromDragStart,
  updateLetters,
} from "./dragAndDropMachine.functions";
import {
  type Coordinates,
  dragAndDropMachineSchema,
} from "./dragAndDropMachine.types";
import type PartySocket from "partysocket";

export type DragAndDropContext = {
  letters: string;
  dragStartMousePosition: Coordinates;
  distanceFromDragStart: Coordinates;
  dragTileIndex: number | undefined;
  socket: PartySocket;
};

export const dragAndDropMachine = createMachine(
  {
    id: "dragAndDropMachine",
    initial: "idle",
    context: {
      letters: "pizzazz",
      dragStartMousePosition: {
        x: 0,
        y: 0,
      },
      distanceFromDragStart: {
        x: 0,
        y: 0,
      },
      dragTileIndex: undefined,
      socket: {} as PartySocket,
    },
    states: {
      idle: {
        entry: ["resetDrag"],
        on: {
          mousedown: {
            target: "dragging",
            actions: ["initializeDrag"],
          },
        },
      },
      dragging: {
        on: {
          mousemove: {
            actions: ["setDistanceFromDragStart"],
          },
          mouseup: {
            target: "idle",
            actions: ["updateLetters"],
          },
        },
      },
    },
    ...dragAndDropMachineSchema,
    /* cspell:disable-next-line */
    /** @xstate-layout N4IgpgJg5mDOIC5QQE4EMoEEB2EAiKA9gA4B0AlhADZgDEAtoQK6ySEDu2A2gAwC6iUMUKxyAF3KFsgkAA9EARgBsADlIBmBQBYATAFYtAdiU9DunQBoQAT0VL1G3SqVaAnK5471W9SoC+flaoGDj4RGTBUFDk2FAMzKxMxLwCSCDCohJSMvIICh6knip6eqpehuo8Rla2CCoKpHoBgSDYhBBwMpGhBCQyGeKS0mm5ALRKNYjjAUHoWLi9ZJQ0-SKD2SOIupN1ho0q6odHx4czIN0L4aSR0bGrmUM5iOo6PKQ67q6G+t4Khl87Ao8A4nUHNPxAA */
    tsTypes: {} as import("./dragAndDropMachine.typegen").Typegen0,
    predictableActionArguments: true,
  },
  {
    actions: {
      initializeDrag: assign(initializeDrag),
      resetDrag: assign(resetDrag),
      updateLetters: sendParent(updateLetters),
      setDistanceFromDragStart: assign(setDistanceFromDragStart),
    },
  }
);
