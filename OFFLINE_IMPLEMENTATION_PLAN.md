# Offline Implementation Plan for FlagFinder

This document outlines a detailed plan to enable offline functionality for FlagFinder, allowing users to play the game completely offline on Android phones after an initial online download.

---

## 📋 Current State Analysis

### ✅ What Already Exists
- Full game functionality with multiple modes
- Country data fetching from REST Countries API
- Flag images from FlagCDN
- LocalStorage for statistics and settings
- Complete UI and game logic

### ❌ What's Missing for Offline Support
1. **Service Worker** (`sw.js`) - Not implemented
2. **Web App Manifest** (`manifest.json`) - Not implemented
3. **App Icons** - Not created
4. **Service Worker Registration** - Not added to script.js
5. **Manifest Link** - Not added to index.html
6. **Pre-download System** - Not implemented
7. **Offline Detection** - Not implemented
8. **Cache Management** - Not implemented

---

## 🎯 Goals

1. **Enable offline gameplay** - Play without internet connection
2. **Pre-download all assets** - Download flags, country data, and resources when online
3. **Installable PWA** - Install on Android home screen
4. **Seamless experience** - Automatic caching with manual download option
5. **Storage management** - Handle cache size and updates

---

## 📦 Assets That Need to Be Cached

### 1. Static Files (Core Application)
- `index.html`
- `styles.css`
- `script.js`
- `manifest.json`
- `icons/icon-192x192.png`
- `icons/icon-512x512.png`
- Leaflet CSS (from CDN)
- Leaflet JS (from CDN)

### 2. Country Data
- **All countries list**: `https://restcountries.com/v3.1/all`
  - Contains: names, codes, coordinates, regions
  - Size: ~500KB - 1MB
  - Frequency: Load once on initialization

- **Individual country details** (for hints):
  - `https://restcountries.com/v3.1/alpha/{code}` (per country)
  - Contains: capital, population, borders, languages, currency
  - Size: ~2-5KB per country
  - Total: ~200-500KB for all countries
  - Frequency: Load on-demand for hints

### 3. Flag Images
- **Flag URLs**: `https://flagcdn.com/w320/{countryCode}.png`
- **Count**: ~195-250 countries (depending on what's included)
- **Size**: ~5-15KB per flag (320px width)
- **Total**: ~1-3MB for all flags
- **Frequency**: Load on-demand during gameplay (but we'll pre-cache)

### 4. Map Tiles (Leaflet)
- **Source**: OpenStreetMap tiles
- **Size**: Variable (depends on zoom level and area viewed)
- **Strategy**: Cache on-demand (too many tiles to pre-cache all)
- **Note**: Map tiles can be cached as user explores the map

---

## 🏗️ Implementation Plan

### Phase 1: Core PWA Infrastructure

#### 1.1 Create Web App Manifest (`manifest.json`)

**File**: `manifest.json`

**Purpose**: Makes the app installable and defines app metadata

**Content**:
```json
{
  "name": "FlagFinder - World Flag Quiz Game",
  "short_name": "FlagFinder",
  "description": "Test your geography knowledge by identifying countries from their flags",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#667eea",
  "orientation": "any",
  "icons": [
    {
      "src": "icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["games", "education"],
  "shortcuts": [
    {
      "name": "Daily Challenge",
      "short_name": "Daily",
      "description": "Play today's challenge",
      "url": "/?mode=daily",
      "icons": [{ "src": "icons/icon-96x96.png", "sizes": "96x96" }]
    },
    {
      "name": "Practice Mode",
      "short_name": "Practice",
      "description": "Learn flags without pressure",
      "url": "/?mode=practice",
      "icons": [{ "src": "icons/icon-96x96.png", "sizes": "96x96" }]
    }
  ]
}
```

**Implementation Steps**:
1. Create `manifest.json` file in project root
2. Add manifest link to `index.html` `<head>`:
   ```html
   <link rel="manifest" href="manifest.json">
   <meta name="theme-color" content="#667eea">
   <meta name="apple-mobile-web-app-capable" content="yes">
   <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
   <meta name="apple-mobile-web-app-title" content="FlagFinder">
   ```

**Testing Checklist**:
- [ ] Manifest file validates (use https://manifest-validator.appspot.com/)
- [ ] Icons display correctly
- [ ] App name and description appear correctly
- [ ] Theme color matches app design

---

#### 1.2 Create App Icons

**Purpose**: Icons for home screen and app drawer

**Required Sizes**:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

**Implementation Steps**:
1. Create `icons/` folder in project root
2. Design base icon (512x512px) with flag theme
3. Generate all sizes (can use online tools or image editor)
4. Ensure icons are maskable (safe zone for adaptive icons)

**Tools**:
- Online: https://realfavicongenerator.net/
- CLI: `npx pwa-asset-generator icon-512x512.png icons/ --manifest manifest.json`
- Manual: Use GIMP, Photoshop, or similar

**Testing Checklist**:
- [ ] All icon sizes created
- [ ] Icons display correctly on Android
- [ ] Icons are high quality and recognizable

---

### Phase 2: Service Worker Implementation

#### 2.1 Create Service Worker (`sw.js`)

**File**: `sw.js`

**Purpose**: Handles caching, offline functionality, and asset management

**Key Features**:
- Cache static assets on install
- Cache dynamic assets (flags, country data) on-demand
- Serve from cache when offline
- Clean up old caches on update
- Handle cache versioning

**Implementation Details**:

```javascript
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
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
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
            // Cache other dynamic content
            else {
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
  const flagPromises = countryCodes.map(code => {
    const flagUrl = `https://flagcdn.com/w320/${code}.png`;
    return fetch(flagUrl)
      .then(response => {
        if (response.ok) {
          return cache.put(flagUrl, response);
        }
      })
      .catch(error => {
        console.error(`Failed to cache flag for ${code}:`, error);
      });
  });
  
  await Promise.all(flagPromises);
  console.log(`Pre-downloaded ${countryCodes.length} flags`);
}

