import { createContext } from "react";
import { useInterpret } from "@xstate/react";
import { dragAndDropMachine } from "./dragAndDropMachine";
import { InterpreterFrom } from "xstate";

export const DragAndDropContext = createContext({
  dragAndDropService: {} as InterpreterFrom<typeof dragAndDropMachine>,
});

export function GlobalStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dragAndDropService = useInterpret(dragAndDropMachine);

  return (
    <DragAndDropContext.Provider value={{ dragAndDropService }}>
      {children}
    </DragAndDropContext.Provider>
  );
}
