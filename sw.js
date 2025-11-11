const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `flagfinder-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `flagfinder-dynamic-${CACHE_VERSION}`;
const FLAGS_CACHE = `flagfinder-flags-${CACHE_VERSION}`;
const DATA_CACHE = `flagfinder-data-${CACHE_VERSION}`;

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json'
  // Icons are optional - add them when available
  // '/icons/icon-192x192.png',
  // '/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        // Cache each asset individually to handle failures gracefully
        const cachePromises = STATIC_ASSETS.map(url => {
          return cache.add(new Request(url, { cache: 'reload' })).catch(err => {
            console.warn(`[Service Worker] Failed to cache ${url}:`, err);
            return null; // Continue even if some assets fail
          });
        });
        return Promise.all(cachePromises);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheName.includes(CACHE_VERSION)) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone response for caching
            const responseToCache = response.clone();
            
            // Cache flag images
            if (url.hostname.includes('flagcdn.com')) {
              caches.open(FLAGS_CACHE).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            // Cache country data
            else if (url.hostname.includes('restcountries.com')) {
              caches.open(DATA_CACHE).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            // Cache Leaflet resources
            else if (url.hostname.includes('unpkg.com') || url.hostname.includes('leaflet')) {
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            // Cache map tiles (optional, can be large)
            else if (url.hostname.includes('tile.openstreetmap.org') || url.hostname.includes('nominatim.openstreetmap.org')) {
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            
            return response;
          })
          .catch(() => {
            // Offline fallback
            if (request.destination === 'image') {
              return new Response('Offline - Image not available', {
                status: 503,
                headers: { 'Content-Type': 'text/plain' }
              });
            }
            return new Response('Offline', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Message handler for pre-download requests
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PRE_DOWNLOAD_FLAGS') {
    const countryCodes = event.data.countryCodes;
    preDownloadFlags(countryCodes);
  }
  
  if (event.data && event.data.type === 'PRE_DOWNLOAD_COUNTRY_DATA') {
    const countryCodes = event.data.countryCodes;
    preDownloadCountryData(countryCodes);
  }
  
  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    getCacheSize().then(size => {
      event.ports[0].postMessage({ size });
    });
  }
});

// Pre-download flags
async function preDownloadFlags(countryCodes) {
  const cache = await caches.open(FLAGS_CACHE);
  let downloaded = 0;
  
  for (const code of countryCodes) {
    try {
      const flagUrl = `https://flagcdn.com/w320/${code}.png`;
      const response = await fetch(flagUrl);
      if (response.ok) {
        await cache.put(flagUrl, response);
        downloaded++;
      }
    } catch (error) {
      console.error(`Failed to cache flag for ${code}:`, error);
    }
  }
  
  console.log(`Pre-downloaded ${downloaded} of ${countryCodes.length} flags`);
  
  // Notify clients of progress
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'FLAGS_DOWNLOAD_PROGRESS',
      downloaded,
      total: countryCodes.length
    });
  });
}

// Pre-download country data
async function preDownloadCountryData(countryCodes) {
  const cache = await caches.open(DATA_CACHE);
  let downloaded = 0;
  
  for (const code of countryCodes) {
    try {
      const dataUrl = `https://restcountries.com/v3.1/alpha/${code.toUpperCase()}`;
      const response = await fetch(dataUrl);
      if (response.ok) {
        await cache.put(dataUrl, response);
        downloaded++;
      }
    } catch (error) {
      console.error(`Failed to cache data for ${code}:`, error);
    }
  }
  
  console.log(`Pre-downloaded data for ${downloaded} of ${countryCodes.length} countries`);
  
  // Notify clients of progress
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'DATA_DOWNLOAD_PROGRESS',
      downloaded,
      total: countryCodes.length
    });
  });
}

// Get total cache size
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    for (const key of keys) {
      try {
        const response = await cache.match(key);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      } catch (error) {
        console.error('Error calculating cache size:', error);
      }
    }
  }
  
  return totalSize;
}

