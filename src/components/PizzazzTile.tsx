import { useContext, useEffect, useRef } from "react";
import { css } from "../../styled-system/css";
import { GlobalStateContext } from "../state/contextProvider";
import { useActor } from "@xstate/react";

type PizzazzTileProps = {
  letter: string;
  index: number;
  isValid: boolean;
};
// change the keys to uppercase
export const letterValues = {
  A: 1,
  B: 3,
  C: 3,
  D: 2,
  E: 1,
  F: 4,
  G: 2,
  H: 4,
  I: 1,
  J: 8,
  K: 5,
  L: 1,
  M: 3,
  N: 1,
  O: 1,
  P: 3,
  Q: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 1,
  V: 4,
  W: 4,
  X: 8,
  Y: 4,
  Z: 10,
  "0": 0,
};

const letterStyles = css({
  border: `1px solid border`,
  pointerEvents: "none",
  borderRadius: "0.5vw",
  color: "#555",
  fontWeight: 400,
  fontSize: "8vw",
  textAlign: "center",
  lineHeight: "12.2vw",
  boxShadow: "1.8px 2.4px 1.8px rgba(0, 0, 0, 0.05)",
  md: { fontSize: "40px", lineHeight: "65px", borderRadius: "4px" },
});

const subStyles = css({
  pointerEvents: "none",
  lineHeight: "normal",
  fontSize: "2.6vw",
  fontWeight: 400,
  verticalAlign: "-25%",
  md: {
    fontSize: "14.5px",
  },
});

const letterContainerStyles = css({
  position: "relative",
  width: "13.68%",
  display: "inline-block",
  userSelect: "none",
});

export function PizzazzTile({ letter, isValid, index }: PizzazzTileProps) {
  const { gameService } = useContext(GlobalStateContext);
  const [state] = useActor(gameService);
  const [stateDnD, sendDnD] = useActor(state.children.dragAndDropMachine);
  const tileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const tile = tileRef.current;
    if (!tile) {
      return;
    }

    tile.addEventListener("mousedown", sendDnD);
    return () => {
      tile.removeEventListener("mousedown", sendDnD);
    };
  }, [tileRef.current, sendDnD]);

  const { x, y } = stateDnD.context.distanceFromDragStart;
  const isDragTile = index === stateDnD.context.dragTileIndex;

  return (
    <div
      ref={tileRef}
      className={letterContainerStyles}
      style={{
        left: isDragTile ? x : undefined,
        top: isDragTile ? y : undefined,
        zIndex: isDragTile ? 1 : 0,
        opacity: isDragTile ? 0.66 : 1,
      }}
      data-index={index}
    >
      <div
        className={letterStyles}
        style={{
          backgroundColor: isValid ? "#C4F2CB" : "#F7E9B7",
          color: letter === "8" ? "transparent" : undefined,
        }}
      >
        {letter}
        <sub className={subStyles}>
          {letterValues[letter as keyof typeof letterValues]}
        </sub>
      </div>
    </div>
  );
}
