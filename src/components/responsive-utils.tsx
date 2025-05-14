import { useEffect, useState } from 'react';

// Hook to detect viewport size
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

// Predefined breakpoints for responsive design
export function useBreakpoint() {
  const isMobile = useMediaQuery('(max-width: 639px)');
  const isTablet = useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isLargeDesktop = useMediaQuery('(min-width: 1280px)');

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    // Current active breakpoint name
    current: isMobile 
      ? 'mobile' 
      : isTablet 
        ? 'tablet' 
        : isDesktop && !isLargeDesktop 
          ? 'desktop' 
          : 'largeDesktop',
  };
}

// Components for conditional rendering based on screen size
interface ResponsiveProps {
  children: React.ReactNode;
}

export function MobileOnly({ children }: ResponsiveProps) {
  const matches = useMediaQuery('(max-width: 639px)');
  return matches ? <>{children}</> : null;
}

export function TabletOnly({ children }: ResponsiveProps) {
  const matches = useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
  return matches ? <>{children}</> : null;
}

export function DesktopOnly({ children }: ResponsiveProps) {
  const matches = useMediaQuery('(min-width: 1024px)');
  return matches ? <>{children}</> : null;
}

export function TabletUp({ children }: ResponsiveProps) {
  const matches = useMediaQuery('(min-width: 640px)');
  return matches ? <>{children}</> : null;
}

export function MobileTablet({ children }: ResponsiveProps) {
  const matches = useMediaQuery('(max-width: 1023px)');
  return matches ? <>{children}</> : null;
}