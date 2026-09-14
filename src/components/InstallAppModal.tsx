import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Download, 
  Share, 
  Smartphone, 
  Laptop, 
  Check, 
  Copy, 
  ExternalLink, 
  Globe, 
  Sparkles,
  ChevronRight,
  HelpCircle,
  QrCode
} from 'lucide-react';
import { AppLogo } from './AppLogo';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerInstall: () => Promise<boolean>;
  isInstallable: boolean;
  isIos: boolean;
  isStandalone: boolean;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  onTriggerInstall,
  isInstallable,
  isIos,
  isStandalone
}) => {
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'MOBILE' | 'DESKTOP' | 'DOMAIN'>('MOBILE');
  const appUrl = 'https://gestion.dryos.fr';

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(appUrl, {
        width: 260,
        margin: 1.5,
        color: {
          dark: '#00434A',
          light: '#FFFFFF'
        }
      })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('Error generating QR code:', err));
    }
  }, [isOpen, appUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-sand border border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col my-4 max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient & App Identity */}
        <div className="bg-navy text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3.5 pr-8">
            <AppLogo className="w-14 h-14 bg-white rounded-2xl p-1 shadow-md flex-shrink-0" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-brand/20 text-emerald-light tracking-wider">
                  Application Officielle
                </span>
                <span className="text-[10px] text-emerald-light font-semibold flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-brand mr-1 animate-pulse" />
                  PWA Haute Précision
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                Mon Assist'Gestion
              </h3>
              <p className="text-xs text-slate-200 font-medium flex items-center space-x-1 mt-0.5">
                <Globe className="w-3.5 h-3.5 text-emerald-light" />
                <span>gestion.dryos.fr</span>
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs in Modal */}
        <div className="flex border-b border-slate-200 bg-white px-4 pt-2 space-x-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('MOBILE')}
            className={`flex items-center space-x-1.5 pb-2.5 px-3 border-b-2 transition cursor-pointer ${
              activeTab === 'MOBILE'
                ? 'border-navy text-navy'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Smartphone (iPhone & Android)</span>
          </button>

          <button
            onClick={() => setActiveTab('DESKTOP')}
            className={`flex items-center space-x-1.5 pb-2.5 px-3 border-b-2 transition cursor-pointer ${
              activeTab === 'DESKTOP'
                ? 'border-navy text-navy'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>PC / Mac & QR Code</span>
          </button>

          <button
            onClick={() => setActiveTab('DOMAIN')}
            className={`flex items-center space-x-1.5 pb-2.5 px-3 border-b-2 transition cursor-pointer ${
              activeTab === 'DOMAIN'
                ? 'border-navy text-navy'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Domaine Dryos</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">

          {/* Quick 1-Click Install if supported (Chrome/Android/Edge) */}
          {isInstallable && (
            <div className="bg-status-ok-bg border border-status-ok-border p-4 rounded-2xl shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-status-ok-text flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-status-ok" />
                    <span>Installation automatique disponible !</span>
                  </h4>
                  <p className="text-xs text-status-ok-text mt-1">
                    Votre navigateur supporte l'installation immédiate en 1 clic sur votre écran.
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  const success = await onTriggerInstall();
                  if (success) onClose();
                }}
                className="mt-3 w-full py-3 px-4 bg-emerald-brand hover:bg-emerald-600 text-white font-extrabold text-sm rounded-xl transition flex items-center justify-center space-x-2 shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger & Installer l'app en 1 clic</span>
              </button>
            </div>
          )}

          {/* TAB 1: SMARTPHONE GUIDE */}
          {activeTab === 'MOBILE' && (
            <div className="space-y-4">
              {/* iPhone / Safari Guide */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-black text-xs">
                    🍎
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-navy">
                      Sur iPhone & iPad (Safari)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Ajout direct sur votre écran d'accueil avec icône Dryos
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-6 h-6 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        Appuyez sur le bouton <strong>Partager</strong>
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                        <span>Icône rectangle avec flèche vers le haut</span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-bold">
                          <Share className="w-3 h-3 mr-1 text-navy" /> Partager
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-6 h-6 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        Touchez <strong>« Sur l'écran d'accueil »</strong>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Faites défiler le menu vers le bas pour trouver l'option avec l'icône ➕.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-6 h-6 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        Validez en touchant <strong>« Ajouter »</strong>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        L'application apparaît directement sur votre bureau iOS avec son logo officiel, notifications de loyer et mode plein écran.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Android Guide */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-black text-xs">
                    🤖
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-navy">
                      Sur Android (Chrome / Samsung Internet)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Menu <span className="font-bold">⋮</span> en haut à droite &gt; <strong>« Installer l'application »</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Home Screen Installed Icon Preview */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 text-white flex items-center justify-between shadow-inner">
                <div className="pr-3">
                  <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-brand/20 text-emerald-light text-[10px] font-bold mb-1">
                    <Check className="w-3 h-3" />
                    <span>Conforme iOS & Android</span>
                  </div>
                  <h5 className="text-xs font-bold text-white">
                    Rendu sur votre écran d'accueil
                  </h5>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Le logo officiel DRYOS et le titre <strong className="text-white">Assist'Gestion</strong> s'affichent automatiquement sous l'icône.
                  </p>
                </div>

                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-13 h-13 rounded-2xl bg-white p-1 shadow-md border border-white/20 flex items-center justify-center overflow-hidden">
                    <AppLogo className="w-11 h-11 object-contain" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-200 mt-1 tracking-tight">
                    Assist'Gestion
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DESKTOP & QR CODE */}
          {activeTab === 'DESKTOP' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center space-y-3">
                <h4 className="text-sm font-black text-navy flex items-center justify-center space-x-1.5">
                  <QrCode className="w-4 h-4 text-emerald-brand" />
                  <span>Scanner pour installer sur votre smartphone</span>
                </h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  Ouvrez l'appareil photo de votre iPhone ou Android et visez ce QR Code pour charger directement <strong>gestion.dryos.fr</strong> :
                </p>

                {qrCodeUrl && (
                  <div className="inline-block p-3 bg-white border-2 border-slate-200/80 rounded-2xl shadow-sm">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code gestion.dryos.fr" 
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                )}

                <div className="pt-1">
                  <span className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full font-mono">
                    https://gestion.dryos.fr
                  </span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-navy flex items-center space-x-1.5">
                  <Laptop className="w-3.5 h-3.5 text-navy" />
                  <span>Installer sur votre PC / Mac (Chrome, Edge, Brave)</span>
                </h4>
                <p className="text-xs text-slate-600">
                  Cliquez sur la petite icône d'ordinateur avec flèche ou le symbole <strong>⊕</strong> situé à droite dans la barre d'adresse de votre navigateur pour l'avoir dans vos applications de bureau.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: DOMAIN MANAGEMENT (gestion.dryos.fr) */}
          {activeTab === 'DOMAIN' && (
            <div className="space-y-3 text-xs text-slate-700">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-navy">
                  <Globe className="w-4 h-4 text-emerald-brand" />
                  <h4 className="text-sm font-extrabold">
                    Domaine officiel : gestion.dryos.fr
                  </h4>
                </div>
                
                <div className="p-3 bg-status-ok-bg border border-status-ok-border rounded-xl space-y-1">
                  <div className="flex items-center space-x-1.5 text-status-ok-text font-bold">
                    <Check className="w-4 h-4 text-status-ok" />
                    <span>Projet Firebase déjà relié à gestion.dryos.fr !</span>
                  </div>
                  <p className="text-[11px] text-status-ok-text">
                    Votre application est maintenant connectée à votre projet Firebase <strong>monassist-gestion</strong> (MonAssist'Gestion) avec le domaine <strong>gestion.dryos.fr</strong>.
                  </p>
                </div>

                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500">URL d'accueil :</span>{' '}
                    <span className="text-navy font-bold">https://gestion.dryos.fr</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Projet Firebase :</span>{' '}
                    <span className="text-slate-800 font-bold">monassist-gestion</span>
                  </div>
                  <div>
                    <span className="text-slate-500">N° Projet :</span>{' '}
                    <span className="text-slate-800 font-bold">682933982805</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Base Firestore :</span>{' '}
                    <span className="text-slate-800 font-bold">(default)</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600">
                  Toute personne accédant à <strong>gestion.dryos.fr</strong> arrive directement sur cette page d'accueil avec vos biens et votre assistant, et peut installer l'application en 1 clic grâce au bouton <strong>« Télécharger l'app ici »</strong>.
                </p>
              </div>

              {/* Copy Direct URL */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                <span className="font-mono text-xs text-navy font-bold truncate mr-2">
                  https://gestion.dryos.fr
                </span>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center space-x-1 cursor-pointer flex-shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-status-ok" />
                      <span>Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                      <span>Copier le lien</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Key Advantages Reminder */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/80 flex items-center space-x-2">
              <span className="text-base">🔔</span>
              <span>Alertes le 5 du mois sur l'écran verrouillé</span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/80 flex items-center space-x-2">
              <span className="text-base">⚡</span>
              <span>Zéro téléchargement App Store requis</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 p-4 px-6 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            {isStandalone ? (
              <span className="text-status-ok-text font-bold flex items-center">
                <Check className="w-3.5 h-3.5 mr-1" />
                Déjà installée sur cet appareil
              </span>
            ) : (
              <span>Disponible sur iPhone, Android, Mac & PC</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
