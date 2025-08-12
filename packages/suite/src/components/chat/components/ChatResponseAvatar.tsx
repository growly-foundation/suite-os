export const ChatResponseAvatar = ({
  showAvatar,
  children,
}: {
  showAvatar?: boolean;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex-shrink-0 pt-2">
      {showAvatar ? children : <div style={{ width: 30, height: 30 }} />}
    </div>
  );
};
