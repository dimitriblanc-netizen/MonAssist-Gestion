import React, { useState } from 'react';
import { Download, Sparkles, Smartphone, ChevronRight, X, QrCode, Check } from 'lucide-react';
import { AppLogo } from './AppLogo';

interface InstallHeroBannerProps {
  onOpenInstallModal: () => void;
  onTriggerInstall: () => Promise<boolean>;
  isInstallable: boolean;
  isStandalone: boolean;
  isIos: boolean;
}

export const InstallHeroBanner: React.FC<InstallHeroBannerProps> = ({
  onOpenInstallModal,
  onTriggerInstall,
  isInstallable,
  isStandalone,
  isIos
}) => {
  const [dismissed, setDismissed] = useState(false);

  // If already installed and running as standalone PWA, render a clean discrete confirmation or hide
  if (isStandalone || dismissed) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#00434A] via-[#00525b] to-[#01353b] text-white p-4 sm:p-5 shadow-lg border border-teal-800/60 transition-all">
      {/* Subtle background light effect */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition cursor-pointer z-10"
        title="Masquer ce bandeau"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative z-1 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Left identity & tagline */}
        <div className="flex items-center space-x-3.5 sm:space-x-4 pr-6 sm:pr-0">
          <AppLogo className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl p-1 shadow-md flex-shrink-0" />
          
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-400 text-[#00434A]">
                Page d'accueil : gestion.dryos.fr
              </span>
              <span className="text-[10px] text-teal-200 font-semibold flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1 animate-ping" />
                Version installable
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              Installez l'application sur votre smartphone ou PC
            </h2>

            <p className="text-xs text-teal-100/90 max-w-xl line-clamp-2 sm:line-clamp-none">
              Recevez les notifications de pointage directes le 5 du mois et générez vos quittances en 1 clic sans passer par l'App Store.
            </p>
          </div>
        </div>

        {/* Right CTA Button that "sort" (pops out) with maximum prominence */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto mt-1 md:mt-0 flex-shrink-0">
          
          <button
            id="btn-hero-download-app"
            onClick={async () => {
              if (isInstallable) {
                const installed = await onTriggerInstall();
                if (!installed) {
                  onOpenInstallModal();
                }
              } else {
                onOpenInstallModal();
              }
            }}
            className="w-full sm:w-auto relative group px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-[#00434A] font-black text-sm transition-all duration-200 shadow-lg shadow-emerald-950/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer ring-4 ring-emerald-400/20"
          >
            <Download className="w-4 h-4 text-[#00434A] animate-bounce" />
            <span className="tracking-wide">Télécharger l'app ici</span>
            <ChevronRight className="w-4 h-4 text-[#00434A]/70 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={onOpenInstallModal}
            className="w-full sm:w-auto px-3.5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer border border-white/10"
            title="Guide d'installation et QR code"
          >
            <QrCode className="w-3.5 h-3.5 text-teal-200" />
            <span className="hidden lg:inline">QR Code</span>
          </button>

        </div>

      </div>
    </div>
  );
};
