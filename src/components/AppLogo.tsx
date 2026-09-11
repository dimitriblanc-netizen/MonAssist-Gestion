import React from 'react';

interface AppLogoProps {
  className?: string;
  variant?: 'card' | 'plain';
}

export const AppLogo: React.FC<AppLogoProps> = ({ 
  className = 'w-10 h-10',
  variant = 'card'
}) => {
  if (variant === 'plain') {
    return (
      <img
        src="/app-logo.jpg"
        alt="Dryos Assist'Gestion Logo"
        className={`object-contain ${className}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center p-1.5 transition-transform duration-200 hover:scale-105 ${className}`}>
      <img
        src="/app-logo.jpg"
        alt="Dryos Assist'Gestion Logo"
        className="w-full h-full object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
