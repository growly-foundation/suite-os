import React, { useState } from 'react';

export interface AppStackConfig {
  theme?: Partial<{
    primary: string;
    secondary: string;
    background: string;
    backgroundForeground: string;
    headerBackground: string;
    headerText: string;
    text: string;
    textForeground: string;
  }>;
  agent?: Partial<{
    avatar?: string;
    name?: string;
  }>;
}

export const AppStackContext = React.createContext<{
  config?: AppStackConfig;
  setConfig: (config: AppStackConfig) => void;
} | null>(null);

export const AppStackProvider: React.FC<{
  children: React.ReactNode;
  config?: AppStackConfig;
}> = ({ children, config }) => {
  const [configState, setConfigState] = useState(config);

  return (
    <AppStackContext.Provider value={{ config: configState, setConfig: setConfigState }}>
      {children}
    </AppStackContext.Provider>
  );
};

export const useAppStack = () => {
  const context = React.useContext(AppStackContext);
  if (!context) {
    throw new Error('useAppStack must be used within a AppStackProvider');
  }
  return context;
};
