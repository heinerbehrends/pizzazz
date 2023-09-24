import { MouseEventHandler, useContext } from "react";
import { css } from "../../styled-system/css";
import { inputStyles } from "./ScreenNameInput";
import { getWordScore } from "../calculateWordScore";
import { useActor } from "@xstate/react";
import { GlobalStateContext } from "../state/contextProvider";

const buttonStyles = css({ ...inputStyles });

type ButtonProps = {
  clickHandler: MouseEventHandler<HTMLInputElement>;
  value: string;
};

export type ScreenNameMessage = { type: "screenName"; name: string };

function Button({ clickHandler, value }: ButtonProps) {
  return (
    <input
      type="button"
      className={buttonStyles}
      onClick={clickHandler}
      value={value}
      autoFocus
    />
  );
}

export function JoinButton() {
  const { gameService } = useContext(GlobalStateContext);
  const [state, send] = useActor(gameService);

  if (state.context.time > 10 && state.value === "waiting") {
    return (
      <Button
        clickHandler={() => send({ type: "joinGame" })}
        value="Join the current game"
      />
    );
  }
  return null;
}

export function SolutionButton() {
  const { gameService } = useContext(GlobalStateContext);
  const [state, send] = useActor(gameService);
  const solution = state.context.letters.substring(
    0,
    state.context.validWordLength
  );
  const potentialScore = getWordScore(solution);
  const buttonMessage = `Play ${solution.toUpperCase()} for ${potentialScore} points`;
  function handleClick() {
    console.log("send solution");
    send({ type: "solution", solution, score: potentialScore });
  }
  return state.context.validWordLength > 0 ? (
    <Button clickHandler={handleClick} value={buttonMessage} />
  ) : null;
}
