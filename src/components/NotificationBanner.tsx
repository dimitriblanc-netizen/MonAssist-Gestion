import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellRing, 
  CheckCircle, 
  Info, 
  Smartphone, 
  Mail, 
  MessageSquare, 
  X, 
  Send, 
  Download, 
  Share, 
  Clock,
  ShieldCheck,
  Check
} from 'lucide-react';
import { AppLogo } from './AppLogo';
import { Property, RentRecord } from '../types';
import { 
  registerServiceWorker, 
  requestNotificationPermission, 
  showImmediateNotification, 
  scheduleDelayedReminder, 
  syncRentRemindersWithSW 
} from '../utils/reminderService';

interface NotificationBannerProps {
  properties?: Property[];
  rents?: RentRecord[];
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  properties = [],
  rents = []
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [testSentMessage, setTestSentMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState<boolean>(false);
  const [swActive, setSwActive] = useState<boolean>(false);
  const [syncedCount, setSyncedCount] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Détection iOS
      const ua = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(ua);
      setIsIos(isIosDevice);

      // Détection PWA installée (standalone)
      const isInStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
      setIsStandalone(isInStandalone);

      // Écoute de l'événement d'installation PWA
      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };
      window.addEventListener('beforeinstallprompt', handleBeforeInstall);
      window.addEventListener('appinstalled', () => {
        setInstalled(true);
        setDeferredPrompt(null);
      });

      // Vérifier permission existante
      if ('Notification' in window) {
        setPermission(Notification.permission);
      }

