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

function Button({ clickHandler, value }: ButtonProps) {
  return (
    <input
      type="button"
      className={buttonStyles}
      onClick={clickHandler}
      value={value}
    />
  );
}

export function JoinButton() {
  const { gameService } = useContext(GlobalStateContext);
  const [state, send] = useActor(gameService);

  if (state.context.time > 20 && state.value === "waiting") {
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
  const text = `Play ${solution.toUpperCase()} for ${potentialScore} points`;
  return state.context.validWordLength > 0 ? (
    <Button
      clickHandler={() => send({ type: "solution", solution })}
      value={text}
    />
  ) : null;
}
