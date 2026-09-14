import { Property, RentRecord } from '../types';

export interface ScheduledReminder {
  id: string;
  title: string;
  body: string;
  triggerTime: number; // timestamp ms
  url?: string;
  tag?: string;
  type?: 'RENT_DUE_5TH' | 'UNPAID_RELANCE' | 'CRITICAL_UNPAID' | 'TEST';
}

/**
 * Enregistrement propre du Service Worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    // Enregistrer le background sync si supporté par le navigateur
    if ('sync' in registration) {
      try {
        await (registration as any).sync.register('check-rent-reminders');
      } catch {
        // Sync registration non critique
      }
    }

    return registration;
  } catch (error) {
    console.warn('Erreur enregistrement Service Worker:', error);
    return null;
  }
}

/**
 * Demande de permission pour les notifications
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch (error) {
    console.error('Erreur demande permission notification:', error);
    return 'denied';
  }
}

/**
 * Envoi d'un message direct au Service Worker
 */
export async function postMessageToSW(type: string, payload: any): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    if (registration.active) {
      registration.active.postMessage({ type, payload });
      return true;
    }
  } catch (err) {
    console.warn('Erreur postMessageToSW:', err);
  }
  return false;
}

/**
 * Déclenche une notification immédiate
 */
export async function showImmediateNotification(title: string, body: string, url = '/app'): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/favicon-32x32.png',
        data: { url },
        tag: 'immediate-alert',
        vibrate: [200, 100, 200]
      } as NotificationOptions);
      return true;
    } else {
      new Notification(title, {
        body,
        icon: '/icon-192.png'
      });
      return true;
    }
  } catch (err) {
    console.warn('Erreur showImmediateNotification:', err);
    return false;
  }
}

/**
 * Programme un rappel dans le Service Worker (s'exécute même quand l'onglet est fermé)
 */
export async function scheduleDelayedReminder(
  id: string,
  title: string,
  body: string,
  delaySeconds: number,
  url = '/app',
  tag?: string
): Promise<boolean> {
  const triggerTime = Date.now() + delaySeconds * 1000;
  return postMessageToSW('SCHEDULE_REMINDER', {
    id,
    title,
    body,
    triggerTime,
    url,
    tag: tag || id
  });
}

/**
 * Calcule et synchronise les rappels automatiques d'échéances de loyers et de relances
 * avec le Service Worker.
 */
export async function syncRentRemindersWithSW(
  properties: Property[],
  rents: RentRecord[]
): Promise<ScheduledReminder[]> {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    return [];
  }

  const reminders: ScheduledReminder[] = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed
  const currentDay = now.getDate();

  // 1. Rappel pour chaque bien au 5 du mois en cours (ou du mois suivant si déjà passé)
  properties.forEach((property) => {
    // Échéance du 5
    let targetDate = new Date(currentYear, currentMonth, 5, 9, 0, 0); // 9h00 du matin
    if (currentDay > 5) {
      // Prochain mois
      targetDate = new Date(currentYear, currentMonth + 1, 5, 9, 0, 0);
    }

    const totalRent = property.rentExcl + property.charges;
    reminders.push({
      id: `rent-due-5th-${property.id}`,
      title: `🔔 Échéance loyer : ${property.name}`,
      body: `Pensez à pointer le loyer de ${property.tenantName} (${totalRent.toFixed(0)} €). Quittance en 1 clic disponible.`,
      triggerTime: targetDate.getTime(),
      url: '/app',
      tag: `rent-5th-${property.id}`,
      type: 'RENT_DUE_5TH'
    });

    // 2. Vérification des impayés sur le mois en cours
    const rentRecord = rents.find((r) => r.propertyId === property.id && r.status === 'LATE');
    if (rentRecord) {
      // Relance amiable (dans les prochaines 2 heures si l'onglet est fermé pour test ou à 14h)
      const relanceDate = new Date(now.getTime() + 4 * 3600 * 1000); // dans 4 heures
      reminders.push({
        id: `unpaid-relance-${property.id}`,
        title: `⚠️ Relance requise : ${property.tenantName}`,
        body: `Loyer en retard de ${rentRecord.total.toFixed(0)} € pour ${property.name}. SMS de relance amiable prêt.`,
        triggerTime: relanceDate.getTime(),
        url: '/app',
        tag: `unpaid-${property.id}`,
        type: 'UNPAID_RELANCE'
      });
    }
  });

  // Envoyer la liste au Service Worker pour stockage persistant dans IndexedDB
  await postMessageToSW('SYNC_REMINDERS', reminders);

  return reminders;
}
