/**
 * Service Worker — handles Web Push notifications.
 *
 * Registered by src/services/pushService.js
 * Receives push events from the backend via the Web Push Protocol.
 */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

// ── Receive push ──────────────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: "New notification", body: event.data.text() };
  }

  const title   = data.title || "Student Collab";
  const options = {
    body:    data.body  || "",
    icon:    data.icon  || "/logo.svg",
    badge:   "/logo.svg",
    data:    { link: data.link || "/" },
    // Keep notification visible until user interacts with it
    requireInteraction: false,
    // Group notifications by tag so they don't pile up
    tag:     "student-collab-notif",
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ── User clicks the notification ──────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const link = event.notification.data?.link || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // If the app is already open, focus it and navigate
      for (const client of windowClients) {
        if ("focus" in client) {
          client.focus();
          client.postMessage({ type: "NAVIGATE", link });
          return;
        }
      }
      // Otherwise open a new tab
      if (clients.openWindow) {
        return clients.openWindow(link);
      }
    })
  );
});