// Pre-download country data
async function preDownloadCountryData(countryCodes) {
  const cache = await caches.open(DATA_CACHE);
  const dataPromises = countryCodes.map(code => {
    const dataUrl = `https://restcountries.com/v3.1/alpha/${code}`;
    return fetch(dataUrl)
      .then(response => {
        if (response.ok) {
          return cache.put(dataUrl, response);
        }
      })
      .catch(error => {
        console.error(`Failed to cache data for ${code}:`, error);
      });
  });
  
  await Promise.all(dataPromises);
  console.log(`Pre-downloaded data for ${countryCodes.length} countries`);
}

// Get total cache size
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    for (const key of keys) {
      const response = await cache.match(key);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }
  
  return totalSize;
}
```

**Implementation Steps**:
1. Create `sw.js` file in project root
2. Test service worker registration
3. Verify caching works correctly

**Testing Checklist**:
- [ ] Service Worker registers successfully
- [ ] Static assets are cached on install
- [ ] Dynamic assets are cached on fetch
- [ ] App works offline (after first visit)
- [ ] Old caches are cleaned up on update

---

#### 2.2 Register Service Worker in `script.js`

**Location**: End of `script.js` file (before or after `initGame()`)

**Code to Add**:
```javascript
// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              showUpdateNotification();
            }
          });
        });
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// Show update notification
function showUpdateNotification() {
  // You can add a UI notification here
  console.log('New version available! Refresh to update.');
}
```

**Implementation Steps**:
1. Add service worker registration code
2. Test registration in browser console
3. Verify service worker appears in DevTools > Application > Service Workers

---

### Phase 3: Pre-Download System

#### 3.1 Pre-Download Manager

**Purpose**: Download all flags and country data when user is online

**Features**:
- Automatic pre-download on first visit
- Manual "Download All" button
- Progress indicator
- Resume capability
- Storage size tracking

**Implementation in `script.js`**:

```javascript
// Pre-download state
let preDownloadState = {
  flagsDownloaded: 0,
  flagsTotal: 0,
  dataDownloaded: 0,
  dataTotal: 0,
  isDownloading: false,
  downloadProgress: 0
};

// Check if pre-download is needed
async function checkPreDownloadStatus() {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    return;
  }
  
  const cacheStatus = localStorage.getItem('preDownloadStatus');
  if (cacheStatus === 'completed') {
    return; // Already downloaded
  }
  
  // Check if we have all countries loaded
  if (gameState.allCountries && gameState.allCountries.length > 0) {
    // Show pre-download option
    showPreDownloadPrompt();
  }
}

// Show pre-download prompt
function showPreDownloadPrompt() {
  // Add UI element to prompt user
  // This can be a banner or modal
  const prompt = document.createElement('div');
  prompt.id = 'pre-download-prompt';
  prompt.className = 'pre-download-prompt';
  prompt.innerHTML = `
    <div class="pre-download-content">
      <h3>📥 Download Game Assets</h3>
      <p>Download all flags and country data to play offline?</p>
      <div class="pre-download-actions">
        <button id="start-pre-download" class="apply-filter-button">Download Now</button>
        <button id="skip-pre-download" class="close-filter-button">Skip</button>
      </div>
    </div>
  `;
  document.body.appendChild(prompt);
  
  document.getElementById('start-pre-download').addEventListener('click', startPreDownload);
  document.getElementById('skip-pre-download').addEventListener('click', () => {
    prompt.remove();
  });
}

