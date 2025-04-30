import { ComponentMode } from '@/components/form/component-mode';
import { ComponentTheme } from '@/components/form/component-theme';
import { AppStackComponent } from '@/types/appstack';
import { ActiveComponent } from './form/active-component';
import { Chain } from './form/chain';

const COMMON_OPTIONS = [ActiveComponent, ComponentMode, ComponentTheme];

const COMPONENT_CONFIG: Partial<Record<AppStackComponent, (() => React.JSX.Element)[]>> = {
  [AppStackComponent.ChatWidget]: [Chain],
  [AppStackComponent.DemoChatWidget]: [Chain],
};

export default function DemoOptions({ component }: { component?: AppStackComponent }) {
  const commonElements = COMMON_OPTIONS.map(Component => <Component key={Component.name} />);

  const specificElements = component
    ? (COMPONENT_CONFIG[component] || []).map(Component => <Component key={Component.name} />)
    : [];

  return (
    <>
      {commonElements}
      {specificElements}
    </>
  );
}
