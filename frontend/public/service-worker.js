self.addEventListener('install', event => {
  console.log('Service Worker installed!');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service Worker activated!');
});

self.addEventListener('fetch', event => {
  // You can add custom caching logic here if needed
}); 