import React, { useState } from 'react';

export interface WidgetConfig {
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

export const WidgetConfigContext = React.createContext<{
  config?: WidgetConfig;
  setConfig: (config: WidgetConfig) => void;
} | null>(null);

export const WidgetConfigProvider: React.FC<{
  children: React.ReactNode;
  config?: WidgetConfig;
}> = ({ children, config }) => {
  const [configState, setConfigState] = useState(config);

  return (
    <WidgetConfigContext.Provider value={{ config: configState, setConfig: setConfigState }}>
      {children}
    </WidgetConfigContext.Provider>
  );
};

export const useWidget = () => {
  const context = React.useContext(WidgetConfigContext);
  if (!context) {
    throw new Error('useWidget must be used within a WidgetConfigProvider');
  }
  return context;
};
