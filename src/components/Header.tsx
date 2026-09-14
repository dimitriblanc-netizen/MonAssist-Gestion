import React, { useState } from 'react';
import { 
  ShieldCheck, 
  PhoneCall, 
  Plus, 
  ExternalLink, 
  Download, 
  Check, 
  LogIn, 
  LogOut, 
  User as UserIcon,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Sparkles,
  Building2
} from 'lucide-react';
import { AppLogo } from './AppLogo';
import { User } from '../firebase';
import { usePrivacy } from '../context/PrivacyContext';

interface HeaderProps {
  onOpenAgencyContact: () => void;
  onAddProperty: () => void;
  onDownloadAppClick: () => void;
  onNavigateToLanding?: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenSecurity?: () => void;
  currentUser: User | null;
  firebaseConnected: boolean;
  totalProperties: number;
  isStandalone?: boolean;
  isAdmin?: boolean;
  isAdminViewActive?: boolean;
  onToggleAdmin?: () => void;
  onResetToAppHome?: () => void;
  onLoadTestData?: () => void;
  onClearTestData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAgencyContact,
  onAddProperty,
  onDownloadAppClick,
  onNavigateToLanding,
  onOpenAuth,
  onLogout,
  onOpenSecurity,
  currentUser,
  firebaseConnected,
  totalProperties,
  isStandalone = false,
  isAdmin = false,
  isAdminViewActive = false,
  onToggleAdmin,
  onResetToAppHome,
  onLoadTestData,
  onClearTestData
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const { privacyMode, togglePrivacyMode } = usePrivacy();

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Dryos Tag */}
          <div 
            className="flex items-center space-x-3.5 cursor-pointer group"
            onClick={onResetToAppHome || (() => {})}
            title="Mon Assist'Gestion - Accueil"
          >
            <AppLogo className="h-9 sm:h-11 w-auto max-w-[120px] sm:max-w-[140px]" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-xl font-black tracking-tight text-navy">
                  MON ASSIST'GESTION
                </span>
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 sm:px-2 py-0.5 rounded-md bg-navy-50 text-navy">
                  DRYOS
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Security Center */}
          <div className="flex items-center space-x-2 sm:space-x-3">

            {/* DRYOS Agency Super-Admin & Personal Account Dual-Switch */}
            {isAdmin && onToggleAdmin && (
              <div className="flex items-center bg-slate-100 border border-slate-200 p-0.5 sm:p-1 rounded-xl shadow-2xs">
                <button
                  id="btn-header-admin-console"
                  onClick={() => !isAdminViewActive && onToggleAdmin()}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-black transition-all flex items-center space-x-1.5 cursor-pointer ${
                    isAdminViewActive
                      ? 'bg-navy text-white shadow-xs'
                      : 'text-slate-600 hover:text-navy hover:bg-slate-200/60'
                  }`}
                  title="Console Agence DRYOS : Gestion des comptes bailleurs & mandats"
                >
                  <ShieldCheck className={`w-3.5 h-3.5 ${isAdminViewActive ? 'text-emerald-brand' : 'text-slate-500'}`} />
                  <span className="hidden sm:inline">Agence DRYOS</span>
                  <span className="sm:hidden">Agence</span>
                </button>

                <button
                  id="btn-header-personal-account"
                  onClick={() => isAdminViewActive && onToggleAdmin()}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-black transition-all flex items-center space-x-1.5 cursor-pointer ${
                    !isAdminViewActive
                      ? 'bg-navy text-white shadow-xs'
                      : 'text-slate-600 hover:text-navy hover:bg-slate-200/60'
                  }`}
                  title="Mon Espace Bailleur Personnel : Mode Test & Gestion de mes lots"
                >
                  <UserIcon className={`w-3.5 h-3.5 ${!isAdminViewActive ? 'text-emerald-brand' : 'text-slate-500'}`} />
                  <span className="hidden sm:inline">Mon Espace Perso</span>
                  <span className="sm:hidden">Perso</span>
                </button>
              </div>
            )}

            {/* Mode Discret (Anti-regards indiscrets) */}
            <button
              id="btn-privacy-toggle"
              onClick={togglePrivacyMode}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                privacyMode
                  ? 'bg-navy text-white border-navy-800 shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title={privacyMode ? "Mode discret actif (cliquer pour afficher les données)" : "Activer le mode discret (flouter les noms et loyers en public)"}
            >
              {privacyMode ? <EyeOff className="w-3.5 h-3.5 text-emerald-light" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
              <span className="hidden md:inline">{privacyMode ? 'Discret' : 'Public'}</span>
            </button>

            {/* Security & RGPD Badge Button */}
            {onOpenSecurity && (
              <button
                id="btn-security-center"
                onClick={onOpenSecurity}
                className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-navy-50 hover:bg-navy-100/70 border border-navy-200/80 text-navy text-xs font-bold transition cursor-pointer"
                title="Consulter le Centre de Sécurité & Confidentialité RGPD"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-brand" />
                <span className="hidden lg:inline">Sécurité & RGPD</span>
                <span className="lg:hidden">Sécurité</span>
              </button>
            )}
            
            {/* The Standout "Télécharger l'app ici" button */}
            {!isStandalone ? (
              <button
                id="btn-header-download-app"
                onClick={onDownloadAppClick}
                className="hidden sm:flex relative group px-3 sm:px-3.5 py-2 rounded-xl bg-emerald-brand hover:bg-emerald-dark text-white text-xs font-black transition-all duration-200 items-center space-x-1.5 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer ring-2 ring-emerald-brand/30"
                title="Télécharger l'application sur votre écran d'accueil"
              >
                <Download className="w-3.5 h-3.5 text-white animate-bounce" />
                <span className="tracking-tight">Installer l'app</span>
              </button>
            ) : (
              <div className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-status-ok-bg text-status-ok-text text-[11px] font-bold border border-status-ok-border">
                <Check className="w-3.5 h-3.5 text-status-ok" />
                <span>PWA installée</span>
              </div>
            )}

            <button
              id="btn-header-agency-contact"
              onClick={onOpenAgencyContact}
              className="hidden lg:flex px-3 py-2 rounded-xl border border-slate-200 hover:border-navy text-xs font-bold text-slate-800 hover:text-navy transition items-center space-x-1.5 cursor-pointer bg-white"
            >
              <PhoneCall className="w-3.5 h-3.5 text-navy" />
              <span>Guichet DRYOS</span>
            </button>

            {/* Add Property Button */}
            <button
              id="btn-header-add-property"
              onClick={onAddProperty}
              className="px-3 sm:px-3.5 py-2 rounded-xl bg-navy hover:bg-navy-800 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
              title="Ajouter un nouveau bien locatif"
            >
              <Plus className="w-4 h-4 text-emerald-light" />
              <span className="hidden sm:inline">Nouveau bien</span>
              <span className="sm:hidden">Ajouter</span>
            </button>

            {/* User Account / Auth Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="btn-user-profile"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
                  title={currentUser.displayName || currentUser.email || 'Mon compte'}
                >
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Avatar" 
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-navy text-white font-bold text-xs flex items-center justify-center">
                      {(currentUser.displayName?.[0] || currentUser.email?.[0] || 'P').toUpperCase()}
                    </div>
                  )}
                  <span className="hidden md:inline text-xs font-bold text-slate-700 max-w-[110px] truncate">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
                </button>

                {showUserDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-30"
                      onClick={() => setShowUserDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-40 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {currentUser.displayName || (isAdmin ? 'Dimitri Blanc' : 'Bailleur connecté')}
                          </p>
                          {isAdmin && (
                            <span className="text-[9px] bg-navy-50 text-navy border border-navy-200 px-1.5 py-0.5 rounded font-black">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {currentUser.email}
                        </p>
                      </div>

                      {/* Admin Quick Switchers */}
                      {isAdmin && onToggleAdmin && (
                        <div className="px-2 py-1 bg-slate-50 border-b border-slate-100 space-y-0.5">
                          <button
                            onClick={() => {
                              setShowUserDropdown(false);
                              if (!isAdminViewActive) onToggleAdmin();
                            }}
                            className={`w-full text-left px-2.5 py-1.5 text-xs font-bold rounded-lg flex items-center space-x-2 transition ${
                              isAdminViewActive
                                ? 'bg-navy text-white shadow-2xs'
                                : 'text-slate-700 hover:bg-slate-200/60'
                            }`}
                          >
                            <ShieldCheck className={`w-3.5 h-3.5 ${isAdminViewActive ? 'text-emerald-brand' : 'text-slate-500'}`} />
                            <span>Console Agence DRYOS</span>
                          </button>

                          <button
                            onClick={() => {
                              setShowUserDropdown(false);
                              if (isAdminViewActive) onToggleAdmin();
                            }}
                            className={`w-full text-left px-2.5 py-1.5 text-xs font-bold rounded-lg flex items-center space-x-2 transition ${
                              !isAdminViewActive
                                ? 'bg-navy text-white shadow-2xs'
                                : 'text-slate-700 hover:bg-slate-200/60'
                            }`}
                          >
                            <UserIcon className={`w-3.5 h-3.5 ${!isAdminViewActive ? 'text-emerald-brand' : 'text-slate-500'}`} />
                            <span>Mon Espace Bailleur Perso</span>
                          </button>

                          {onLoadTestData && (
                            <button
                              onClick={() => {
                                setShowUserDropdown(false);
                                onLoadTestData();
                              }}
                              className="w-full text-left px-2.5 py-1.5 text-[11px] font-semibold text-navy hover:bg-navy-50 rounded-lg flex items-center space-x-2 transition"
                            >
                              <Sparkles className="w-3 h-3 text-emerald-brand" />
                              <span>Charger 3 biens de test</span>
                            </button>
                          )}
                        </div>
                      )}

                      <div className="px-2 py-1">
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            onAddProperty();
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl flex items-center space-x-2"
                        >
                          <Plus className="w-3.5 h-3.5 text-navy" />
                          <span>Ajouter un bien</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            onOpenAgencyContact();
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl flex items-center space-x-2"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-navy" />
                          <span>Guichet DRYOS</span>
                        </button>

                        {onOpenSecurity && (
                          <button
                            onClick={() => {
                              setShowUserDropdown(false);
                              onOpenSecurity();
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl flex items-center space-x-2"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-brand" />
                            <span>Sécurité & RGPD</span>
                          </button>
                        )}
                      </div>

                      <div className="pt-1 border-t border-slate-100 px-2">
                        <button
                          id="btn-logout"
                          onClick={() => {
                            setShowUserDropdown(false);
                            onLogout();
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-status-urgent-text hover:bg-status-urgent-bg rounded-xl flex items-center space-x-2 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Se déconnecter</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                id="btn-header-login"
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                title="Se connecter avec Google ou Email"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Connexion</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
