import { useActor } from "@xstate/react";
import { useContext } from "react";
import { css } from "../../styled-system/css";
import { GlobalStateContext } from "../state/contextProvider";

const definitionStyle = css({
  marginBottom: "4.5vw",
  textAlign: "left",
  fontStyle: "italic",
  fontWeight: 300,
  fontSize: "4vw",
  color: "#7A828A",
  borderLeft: "1px solid #CED4DA",
  padding: "3vw 6vw",
  md: { marginBottom: "1.5rem", padding: "0.8rem 1.6rem", fontSize: "1.1rem" },
});

export function Definition() {
  const { gameService } = useContext(GlobalStateContext);
  const [state] = useActor(gameService);

  const message = state.context.definition;

  return <div className={definitionStyle}>{message}</div>;
}
