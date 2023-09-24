import type PartySocket from "partysocket";

export const dragAndDropMachineSchema = {
  schema: {
    context: {
      letters: "pizzazz",
      dragStartMousePosition: {} as Coordinates,
      distanceFromDragStart: {} as Coordinates,
      dragTileIndex: undefined as number | undefined,
      socket: {} as PartySocket,
    },
    events: {} as MouseEvent,
  },
};

export type Coordinates = {
  x: number;
  y: number;
};
