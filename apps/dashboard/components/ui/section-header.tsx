import { LucideIcon } from 'lucide-react';

export interface SectionHeaderProps {
  title: string;
  icon?: LucideIcon;
  className?: string;
}

/**
 * Reusable section header component used across dashboard sections
 */
export function SectionHeader({ title, icon: Icon, className = 'mb-3' }: SectionHeaderProps) {
  return (
    <h4 className={`text-sm font-semibold flex items-center gap-2 ${className}`}>
      {Icon && <Icon className="h-4 w-4" />}
      {title}
    </h4>
  );
}
