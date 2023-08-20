import { DragAndDropContext } from "./dragAndDropMachine";

type Coordinates = {
  x: number;
  y: number;
};

function isInBetween(lowerThreshold: number, upperThreshold: number) {
  return (number: number) =>
    number >= lowerThreshold && number <= upperThreshold;
}

function isOverlapping(tileCenter: Coordinates) {
  return ({ bottom, top, left, right }: DOMRect) => {
    const isInBetweenX = isInBetween(left, right)(tileCenter.x);
    const isInBetweenY = isInBetween(top, bottom)(tileCenter.y);
    return isInBetweenX && isInBetweenY;
  };
}

function getDragDistance(context: DragAndDropContext, event: DragEvent) {
  return {
    x: event.clientX - context.dragStartMousePosition.x,
    y: event.clientY - context.dragStartMousePosition.y,
  };
}

function getElementCenter(event: DragEvent) {
  const tile = event.target as HTMLDivElement;
  const dragElementBounds = tile.getBoundingClientRect();
  const { left, top, right, bottom } = dragElementBounds;
  return {
    x: right - (right - left) / 2,
    y: bottom - (bottom - top) / 2,
  };
}

export function getDragTileCenter(
  context: DragAndDropContext,
  event: DragEvent
) {
  const { x: dragX, y: dragY } = getDragDistance(context, event);
  const elementCenter = getElementCenter(event);
  return {
    x: elementCenter.x + dragX,
    y: elementCenter.y + dragY,
  };
}

export function getDropTileIndex(
  context: DragAndDropContext,
  event: DragEvent
) {
  const tile = event.target as HTMLDivElement;
  const siblings = [...(tile.parentNode?.children || [])] as HTMLDivElement[];
  const dropTargetBounds = siblings.map((sibling) =>
    sibling.getBoundingClientRect()
  );

  const dragTileCenter = getDragTileCenter(context, event);

  const dropIndex = dropTargetBounds
    .map(isOverlapping(dragTileCenter))
    .indexOf(true);

  if (dropIndex === -1) {
    return null;
  }
  return dropIndex;
}

function replaceLetter(word: string, letter: string, index: number) {
  return word
    .substring(0, index)
    .concat(letter)
    .concat(word.substring(index + 1));
}

export function swapLetters(word: string, index: number, targetIndex: number) {
  return replaceLetter(
    replaceLetter(word, word[index], targetIndex),
    word[targetIndex],
    index
  );
}
