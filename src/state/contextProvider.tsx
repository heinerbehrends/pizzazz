import { createContext } from "react";
import { useInterpret } from "@xstate/react";
import { dragAndDropMachine } from "./dragAndDropMachine";
import { InterpreterFrom } from "xstate";
import { entryAnimationMachine } from "./entryAnimationMachine";

export const GlobalStateContext = createContext({
  dragAndDropService: {} as InterpreterFrom<typeof dragAndDropMachine>,
  entryAnimationService: {} as InterpreterFrom<typeof entryAnimationMachine>,
});

export function GlobalStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dragAndDropService = useInterpret(dragAndDropMachine);
  const entryAnimationService = useInterpret(entryAnimationMachine);

  return (
    <GlobalStateContext.Provider
      value={{ entryAnimationService, dragAndDropService }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
}
