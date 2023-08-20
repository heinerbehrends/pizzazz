import { assign, createMachine } from "xstate";
import {
  getDragDistance,
  getDropTileIndex,
  swapLetters,
} from "./dragAndDropLogic";

export type DragAndDropContext = {
  letters: string;
  dragStartMousePosition: {
    x: number;
    y: number;
  };
  distanceFromDragStart: {
    x: number;
    y: number;
  };
  dragTileIndex: number | undefined;
};

type UpdateLettersEvent = {
  type: "updateLetters";
};

export const dragAndDropMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QQE4EMoEEB2EAiKA9gA4B0AlhADZgDEqGsALmikwNoAMAuoqMYVjkm5Qtj4gAHogCMANgAcpAMyrlAFgDsc7Z00AmfeoA0IAJ6zNm0vLlyAnOpmcH9mVYC+H0wyy4CJKS+UOTYULQAtoQArrBgUQBuYFy8SCACQiJiEtIITgCspIr5nHqcMurKMgqmFgjOpJzKLorq+Zrq+nLu6l4+6H74RGTBoeG+YLgpEhnCouJpuTL5+kXKcu0yhgqV9vY15rKcjc12O+2d3R1e3iDYhBBwEr44QyQzgnPZi4gAtHK1P5WUjqBzKfQKVR2AwKex9EAvfzDCjUMAfTLzHKITqA+r2Va2TQuTiVPQ7BTwxFvEYDEJhdFfBagXKqaz4rrKBT6DSOLm4-ScVaaEqcEr4zj2ZQdXo3IA */
    id: "dragAndDrop",
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
            target: "dragging",
            actions: ["setDistanceFromDragStart"],
          },
          mouseup: {
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
        distanceFromDragStart: {} as { x: number; y: number },
        dragTileIndex: -1 as number | undefined,
      },
      events: {} as MouseEvent,
    },
    /** @xstate-layout N4IgpgJg5mDOIC5QQE4EMoEEB2EAiKA9gA4B0AlhADZgDEAtoQK6ySEDu2A2gAwC6iUMUKxyAF3KFsgkAA9EARgBsADlIBmBQBYATAFYtAdiU9DunQBoQAT0VL1G3SqVaAnK5471W9SoC+flaoGDj4RGTBUFDk2FAMzKxMxLwCSCDCohJSMvIICh6knip6eqpehuo8Rla2CCoKpHoBgSDYhBBwMpGhBCQyGeKS0mm5ALRKNYjjAUHoWLi9ZJQ0-SKD2SOIupN1ho0q6odHx4czIN0L4aSR0bGrmUM5iOo6PKQ67q6G+t4Khl87Ao8A4nUHNPxAA */
    tsTypes: {} as import("./dragAndDropMachine.typegen").Typegen0,
    predictableActionArguments: true,
  },
  {
    actions: {
      initializeDrag: assign((context, mouseEvent: MouseEvent) => {
        const x = mouseEvent.clientX;
        const y = mouseEvent.clientY;
        const dragTileIndex = Number(
          (mouseEvent.target as HTMLDivElement).dataset.index
        );
        return {
          ...context,
          dragStartMousePosition: {
            x,
            y,
          },
          dragTileIndex,
        };
      }),
      resetDrag: assign((context) => ({
        ...context,
        distanceFromDragStart: { x: 0, y: 0 },
        dragTileIndex: undefined,
      })),

      updateLetters: assign(
        (context: DragAndDropContext, event: MouseEvent) => {
          const tile = event.target as HTMLDivElement;
          const dropIndex = getDropTileIndex(context, event);
          const dragIndex = Number(tile.dataset.index);
          console.log("dropIndex", dropIndex);
          if (dropIndex === null || dropIndex === undefined) {
            return context;
          }
          return {
            ...context,
            letters: swapLetters(context.letters, dragIndex, dropIndex),
          };
        }
      ),
      setDistanceFromDragStart: assign(
        (context: DragAndDropContext, event: MouseEvent) => {
          const distanceFromDragStart = getDragDistance(context, event);
          return {
            ...context,
            distanceFromDragStart,
          };
        }
      ),
    },
  }
);
