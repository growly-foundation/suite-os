import { ReactNode, createContext, useContext, useState } from 'react';

type ComponentProviderProps = {
  children: ReactNode;
};

type ComponentContextType = {
  activeComponent: string | null;
  openComponent: (id: string) => void;
  closeComponent: () => void;
};

const ComponentContext = createContext<ComponentContextType | undefined>(undefined);

export function ComponentProvider({ children }: ComponentProviderProps) {
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  const openComponent = (id: string) => {
    setActiveComponent(id);
  };

  const closeComponent = () => {
    setActiveComponent(null);
  };

  console.log(activeComponent);

  return (
    <ComponentContext.Provider value={{ activeComponent, openComponent, closeComponent }}>
      {children}
    </ComponentContext.Provider>
  );
}

export function useComponentProvider() {
  const context = useContext(ComponentContext);
  if (context === undefined) {
    throw new Error('useComponentProvider must be used within a ComponentProvider');
  }
  return context;
}

export function useComponent(id: string) {
  const { activeComponent, openComponent, closeComponent } = useComponentProvider();

  return {
    isOpen: activeComponent === id,
    open: () => openComponent(id),
    close: closeComponent,
    toggle: () => (activeComponent === id ? closeComponent() : openComponent(id)),
  };
}
