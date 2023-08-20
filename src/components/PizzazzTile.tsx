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
  lineHeight: "normal",
  fontSize: "2.6vw",
  fontWeight: 400,
  verticalAlign: "-25%",
  md: {
    fontSize: "14.5px",
  },
});

const letterContainerStyles = css({
  width: "13.68%",
  display: "inline-block",
});

export function PizzazzTile({
  letter,
  isValid = false,
  index,
}: PizzazzTileProps) {
  const { dragAndDropService } = useContext(GlobalStateContext);
  const [, send] = useActor(dragAndDropService);
  const tileRef = useRef<HTMLDivElement | null>(null);
  // dragAndDropService.onChange(console.log);

  useEffect(() => {
    const tile = tileRef.current;
    if (!tile) {
      return;
    }
    tile.addEventListener("dragstart", (mouseEvent) => {
      send({
        type: "dragstart",
        dragStartMousePosition: {
          x: mouseEvent.clientX,
          y: mouseEvent.clientY,
        },
      });
    });

    tile.addEventListener("dragend", send);
  }, [tileRef.current, send]);

  return (
    <div
      ref={tileRef}
      draggable
      className={letterContainerStyles}
      data-index={index}
    >
      <div
        className={letterStyles}
        style={{ backgroundColor: isValid ? "#C4F2CB" : "#F7E9B7" }}
      >
        {letter.toUpperCase()}
        <sub className={subStyles}>
          {letterValues[letter as keyof typeof letterValues]}
        </sub>
      </div>
    </div>
  );
}