      // Enregistrer le Service Worker
      registerServiceWorker().then((reg) => {
        if (reg) {
          setSwActive(true);
        }
      });

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      };
    }
  }, []);

  // Synchronisation des échéances de loyers dans le Service Worker
  useEffect(() => {
    if (permission === 'granted' && properties.length > 0) {
      syncRentRemindersWithSW(properties, rents).then((reminders) => {
        setSyncedCount(reminders.length);
      });
    }
  }, [permission, properties, rents]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowInfoModal(true);
    }
  };

  const requestPushPermission = async () => {
    if (!('Notification' in window)) {
      alert("Votre navigateur actuel ne prend pas en charge les notifications push. Sur iPhone, installez l'app sur l'écran d'accueil (Partager ⎋ -> Sur l'écran d'accueil) sous iOS 16.4+.");
      return;
    }

    try {
      const perm = await requestNotificationPermission();
      setPermission(perm);

      if (perm === 'granted') {
        await showImmediateNotification(
          "Mon Assist'Gestion 🔔",
          "Notifications de rappel activées ! Vous recevrez des alertes d'échéances et de relances même avec l'onglet fermé."
        );
        setTestSentMessage("Notifications locales activées avec succès !");
        setTimeout(() => setTestSentMessage(null), 5000);
      } else if (perm === 'denied') {
        alert("Les notifications ont été bloquées dans les paramètres de votre navigateur. Vous pouvez les réactiver dans Réglages > Safari/Chrome > Notifications.");
      }
    } catch (err) {
      console.error('Erreur demande notifications:', err);
    }
  };

  // Test immédiat
  const handleImmediateTest = async () => {
    if (permission !== 'granted') {
      await requestPushPermission();
      return;
    }

    const success = await showImmediateNotification(
      "Mon Assist'Gestion 🔔",
      "Test réussi ! Le Service Worker gère vos notifications de gestion locative."
    );

    if (success) {
      setTestSentMessage("Notification test immédiate envoyée.");
      setTimeout(() => setTestSentMessage(null), 5000);
    }
  };

  // Test différé (permet de fermer l'onglet ou changer d'application)
  const handleDelayedReminderTest = async () => {
    if (permission !== 'granted') {
      await requestPushPermission();
      return;
    }

    const delay = 8; // 8 secondes
    setCountdown(delay);

    await scheduleDelayedReminder(
      `test-delayed-${Date.now()}`,
      "Mon Assist'Gestion 🔔 (Rappel en tâche de fond)",
      "Le Service Worker a déclenché ce rappel local même en dehors de l'onglet actif !",
      delay,
      '/app',
      'test-background-reminder'
    );

    setTestSentMessage(`Rappel différé programmé dans ${delay}s. Vous pouvez fermer ou réduire cet onglet dès maintenant !`);

    let current = delay;
    const interval = setInterval(() => {
      current -= 1;
      if (current <= 0) {
        clearInterval(interval);
        setCountdown(null);
        setTimeout(() => setTestSentMessage(null), 4000);
      } else {
        setCountdown(current);
      }
    }, 1000);
  };

  return (
    <>
      {/* Sleek Mobile Push Banner */}
      <div className="bg-navy-50/50 border border-navy-100 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-navy text-white flex items-center justify-center flex-shrink-0">
            {permission === 'granted' ? (
              <BellRing className="w-4 h-4 text-emerald-light" />
            ) : (
              <Bell className="w-4 h-4 text-emerald-light" />
            )}
          </div>
          <div className="min-w-0">
            {permission === 'granted' ? (
              <div>
                <p className="font-bold text-navy flex items-center">
                  <CheckCircle className="w-3.5 h-3.5 text-status-ok inline mr-1" />
                  Rappels locaux & Service Worker actifs
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  Alertes le 5 du mois et impayés même onglet fermé
                  {syncedCount > 0 ? ` (${syncedCount} rappels synchronisés)` : ''}
                </p>
              </div>
            ) : (
              <div>
                <p className="font-bold text-slate-900">
                  Rappels d'échéances sans ouvrir l'application
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  Notifications locales le 5 du mois et relances impayés même onglet fermé
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0 flex-wrap gap-y-1">
          {!isStandalone && !installed && (
            <button
              onClick={handleInstallClick}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-[11px] hover:bg-slate-50 transition flex items-center space-x-1 cursor-pointer"
              title="Installer sur votre smartphone ou PC"
            >
              <Download className="w-3 h-3 text-navy" />
              <span className="hidden sm:inline">Installer l'app</span>
            </button>
          )}

          {permission === 'granted' ? (
            <>
              <button
                onClick={handleImmediateTest}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-navy-200 text-navy font-bold text-[11px] hover:bg-navy-50 transition flex items-center space-x-1 cursor-pointer"
                title="Tester l'affichage immédiat"
              >
                <Send className="w-3 h-3 text-navy" />
                <span>Tester direct</span>
              </button>

              <button
                onClick={handleDelayedReminderTest}
                disabled={countdown !== null}
                className="px-2.5 py-1.5 rounded-lg bg-navy text-white font-bold text-[11px] hover:bg-navy-800 transition flex items-center space-x-1.5 cursor-pointer shadow-xs disabled:opacity-60"
                title="Programmer une alerte dans 8s pour tester avec l'onglet fermé"
              >
                <Clock className="w-3 h-3 text-emerald-light" />
                <span>
                  {countdown !== null ? `Fermez l'onglet (${countdown}s)` : 'Tester onglet fermé (8s)'}
                </span>
              </button>
            </>
          ) : (
            <button
              onClick={requestPushPermission}
              className="px-3 py-1.5 rounded-xl bg-navy hover:bg-navy-800 text-white font-bold text-[11px] shadow-xs transition cursor-pointer flex items-center space-x-1"
            >
              <BellRing className="w-3 h-3 text-emerald-light mr-1" />
              <span>Activer les rappels</span>
            </button>
          )}

          <button
            onClick={() => setShowInfoModal(true)}
            title="Comment fonctionne le Service Worker et les rappels ?"
            className="p-1.5 text-slate-400 hover:text-navy transition cursor-pointer"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {testSentMessage && (
        <div className="bg-status-ok-bg border border-status-ok-border text-status-ok-text text-xs px-3.5 py-2.5 rounded-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-status-ok flex-shrink-0" />
            <span>{testSentMessage}</span>
          </div>
          <button 
            onClick={() => setTestSentMessage(null)} 
            className="text-status-ok hover:text-green-900 cursor-pointer ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Info Modal : Fonctionnement du Service Worker et des alertes hors onglet */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-navy text-white flex items-center justify-center">
                  <Bell className="w-4 h-4 text-emerald-light" />
                </div>
                <div>
                  <h3 className="text-base font-black text-navy">
                    Rappels locaux & Service Worker
                  </h3>
                  <p className="text-[10px] text-slate-500">Fonctionnement en tâche de fond même onglet fermé</p>
                </div>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Pour vous garantir une <strong>charge mentale nulle</strong>, le Service Worker de Mon Assist'Gestion s'exécute en tâche de fond sur votre appareil. Il conserve vos échéances et déclenche des notifications natives sans que vous n'ayez besoin de garder l'application ouverte.
            </p>

            {/* Statut technique */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Moteur Service Worker :</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-status-ok-bg text-status-ok-text border border-status-ok-border">
                  <CheckCircle className="w-3 h-3 mr-1 text-status-ok" />
                  Actif (/sw.js)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Stockage des échéances :</span>
                <span className="text-[11px] text-slate-600 font-semibold">IndexedDB locale sécurisée</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Permission Notifications :</span>
                <span className={`text-[11px] font-bold ${
                  permission === 'granted' ? 'text-status-ok-text' : 'text-status-warning-text'
                }`}>
                  {permission === 'granted' ? 'Autorisée' : 'En attente d\'activation'}
                </span>
              </div>
            </div>

            {/* Aperçu de l'icône sur l'écran d'accueil */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
              <AppLogo className="w-12 h-12 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-navy bg-navy-50 px-2 py-0.5 rounded-md">
                  PWA & Notifications Écran Verrouillé
                </span>
                <h4 className="text-sm font-black text-navy mt-1 truncate">
                  Mon Assist'Gestion
                </h4>
                <p className="text-[11px] text-slate-500">
                  Logo officiel DRYOS et badge de notification direct
                </p>
              </div>
            </div>

            {deferredPrompt ? (
              <button
                onClick={handleInstallClick}
                className="w-full py-3 px-4 rounded-xl bg-navy hover:bg-navy-800 text-white text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Installer l'application sur cet appareil</span>
              </button>
            ) : isIos ? (
              <div className="bg-status-warning-bg border border-status-warning-border p-3.5 rounded-2xl text-xs text-status-warning-text space-y-1.5">
                <div className="font-bold flex items-center space-x-1.5 text-navy">
                  <Share className="w-4 h-4" />
                  <span>Installation sur iPhone / iPad (iOS 16.4+) :</span>
                </div>
                <ol className="list-decimal list-inside text-[11px] space-y-1 text-slate-700">
                  <li>Ouvrez le menu Partager dans Safari (icône <strong>⎋</strong> en bas).</li>
                  <li>Faites défiler et touchez <strong>« Sur l'écran d'accueil » ➕</strong>.</li>
                  <li>L'application s'affichera sur votre écran d'accueil avec les notifications natives autorisées !</li>
                </ol>
              </div>
            ) : null}

            <div className="space-y-2.5">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center space-x-2 text-xs font-bold text-navy">
                  <Smartphone className="w-4 h-4 text-navy" />
                  <span>1. Rappel du 5 du mois (Échéance de loyer)</span>
                </div>
                <p className="text-[11px] text-slate-500 pl-6 leading-normal">
                  Le 5 de chaque mois à 9h00, une notification native vous rappelle de pointer le loyer en 1 clic et d'émettre la quittance.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                  <MessageSquare className="w-4 h-4 text-slate-600" />
                  <span>2. Relance impayé J+5 & J+15</span>
                </div>
                <p className="text-[11px] text-slate-500 pl-6 leading-normal">
                  Si un loyer n'est pas soldé après l'échéance, vous recevez une notification vous proposant le modèle de SMS ou de mise en demeure prêt à l'emploi.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-navy" />
                  <span>3. Confidentialité & Sécurité totale</span>
                </div>
                <p className="text-[11px] text-slate-500 pl-6 leading-normal">
                  Les rappels sont calculés et conservés localement sur votre navigateur, sans tracking publicitaire ni revente de données.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={() => {
                  setShowInfoModal(false);
                  handleDelayedReminderTest();
                }}
                className="w-full sm:w-1/2 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Tester hors-onglet (8s)</span>
              </button>

              <button
                onClick={() => {
                  setShowInfoModal(false);
                  if (permission !== 'granted') {
                    requestPushPermission();
                  } else {
                    handleImmediateTest();
                  }
                }}
                className="w-full sm:w-1/2 py-2.5 rounded-xl bg-navy text-white text-xs font-bold hover:bg-navy-800 transition cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <BellRing className="w-3.5 h-3.5 text-emerald-light" />
                <span>{permission === 'granted' ? 'Tester maintenant' : 'Activer maintenant'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
