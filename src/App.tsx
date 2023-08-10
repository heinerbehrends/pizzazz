import { useActor } from "@xstate/react";
import { useContext } from "react";
import { css } from "../styled-system/css";
import { PizzazzTile } from "./components/PizzazzTile";
import {
  DragAndDropContext,
  GlobalStateProvider,
} from "./state/contextProvider";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { dragAndDropService } from "./state/dragAndDropMachine";

const mainContainerStyles = css({
  height: "100dvh",
  maxWidth: "500px",
  marginX: "auto",
});

const PizzazzBoardStyles = css({
  padding: "1.1vw",
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-around",
  boxSizing: "border-box",
  marginTop: "66dvh",
  md: {
    padding: "0.25rem",
  },
});

dragAndDropService.onTransition(console.log).start();

function PizzazzBoard() {
  const { dragAndDropService } = useContext(DragAndDropContext);
  const [state] = useActor(dragAndDropService);

  return (
    <div className={PizzazzBoardStyles}>
      {state?.context.letters.split("").map((letter) => (
        <PizzazzTile letter={letter} />
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
