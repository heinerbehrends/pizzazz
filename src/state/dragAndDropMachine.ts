import { assign, createMachine } from "xstate";
import { getDragDistance, getDropTileIndex } from "./dragAndDropLogic";
import { sendParent } from "xstate/lib/actions";
import type PartySocket from "partysocket";

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
  socket: PartySocket;
};

export const dragAndDropMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QQE4EMoEEB2EAiKA9gA4B0AlhADZgDEqGsALmikwNoAMAuoqMYVjkm5Qtj4gAHogCMANgAcpAMyrlAFgDsc7Z00AmfeoA0IAJ6zNm0vLlyAnOpmcH9mVYC+H0wyy4CJKS+UOTYULQAtoQArrBgUQBuYFy8SCACQiJiEtIITgCspIr5nHqcMurKMgqmFgjOpJzKLorq+Zrq+nLu6l4+6H74RGTBoeG+YLgpEhnCouJpuTL5+kXKcu0yhgqV9vY15rKcjc12O+2d3R1e3iDYhBBwEr44QyQzgnPZi4gAtHK1P5WUjqBzKfQKVR2AwKex9EAvfzDCjUMAfTLzHKITqA+r2Va2TQuTiVPQ7BTwxFvEYDEJhdFfBagXKqaz4rrKBT6DSOLm4-ScVaaEqcEr4zj2ZQdXo3IA */
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
    schema: {
      context: {
        letters: "pizzazz",
        dragStartMousePosition: {} as { x: number; y: number },
        distanceFromDragStart: {} as { x: number; y: number },
        dragTileIndex: undefined as number | undefined,
        socket: {} as PartySocket,
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

      updateLetters: sendParent((context, event: MouseEvent) => {
        return {
          type: "letterDropped",
          dragIndex: Number((event?.target as HTMLDivElement).dataset.index),
          dropIndex: getDropTileIndex(context, event),
        };
      }),
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
