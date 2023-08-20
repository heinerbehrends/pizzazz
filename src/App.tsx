import { useActor } from "@xstate/react";
import { useContext, useEffect, useRef } from "react";
import { css } from "../styled-system/css";
import { PizzazzTile } from "./components/PizzazzTile";
import {
  GlobalStateContext,
  GlobalStateProvider,
} from "./state/contextProvider";

const letterIds = [
  "zeroth",
  "first",
  "second",
  "third",
  "fourth",
  "fifth",
  "sixth",
];

const mainContainerStyles = css({
  maxWidth: "500px",
  marginX: "auto",
  paddingTop: "40dvh",
});

const PizzazzBoardStyles = css({
  position: "relative",
  padding: "1.1vw",
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-around",
  boxSizing: "border-box",
  md: {
    padding: "0.25rem",
  },
});

function PizzazzBoard() {
  const { dragAndDropService } = useContext(GlobalStateContext);
  const [state, send] = useActor(dragAndDropService);
  // dragAndDropService.onTransition((state) =>
  //   console.log(state.context.distanceFromDragStart)
  // );

  useEffect(() => {
    const body = document.body;
    body.addEventListener("mouseup", send);
    body.addEventListener("mousemove", send);
    return () => {
      body.removeEventListener("mouseup", send);
      body.removeEventListener("mousemove", send);
    };
  });

  return (
    <div className={PizzazzBoardStyles}>
      {state.context.letters.split("").map((letter, index) => (
        <PizzazzTile
          key={letterIds[index]}
          letter={letter}
          index={index}
          data-id={index}
        />
      ))}
    </div>
  );
}

function App() {
  return (
    <GlobalStateProvider>
      <main className={mainContainerStyles}>
        <PizzazzBoard />
      </main>
    </GlobalStateProvider>
  );
}

export default App;
