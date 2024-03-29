import { useActor } from "@xstate/react";
import { useContext, useEffect } from "react";
import { css } from "../styled-system/css";
import { PizzazzTile } from "./components/PizzazzTile";
import {
  GlobalStateContext,
  GlobalStateProvider,
} from "./state/contextProvider";
// cspell:disable-next-line
import { Message } from "./components/Messsage";
import { ScreenNameInput } from "./components/ScreenNameInput";
import { Definition } from "./components/Definitions";
import { ProgressBar } from "./components/ProgressBar";
import { JoinButton, SolutionButton } from "./components/Buttons";
import { State } from "xstate";

const letterIds = [
  "zeroth",
  "first",
  "second",
  "third",
  "fourth",
  "fifth",
  "sixth",
] as const;

const mainContainerStyles = css({
  maxWidth: "500px",
  marginX: "auto",
  paddingTop: "40dvh",
  textAlign: "center",
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

const containerStyles = css({
  marginLeft: "auto",
  marginRight: "auto",
  textAlign: "center",
  maxWidth: "500px",
  marginTop: "18vw",
  boxSizing: "border-box",
  marginBottom: "4.5vw",
  md: { marginTop: "3rem", marginBottom: "1.5rem" },
});

function useLogState(gameState: State<any, any, any, any, any>) {
  useEffect(() => {
    console.log(gameState.value);
  }, [gameState.value]);
}

export function LetterRow() {
  const { gameService } = useContext(GlobalStateContext);
  const [gameState] = useActor(gameService);
  const [, sendDnD] = useActor(gameState.children.dragAndDropMachine);
  useLogState(gameState);
  useEffect(() => {
    const body = document.body;
    body.addEventListener("mouseup", sendDnD);
    body.addEventListener("mousemove", sendDnD);
    return () => {
      body.removeEventListener("mouseup", sendDnD);
      body.removeEventListener("mousemove", sendDnD);
    };
  });

  return (
    <div className={containerStyles}>
      <div className={PizzazzBoardStyles}>
        {gameState.context.letters.split("").map((letter, index) => (
          <PizzazzTile
            key={letterIds[index]}
            letter={letter}
            index={index}
            data-id={index}
            isValid={index < gameState.context.validWordLength}
          />
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <GlobalStateProvider>
      <main className={mainContainerStyles}>
        <Message />
        <LetterRow />
        <ProgressBar />
        <Definition />
        <JoinButton />
        <SolutionButton />
        <ScreenNameInput />
      </main>
    </GlobalStateProvider>
  );
}

export default App;
