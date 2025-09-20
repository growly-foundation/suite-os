export const BlockscanSvg = ({
  width = 24,
  height = 24,
  className,
}: {
  width?: number;
  height?: number;
  className?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 256 256"
    fill="none"
    className={className}>
    <rect x="23" y="1" width="81.3807" height="252.861" rx="3" fill="black" />
    <rect x="116.742" y="1" width="116.258" height="120.629" rx="3" fill="black" />
    <rect x="116.742" y="133.99" width="116.258" height="120.629" rx="3" fill="black" />
  </svg>
);
