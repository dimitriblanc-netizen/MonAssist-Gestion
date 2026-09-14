import React from 'react';

interface AppLogoProps {
  className?: string;
  variant?: 'card' | 'plain';
}

export const AppLogo: React.FC<AppLogoProps> = ({ 
  className = 'h-10 w-auto',
  variant = 'plain'
}) => {
  return (
    <img
      src="/app-logo.png"
      alt="DRYOS"
      className={`object-contain select-none ${className}`}
      referrerPolicy="no-referrer"
    />
  );
};
