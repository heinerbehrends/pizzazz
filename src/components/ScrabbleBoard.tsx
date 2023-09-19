import { css } from "../../styled-system/css";
import { LetterRow } from "../App";
// import { ReactComponent as PizzazzBoard } from "./pizzazzBoard.svg";

const scrabbleBoardContainerStyles = css({
  position: "relative",
  marginLeft: "auto",
  marginRight: "auto",
  backgroundColor: "#fff",
  marginBottom: "4.5vw",
  md: {
    marginBottom: "1.5rem",
  },
});

const scrabbleBoardStyles = css({
  marginLeft: "auto",
  marginRight: "auto",
  position: "relative",
  padding: "1.1vw",
  boxShadow: "${shadow}",
  listStyle: "none",
  display: "flex",
  justifyContent: "space-around",
  boxSizing: "border-box",
  md: {
    padding: "0.25rem",
  },
});

export function ScrabbleBoard() {
  return (
    <div className={scrabbleBoardContainerStyles}>
      <div className={scrabbleBoardStyles}>
        {/* <PizzazzBoard style={{ width: "100%", height: "100%" }} /> */}
        <LetterRow />
      </div>
    </div>
  );
}
