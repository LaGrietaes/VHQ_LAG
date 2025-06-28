"use client"

import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ThemeAwareLogoProps {
  variant?: 'full' | 'small';
  className?: string;
}

export function ThemeAwareLogo({
  variant = 'full',
  className = '',
}: ThemeAwareLogoProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Set up portrait mode detection
    const mediaQuery = window.matchMedia("(orientation: portrait)");
    setIsPortrait(mediaQuery.matches);

    const handleOrientationChange = (e: MediaQueryListEvent) => {
      setIsPortrait(e.matches);
    };

    mediaQuery.addEventListener('change', handleOrientationChange);

    return () => {
      mediaQuery.removeEventListener('change', handleOrientationChange);
    };
  }, []);

  if (!mounted) {
    return (
      <div className={`h-12 w-auto ${className}`} />
    );
  }

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';

  // Use LA_VHQ for portrait mode on tablets/phones, otherwise use full VHQ_LAG
  const useCompactLogo = isPortrait || variant === 'small';
  
  const logoPath = useCompactLogo
    ? isDark ? '/LA_VHQ_W.svg' : '/LA_VHQ_B.svg'
    : isDark ? '/VHQ_LAG_White.svg' : '/VHQ_LAG_Black.svg';

  // Calculate dimensions based on logo type
  const dimensions = useCompactLogo
    ? { width: 120, height: 57 } // LA_VHQ (312.1:149.05 aspect ratio, scaled down)
    : { width: 244, height: 60 }; // VHQ_LAG (keeping the same dimensions)

  return (
    <div className={`relative flex items-center ${className}`}>
      <div 
        className="relative"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          maxWidth: '100%'
        }}
      >
        <Image
          src={logoPath}
          alt="VHQ Logo"
          fill
          className="object-contain object-center"
          priority
          sizes={`${dimensions.width}px`}
          quality={100}
        />
      </div>
    </div>
  );
} 