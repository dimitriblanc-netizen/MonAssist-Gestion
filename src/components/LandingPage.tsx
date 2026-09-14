import React from 'react';
import { 
  ArrowRight, 
  Smartphone, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  FileText, 
  TrendingUp, 
  Calendar, 
  PhoneCall, 
  ExternalLink,
  Share,
  PlusSquare,
  Sparkles,
  Lock
} from 'lucide-react';
import { AppLogo } from './AppLogo';

interface LandingPageProps {
  onNavigateToApp: () => void;
  onInstallClick: () => void;
  canInstall: boolean;
  isInstalled: boolean;
  onOpenAgencyContact: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToApp,
  onInstallClick,
  canInstall,
  isInstalled,
  onOpenAgencyContact
}) => {
  return (
    <div className="min-h-screen bg-[#FBF7EE] text-slate-900 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AppLogo className="h-10 sm:h-12 w-auto max-w-[130px]" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-[#00434A]">
                  MON ASSIST'GESTION
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#00434A]/10 text-[#00434A]">
                  DRYOS
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                L'application pour les propriétaires bailleurs
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onNavigateToApp}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#00434A] hover:bg-[#00343a] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
            >
              <span>Accéder à l'application</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300/60 text-xs sm:text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Version 2.0 • Gestion locative Zero-Cognitive Load</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#00434A] tracking-tight leading-tight sm:leading-none mb-6">
              Gérez vos locations sans stress <br className="hidden sm:inline" />
              <span className="text-teal-700">en 30 secondes par mois.</span>
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
              Pointez vos loyers en 1 clic, éditez vos quittances conformes ALUR, révisez vos loyers selon l'IRL officiel et anticipez les préavis légaux sans aucune charge mentale.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto mb-10">
              <button
                id="btn-hero-launch-app"
                onClick={onNavigateToApp}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#00434A] hover:bg-[#00343a] text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2.5 cursor-pointer"
              >
                <span>Lancer l'application</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                id="btn-hero-install-app"
                onClick={onInstallClick}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Download className="w-5 h-5 text-emerald-600" />
                <span>Installer sur mon smartphone</span>
              </button>
            </div>

            {/* Reassurance Tags */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 font-medium">
              <span className="flex items-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5" />
                100% Gratuit pour les bailleurs
              </span>
              <span className="flex items-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5" />
                Sauvegarde Cloud sécurisée
              </span>
              <span className="flex items-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5" />
                Conforme réglementation Loi ALUR & IRL
              </span>
            </div>

          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="py-12 bg-white border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-black tracking-wider uppercase text-teal-800 bg-teal-50 px-3 py-1 rounded-full">
                Fonctionnalités Clés
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#00434A] mt-3">
                Tout ce dont un propriétaire a besoin, rien de superflu.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-[#FBF7EE]/60 border border-slate-200/80 hover:border-teal-600/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4 font-bold">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Pointage en 1 Clic
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Dès réception du virement, validez le loyer en un geste. L'application génère immédiatement la quittance et met à jour votre historique comptable.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-[#FBF7EE]/60 border border-slate-200/80 hover:border-teal-600/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-4 font-bold">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Quittances & Courriers LRAR
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Génération instantanée de quittances PDF conformes. En cas de retard, modèles légaux de relance amiable et mises en demeure LRAR en 1 clic.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-[#FBF7EE]/60 border border-slate-200/80 hover:border-teal-600/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4 font-bold">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Révision IRL & Délais Légaux
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Calcul automatique de votre augmentation de loyer avec le dernier indice INSEE officiel. Suivi précis des délais de préavis et des baux.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Installation Guide Section */}
        <section id="installation" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FBF7EE] to-slate-100/70">
          <div className="max-w-4xl mx-auto">
            
            <div className="text-center mb-10">
              <span className="text-xs font-black tracking-wider uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                Installation Simple & Rapide
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#00434A] mt-3">
                Comment installer l'application sur votre écran d'accueil ?
              </h2>
              <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
                Pas besoin de passer par l'App Store ou Google Play : l'application s'installe directement depuis votre navigateur en 10 secondes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* iOS Guide */}
              <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Sur iPhone & iPad (Safari)</h3>
                      <p className="text-xs text-slate-500">Installation via le navigateur Safari</p>
                    </div>
                  </div>

                  <ol className="space-y-3.5 text-sm text-slate-700 mb-6">
                    <li className="flex items-start">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">1</span>
                      <span>Ouvrez <strong>gestion.dryos.fr</strong> dans <strong>Safari</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">2</span>
                      <span className="flex items-center flex-wrap gap-1">
                        Appuyez sur le bouton <strong>Partager</strong>
                        <Share className="w-4 h-4 text-blue-600 inline ml-1" />
                        (en bas de votre écran)
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">3</span>
                      <span className="flex items-center flex-wrap gap-1">
                        Faites défiler et sélectionnez <strong>« Sur l'écran d'accueil »</strong>
                        <PlusSquare className="w-4 h-4 text-slate-600 inline ml-1" />
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">4</span>
                      <span>Appuyez sur <strong>Ajouter</strong> en haut à droite.</span>
                    </li>
                  </ol>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-medium">
                  ✓ L'icône DRYOS apparaîtra sur votre écran d'accueil comme n'importe quelle application !
                </div>
              </div>

              {/* Android & PC Guide */}
              <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Sur Android, PC & Mac</h3>
                      <p className="text-xs text-slate-500">Chrome, Edge ou Brave</p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mb-6">
                    Sur Android ou PC, l'installation est immédiate en 1 clic grâce à la technologie Progressive Web App (PWA).
                  </p>

                  <div className="mb-6">
                    <button
                      onClick={onInstallClick}
                      className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Download className="w-5 h-5" />
                      <span>{isInstalled ? 'Application déjà installée' : 'Installer l\'application maintenant'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 text-center">
                    Ou cliquez sur les 3 petits points verticaux de votre navigateur puis sur <strong>« Installer l'application »</strong>.
                  </p>
                </div>

                <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-xs text-teal-800 font-medium mt-4">
                  ✓ Fonctionne hors-ligne et s'ouvre en plein écran sans barre de navigation.
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* DRYOS Agency Support Banner */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#00434A] text-white">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Accompagnement Premium
              </span>
              <h3 className="text-xl sm:text-2xl font-black mt-1">
                Besoin d'aide ou envie de déléguer votre gestion ?
              </h3>
              <p className="text-sm text-slate-300 mt-1 max-w-lg">
                L'agence DRYOS prend en charge 100% de la gestion locative : recherche de locataire, assurance loyers impayés, travaux et déclarations fiscales.
              </p>
            </div>

            <button
              onClick={onOpenAgencyContact}
              className="px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-[#00434A] text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-2 flex-shrink-0 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-[#00434A]" />
              <span>Contacter l'agence DRYOS</span>
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <AppLogo className="h-6 w-auto" />
            <span className="font-bold text-slate-800">Mon Assist'Gestion</span>
            <span>•</span>
            <span>DRYOS Immobilier</span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={onNavigateToApp} 
              className="font-bold text-[#00434A] hover:underline cursor-pointer"
            >
              Lancer l'application
            </button>
            <span>•</span>
            <a 
              href="https://dryos.fr" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:underline flex items-center"
            >
              dryos.fr
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
};
