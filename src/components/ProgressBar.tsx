import { useActor } from "@xstate/react";
import { useContext, useEffect, useRef } from "react";
import { css } from "../../styled-system/css";
import { GlobalStateContext } from "../state/contextProvider";

const containerStyles = css({
  marginX: "auto",
  position: "relative",
  height: "11px",
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
  console.log("time: ", state.context.time);
  const gameDuration = 40;
  const progressBarKeyframes = [
    { width: `${100 - (state.context.time / gameDuration) * 100}%` },
    { width: "100%" },
  ];
  const progressBarTiming = {
    duration: state.context.time * 1000,
  };
  const progressBarRef = useRef(null);

  useEffect(() => {
    if (progressBarRef.current === null) {
      return;
    }
    const progressBarDOM = progressBarRef.current as HTMLDivElement;
    progressBarDOM.animate(progressBarKeyframes, progressBarTiming);
  }, [state.context.time]);
  return (
    <div className={containerStyles}>
      <div ref={progressBarRef} className={barStyles} />
    </div>
  );
}
