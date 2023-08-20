import { assign, createMachine } from "xstate";
import { getDropTileIndex, swapLetters } from "./dragAndDropLogic";

export type DragAndDropContext = {
  letters: string;
  dragStartMousePosition: {
    x: number;
    y: number;
  };
};

type DragStartEvent = {
  type: "dragstart";
  dragStartMousePosition: {
    x: number;
    y: number;
  };
};
type UpdateLettersEvent = {
  type: "updateLetters";
};

export const dragAndDropMachine = createMachine(
  {
    id: "dragAndDrop",
    initial: "idle",
    context: {
      letters: "pizzazz",
      dragStartMousePosition: {
        x: 0,
        y: 0,
      },
    },
    states: {
      idle: {
        on: {
          dragstart: {
            target: "dragging",
            actions: ["initializeDrag"],
          },
        },
      },
      dragging: {
        on: {
          dragend: {
            target: "idle",
            actions: ["updateLetters"],
          },
        },
      },
    },
    schema: {
      context: {
        letters: "pizzazz",
        dragStartMousePosition: {} as { x: number; y: number },
      },
      events: {} as
        | UpdateLettersEvent
        | {
            type: "dragend";
          }
        | DragStartEvent
        | DragEvent,
    },
    /** @xstate-layout N4IgpgJg5mDOIC5QQE4EMoEEB2EAiKA9gA4B0AlhADZgDEAtoQK6ySEDu2A2gAwC6iUMUKxyAF3KFsgkAA9EARgBsADlIBmBQBYATAFYtAdiU9DunQBoQAT0VL1G3SqVaAnK5471W9SoC+flaoGDj4RGTBUFDk2FAMzKxMxLwCSCDCohJSMvIICh6knip6eqpehuo8Rla2CCoKpHoBgSDYhBBwMpGhBCQyGeKS0mm5ALRKNYjjAUHoWLi9ZJQ0-SKD2SOIupN1ho0q6odHx4czIN0L4aSR0bGrmUM5iOo6PKQ67q6G+t4Khl87Ao8A4nUHNPxAA */
    tsTypes: {} as import("./dragAndDropMachine.typegen").Typegen0,
    predictableActionArguments: true,
  },
  {
    actions: {
      initializeDrag: assign((context, mouseEvent: DragStartEvent) => {
        const { x, y } = mouseEvent.dragStartMousePosition;
        return {
          ...context,
          dragStartMousePosition: {
            x,
            y,
          },
        };
      }),
      updateLetters: assign((context: DragAndDropContext, event: DragEvent) => {
        const tile = event.target as HTMLDivElement;
        const dropIndex = getDropTileIndex(context, event);
        const dragIndex = Number(tile.dataset.index);

        if (dropIndex !== null) {
          return {
            ...context,
            letters: swapLetters(context.letters, dragIndex, dropIndex),
          };
        }
        return context;
      }),
    },
  }
);
