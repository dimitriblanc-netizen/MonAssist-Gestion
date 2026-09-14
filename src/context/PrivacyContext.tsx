import React, { createContext, useContext, useState, useEffect } from 'react';

interface PrivacyContextType {
  privacyMode: boolean;
  togglePrivacyMode: () => void;
  maskText: (text: string | undefined | null, type?: 'name' | 'phone' | 'email' | 'amount') => string;
}

const PrivacyContext = createContext<PrivacyContextType>({
  privacyMode: false,
  togglePrivacyMode: () => {},
  maskText: (t) => t || '',
});

export const PrivacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [privacyMode, setPrivacyMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('dryos_privacy_mode') === 'true';
    } catch {
      return false;
    }
  });

  const togglePrivacyMode = () => {
    setPrivacyMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('dryos_privacy_mode', String(next));
      } catch {}
      return next;
    });
  };

  const maskText = (text: string | undefined | null, type: 'name' | 'phone' | 'email' | 'amount' = 'name'): string => {
    if (!text) return '—';
    if (!privacyMode) return text;

    switch (type) {
      case 'name': {
        const parts = text.trim().split(/\s+/);
        return parts.map(p => p[0] ? `${p[0]}•••••` : '••••').join(' ');
      }
      case 'phone': {
        if (text.length < 4) return '•• •• •• ••';
        return `${text.slice(0, 2)} •• •• •• ${text.slice(-2)}`;
      }
      case 'email': {
        const [user, domain] = text.split('@');
        if (!domain) return '•••••@••••.fr';
        return `${user?.[0] || 'u'}•••••@${domain}`;
      }
      case 'amount': {
        return '••• €';
      }
      default:
        return '••••••••';
    }
  };

  return (
    <PrivacyContext.Provider value={{ privacyMode, togglePrivacyMode, maskText }}>
      {children}
    </PrivacyContext.Provider>
  );
};

export function usePrivacy() {
  return useContext(PrivacyContext);
}

/**
 * Component to wrap sensitive information (blur effect on screen when privacy is active)
 */
export const MaskedValue: React.FC<{
  value: React.ReactNode;
  type?: 'name' | 'phone' | 'email' | 'amount' | 'generic';
  className?: string;
}> = ({ value, className = '' }) => {
  const { privacyMode } = usePrivacy();

  if (!privacyMode) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span 
      className={`inline-block select-none transition-all duration-200 cursor-pointer ${
        privacyMode 
          ? 'filter blur-[4.5px] hover:blur-none opacity-80 hover:opacity-100' 
          : ''
      } ${className}`}
      title="Mode discret actif (survolez pour afficher temporairement)"
    >
      {value}
    </span>
  );
};