// Start pre-download process
async function startPreDownload() {
  if (!navigator.onLine) {
    alert('You need to be online to download game assets.');
    return;
  }
  
  preDownloadState.isDownloading = true;
  preDownloadState.flagsTotal = gameState.allCountries.length;
  preDownloadState.dataTotal = gameState.allCountries.length;
  
  // Show progress UI
  showPreDownloadProgress();
  
  // Get country codes
  const countryCodes = gameState.allCountries.map(c => c.code.toLowerCase());
  
  // Download flags in batches (to avoid overwhelming the browser)
  await downloadFlagsInBatches(countryCodes, 10); // 10 at a time
  
  // Download country data in batches
  await downloadCountryDataInBatches(countryCodes, 5); // 5 at a time
  
  // Mark as completed
  localStorage.setItem('preDownloadStatus', 'completed');
  localStorage.setItem('preDownloadDate', new Date().toISOString());
  
  preDownloadState.isDownloading = false;
  hidePreDownloadProgress();
  showPreDownloadComplete();
}

// Download flags in batches
async function downloadFlagsInBatches(countryCodes, batchSize) {
  const cache = await caches.open('flagfinder-flags-v1.0.0');
  
  for (let i = 0; i < countryCodes.length; i += batchSize) {
    const batch = countryCodes.slice(i, i + batchSize);
    const promises = batch.map(async (code) => {
      try {
        const flagUrl = `https://flagcdn.com/w320/${code}.png`;
        const response = await fetch(flagUrl);
        if (response.ok) {
          await cache.put(flagUrl, response);
          preDownloadState.flagsDownloaded++;
          updatePreDownloadProgress();
        }
      } catch (error) {
        console.error(`Failed to download flag for ${code}:`, error);
      }
    });
    
    await Promise.all(promises);
    
    // Small delay between batches to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Download country data in batches
async function downloadCountryDataInBatches(countryCodes, batchSize) {
  const cache = await caches.open('flagfinder-data-v1.0.0');
  
  for (let i = 0; i < countryCodes.length; i += batchSize) {
    const batch = countryCodes.slice(i, i + batchSize);
    const promises = batch.map(async (code) => {
      try {
        const dataUrl = `https://restcountries.com/v3.1/alpha/${code.toUpperCase()}`;
        const response = await fetch(dataUrl);
        if (response.ok) {
          await cache.put(dataUrl, response);
          preDownloadState.dataDownloaded++;
          updatePreDownloadProgress();
        }
      } catch (error) {
        console.error(`Failed to download data for ${code}:`, error);
      }
    });
    
    await Promise.all(promises);
    
    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

// Update progress display
function updatePreDownloadProgress() {
  const total = preDownloadState.flagsTotal + preDownloadState.dataTotal;
  const downloaded = preDownloadState.flagsDownloaded + preDownloadState.dataDownloaded;
  preDownloadState.downloadProgress = Math.round((downloaded / total) * 100);
  
  const progressBar = document.getElementById('pre-download-progress-bar');
  const progressText = document.getElementById('pre-download-progress-text');
  
  if (progressBar) {
    progressBar.style.width = `${preDownloadState.downloadProgress}%`;
  }
  
  if (progressText) {
    progressText.textContent = `Downloaded ${downloaded} of ${total} assets (${preDownloadState.downloadProgress}%)`;
  }
}

// Show progress UI
function showPreDownloadProgress() {
  const prompt = document.getElementById('pre-download-prompt');
  if (prompt) {
    prompt.innerHTML = `
      <div class="pre-download-content">
        <h3>📥 Downloading Game Assets</h3>
        <div class="pre-download-progress-container">
          <div class="pre-download-progress-bar-container">
            <div id="pre-download-progress-bar" class="pre-download-progress-bar" style="width: 0%"></div>
          </div>
          <p id="pre-download-progress-text">Starting download...</p>
        </div>
        <p class="pre-download-note">This may take a few minutes. You can continue playing while downloading.</p>
      </div>
    `;
  }
}

// Hide progress UI
function hidePreDownloadProgress() {
  const prompt = document.getElementById('pre-download-prompt');
  if (prompt) {
    prompt.remove();
  }
}

// Show completion message
function showPreDownloadComplete() {
  const notification = document.createElement('div');
  notification.className = 'pre-download-complete';
  notification.innerHTML = `
    <div class="pre-download-content">
      <h3>✅ Download Complete!</h3>
      <p>All game assets have been downloaded. You can now play offline.</p>
      <button onclick="this.parentElement.parentElement.remove()" class="apply-filter-button">OK</button>
    </div>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 5000);
}

// Add to Settings modal - Manual download button
function addPreDownloadToSettings() {
  // Add button to settings modal for manual re-download
  const settingsContent = document.querySelector('.settings-modal-content .settings-options');
  if (settingsContent) {
    const downloadSection = document.createElement('div');
    downloadSection.className = 'setting-item';
    downloadSection.innerHTML = `
      <label>
        <button id="manual-pre-download" class="apply-filter-button">Download All Game Assets</button>
        <span>Download flags and country data for offline play</span>
      </label>
      <p class="setting-description">This will download all flags and country data (~2-4MB). Requires internet connection.</p>
    `;
    settingsContent.appendChild(downloadSection);
    
    document.getElementById('manual-pre-download').addEventListener('click', startPreDownload);
  }
}
```

**Implementation Steps**:
1. Add pre-download functions to `script.js`
2. Call `checkPreDownloadStatus()` after countries are loaded
3. Add CSS for pre-download UI
4. Add manual download button to settings
5. Test download process

**Testing Checklist**:
- [ ] Pre-download prompt appears after countries load
- [ ] Download progress updates correctly
- [ ] All flags are cached
- [ ] All country data is cached
- [ ] Game works offline after download
- [ ] Manual download button works

---

#### 3.2 Offline Detection & Indicator

**Purpose**: Show user when they're offline and using cached data

**Implementation in `script.js`**:

```javascript
// Offline indicator
function initializeOfflineIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'offline-indicator';
  indicator.className = 'offline-indicator hidden';
  indicator.innerHTML = `
    <span>📡</span>
    <span>You're offline. Playing with cached data.</span>
  `;
  document.body.appendChild(indicator);
  
  window.addEventListener('online', () => {
    indicator.classList.remove('show');
    console.log('Back online!');
  });
  
  window.addEventListener('offline', () => {
    indicator.classList.add('show');
    console.log('Gone offline!');
  });
  
  // Check initial state
  if (!navigator.onLine) {
    indicator.classList.add('show');
  }
}
```

**CSS to Add** (in `styles.css`):

```css
.offline-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #f59e0b;
  color: white;
  padding: 0.5rem;
  text-align: center;
  z-index: 10000;
  transform: translateY(-100%);
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.offline-indicator.show {
  transform: translateY(0);
}
```

**Implementation Steps**:
1. Add offline indicator function
2. Call `initializeOfflineIndicator()` in `initGame()`
3. Add CSS styles
4. Test offline/online detection

---

### Phase 4: Cache Management

#### 4.1 Cache Size Tracking

**Purpose**: Show users how much storage is being used

**Implementation**:

```javascript
// Get cache size
async function getCacheSize() {
  if (!('caches' in window)) {
    return 0;
  }
  
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    for (const key of keys) {
      const response = await cache.match(key);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }
  
  return totalSize;
}

// Format bytes to human-readable
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Display cache size in settings
async function displayCacheSize() {
  const size = await getCacheSize();
  const sizeElement = document.getElementById('cache-size-display');
  if (sizeElement) {
    sizeElement.textContent = `Cache size: ${formatBytes(size)}`;
  }
}
```

#### 4.2 Clear Cache Option

**Purpose**: Allow users to clear cache if needed

**Implementation**:

```javascript
// Clear all caches
async function clearAllCaches() {
  if (confirm('Are you sure you want to clear all cached data? You will need to download assets again for offline play.')) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    localStorage.removeItem('preDownloadStatus');
    alert('Cache cleared successfully.');
    location.reload();
  }
}
```

---

### Phase 5: UI Enhancements

#### 5.1 Pre-Download UI Components

**CSS to Add** (in `styles.css`):

```css
/* Pre-download Prompt */
.pre-download-prompt {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5000;
  background: rgba(0, 0, 0, 0.8);
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pre-download-content {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.pre-download-content h3 {
  margin-bottom: 1rem;
  color: #667eea;
}

.pre-download-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}

.pre-download-progress-container {
  margin: 1.5rem 0;
}

.pre-download-progress-bar-container {
  width: 100%;
  height: 20px;
  background: #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.pre-download-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.pre-download-note {
  font-size: 0.875rem;
  color: #666;
  margin-top: 1rem;
}

.pre-download-complete {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 5000;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

body.dark-mode .pre-download-content {
  background: #1e293b;
  color: #e5e7eb;
}

body.dark-mode .pre-download-content h3 {
  color: #818cf8;
}
```

---

## 📝 Implementation Checklist

### Phase 1: Core PWA Infrastructure
- [ ] Create `manifest.json`
- [ ] Add manifest link to `index.html`
- [ ] Create app icons (all sizes)
- [ ] Test manifest validation

### Phase 2: Service Worker
- [ ] Create `sw.js`
- [ ] Register service worker in `script.js`
- [ ] Test service worker registration
- [ ] Test offline functionality

### Phase 3: Pre-Download System
- [ ] Add pre-download functions to `script.js`
- [ ] Add pre-download UI components
- [ ] Add CSS for pre-download UI
- [ ] Test download process
- [ ] Add manual download button to settings

### Phase 4: Offline Features
- [ ] Add offline indicator
- [ ] Add cache size tracking
- [ ] Add clear cache option
- [ ] Test offline detection

### Phase 5: Testing
- [ ] Test on Android Chrome
- [ ] Test offline gameplay
- [ ] Test pre-download process
- [ ] Test cache management
- [ ] Test app installation

---

## 🧪 Testing Plan

### 1. Local Testing (Development)
1. Run app on local server (http://localhost)
2. Open Chrome DevTools > Application > Service Workers
3. Verify service worker registers
4. Check cache storage
5. Test offline mode (DevTools > Network > Offline)

### 2. Android Testing
1. Deploy to HTTPS hosting (GitHub Pages, Netlify, etc.)
2. Open on Android Chrome
3. Visit site once (online)
4. Trigger pre-download
5. Wait for download to complete
6. Turn off WiFi/data
7. Test offline gameplay
8. Test app installation (Add to Home Screen)

### 3. Edge Cases
- [ ] Test with slow connection
- [ ] Test with interrupted download
- [ ] Test cache size limits
- [ ] Test update process
- [ ] Test on different Android versions

---

## 🚀 Deployment Steps

### 1. Pre-Deployment
- [ ] All files created and tested
- [ ] Icons generated
- [ ] Service worker tested
- [ ] Pre-download tested

### 2. Deployment
1. Deploy to hosting with HTTPS:
   - GitHub Pages (free, automatic HTTPS)
   - Netlify (free, automatic HTTPS)
   - Vercel (free, automatic HTTPS)
   - Firebase Hosting (free tier)

2. Verify HTTPS is working
3. Test service worker registration
4. Test offline functionality

### 3. Post-Deployment
- [ ] Test on Android device
- [ ] Verify installation works
- [ ] Verify offline gameplay works
- [ ] Monitor cache usage

---

## 📊 Expected Results

### Storage Usage
- **Static files**: ~500KB
- **Country data**: ~1MB
- **Flag images**: ~2-3MB
- **Total**: ~3-5MB

### Download Time
- **Fast connection (10 Mbps)**: ~30-60 seconds
- **Medium connection (5 Mbps)**: ~1-2 minutes
- **Slow connection (1 Mbps)**: ~3-5 minutes

### User Experience
- First visit: Prompt to download assets
- Download progress: Visible progress bar
- After download: Full offline functionality
- Settings: Manual download option available

---

## 🔧 Troubleshooting

### Service Worker Not Registering
- Check HTTPS is enabled
- Check file path is correct (`/sw.js`)
- Check browser console for errors
- Verify service worker file exists

### Pre-Download Not Working
- Check internet connection
- Check browser console for errors
- Verify countries are loaded
- Check cache storage limits

### Offline Not Working
- Verify assets were downloaded
- Check cache storage in DevTools
- Verify service worker is active
- Check for cache errors

---

## 📅 Estimated Timeline

- **Phase 1** (Manifest & Icons): 1-2 hours
- **Phase 2** (Service Worker): 2-3 hours
- **Phase 3** (Pre-Download System): 3-4 hours
- **Phase 4** (Offline Features): 1-2 hours
- **Phase 5** (Testing): 2-3 hours

**Total**: ~9-14 hours

---

## 🎯 Success Criteria

The offline implementation is successful when:

1. ✅ App can be installed on Android
2. ✅ All game assets can be pre-downloaded
3. ✅ App works completely offline after download
4. ✅ Download progress is visible
5. ✅ Offline indicator works
6. ✅ Cache management works
7. ✅ No console errors
8. ✅ Smooth user experience

---

*Last Updated: [Current Date]*
*Version: 1.0*

