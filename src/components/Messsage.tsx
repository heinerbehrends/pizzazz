import { useActor } from "@xstate/react";
import { useContext } from "react";
import { GlobalStateContext } from "../state/contextProvider";
import { css } from "../../styled-system/css";

const messageContainerStyles = css({
  textAlign: "center",
  marginBottom: "9vw",
  md: { marginBottom: "3rem" },
});

const messageStyles = css({
  display: "inline-block",
  fontSize: "4vw",
  fontWeight: 300,
  fontFamily: "Roboto, sans-serif",
  color: "#7A828A",
  padding: "3vw 6vw",
  borderBottom: "1px solid #CED4DA",
  _firstLetter: {
    textTransform: "uppercase",
  },
  md: {
    fontSize: "1.1rem",
    padding: "0.5rem 1rem",
  },
});

export function Message() {
  const { gameService } = useContext(GlobalStateContext);
  const [state] = useActor(gameService);

  const message = state.context.message;
  return (
    <div className={messageContainerStyles}>
      <p className={messageStyles}>{message}</p>
    </div>
  );
}
