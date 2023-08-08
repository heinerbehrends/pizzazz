import { css } from "../../styled-system/css";

type PizzazzTileProps = {
  letter: string;
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
  color: "letter",
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

export function PizzazzTile({ letter, isValid = false }: PizzazzTileProps) {
  return (
    <div className={letterContainerStyles}>
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
