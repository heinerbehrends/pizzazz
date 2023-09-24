import { useActor } from "@xstate/react";
import { useContext, useEffect, useRef } from "react";
import { css } from "../../styled-system/css";
import { GlobalStateContext } from "../state/contextProvider";
import { gameDuration } from "../srcServer/stateServer/serverGameMachine";

const containerStyles = css({
  marginX: "auto",
  position: "relative",
  height: "20px",
  background: "#fff",
  padding: "4.5px",
  boxShadow: "'1.8px 2.4px 1.8px rgba(0, 0, 0, 0.05)'",
  marginBottom: "9vw",
  md: {
    marginBottom: "1.5rem",
  },
});

const barStyles = css({
  position: "relative",
  background: "#E7DDCF",
  height: "100%",
  borderRight: "solid #FFC2C0 1px",
});

export function ProgressBar() {
  const { gameService } = useContext(GlobalStateContext);
  const [state] = useActor(gameService);
  const progressBarRef = useRef(null);

  useEffect(() => {
    if (progressBarRef.current === null) {
      return;
    }
    console.log("progress bar time: ", state.context.time);
    const progressBarKeyframes = [
      { width: `${100 - (state.context.time / gameDuration) * 100}%` },
      { width: "100%" },
    ];
    const progressBarTiming = {
      duration: state.context.time * 1000,
    };
    const progressBarDOM = progressBarRef.current as HTMLDivElement;
    progressBarDOM.animate(progressBarKeyframes, progressBarTiming);
  }, [state.context.time, state.context.lettersStatic, state.value]);

  if (state.value === "dragAndDrop") {
    return (
      <div className={containerStyles}>
        <div ref={progressBarRef} className={barStyles} />
      </div>
    );
  }
  return null;
}
