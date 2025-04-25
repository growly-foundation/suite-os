import { useMediaQuery } from 'react-responsive';

export const BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
};

export const MIDDLE_STYLE = {
  justifyContent: 'center',
  display: 'flex',
  alignItems: 'center',
};

export const useBreakpoint = () => {
  const isMobile = useMediaQuery({ query: `(max-width: ${BREAKPOINTS.sm}px)` });
  const isTablet = useMediaQuery({ query: `(max-width: ${BREAKPOINTS.lg}px)` });
  const isDesktop = useMediaQuery({
    query: `(max-width: ${BREAKPOINTS.xl}px)`,
  });

  return { isMobile, isTablet, isDesktop };
};
