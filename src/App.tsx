import { css } from "../styled-system/css";
import { PizzazzTile } from "./components/PizzazzTile";

type PizzazzTileProps = { letters: string };

const PizzazzBoardStyles = css({
  marginX: "auto",
  position: "relative",
  padding: "1.1vw",
  boxShadow: "${shadow}",
  listStyle: "none",
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-around",
  boxSizing: "border-box",
  md: {
    padding: "0.25rem",
  },
});

function PizzazzBoard({ letters }: PizzazzTileProps) {
  return (
    <div className={PizzazzBoardStyles}>
      {letters.split("").map((letter) => (
        <PizzazzTile letter={letter} />
      ))}
    </div>
  );
}

function App() {
  return <PizzazzBoard letters="pizzazz" />;
}

export default App;
