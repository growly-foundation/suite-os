import { IconContainer } from '../../ui/icon-container';

// Helper component for column headers with icons
export const HeadLabelWithIcon = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="flex items-center space-x-2 text-xs">
    <IconContainer>{icon}</IconContainer>
    <span>{label}</span>
  </div>
);
