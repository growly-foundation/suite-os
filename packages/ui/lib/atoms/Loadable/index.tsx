import type React from 'react';

type Props = {
  isLoading: boolean | undefined;
  loadComponent: React.ReactElement;
  children: React.ReactElement | React.ReactNode | React.ReactNode[];
};

const Loadable = ({ loadComponent, isLoading, children }: Props) => {
  return isLoading ? loadComponent : <>{children}</>;
};

export default Loadable;
