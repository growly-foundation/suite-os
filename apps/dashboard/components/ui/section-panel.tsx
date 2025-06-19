import { ReactNode } from 'react';
import { SectionHeader, SectionHeaderProps } from './section-header';

interface SectionPanelProps extends SectionHeaderProps {
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/**
 * A consistent panel component with standard styling used across the dashboard
 */
export function SectionPanel({
  title,
  icon,
  children,
  className = '',
  bodyClassName = '',
}: SectionPanelProps) {
  return (
    <div className={`p-4 bg-white border-b ${className}`}>
      <SectionHeader title={title} icon={icon} />
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
