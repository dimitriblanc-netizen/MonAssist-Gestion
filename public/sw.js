// Service Worker pour Mon Assist'Gestion (DRYOS Immobilier)
// Gère le mode hors-ligne, le cache PWA et les notifications locales de rappel d'échéances

const CACHE_NAME = 'assist-gestion-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png'
];

// --- 1. Gestion de l'installation et du cycle de vie ---
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Erreur de pré-mise en cache SW:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Nettoyage des anciens caches
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      }),
      // Prise de contrôle immédiate des clients
      self.clients.claim()
    ]).then(() => {
      // Démarrer la vérification des rappels stockés
      checkDueReminders();
    })
  );
});

// --- 2. Stratégie de mise en cache Network First avec fallback Cache ---
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Ignorer les requêtes non-HTTP (comme chrome-extension:)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Mettre à jour le cache si la requête est réussie
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch(() => {});
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // En cas de perte de réseau, utiliser le cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Pour les requêtes de navigation, renvoyer /index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// --- 3. Base IndexedDB pour stocker les rappels de loyers programmés ---
const DB_NAME = 'dryos_local_reminders_db';
const DB_VERSION = 1;
const STORE_NAME = 'reminders';

function openRemindersDB() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in self)) {
      reject(new Error('IndexedDB non supporté dans le SW'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveReminderToDB(reminder) {
  try {
    const db = await openRemindersDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(reminder);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Erreur saveReminderToDB:', err);
    return false;
  }
}

async function getAllRemindersFromDB() {
  try {
    const db = await openRemindersDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    return [];
  }
}

async function deleteReminderFromDB(id) {
  try {
    const db = await openRemindersDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Erreur deleteReminderFromDB:', err);
  }
}

// Map en mémoire pour les timers actifs
const activeTimers = new Map();

function scheduleLocalTimeout(reminder) {
  const now = Date.now();
  const delay = Math.max(0, reminder.triggerTime - now);

  // Annuler timer existant pour cet id s'il y en a un
  if (activeTimers.has(reminder.id)) {
    clearTimeout(activeTimers.get(reminder.id));
    activeTimers.delete(reminder.id);
  }

  // Si le délai est raisonnable (< 24 jours max pour setTimeout dans Node/V8)
  if (delay < 2147483647) {
    const timerId = setTimeout(async () => {
      activeTimers.delete(reminder.id);
      await triggerNotification(reminder);
      await deleteReminderFromDB(reminder.id);
    }, delay);
    activeTimers.set(reminder.id, timerId);
  }
}

async function triggerNotification(reminder) {
  const options = {
    body: reminder.body,
    icon: reminder.icon || '/icon-192.png',
    badge: reminder.badge || '/favicon-32x32.png',
    tag: reminder.tag || `reminder-${reminder.id}`,
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: reminder.url || '/app',
      reminderId: reminder.id,
      timestamp: Date.now()
    },
    actions: [
      { action: 'open', title: 'Ouvrir Assist\'Gestion' },
      { action: 'dismiss', title: 'Compris' }
    ]
  };

  try {
    await self.registration.showNotification(reminder.title, options);
  } catch (err) {
    console.error('Erreur affichage notification SW:', err);
  }
}

// Vérification périodique des rappels arrivés à échéance
async function checkDueReminders() {
  const now = Date.now();
  const reminders = await getAllRemindersFromDB();

  for (const reminder of reminders) {
    if (reminder.triggerTime <= now) {
      await triggerNotification(reminder);
      await deleteReminderFromDB(reminder.id);
    } else {
      // Reprogrammer le timer en mémoire s'il n'est pas déjà actif
      if (!activeTimers.has(reminder.id)) {
        scheduleLocalTimeout(reminder);
      }
    }
  }
}

// Vérifier les rappels chaque minute en arrière-plan
setInterval(() => {
  checkDueReminders().catch(() => {});
}, 60000);

// --- 4. Écoute des messages venant de l'application React ---
self.addEventListener('message', (event) => {
  if (!event.data || typeof event.data !== 'object') return;

  const { type, payload } = event.data;

  switch (type) {
    case 'SHOW_NOTIFICATION': {
      // Affichage immédiat d'une notification
      if (payload) {
        triggerNotification({
          id: payload.id || `immediate-${Date.now()}`,
          title: payload.title || "Mon Assist'Gestion 🔔",
          body: payload.body || "Notification de rappel de gestion locative",
          url: payload.url || '/app',
          tag: payload.tag || 'immediate'
        });
      }
      break;
    }

    case 'SCHEDULE_REMINDER': {
      // Programmer un rappel en arrière-plan (même quand l'onglet est fermé)
      if (payload && payload.id && payload.triggerTime) {
        saveReminderToDB(payload).then(() => {
          scheduleLocalTimeout(payload);
          if (event.source && event.source.postMessage) {
            event.source.postMessage({ type: 'REMINDER_SCHEDULED', id: payload.id });
          }
        });
      }
      break;
    }

    case 'SYNC_REMINDERS': {
      // Synchroniser la liste complète des échéances (5 du mois, relances impayés)
      if (Array.isArray(payload)) {
        Promise.all(payload.map((r) => saveReminderToDB(r))).then(() => {
          checkDueReminders();
          if (event.source && event.source.postMessage) {
            event.source.postMessage({ type: 'REMINDERS_SYNCED', count: payload.length });
          }
        });
      }
      break;
    }

    case 'CANCEL_REMINDER': {
      if (payload && payload.id) {
        if (activeTimers.has(payload.id)) {
          clearTimeout(activeTimers.get(payload.id));
          activeTimers.delete(payload.id);
        }
        deleteReminderFromDB(payload.id);
      }
      break;
    }

    case 'CHECK_REMINDERS': {
      checkDueReminders();
      break;
    }

    default:
      break;
  }
});

// --- 5. Support de Background Sync & Periodic Sync ---
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-rent-reminders') {
    event.waitUntil(checkDueReminders());
  }
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-rent-reminders') {
    event.waitUntil(checkDueReminders());
  }
});

// --- 6. Écoute des notifications push distantes (FCM / Web Push) ---
self.addEventListener('push', (event) => {
  let data = { 
    title: "Mon Assist'Gestion 🔔", 
    body: "Échéance de loyer ou alerte impayé" 
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/favicon-32x32.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/app' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// --- 7. Clic sur notification : ouverture intelligente de l'application ---
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/app';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si une fenêtre de l'app est déjà ouverte, la mettre au premier plan
      for (const client of clientList) {
        if ('focus' in client) {
          if (client.url.includes(self.registration.scope)) {
            client.focus();
            if ('navigate' in client && targetUrl) {
              client.navigate(targetUrl);
            }
            return;
          }
        }
      }
      // Sinon ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
