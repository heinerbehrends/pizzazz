import { createContext } from "react";
import { useInterpret } from "@xstate/react";
import { InterpreterFrom } from "xstate";
import { gameMachine } from "./gameMachine";

export const GlobalStateContext = createContext({
  // dragAndDropService: {} as InterpreterFrom<typeof dragAndDropMachine>,
  // entryAnimationService: {} as InterpreterFrom<typeof entryAnimationMachine>,
  gameService: {} as InterpreterFrom<typeof gameMachine>,
});

export function GlobalStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // const dragAndDropService = useInterpret(dragAndDropMachine);
  // const entryAnimationService = useInterpret(entryAnimationMachine);
  const gameService = useInterpret(gameMachine);

  return (
    <GlobalStateContext.Provider value={{ gameService }}>
      {children}
    </GlobalStateContext.Provider>
  );
}
