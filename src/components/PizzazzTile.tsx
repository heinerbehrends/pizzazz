import { useContext, useEffect, useRef } from "react";
import { css } from "../../styled-system/css";
import { GlobalStateContext } from "../state/contextProvider";
import { useActor } from "@xstate/react";

type PizzazzTileProps = {
  letter: string;
  index: number;
  isValid?: boolean;
};

const letterValues = {
  a: 1,
  b: 3,
  c: 3,
  d: 2,
  e: 1,
  f: 4,
  g: 2,
  h: 4,
  i: 1,
  j: 8,
  k: 5,
  l: 1,
  m: 3,
  n: 1,
  o: 1,
  p: 3,
  q: 10,
  r: 1,
  s: 1,
  t: 1,
  u: 1,
  v: 4,
  w: 4,
  x: 8,
  y: 4,
  z: 10,
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

export function PizzazzTile({
  letter,
  isValid = false,
  index,
}: PizzazzTileProps) {
  const { dragAndDropService } = useContext(GlobalStateContext);
  const [state, send] = useActor(dragAndDropService);
  const tileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const tile = tileRef.current;
    if (!tile) {
      return;
    }

    tile.addEventListener("mousedown", send);
    return () => {
      tile.removeEventListener("mousedown", send);
    };
  }, [tileRef.current, send]);
  const { x, y } = state.context.distanceFromDragStart;
  const isDragTile = index === state.context.dragTileIndex;
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
        }}
      >
        {letter.toUpperCase()}
        <sub className={subStyles}>
          {letterValues[letter as keyof typeof letterValues]}
        </sub>
      </div>
    </div>
  );
}
