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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`h-12 w-auto ${className}`} />
    );
  }

  // Use the proper brand logo
  const logoPath = '/LAG_VHQ_LOGO_W.svg';

  // Dimensions based on the logo's aspect ratio (760.61:187)
  const dimensions = { width: 200, height: 49 }; // Maintaining the 4:1 aspect ratio

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
          alt="VHQ LAG Logo"
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