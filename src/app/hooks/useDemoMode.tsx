import React, { ReactNode, createContext, useContext } from 'react';

const DemoModeContext = createContext<boolean>(false);

type DemoModeProviderProps = {
  children: ReactNode;
  demoMode: boolean;
};

export const DemoModeProvider = ({ children, demoMode }: DemoModeProviderProps) => {
  return <DemoModeContext.Provider value={demoMode}>{children}</DemoModeContext.Provider>;
};

export function useDemoMode() {
  return useContext(DemoModeContext);
}
