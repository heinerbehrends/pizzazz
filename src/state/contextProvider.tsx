import { createContext, useContext } from "react";
import { useInterpret } from "@xstate/react";
import { InterpreterFrom } from "xstate";
import { gameMachine } from "./gameMachine";
import usePartySocket from "partysocket/react";
import type PartySocket from "partysocket";

export const GlobalStateContext = createContext({
  // dragAndDropService: {} as InterpreterFrom<typeof dragAndDropMachine>,
  // entryAnimationService: {} as InterpreterFrom<typeof entryAnimationMachine>,
  gameService: {} as InterpreterFrom<typeof gameMachine>,
  socket: {} as PartySocket,
});

export function GlobalStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // const dragAndDropService = useInterpret(dragAndDropMachine);
  // const entryAnimationService = useInterpret(entryAnimationMachine);
  const socket = usePartySocket({
    host: "localhost:1999",
    room: "pizzazz-room",
  });
  console.log(socket);
  const gameService = useInterpret(gameMachine(socket));

  return (
    <GlobalStateContext.Provider value={{ gameService, socket }}>
      {children}
    </GlobalStateContext.Provider>
  );
}
