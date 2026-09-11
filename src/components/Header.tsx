import React from 'react';
import { ShieldCheck, PhoneCall, Plus, ExternalLink, Download, Smartphone, Check } from 'lucide-react';
import { AppLogo } from './AppLogo';

interface HeaderProps {
  onOpenAgencyContact: () => void;
  onAddProperty: () => void;
  onDownloadAppClick: () => void;
  firebaseConnected: boolean;
  totalProperties: number;
  isStandalone?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAgencyContact,
  onAddProperty,
  onDownloadAppClick,
  firebaseConnected,
  totalProperties,
  isStandalone = false
}) => {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Dryos Tag */}
          <div className="flex items-center space-x-3">
            <AppLogo className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm sm:text-lg font-black tracking-tight text-[#00434A]">
                  MON ASSIST'GESTION
                </span>
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 sm:px-2 py-0.5 rounded-md bg-[#00434A]/10 text-[#00434A]">
                  Par DRYOS
                </span>
              </div>
              <div className="hidden xs:flex items-center space-x-2 text-[10px] sm:text-[11px] text-slate-500 font-medium">
                <span className="font-semibold text-teal-800">gestion.dryos.fr</span>
                <span>•</span>
                <span className="text-emerald-700 flex items-center font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1" />
                  Auto-gestion sereine
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* The Standout "Télécharger l'app ici" button */}
            {!isStandalone ? (
              <button
                id="btn-header-download-app"
                onClick={onDownloadAppClick}
                className="relative group px-3 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black transition-all duration-200 flex items-center space-x-1.5 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer ring-2 ring-emerald-400/30"
                title="Télécharger l'application sur votre écran d'accueil"
              >
                <Download className="w-3.5 h-3.5 text-white animate-bounce" />
                <span className="tracking-tight">Télécharger l'app</span>
                <span className="hidden lg:inline text-[10px] bg-white/20 px-1 py-0.5 rounded font-bold">ici</span>
              </button>
            ) : (
              <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>App installée</span>
              </div>
            )}

            <a
              href="https://paris.dryos.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-[#00434A] px-2.5 py-2 rounded-xl hover:bg-slate-50 transition"
            >
              <span>paris.dryos.fr</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              id="btn-header-agency-contact"
              onClick={onOpenAgencyContact}
              className="hidden md:flex px-3 py-2 rounded-xl border border-slate-200 hover:border-[#00434A] text-xs font-bold text-slate-800 hover:text-[#00434A] transition items-center space-x-1.5 cursor-pointer bg-white"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#00434A]" />
              <span>Guichet DRYOS</span>
            </button>

            <button
              id="btn-header-add-property"
              onClick={onAddProperty}
              className="px-3 sm:px-4 py-2 rounded-xl bg-[#00434A] hover:bg-[#00343a] text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-teal-300" />
              <span className="hidden sm:inline">Nouveau bien</span>
              <span className="sm:hidden">Ajouter</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
