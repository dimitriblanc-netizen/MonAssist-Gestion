import React, { useState, useEffect } from 'react';
import { Bell, BellRing, CheckCircle, Info, Smartphone, Mail, MessageSquare, X, Send, Download, Share } from 'lucide-react';
import { AppLogo } from './AppLogo';

export const NotificationBanner: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState<boolean>(false);

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
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.warn('SW registration skipped:', err);
        });
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      };
    }
  }, []);

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
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === 'granted') {
        sendTestNotification();
      } else if (perm === 'denied') {
        alert("Les notifications ont été bloquées dans les paramètres de votre navigateur. Vous pouvez les réactiver dans Réglages > Safari/Chrome > Notifications.");
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
    }
  };

  const sendTestNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification("Mon Assist'Gestion 🔔", {
              body: "Parfait ! Le 5 du mois, vous recevrez une alerte directe pour pointer vos loyers sans ouvrir l'application.",
              icon: '/icon-192.png',
              badge: '/favicon-32x32.png'
            });
          });
        } else {
          new Notification("Mon Assist'Gestion 🔔", {
            body: "Parfait ! Le 5 du mois, vous recevrez une alerte directe pour pointer vos loyers sans ouvrir l'application.",
            icon: '/icon-192.png'
          });
        }
        setTestSent(true);
        setTimeout(() => setTestSent(false), 5000);
      } catch (e) {
        console.warn('Direct notification error:', e);
      }
    }
  };

  return (
    <>
      {/* Sleek Mobile Push Banner */}
      <div className="bg-[#00434A]/5 border border-[#00434A]/15 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#00434A] text-white flex items-center justify-center flex-shrink-0">
            {permission === 'granted' ? (
              <BellRing className="w-4 h-4 text-emerald-300" />
            ) : (
              <Bell className="w-4 h-4 text-teal-200" />
            )}
          </div>
          <div className="min-w-0">
            {permission === 'granted' ? (
              <div>
                <p className="font-bold text-[#00434A] flex items-center">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />
                  Alertes smartphone actives
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  Rappels le 5 du mois et impayés sur écran verrouillé
                </p>
              </div>
            ) : (
              <div>
                <p className="font-bold text-slate-900">
                  Être alerté sans ouvrir l'application
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  Notification écran verrouillé le 5 du mois & en cas de retard
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {!isStandalone && !installed && (
            <button
              onClick={handleInstallClick}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-[11px] hover:bg-slate-50 transition flex items-center space-x-1 cursor-pointer"
              title="Installer sur votre smartphone ou PC"
            >
              <Download className="w-3 h-3 text-[#00434A]" />
              <span className="hidden sm:inline">Installer l'app</span>
            </button>
          )}

          {permission === 'granted' ? (
            <button
              onClick={sendTestNotification}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-[#00434A]/20 text-[#00434A] font-bold text-[11px] hover:bg-[#00434A]/5 transition flex items-center space-x-1 cursor-pointer"
            >
              <Send className="w-3 h-3 text-[#00434A]" />
              <span className="hidden sm:inline">Tester</span>
            </button>
          ) : (
            <button
              onClick={requestPushPermission}
              className="px-3 py-1.5 rounded-xl bg-[#00434A] hover:bg-[#00343a] text-white font-bold text-[11px] shadow-xs transition cursor-pointer flex items-center space-x-1"
            >
              <span>Activer</span>
            </button>
          )}

          <button
            onClick={() => setShowInfoModal(true)}
            title="Comment ça fonctionne ?"
            className="p-1.5 text-slate-400 hover:text-[#00434A] transition cursor-pointer"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {testSent && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-2 rounded-xl flex items-center justify-between animate-fade-in">
          <span>🔔 Notification test envoyée sur votre écran de smartphone !</span>
          <button onClick={() => setTestSent(false)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Info Modal : Comment fonctionnent les alertes sans ouvrir l'app */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FBF7EE] border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-[#00434A] text-white flex items-center justify-center">
                  <Bell className="w-4 h-4 text-teal-300" />
                </div>
                <h3 className="text-base font-black text-[#00434A]">
                  Alertes sans ouvrir l'application
                </h3>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Pour respecter le principe de <strong>charge mentale nulle</strong>, vous ne devez pas avoir à penser à ouvrir l'application. Elle vient à vous uniquement quand une décision est requise.
            </p>

            {/* Aperçu de l'icône sur l'écran d'accueil */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
              <AppLogo className="w-14 h-14 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Icône officielle PWA & Favicon
                </span>
                <h4 className="text-sm font-black text-[#00434A] mt-1 truncate">
                  Mon Assist'Gestion
                </h4>
                <p className="text-[11px] text-slate-500">
                  Logo Dryos (maison & arbre) prêt pour votre écran d'accueil
                </p>
              </div>
            </div>

            {deferredPrompt ? (
              <button
                onClick={handleInstallClick}
                className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Installer l'application sur cet appareil</span>
              </button>
            ) : isIos ? (
              <div className="bg-amber-50/80 border border-amber-200/80 p-3.5 rounded-2xl text-xs text-amber-900 space-y-1.5">
                <div className="font-bold flex items-center space-x-1.5 text-[#00434A]">
                  <Share className="w-4 h-4" />
                  <span>Installation sur iPhone / iPad :</span>
                </div>
                <ol className="list-decimal list-inside text-[11px] space-y-1 text-slate-700">
                  <li>Ouvrez le menu Partager dans Safari (icône <strong>⎋</strong> en bas).</li>
                  <li>Faites défiler et touchez <strong>« Sur l'écran d'accueil » ➕</strong>.</li>
                  <li>L'application s'affichera avec son icône officielle et ses notifications !</li>
                </ol>
              </div>
            ) : null}

            <div className="space-y-3">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#00434A]">
                  <Smartphone className="w-4 h-4 text-[#00434A]" />
                  <span>1. Notifications Push écran verrouillé (Recommandé)</span>
                </div>
                <p className="text-[11px] text-slate-500 pl-6 leading-normal">
                  Comme une application de banque : une notification apparaît sur votre écran de veille le 5 du mois à 9h00 avec les boutons directs <em>"Reçu"</em> ou <em>"En retard"</em>.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                  <Mail className="w-4 h-4 text-slate-600" />
                  <span>2. Rappel e-mail mensuel</span>
                </div>
                <p className="text-[11px] text-slate-500 pl-6 leading-normal">
                  Un email ultra-court vous est envoyé le 5 du mois avec un lien sécurisé 1-clic pour valider ou déclarer un retard.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                  <MessageSquare className="w-4 h-4 text-slate-600" />
                  <span>3. Alerte SMS impayé</span>
                </div>
                <p className="text-[11px] text-slate-500 pl-6 leading-normal">
                  En cas d'impayé non résolu à J+10 et J+20, un SMS d'alerte vous prévient avant la forclusion de votre garantie Visale ou GLI.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowInfoModal(false);
                requestPushPermission();
              }}
              className="w-full py-3 rounded-xl bg-[#00434A] text-white text-xs font-bold hover:bg-[#00343a] transition cursor-pointer"
            >
              Activer les notifications maintenant
            </button>
          </div>
        </div>
      )}
    </>
  );
};
