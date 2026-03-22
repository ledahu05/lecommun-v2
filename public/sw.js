// Minimal service worker for PWA installability.
// No offline caching — just satisfies Chrome's install criteria.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass through all requests to the network
  return;
});
