import { LucideProps } from 'lucide-react';

export const InteractableIcon = ({
  iconComponent,
}: {
  iconComponent: (
    props: Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
  ) => React.ReactNode;
}) => {
  return iconComponent({
    className: 'h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary',
  });
};
