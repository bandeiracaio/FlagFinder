// Game State
const gameState = {
    score: 0,
    streak: 0,
    bestStreak: 0,
    currentRound: 1,
    totalRounds: 10,
    currentCountry: null,
    previousCountry: null,
    countries: [],
    allCountries: [], // Store all loaded countries
    filteredCountries: [], // Currently active country pool
    currentFilter: 'all', // Current filter type
    map: null,
    clickedMarker: null,
    isWaitingForClick: false,
    distances: [], // Store distances for each round
    totalDistance: 0,
    averageDistance: 0,
    bestAccuracy: Infinity, // Best (smallest) distance achieved
    correctAnswers: 0,
    incorrectAnswers: 0,
    hintsUsed: [] // Track which hints were used this round
};

// Statistics stored in localStorage
let gameStatistics = {
    gamesPlayed: 0,
    totalScore: 0,
    bestScore: 0,
    bestStreak: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    totalDistance: 0,
    totalRounds: 0,
    regionalStats: {}, // { region: { correct, incorrect, attempts } }
    countryStats: {}, // { countryCode: { correct, incorrect, attempts, avgDistance } }
    filtersUsed: {} // Track which filters have been used
};

// Achievements stored in localStorage
let achievements = {
    perfectRound: false,
    streakMaster: false,
    globetrotter: false,
    speedDemon: false,
    precision: false,
    explorer: false,
    scholar: false,
    perfectionist: false,
    progress: {
        perfectRound: 0,
        streakMaster: 0,
        globetrotter: new Set(),
        speedDemon: [],
        precision: 0,
        explorer: new Set(),
        scholar: 0,
        perfectionist: 0
    }
};

// Game mode
let currentGameMode = 'classic'; // 'classic', 'practice', 'daily', 'time', 'endless', 'blitz'
let dailyChallengeCountries = [];
let dailyChallengeDate = null;
let currentQuizType = 'map'; // 'map', 'multiple', 'reverse', 'capital'
let timerInterval = null;
let timeRemaining = 4;
let blitzTimerInterval = null;
let blitzTimeRemaining = 60;
let gameHistory = [];
let customCountrySets = {};
let editingCustomSetId = null;
let mapStyle = 'dark'; // 'political', 'dark', 'satellite' - Default to dark
let currentDifficulty = 'all'; // 'all', 'easy', 'medium', 'hard', 'expert'
let playerLevel = 1;
let playerXP = 0;
let xpToNextLevel = 100;
let personalRecords = {
    highestScore: 0,
    longestStreak: 0,
    fastestRound: null, // in seconds
    bestAccuracy: 0,
    closestGuess: Infinity, // in km
    mostCountries: 0
};
let showCountryLabels = false;
let countryLabelsLayer = null;
let countryHighlightLayer = null;
let countryBordersLayer = null; // GeoJSON layer for country borders
let bordersGeoJSONCache = null; // Cache for pre-loaded borders GeoJSON data
let bordersLoadingPromise = null; // Promise for borders loading to avoid duplicate requests

// Settings stored in localStorage
let gameSettings = {
    darkMode: true, // Default to dark mode
    soundEffects: true,
    music: false,
    masterVolume: 50,
    hapticFeedback: false,
    swipeGestures: true,
    fullscreen: false,
    landscapeLock: false,
    headerSpacing: 'default' // 'default', 'compact', 'minimal'
};

// Sound effects (using Web Audio API for simple tones)
const soundEffects = {
    correct: null,
    incorrect: null,
    streak: null,
    achievement: null
};

// DOM Elements
const scoreElement = document.getElementById('score');
const streakElement = document.getElementById('streak');
const roundElement = document.getElementById('round');
const flagImage = document.getElementById('flag-image');
const feedbackOverlay = document.getElementById('feedback-overlay');
const feedbackMessage = document.getElementById('feedback-message');
const countryName = document.getElementById('country-name');
const gameOverModal = document.getElementById('game-over-modal');
const finalScoreElement = document.getElementById('final-score');
const bestStreakElement = document.getElementById('best-streak');
const bestAccuracyElement = document.getElementById('best-accuracy');
const avgDistanceElement = document.getElementById('avg-distance');
const restartButton = document.getElementById('restart-button');
const loadingOverlay = document.getElementById('loading-overlay');
const filterButton = document.getElementById('filter-button');
const filterLabel = document.getElementById('filter-label');
const filterModal = document.getElementById('filter-modal');
const filterCount = document.getElementById('filter-count');
const applyFilterButton = document.getElementById('apply-filter-button');
const closeFilterButton = document.getElementById('close-filter-button');
const filterOptions = document.querySelectorAll('.filter-option');
// Border settings elements - will be initialized after DOM is ready
let borderSettingsButton;
let borderSettingsModal;
let borderThicknessSlider;
let borderContrastSlider;
let borderOverlayCheckbox;
let applyBorderSettingsButton;
let closeBorderSettingsButton;
const loadingMessage = document.getElementById('loading-message');
const loadingHint = document.getElementById('loading-hint');
const processingOverlay = document.getElementById('processing-overlay');
const multiplierIndicator = document.getElementById('multiplier-indicator');
const multiplierValue = document.getElementById('multiplier-value');
const settingsButton = document.getElementById('settings-button');
const statsButton = document.getElementById('stats-button');
const settingsModal = document.getElementById('settings-modal');
const statsModal = document.getElementById('stats-modal');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const soundEffectsToggle = document.getElementById('sound-effects-toggle');
const musicToggle = document.getElementById('music-toggle');
const masterVolumeSlider = document.getElementById('master-volume');
const closeSettingsButton = document.getElementById('close-settings-button');
const closeStatsButton = document.getElementById('close-stats-button');
const resetStatsButton = document.getElementById('reset-stats-button');
const hintButton = document.getElementById('hint-button');
const hintModal = document.getElementById('hint-modal');
const hintOptions = document.querySelectorAll('.hint-option');
const hintDisplay = document.getElementById('hint-display');
const hintText = document.getElementById('hint-text');
const closeHintButton = document.getElementById('close-hint-button');
const gameModeButton = document.getElementById('game-mode-button');
const gameModeLabel = document.getElementById('game-mode-label');
const gameModeModal = document.getElementById('game-mode-modal');
const gameModeOptions = document.querySelectorAll('.game-mode-option');
const closeGameModeButton = document.getElementById('close-game-mode-button');
const dailyChallengeButton = document.getElementById('daily-challenge-button');
const achievementsButton = document.getElementById('achievements-button');
const achievementsModal = document.getElementById('achievements-modal');
const achievementsGrid = document.getElementById('achievements-grid');
const closeAchievementsButton = document.getElementById('close-achievements-button');
const tutorialOverlay = document.getElementById('tutorial-overlay');
const statTabs = document.querySelectorAll('.stat-tab');
const statsTabContents = document.querySelectorAll('.stats-tab-content');
const regionalStatsList = document.getElementById('regional-stats-list');
const countryStatsList = document.getElementById('country-stats-list');
const countrySearchInput = document.getElementById('country-search');
const countrySortSelect = document.getElementById('country-sort');
const timerStatItem = document.getElementById('timer-stat-item');
const timerElement = document.getElementById('timer');
const quizModeButton = document.getElementById('quiz-mode-button');
const quizModeSelection = document.getElementById('quiz-mode-selection');
const quizOptions = document.querySelectorAll('.quiz-option');
const multipleChoiceContainer = document.getElementById('multiple-choice-container');
const choiceOptions = document.querySelectorAll('.choice-option');
const historyFilter = document.getElementById('history-filter');
const exportHistoryButton = document.getElementById('export-history-button');
const gameHistoryList = document.getElementById('game-history-list');
const countryInfoModal = document.getElementById('country-info-modal');
const countryInfoContent = document.getElementById('country-info-content');
const closeCountryInfoButton = document.getElementById('close-country-info-button');
const customSetsButton = document.getElementById('custom-sets-button');
const customSetsModal = document.getElementById('custom-sets-modal');
const customSetNameInput = document.getElementById('custom-set-name');
const createCustomSetButton = document.getElementById('create-custom-set-button');
const customSetsList = document.getElementById('custom-sets-list');
const closeCustomSetsButton = document.getElementById('close-custom-sets-button');
const customSetEditorModal = document.getElementById('custom-set-editor-modal');
const editingSetNameInput = document.getElementById('editing-set-name');
const countrySearchEditor = document.getElementById('country-search-editor');
const selectAllCountriesButton = document.getElementById('select-all-countries-button');
const deselectAllCountriesButton = document.getElementById('deselect-all-countries-button');
const customSetCountriesList = document.getElementById('custom-set-countries-list');
const saveCustomSetButton = document.getElementById('save-custom-set-button');
const deleteCustomSetButton = document.getElementById('delete-custom-set-button');
const cancelCustomSetEditorButton = document.getElementById('cancel-custom-set-editor-button');
// Map style elements (button removed, now in settings)
const mapStyleModal = document.getElementById('map-style-modal');
const mapStyleOptions = document.querySelectorAll('.map-style-option');
const closeMapStyleButton = document.getElementById('close-map-style-button');
const leaderboardButton = document.getElementById('leaderboard-button');
const leaderboardModal = document.getElementById('leaderboard-modal');
const leaderboardTabs = document.querySelectorAll('.leaderboard-tab');
const leaderboardContent = document.getElementById('leaderboard-content');
const closeLeaderboardButton = document.getElementById('close-leaderboard-button');
const settingsTabs = document.querySelectorAll('.settings-tab');
const hapticFeedbackToggle = document.getElementById('haptic-feedback-toggle');
const swipeGesturesToggle = document.getElementById('swipe-gestures-toggle');
const fullscreenToggle = document.getElementById('fullscreen-toggle');
const landscapeLockToggle = document.getElementById('landscape-lock-toggle');
const difficultyButton = document.getElementById('difficulty-button');
const difficultyLabel = document.getElementById('difficulty-label');
const difficultyModal = document.getElementById('difficulty-modal');
const difficultyOptions = document.querySelectorAll('.difficulty-option');
const closeDifficultyButton = document.getElementById('close-difficulty-button');
const levelElement = document.getElementById('level');
const xpElement = document.getElementById('xp');
const levelStatItem = document.getElementById('level-stat-item');
const xpStatItem = document.getElementById('xp-stat-item');
const recordHighestScore = document.getElementById('record-highest-score');
const recordLongestStreak = document.getElementById('record-longest-streak');
const recordFastestRound = document.getElementById('record-fastest-round');
const recordBestAccuracy = document.getElementById('record-best-accuracy');
const recordClosestGuess = document.getElementById('record-closest-guess');
const recordMostCountries = document.getElementById('record-most-countries');
const exportStatsCsvButton = document.getElementById('export-stats-csv-button');
const shareStatsButton = document.getElementById('share-stats-button');
const shareModal = document.getElementById('share-modal');
const sharePreview = document.getElementById('share-preview');
const shareTwitterButton = document.getElementById('share-twitter-button');
const shareFacebookButton = document.getElementById('share-facebook-button');
const copyShareLinkButton = document.getElementById('copy-share-link-button');
const downloadShareImageButton = document.getElementById('download-share-image-button');
const closeShareButton = document.getElementById('close-share-button');
const fontSizeSelect = document.getElementById('font-size');
const countryLabelsToggle = document.getElementById('country-labels-toggle');

// ==================== LOCAL STORAGE FUNCTIONS ====================

// Load statistics from localStorage
function loadStatistics() {
    const saved = localStorage.getItem('flagfinder-statistics');
    if (saved) {
        try {
            gameStatistics = { ...gameStatistics, ...JSON.parse(saved) };
        } catch (e) {
            console.error('Error loading statistics:', e);
        }
    }
}

// Save statistics to localStorage
function saveStatistics() {
    try {
        localStorage.setItem('flagfinder-statistics', JSON.stringify(gameStatistics));
    } catch (e) {
        console.error('Error saving statistics:', e);
    }
}

// Load settings from localStorage
function loadSettings() {
    const saved = localStorage.getItem('flagfinder-settings');
    if (saved) {
        try {
            gameSettings = { ...gameSettings, ...JSON.parse(saved) };
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }
    // Apply settings
    applySettings();
}

// Save settings to localStorage
function saveSettings() {
    try {
        localStorage.setItem('flagfinder-settings', JSON.stringify(gameSettings));
    } catch (e) {
        console.error('Error saving settings:', e);
    }
}

// Apply settings to UI
function applySettings() {
    // Dark mode
    if (gameSettings.darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    if (darkModeToggle) darkModeToggle.checked = gameSettings.darkMode;
    
    // Sound effects
    if (soundEffectsToggle) soundEffectsToggle.checked = gameSettings.soundEffects;
    
    // Music
    if (musicToggle) musicToggle.checked = gameSettings.music;
    
    // Volume
    if (masterVolumeSlider) masterVolumeSlider.value = gameSettings.masterVolume;
    
    // Header spacing
    const gameHeader = document.querySelector('.game-header');
    if (gameHeader) {
        gameHeader.classList.remove('header-spacing-default', 'header-spacing-compact', 'header-spacing-minimal');
        const spacing = gameSettings.headerSpacing || 'default';
        gameHeader.classList.add(`header-spacing-${spacing}`);
    }
    
    // Update header spacing select if it exists
    const headerSpacingSelect = document.getElementById('header-spacing');
    if (headerSpacingSelect) {
        headerSpacingSelect.value = gameSettings.headerSpacing || 'default';
    }
}


// ==================== SOUND EFFECTS ====================

// Create a simple tone using Web Audio API
function playTone(frequency, duration, type = 'sine') {
    if (!gameSettings.soundEffects) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    const volume = gameSettings.masterVolume / 100;
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// Play sound effect
function playSound(soundName) {
    if (!gameSettings.soundEffects) return;
    
    switch (soundName) {
        case 'correct':
            playTone(523.25, 0.2, 'sine'); // C5
            setTimeout(() => playTone(659.25, 0.2, 'sine'), 100); // E5
            break;
        case 'incorrect':
            playTone(220, 0.3, 'sawtooth'); // A3
            break;
        case 'streak':
            playTone(440, 0.15, 'sine'); // A4
            setTimeout(() => playTone(554.37, 0.15, 'sine'), 100); // C#5
            setTimeout(() => playTone(659.25, 0.2, 'sine'), 200); // E5
            break;
        case 'achievement':
            playTone(523.25, 0.1, 'sine'); // C5
            setTimeout(() => playTone(659.25, 0.1, 'sine'), 100); // E5
            setTimeout(() => playTone(783.99, 0.1, 'sine'), 200); // G5
            setTimeout(() => playTone(1046.50, 0.3, 'sine'), 300); // C6
            break;
    }
}

// ==================== STATISTICS FUNCTIONS ====================

// Update statistics after game ends
function updateStatistics() {
    gameStatistics.gamesPlayed++;
    gameStatistics.totalScore += gameState.score;
    gameStatistics.totalCorrect += gameState.correctAnswers;
    gameStatistics.totalIncorrect += gameState.incorrectAnswers;
    gameStatistics.totalRounds += gameState.totalRounds;
    
    if (gameState.score > gameStatistics.bestScore) {
        gameStatistics.bestScore = gameState.score;
        playSound('achievement');
    }
    
    if (gameState.bestStreak > gameStatistics.bestStreak) {
        gameStatistics.bestStreak = gameState.bestStreak;
        playSound('achievement');
    }
    
    if (gameState.totalDistance > 0) {
        gameStatistics.totalDistance += gameState.totalDistance;
    }
    
    // Update achievement progress
    if (gameState.correctAnswers === 10) {
        achievements.progress.perfectRound = Math.max(achievements.progress.perfectRound, 10);
    }
    if (gameState.bestStreak >= 10) {
        achievements.progress.streakMaster = Math.max(achievements.progress.streakMaster, gameState.bestStreak);
    }
    if (gameState.distances.filter(d => d.distance < 50).length >= 5) {
        achievements.progress.precision = Math.max(achievements.progress.precision, 5);
    }
    if (gameState.correctAnswers > 0 && gameState.incorrectAnswers === 0) {
        achievements.progress.perfectionist = Math.max(achievements.progress.perfectionist, 10);
    }
    achievements.progress.scholar = gameStatistics.gamesPlayed;
    
    // Track continents for Globetrotter
    gameState.distances.forEach(d => {
        if (d.country) {
            const country = gameState.allCountries.find(c => c.name === d.country);
            if (country) {
                const continent = getContinent(country);
                if (continent) achievements.progress.globetrotter.add(continent);
            }
        }
    });
    
    saveStatistics();
    saveAchievements();
    updateStatsDisplay();
}

// Update statistics display in modal
function updateStatsDisplay() {
    document.getElementById('stat-games-played').textContent = gameStatistics.gamesPlayed;
    document.getElementById('stat-total-score').textContent = gameStatistics.totalScore;
    document.getElementById('stat-best-score').textContent = gameStatistics.bestScore;
    document.getElementById('stat-best-streak').textContent = gameStatistics.bestStreak;
    document.getElementById('stat-total-correct').textContent = gameStatistics.totalCorrect;
    document.getElementById('stat-total-incorrect').textContent = gameStatistics.totalIncorrect;
    
    const totalAnswers = gameStatistics.totalCorrect + gameStatistics.totalIncorrect;
    const accuracy = totalAnswers > 0 ? Math.round((gameStatistics.totalCorrect / totalAnswers) * 100) : 0;
    document.getElementById('stat-accuracy').textContent = `${accuracy}%`;
    
    const avgDistance = gameStatistics.totalRounds > 0 
        ? gameStatistics.totalDistance / gameStatistics.totalRounds 
        : 0;
    document.getElementById('stat-avg-distance').textContent = avgDistance > 0 ? formatDistance(avgDistance) : '-';
}

// Reset statistics
function resetStatistics() {
    if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
        gameStatistics = {
            gamesPlayed: 0,
            totalScore: 0,
            bestScore: 0,
            bestStreak: 0,
            totalCorrect: 0,
            totalIncorrect: 0,
            totalDistance: 0,
            totalRounds: 0,
            regionalStats: {},
            countryStats: {},
            filtersUsed: {}
        };
        saveStatistics();
        updateStatsDisplay();
        renderRegionalStats();
        renderCountryStats();
    }
}

// ==================== HINT SYSTEM ====================

// Country data cache for hints
let countryDataCache = {};

// Fetch additional country data for hints
async function fetchCountryData(countryCode) {
    if (countryDataCache[countryCode]) {
        return countryDataCache[countryCode];
    }
    
    try {
        const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        const country = Array.isArray(data) ? data[0] : data;
        
        const countryData = {
            continent: country.continents?.[0] || 'Unknown',
            capital: country.capital?.[0] || 'Unknown',
            population: country.population || 0,
            borders: country.borders || []
        };
        
        countryDataCache[countryCode] = countryData;
        return countryData;
    } catch (error) {
        console.error('Error fetching country data:', error);
        return {
            continent: 'Unknown',
            capital: 'Unknown',
            population: 0,
            borders: []
        };
    }
}

// Get hint text
async function getHint(hintType) {
    if (!gameState.currentCountry) return '';
    
    const countryCode = gameState.currentCountry.code.toUpperCase();
    const data = await fetchCountryData(countryCode);
    
    switch (hintType) {
        case 'continent':
            return `This country is in ${data.continent}`;
        case 'capital':
            return `The capital city is ${data.capital}`;
        case 'population':
            const pop = data.population;
            if (pop >= 100000000) return `Population: Over 100 million`;
            if (pop >= 10000000) return `Population: 10-100 million`;
            if (pop >= 1000000) return `Population: 1-10 million`;
            return `Population: Under 1 million`;
        case 'neighbors':
            if (data.borders.length === 0) return `This country has no land borders`;
            if (data.borders.length === 1) return `This country borders 1 country`;
            return `This country borders ${data.borders.length} countries`;
        default:
            return '';
    }
}

// Show hint
async function showHint(hintType) {
    if (gameState.hintsUsed.includes(hintType)) {
        return; // Already used this hint
    }
    
    // Deduct points
    const hintCost = 2;
    gameState.score = Math.max(0, gameState.score - hintCost);
    updateUI();
    
    // Mark hint as used
    gameState.hintsUsed.push(hintType);
    
    // Get and display hint
    const hintTextContent = await getHint(hintType);
    hintText.textContent = hintTextContent;
    hintDisplay.classList.remove('hidden');
    
    // Disable used hint button
    const hintButton = document.querySelector(`[data-hint="${hintType}"]`);
    if (hintButton) {
        hintButton.disabled = true;
    }
    
    playSound('correct'); // Use correct sound for hint reveal
}

// Reset hints for new round
function resetHints() {
    gameState.hintsUsed = [];
    hintDisplay.classList.add('hidden');
    hintText.textContent = '';
    hintOptions.forEach(btn => btn.disabled = false);
}

// ==================== ACHIEVEMENT SYSTEM ====================

// Achievement definitions
const achievementDefinitions = [
    {
        id: 'perfectRound',
        name: 'Perfect Round',
        description: 'Get all 10 correct in a game',
        icon: '⭐',
        check: () => gameState.correctAnswers === 10 && gameState.currentRound > gameState.totalRounds
    },
    {
        id: 'streakMaster',
        name: 'Streak Master',
        description: 'Achieve a 10+ streak',
        icon: '🔥',
        check: () => gameState.bestStreak >= 10
    },
    {
        id: 'globetrotter',
        name: 'Globetrotter',
        description: 'Play flags from all continents',
        icon: '🌍',
        check: () => {
            const continents = new Set();
            gameState.distances.forEach(d => {
                if (d.country) {
                    const country = gameState.allCountries.find(c => c.name === d.country);
                    if (country) {
                        const continent = getContinent(country);
                        if (continent) continents.add(continent);
                    }
                }
            });
            return continents.size >= 6; // All 6 continents
        }
    },
    {
        id: 'precision',
        name: 'Precision',
        description: 'Get within 50km on 5 guesses',
        icon: '🎯',
        check: () => {
            const closeGuesses = gameState.distances.filter(d => d.distance < 50).length;
            return closeGuesses >= 5;
        }
    },
    {
        id: 'explorer',
        name: 'Explorer',
        description: 'Try all filter categories',
        icon: '🗺️',
        check: () => Object.keys(gameStatistics.filtersUsed).length >= 10
    },
    {
        id: 'scholar',
        name: 'Scholar',
        description: 'Complete 100 games',
        icon: '📚',
        check: () => gameStatistics.gamesPlayed >= 100
    },
    {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: '100% accuracy in a game',
        icon: '💯',
        check: () => gameState.correctAnswers > 0 && gameState.incorrectAnswers === 0 && gameState.currentRound > gameState.totalRounds
    }
];

// Load achievements from localStorage
function loadAchievements() {
    const saved = localStorage.getItem('flagfinder-achievements');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            achievements = { ...achievements, ...parsed };
            // Convert Sets back from arrays
            if (parsed.progress) {
                if (parsed.progress.globetrotter) {
                    achievements.progress.globetrotter = new Set(parsed.progress.globetrotter);
                }
                if (parsed.progress.explorer) {
                    achievements.progress.explorer = new Set(parsed.progress.explorer);
                }
            }
        } catch (e) {
            console.error('Error loading achievements:', e);
        }
    }
}

// Save achievements to localStorage
function saveAchievements() {
    try {
        const toSave = {
            ...achievements,
            progress: {
                ...achievements.progress,
                globetrotter: Array.from(achievements.progress.globetrotter),
                explorer: Array.from(achievements.progress.explorer)
            }
        };
        localStorage.setItem('flagfinder-achievements', JSON.stringify(toSave));
    } catch (e) {
        console.error('Error saving achievements:', e);
    }
}

// Load game history from localStorage
function loadGameHistory() {
    const saved = localStorage.getItem('flagfinder-game-history');
    if (saved) {
        try {
            gameHistory = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading game history:', e);
            gameHistory = [];
        }
    } else {
        gameHistory = [];
    }
}

// Save game history to localStorage
function saveGameHistory() {
    try {
        localStorage.setItem('flagfinder-game-history', JSON.stringify(gameHistory));
    } catch (e) {
        console.error('Error saving game history:', e);
    }
}

// Load custom country sets from localStorage
function loadCustomSets() {
    const saved = localStorage.getItem('flagfinder-custom-sets');
    if (saved) {
        try {
            customCountrySets = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading custom sets:', e);
            customCountrySets = {};
        }
    } else {
        customCountrySets = {};
    }
}

// Save custom country sets to localStorage
function saveCustomSets() {
    try {
        localStorage.setItem('flagfinder-custom-sets', JSON.stringify(customCountrySets));
    } catch (e) {
        console.error('Error saving custom sets:', e);
    }
}

// Load map style from localStorage
function loadMapStyle() {
    const saved = localStorage.getItem('flagfinder-map-style');
    if (saved && mapStyles[saved]) {
        mapStyle = saved;
    } else {
        // Default to dark if saved style doesn't exist
        mapStyle = 'dark';
    }
}

// Save map style to localStorage
function saveMapStyle() {
    try {
        localStorage.setItem('flagfinder-map-style', mapStyle);
    } catch (e) {
        console.error('Error saving map style:', e);
    }
}

// Load level system from localStorage
function loadLevelSystem() {
    const saved = localStorage.getItem('flagfinder-level-system');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            playerLevel = data.level || 1;
            playerXP = data.xp || 0;
            xpToNextLevel = data.xpToNextLevel || 100;
        } catch (e) {
            console.error('Error loading level system:', e);
        }
    }
}

// Save level system to localStorage
function saveLevelSystem() {
    try {
        localStorage.setItem('flagfinder-level-system', JSON.stringify({
            level: playerLevel,
            xp: playerXP,
            xpToNextLevel: xpToNextLevel
        }));
    } catch (e) {
        console.error('Error saving level system:', e);
    }
}

// Load personal records from localStorage
function loadPersonalRecords() {
    const saved = localStorage.getItem('flagfinder-personal-records');
    if (saved) {
        try {
            personalRecords = { ...personalRecords, ...JSON.parse(saved) };
        } catch (e) {
            console.error('Error loading personal records:', e);
        }
    }
}

// Save personal records to localStorage
function savePersonalRecords() {
    try {
        localStorage.setItem('flagfinder-personal-records', JSON.stringify(personalRecords));
    } catch (e) {
        console.error('Error saving personal records:', e);
    }
}

// Load difficulty from localStorage
function loadDifficulty() {
    const saved = localStorage.getItem('flagfinder-difficulty');
    if (saved) {
        currentDifficulty = saved;
    }
}

// Save difficulty to localStorage
function saveDifficulty() {
    try {
        localStorage.setItem('flagfinder-difficulty', currentDifficulty);
    } catch (e) {
        console.error('Error saving difficulty:', e);
    }
}

// Load font size from localStorage
function loadFontSize() {
    const saved = localStorage.getItem('flagfinder-font-size');
    if (saved && fontSizeSelect) {
        fontSizeSelect.value = saved;
        applyFontSize(saved);
    }
}

// Save font size to localStorage
function saveFontSize() {
    try {
        if (fontSizeSelect) {
            localStorage.setItem('flagfinder-font-size', fontSizeSelect.value);
        }
    } catch (e) {
        console.error('Error saving font size:', e);
    }
}

// Load country labels setting from localStorage
function loadCountryLabelsSetting() {
    const saved = localStorage.getItem('flagfinder-country-labels');
    if (saved === 'true' && countryLabelsToggle) {
        countryLabelsToggle.checked = true;
        showCountryLabels = true;
    }
}

// Save country labels setting to localStorage
function saveCountryLabelsSetting() {
    try {
        localStorage.setItem('flagfinder-country-labels', showCountryLabels.toString());
    } catch (e) {
        console.error('Error saving country labels setting:', e);
    }
}

// Check and unlock achievements
function checkAchievements() {
    achievementDefinitions.forEach(achievement => {
        if (!achievements[achievement.id] && achievement.check()) {
            achievements[achievement.id] = true;
            playSound('achievement');
            showAchievementUnlock(achievement);
            saveAchievements();
        }
    });
}

// Show achievement unlock notification
function showAchievementUnlock(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-notification-content">
            <span class="achievement-notification-icon">${achievement.icon}</span>
            <div>
                <div class="achievement-notification-title">Achievement Unlocked!</div>
                <div class="achievement-notification-name">${achievement.name}</div>
            </div>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Render achievements
function renderAchievements() {
    if (!achievementsGrid) return;
    
    achievementsGrid.innerHTML = '';
    
    achievementDefinitions.forEach(achievement => {
        const card = document.createElement('div');
        card.className = `achievement-card ${achievements[achievement.id] ? 'unlocked' : 'locked'}`;
        
        const progress = getAchievementProgress(achievement.id);
        const progressText = progress > 0 ? `${progress}%` : '';
        
        card.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-description">${achievement.description}</div>
            ${progressText ? `<div class="achievement-progress">${progressText}</div>` : ''}
        `;
        
        achievementsGrid.appendChild(card);
    });
}

// Get achievement progress percentage
function getAchievementProgress(achievementId) {
    switch (achievementId) {
        case 'perfectRound':
            return Math.min(100, Math.round((achievements.progress.perfectRound / 10) * 100));
        case 'streakMaster':
            return Math.min(100, Math.round((achievements.progress.streakMaster / 10) * 100));
        case 'globetrotter':
            return Math.min(100, Math.round((achievements.progress.globetrotter.size / 6) * 100));
        case 'precision':
            return Math.min(100, Math.round((achievements.progress.precision / 5) * 100));
        case 'explorer':
            return Math.min(100, Math.round((achievements.progress.explorer.size / 10) * 100));
        case 'scholar':
            return Math.min(100, Math.round((achievements.progress.scholar / 100) * 100));
        case 'perfectionist':
            return Math.min(100, Math.round((achievements.progress.perfectionist / 10) * 100));
        default:
            return 0;
    }
}

// Get continent for a country
function getContinent(country) {
    const lat = country.latlng[0];
    const lng = country.latlng[1];
    
    if (lat >= -35 && lat <= 37 && lng >= -18 && lng <= 52) return 'Africa';
    if (lat >= -10 && lat <= 81 && lng >= 25 && lng <= 180) return 'Asia';
    if (lat >= 35 && lat <= 72 && lng >= -25 && lng <= 45) return 'Europe';
    if (lng >= -180 && lng <= -30) return 'Americas';
    if (lat >= -50 && lat <= -10 && lng >= 110 && lng <= 180) return 'Oceania';
    return null;
}

// ==================== GAME MODE SYSTEM ====================

// Set game mode
function setGameMode(mode) {
    currentGameMode = mode;
    const modeLabels = {
        classic: 'Classic',
        practice: 'Practice',
        daily: 'Daily',
        time: 'Time Challenge',
        endless: 'Endless',
        blitz: 'Blitz'
    };
    if (gameModeLabel) {
        gameModeLabel.textContent = modeLabels[mode] || 'Classic';
    }
    
    // Show/hide timer for time challenge and blitz modes
    if (timerStatItem) {
        timerStatItem.classList.toggle('hidden', mode !== 'time' && mode !== 'blitz');
    }
    
    // Save mode preference
    gameSettings.gameMode = mode;
    saveSettings();
    
    // Restart game with new mode
    restartGame();
}

// ==================== DAILY CHALLENGE SYSTEM ====================

// Generate daily challenge countries
function generateDailyChallenge() {
    if (!gameState.allCountries || gameState.allCountries.length === 0) return;
    
    const today = new Date().toDateString();
    
    // Check if we already have today's challenge
    const saved = localStorage.getItem('flagfinder-daily-challenge');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.date === today && data.countries) {
                dailyChallengeDate = data.date;
                dailyChallengeCountries = data.countries;
                return;
            }
        } catch (e) {
            console.error('Error loading daily challenge:', e);
        }
    }
    
    // Generate new challenge for today using date-based seed
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Simple seeded shuffle
    const shuffled = [...gameState.allCountries];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor((seed + i) % (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    dailyChallengeCountries = shuffled.slice(0, 10).map(c => ({ name: c.name, code: c.code }));
    dailyChallengeDate = today;
    
    // Save daily challenge
    localStorage.setItem('flagfinder-daily-challenge', JSON.stringify({
        date: today,
        countries: dailyChallengeCountries
    }));
}

// ==================== PRACTICE MODE ====================

// Practice mode: show answer immediately
function showPracticeAnswer() {
    if (currentGameMode !== 'practice' || !gameState.currentCountry) return;
    
    // Show country name immediately in practice mode
    const instruction = document.querySelector('.flag-instruction');
    if (instruction) {
        instruction.textContent = `This is the flag of ${gameState.currentCountry.name}`;
    }
}

// ==================== ENHANCED STATISTICS ====================

// Update regional statistics
function updateRegionalStats(country, isCorrect) {
    const continent = getContinent(country);
    if (!continent) return;
    
    if (!gameStatistics.regionalStats[continent]) {
        gameStatistics.regionalStats[continent] = { correct: 0, incorrect: 0, attempts: 0 };
    }
    
    gameStatistics.regionalStats[continent].attempts++;
    if (isCorrect) {
        gameStatistics.regionalStats[continent].correct++;
    } else {
        gameStatistics.regionalStats[continent].incorrect++;
    }
}

// Update country statistics
function updateCountryStats(country, isCorrect, distance) {
    const code = country.code;
    
    if (!gameStatistics.countryStats[code]) {
        gameStatistics.countryStats[code] = { correct: 0, incorrect: 0, attempts: 0, totalDistance: 0 };
    }
    
    gameStatistics.countryStats[code].attempts++;
    gameStatistics.countryStats[code].totalDistance += distance;
    
    if (isCorrect) {
        gameStatistics.countryStats[code].correct++;
    } else {
        gameStatistics.countryStats[code].incorrect++;
    }
}

// Render regional statistics
function renderRegionalStats() {
    if (!regionalStatsList) return;
    
    regionalStatsList.innerHTML = '';
    
    const regions = Object.keys(gameStatistics.regionalStats).sort();
    
    if (regions.length === 0) {
        regionalStatsList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No regional statistics yet. Play some games to see your performance by region!</p>';
        return;
    }
    
    regions.forEach(region => {
        const stats = gameStatistics.regionalStats[region];
        const accuracy = stats.attempts > 0 
            ? Math.round((stats.correct / stats.attempts) * 100) 
            : 0;
        
        const item = document.createElement('div');
        item.className = 'regional-stat-item';
        item.innerHTML = `
            <div class="regional-stat-name">${region}</div>
            <div class="regional-stat-details">
                <span>Attempts: <span class="regional-stat-value">${stats.attempts}</span></span>
                <span>Correct: <span class="regional-stat-value">${stats.correct}</span></span>
                <span>Accuracy: <span class="regional-stat-value">${accuracy}%</span></span>
            </div>
        `;
        regionalStatsList.appendChild(item);
    });
}

// Render country statistics
function renderCountryStats() {
    if (!countryStatsList) return;
    
    const searchTerm = countrySearchInput ? countrySearchInput.value.toLowerCase() : '';
    const sortBy = countrySortSelect ? countrySortSelect.value : 'name';
    
    let countries = Object.keys(gameStatistics.countryStats).map(code => {
        const stats = gameStatistics.countryStats[code];
        const country = gameState.allCountries.find(c => c.code === code);
        return {
            code,
            name: country ? country.name : code,
            ...stats,
            accuracy: stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0,
            avgDistance: stats.attempts > 0 ? stats.totalDistance / stats.attempts : 0
        };
    });
    
    // Filter by search term
    if (searchTerm) {
        countries = countries.filter(c => c.name.toLowerCase().includes(searchTerm));
    }
    
    // Sort
    countries.sort((a, b) => {
        switch (sortBy) {
            case 'accuracy':
                return b.accuracy - a.accuracy;
            case 'attempts':
                return b.attempts - a.attempts;
            default:
                return a.name.localeCompare(b.name);
        }
    });
    
    countryStatsList.innerHTML = '';
    
    if (countries.length === 0) {
        countryStatsList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No country statistics yet. Play some games to see your performance by country!</p>';
        return;
    }
    
    countries.forEach(country => {
        const item = document.createElement('div');
        item.className = 'country-stat-item';
        item.innerHTML = `
            <div class="country-stat-name">${country.name}</div>
            <div class="country-stat-info">
                <span>Attempts: ${country.attempts}</span>
                <span>Correct: ${country.correct}</span>
                <span class="country-stat-accuracy">${country.accuracy}%</span>
            </div>
        `;
        countryStatsList.appendChild(item);
    });
}

// ==================== TUTORIAL SYSTEM ====================

// Show tutorial
function showTutorial() {
    const hasSeenTutorial = localStorage.getItem('flagfinder-tutorial-seen');
    if (!hasSeenTutorial && tutorialOverlay) {
        tutorialOverlay.classList.remove('hidden');
    }
}

// Hide tutorial
function hideTutorial() {
    if (tutorialOverlay) {
        tutorialOverlay.classList.add('hidden');
        localStorage.setItem('flagfinder-tutorial-seen', 'true');
    }
}

// Initialize tutorial navigation
function initializeTutorial() {
    if (!tutorialOverlay) return;
    
    let currentSlide = 1;
    const totalSlides = 4;
    
    const showSlide = (slideNum) => {
        document.querySelectorAll('.tutorial-slide').forEach((slide, index) => {
            slide.classList.toggle('hidden', index + 1 !== slideNum);
        });
    };
    
    document.getElementById('tutorial-next')?.addEventListener('click', () => {
        currentSlide = Math.min(totalSlides, currentSlide + 1);
        showSlide(currentSlide);
    });
    
    document.getElementById('tutorial-next-2')?.addEventListener('click', () => {
        currentSlide = Math.min(totalSlides, currentSlide + 1);
        showSlide(currentSlide);
    });
    
    document.getElementById('tutorial-next-3')?.addEventListener('click', () => {
        currentSlide = Math.min(totalSlides, currentSlide + 1);
        showSlide(currentSlide);
    });
    
    document.getElementById('tutorial-prev-2')?.addEventListener('click', () => {
        currentSlide = Math.max(1, currentSlide - 1);
        showSlide(currentSlide);
    });
    
    document.getElementById('tutorial-prev-3')?.addEventListener('click', () => {
        currentSlide = Math.max(1, currentSlide - 1);
        showSlide(currentSlide);
    });
    
    document.getElementById('tutorial-prev-4')?.addEventListener('click', () => {
        currentSlide = Math.max(1, currentSlide - 1);
        showSlide(currentSlide);
    });
    
    document.getElementById('tutorial-skip')?.addEventListener('click', hideTutorial);
    document.getElementById('tutorial-finish')?.addEventListener('click', hideTutorial);
}

// ==================== INITIALIZE SYSTEMS ====================

// Initialize statistics and settings
function initializeDataSystems() {
    loadStatistics();
    loadSettings();
    loadAchievements();
    loadGameHistory();
    loadCustomSets();
    loadMapStyle();
    loadLevelSystem();
    loadPersonalRecords();
    loadDifficulty();
    loadFontSize();
    loadCountryLabelsSetting();
    
    // Dark mode is now default, but check system preference if no settings saved
    if (!localStorage.getItem('flagfinder-settings')) {
        // Default to dark mode, but can be overridden by system preference if user prefers
        gameSettings.darkMode = true;
    }
    
    // Apply all settings (including header spacing)
    applySettings();
    
    // Load game mode preference
    if (gameSettings.gameMode) {
        currentGameMode = gameSettings.gameMode;
        const modeLabels = {
            classic: 'Classic',
            practice: 'Practice',
            daily: 'Daily',
            time: 'Time Challenge',
            endless: 'Endless'
        };
        if (gameModeLabel) {
            gameModeLabel.textContent = modeLabels[currentGameMode] || 'Classic';
        }
    }
    
    // Apply map style
    // Map style label removed (now in settings)
    
    // Apply difficulty
    if (currentDifficulty !== 'all') {
        setDifficulty(currentDifficulty);
    }
    
    // Update level display
    updateLevelDisplay();
    
    // Render personal records
    renderPersonalRecords();
    
    // Apply country labels if enabled
    if (showCountryLabels) {
        setTimeout(() => toggleCountryLabels(true), 1000); // Wait for map to initialize
    }
}

// Initialize settings modal
function initializeSettings() {
    if (!settingsButton || !settingsModal) return;
    
    settingsButton.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
        addPreDownloadToSettings();
    });
    
    if (closeSettingsButton) {
        closeSettingsButton.addEventListener('click', () => {
            settingsModal.classList.add('hidden');
        });
    }
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', (e) => {
            gameSettings.darkMode = e.target.checked;
            applySettings();
            saveSettings();
        });
    }
    
    if (soundEffectsToggle) {
        soundEffectsToggle.addEventListener('change', (e) => {
            gameSettings.soundEffects = e.target.checked;
            saveSettings();
        });
    }
    
    if (musicToggle) {
        musicToggle.addEventListener('change', (e) => {
            gameSettings.music = e.target.checked;
            saveSettings();
        });
    }
    
    if (masterVolumeSlider) {
        masterVolumeSlider.addEventListener('input', (e) => {
            gameSettings.masterVolume = parseInt(e.target.value);
            saveSettings();
        });
    }
    
    // Header spacing
    const headerSpacingSelect = document.getElementById('header-spacing');
    if (headerSpacingSelect) {
        headerSpacingSelect.value = gameSettings.headerSpacing || 'default';
        headerSpacingSelect.addEventListener('change', (e) => {
            gameSettings.headerSpacing = e.target.value;
            applySettings();
            saveSettings();
        });
    }
    
    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && settingsModal && !settingsModal.classList.contains('hidden')) {
            settingsModal.classList.add('hidden');
        }
    });
}

// Initialize statistics modal
function initializeStatistics() {
    if (!statsButton || !statsModal) return;
    
    statsButton.addEventListener('click', () => {
        updateStatsDisplay();
        renderRegionalStats();
        renderCountryStats();
        renderGameHistory();
        renderPersonalRecords();
        statsModal.classList.remove('hidden');
    });
    
    if (closeStatsButton) {
        closeStatsButton.addEventListener('click', () => {
            statsModal.classList.add('hidden');
        });
    }
    
    if (resetStatsButton) {
        resetStatsButton.addEventListener('click', () => {
            resetStatistics();
        });
    }
    
    // Statistics tabs
    if (statTabs && statTabs.length > 0) {
        statTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                
                // Update active tab
                statTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update active content
                statsTabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `stats-${tabName}`) {
                        content.classList.add('active');
                        if (tabName === 'regional') {
                            renderRegionalStats();
                        } else if (tabName === 'countries') {
                            renderCountryStats();
                        } else if (tabName === 'history') {
                            renderGameHistory();
                        } else if (tabName === 'records') {
                            renderPersonalRecords();
                        }
                    }
                });
            });
        });
    }
    
    // Country search and sort
    if (countrySearchInput) {
        countrySearchInput.addEventListener('input', renderCountryStats);
    }
    if (countrySortSelect) {
        countrySortSelect.addEventListener('change', renderCountryStats);
    }
    
    // History tab
    if (historyFilter) {
        historyFilter.addEventListener('change', renderGameHistory);
    }
    
    if (exportHistoryButton) {
        exportHistoryButton.addEventListener('click', exportGameHistory);
    }
    
    // Country info modal
    if (closeCountryInfoButton) {
        closeCountryInfoButton.addEventListener('click', () => {
            if (countryInfoModal) {
                countryInfoModal.classList.add('hidden');
            }
        });
    }
    
    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && statsModal && !statsModal.classList.contains('hidden')) {
            statsModal.classList.add('hidden');
        }
    });
}

// Initialize hint system
function initializeHints() {
    if (!hintButton || !hintModal) return;
    
    hintButton.addEventListener('click', () => {
        if (!gameState.currentCountry || !gameState.isWaitingForClick) return;
        hintModal.classList.remove('hidden');
        resetHints(); // Reset hints for current round
    });
    
    if (closeHintButton) {
        closeHintButton.addEventListener('click', () => {
            hintModal.classList.add('hidden');
        });
    }
    
    if (hintOptions && hintOptions.length > 0) {
        hintOptions.forEach(option => {
            option.addEventListener('click', async () => {
                const hintType = option.dataset.hint;
                await showHint(hintType);
            });
        });
    }
    
    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && hintModal && !hintModal.classList.contains('hidden')) {
            hintModal.classList.add('hidden');
        }
    });
}

// Initialize game mode system
function initializeGameMode() {
    if (!gameModeButton || !gameModeModal) return;
    
    gameModeButton.addEventListener('click', () => {
        gameModeModal.classList.remove('hidden');
    });
    
    if (closeGameModeButton) {
        closeGameModeButton.addEventListener('click', () => {
            gameModeModal.classList.add('hidden');
        });
    }
    
    if (gameModeOptions && gameModeOptions.length > 0) {
        gameModeOptions.forEach(option => {
            option.addEventListener('click', () => {
                const mode = option.dataset.mode;
                setGameMode(mode);
                gameModeModal.classList.add('hidden');
            });
        });
    }
}

// Initialize achievements
function initializeAchievements() {
    if (!achievementsButton || !achievementsModal) return;
    
    achievementsButton.addEventListener('click', () => {
        renderAchievements();
        achievementsModal.classList.remove('hidden');
    });
    
    if (closeAchievementsButton) {
        closeAchievementsButton.addEventListener('click', () => {
            achievementsModal.classList.add('hidden');
        });
    }
}

// Initialize daily challenge
function initializeDailyChallenge() {
    if (!dailyChallengeButton) return;
    
    dailyChallengeButton.addEventListener('click', () => {
        setGameMode('daily');
    });
    
    // Check if daily challenge is available
    const today = new Date().toDateString();
    const saved = localStorage.getItem('flagfinder-daily-challenge');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.date === today) {
                dailyChallengeButton.classList.add('active');
            }
        } catch (e) {
            // Ignore
        }
    }
}

// ==================== TIME CHALLENGE MODE ====================

// Start timer for time challenge mode
function startTimer() {
    if (currentGameMode !== 'time') return;
    
    timeRemaining = 4;
    if (timerElement) {
        timerElement.textContent = `${timeRemaining}s`;
        timerElement.classList.remove('warning');
    }
    
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        if (timerElement) {
            timerElement.textContent = `${timeRemaining}s`;
            if (timeRemaining <= 1) {
                timerElement.classList.add('warning');
            } else {
                timerElement.classList.remove('warning');
            }
        }
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            // Time's up - mark as incorrect
            if (gameState.isWaitingForClick) {
                handleTimeUp();
            }
        }
    }, 1000);
}

// Stop timer
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Handle time up
function handleTimeUp() {
    stopTimer();
    gameState.isWaitingForClick = false;
    
    // Safety check for currentCountry
    if (!gameState.currentCountry || !gameState.currentCountry.latlng || !Array.isArray(gameState.currentCountry.latlng) || gameState.currentCountry.latlng.length < 2) {
        console.error('handleTimeUp: currentCountry or latlng is invalid');
        nextRound();
        return;
    }
    
    const distance = calculateDistance(
        gameState.currentCountry.latlng[0],
        gameState.currentCountry.latlng[1],
        gameState.currentCountry.latlng[0],
        gameState.currentCountry.latlng[1]
    );
    showFeedback(false, distance, gameState.currentCountry.name || 'Unknown');
    gameState.score = Math.max(0, gameState.score - 5); // Penalty for time up
    gameState.incorrectAnswers++;
    gameState.streak = 0;
    updateUI();
    
    setTimeout(() => {
        if (currentGameMode === 'endless') {
            endGame();
        } else {
            nextRound();
        }
    }, 2000);
}

// ==================== BLITZ MODE ====================

// Start blitz timer (60 seconds)
function startBlitzTimer() {
    if (currentGameMode !== 'blitz') return;
    
    blitzTimeRemaining = 60;
    if (timerElement) {
        timerElement.textContent = `${blitzTimeRemaining}s`;
        timerElement.classList.remove('warning');
    }
    
    if (blitzTimerInterval) {
        clearInterval(blitzTimerInterval);
    }
    
    blitzTimerInterval = setInterval(() => {
        blitzTimeRemaining--;
        if (timerElement) {
            timerElement.textContent = `${blitzTimeRemaining}s`;
            if (blitzTimeRemaining <= 10) {
                timerElement.classList.add('warning');
            } else {
                timerElement.classList.remove('warning');
            }
        }
        
        if (blitzTimeRemaining <= 0) {
            clearInterval(blitzTimerInterval);
            blitzTimerInterval = null;
            // Time's up - end blitz game
            endBlitzGame();
        }
    }, 1000);
}

// Stop blitz timer
function stopBlitzTimer() {
    if (blitzTimerInterval) {
        clearInterval(blitzTimerInterval);
        blitzTimerInterval = null;
    }
}

// End blitz game
function endBlitzGame() {
    stopBlitzTimer();
    gameState.isWaitingForClick = false;
    
    // Show final score
    const finalScore = gameState.score;
    const flagsGuessed = gameState.correctAnswers + gameState.incorrectAnswers;
    const accuracy = flagsGuessed > 0 ? Math.round((gameState.correctAnswers / flagsGuessed) * 100) : 0;
    
    showFeedback(true, `Blitz Complete!`, `Score: ${finalScore} | Flags: ${flagsGuessed} | Accuracy: ${accuracy}%`);
    
    // Update statistics
    updateStatistics();
    checkAchievements();
    addGameToHistory();
    
    // Update leaderboard
    updateLeaderboard('blitz', {
        score: finalScore,
        flags: flagsGuessed,
        accuracy: accuracy,
        date: new Date().toISOString()
    });
    
    // Show game over modal after a delay
    setTimeout(() => {
        showGameOverModal();
    }, 2000);
}

// ==================== ENDLESS MODE ====================

// Check if game should continue in endless mode
function shouldContinueEndless() {
    return currentGameMode === 'endless' && gameState.streak > 0;
}

// ==================== COUNTRY INFORMATION CARDS ====================

// Show country info card after each round (integrated into flag container)
function showCountryInfoCard(country, isCorrect, distance) {
    // Get the integrated country info card element
    const infoCard = document.getElementById('country-info-card-integrated');
    if (!infoCard) return;
    
    // Get country data (handle both array and string formats for capital)
    const capital = country.capital 
        ? (Array.isArray(country.capital) && country.capital[0] ? country.capital[0] : country.capital)
        : 'N/A';
    const population = country.population ? formatNumber(country.population) : 'N/A';
    const area = country.area ? `${formatNumber(Math.round(country.area))} km²` : 'N/A';
    const region = country.region || country.subregion || 'N/A';
    
    // Build card HTML
    infoCard.innerHTML = `
        <div class="info-card-integrated-content">
            <div class="info-card-integrated-header">
                <span class="info-card-status ${isCorrect ? 'correct' : 'incorrect'}">${isCorrect ? '✓' : '✗'}</span>
                <h4>${country.name}</h4>
            </div>
            <div class="info-card-integrated-body">
                <div class="info-card-row-compact">
                    <span class="info-label">Capital:</span>
                    <span class="info-value">${capital}</span>
                </div>
                <div class="info-card-row-compact">
                    <span class="info-label">Population:</span>
                    <span class="info-value">${population}</span>
                </div>
                <div class="info-card-row-compact">
                    <span class="info-label">Area:</span>
                    <span class="info-value">${area}</span>
                </div>
                <div class="info-card-row-compact">
                    <span class="info-label">Region:</span>
                    <span class="info-value">${region}</span>
                </div>
                ${distance !== undefined ? `
                <div class="info-card-row-compact">
                    <span class="info-label">Distance:</span>
                    <span class="info-value ${isCorrect ? 'correct' : 'incorrect'}">${formatDistance(distance)}</span>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // Show card with animation
    infoCard.classList.remove('hidden');
    
    // Auto-hide after delay (shorter for blitz mode)
    const hideDelay = currentGameMode === 'blitz' ? 1200 : 3000;
    setTimeout(() => {
        if (infoCard && !infoCard.classList.contains('hidden')) {
            infoCard.classList.add('hidden');
        }
    }, hideDelay);
}

// ==================== LEADERBOARD SYSTEM ====================

// Leaderboard data structure
let leaderboards = {
    blitz: [], // { score, flags, accuracy, date, playerName }
    classic: [], // { score, accuracy, date, playerName }
    daily: [], // { score, accuracy, date, playerName }
    time: [] // { score, accuracy, date, playerName }
};

// Load leaderboards from localStorage
function loadLeaderboards() {
    try {
        const saved = localStorage.getItem('flagfinder-leaderboards');
        if (saved) {
            leaderboards = JSON.parse(saved);
            // Convert date strings back to Date objects if needed
            Object.keys(leaderboards).forEach(mode => {
                if (Array.isArray(leaderboards[mode])) {
                    leaderboards[mode] = leaderboards[mode].map(entry => ({
                        ...entry,
                        date: new Date(entry.date)
                    }));
                }
            });
        }
    } catch (e) {
        console.error('Error loading leaderboards:', e);
        leaderboards = {
            blitz: [],
            classic: [],
            daily: [],
            time: []
        };
    }
}

// Save leaderboards to localStorage
function saveLeaderboards() {
    try {
        localStorage.setItem('flagfinder-leaderboards', JSON.stringify(leaderboards));
    } catch (e) {
        console.error('Error saving leaderboards:', e);
    }
}

// Update leaderboard for a game mode
function updateLeaderboard(mode, entry) {
    if (!leaderboards[mode]) {
        leaderboards[mode] = [];
    }
    
    // Get player name (use stored name or default)
    const playerName = localStorage.getItem('flagfinder-player-name') || 'Player';
    
    // Add entry
    leaderboards[mode].push({
        ...entry,
        playerName: playerName,
        date: new Date()
    });
    
    // Sort by score (descending)
    leaderboards[mode].sort((a, b) => b.score - a.score);
    
    // Keep only top 100 entries
    leaderboards[mode] = leaderboards[mode].slice(0, 100);
    
    saveLeaderboards();
}

// Get top scores for a mode
function getTopScores(mode, limit = 10) {
    if (!leaderboards[mode]) {
        return [];
    }
    return leaderboards[mode].slice(0, limit);
}

// Show country information card (detailed modal)
async function showCountryInfo(country) {
    if (!countryInfoModal || !countryInfoContent) return;
    
    try {
        const countryData = await fetchCountryDataEnhanced(country.code);
        
        countryInfoContent.innerHTML = `
            <img src="${country.flag}" alt="${country.name} flag" class="country-info-flag">
            <div class="country-info-section">
                <h3>Basic Information</h3>
                <div class="country-info-item">
                    <span class="country-info-label">Country:</span>
                    <span class="country-info-value">${country.name}</span>
                </div>
                ${countryData.capital ? `
                <div class="country-info-item">
                    <span class="country-info-label">Capital:</span>
                    <span class="country-info-value">${countryData.capital}</span>
                </div>
                ` : ''}
                ${countryData.population ? `
                <div class="country-info-item">
                    <span class="country-info-label">Population:</span>
                    <span class="country-info-value">${formatPopulation(countryData.population)}</span>
                </div>
                ` : ''}
                ${countryData.continent ? `
                <div class="country-info-item">
                    <span class="country-info-label">Continent:</span>
                    <span class="country-info-value">${countryData.continent}</span>
                </div>
                ` : ''}
            </div>
            ${countryData.languages ? `
            <div class="country-info-section">
                <h3>Languages</h3>
                <div class="country-info-item">
                    <span class="country-info-value">${countryData.languages}</span>
                </div>
            </div>
            ` : ''}
            ${countryData.currency ? `
            <div class="country-info-section">
                <h3>Currency</h3>
                <div class="country-info-item">
                    <span class="country-info-value">${countryData.currency}</span>
                </div>
            </div>
            ` : ''}
            ${countryData.borders ? `
            <div class="country-info-section">
                <h3>Bordering Countries</h3>
                <div class="country-info-item">
                    <span class="country-info-value">${countryData.borders}</span>
                </div>
            </div>
            ` : ''}
        `;
        
        countryInfoModal.classList.remove('hidden');
    } catch (error) {
        console.error('Error fetching country info:', error);
    }
}

// Format population number
function formatPopulation(pop) {
    if (pop >= 1000000000) return `${(pop / 1000000000).toFixed(1)}B`;
    if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`;
    if (pop >= 1000) return `${(pop / 1000).toFixed(1)}K`;
    return pop.toString();
}

// Enhanced fetchCountryData to include more info
async function fetchCountryDataEnhanced(countryCode) {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        const country = data[0];
        
        return {
            capital: country.capital ? country.capital[0] : null,
            population: country.population || null,
            continent: country.continents ? country.continents[0] : null,
            languages: country.languages ? Object.values(country.languages).join(', ') : null,
            currency: country.currencies ? Object.values(country.currencies)[0].name : null,
            borders: country.borders ? country.borders.length + ' countries' : null
        };
    } catch (error) {
        console.error('Error fetching enhanced country data:', error);
        return {};
    }
}

// ==================== QUIZ VARIATIONS ====================

// Set quiz type
function setQuizType(type) {
    currentQuizType = type;
    
    // Show/hide UI elements based on quiz type
    if (quizModeButton) {
        quizModeButton.classList.toggle('hidden', type === 'map');
    }
    
    if (multipleChoiceContainer) {
        multipleChoiceContainer.classList.toggle('hidden', type !== 'multiple');
    }
    
    if (quizModeSelection) {
        quizModeSelection.classList.add('hidden');
    }
    
    // Update quiz option active state
    quizOptions.forEach(opt => {
        opt.classList.toggle('active', opt.dataset.quiz === type);
    });
    
    // Restart round with new quiz type
    if (gameState.currentCountry) {
        startRound();
    }
}

// Generate multiple choice options
function generateMultipleChoice() {
    if (!gameState.currentCountry || !choiceOptions) return;
    
    const correctCountry = gameState.currentCountry;
    const allCountries = [...gameState.filteredCountries.length > 0 ? gameState.filteredCountries : gameState.allCountries];
    
    // Remove correct country from pool
    const pool = allCountries.filter(c => c.code !== correctCountry.code);
    
    // Shuffle and pick 3 random countries
    const shuffled = pool.sort(() => Math.random() - 0.5);
    const wrongAnswers = shuffled.slice(0, 3);
    
    // Combine correct answer with wrong answers and shuffle
    const allOptions = [correctCountry, ...wrongAnswers].sort(() => Math.random() - 0.5);
    
    // Update choice buttons
    choiceOptions.forEach((button, index) => {
        if (allOptions[index]) {
            button.textContent = allOptions[index].name;
            button.dataset.countryCode = allOptions[index].code;
            button.classList.remove('correct', 'incorrect');
            button.disabled = false;
        }
    });
}

// Handle multiple choice answer
function handleMultipleChoiceAnswer(countryCode) {
    const isCorrect = countryCode === gameState.currentCountry.code;
    
    // Disable all buttons
    choiceOptions.forEach(button => {
        button.disabled = true;
        if (button.dataset.countryCode === countryCode) {
            button.classList.add(isCorrect ? 'correct' : 'incorrect');
        }
        if (button.dataset.countryCode === gameState.currentCountry.code && !isCorrect) {
            button.classList.add('correct');
        }
    });
    
    if (isCorrect) {
        const distance = 0; // Perfect for multiple choice
        showFeedback(true, distance, gameState.currentCountry.name);
        gameState.score += 10;
        gameState.correctAnswers++;
        gameState.streak++;
        playSound('correct');
    } else {
        showFeedback(false, Infinity, gameState.currentCountry.name);
        gameState.score = Math.max(0, gameState.score - 5);
        gameState.incorrectAnswers++;
        gameState.streak = 0;
        playSound('incorrect');
    }
    
    updateUI();
    
    setTimeout(() => {
        if (currentGameMode === 'endless' && !isCorrect) {
            endGame();
        } else if (currentGameMode !== 'endless') {
            nextRound();
        } else {
            nextRound();
        }
    }, 2000);
}

// ==================== GAME HISTORY ====================

// Add game to history
function addGameToHistory() {
    const gameRecord = {
        id: Date.now(),
        date: new Date().toISOString(),
        mode: currentGameMode,
        score: gameState.score,
        correct: gameState.correctAnswers,
        incorrect: gameState.incorrectAnswers,
        rounds: gameState.currentRound - 1,
        streak: Math.max(...(gameState.distances.map(d => d.streak || 0).concat([0]))),
        accuracy: gameState.correctAnswers + gameState.incorrectAnswers > 0 
            ? Math.round((gameState.correctAnswers / (gameState.correctAnswers + gameState.incorrectAnswers)) * 100) 
            : 0,
        averageDistance: gameState.distances.length > 0 
            ? Math.round(gameState.distances.reduce((sum, d) => sum + d.distance, 0) / gameState.distances.length) 
            : 0
    };
    
    gameHistory.unshift(gameRecord);
    
    // Keep only last 100 games
    if (gameHistory.length > 100) {
        gameHistory = gameHistory.slice(0, 100);
    }
    
    saveGameHistory();
}

// Render game history
function renderGameHistory() {
    if (!gameHistoryList) return;
    
    const filter = historyFilter ? historyFilter.value : 'all';
    let filteredHistory = gameHistory;
    
    if (filter !== 'all') {
        filteredHistory = gameHistory.filter(game => game.mode === filter);
    }
    
    gameHistoryList.innerHTML = '';
    
    if (filteredHistory.length === 0) {
        gameHistoryList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No game history yet. Play some games to see your history!</p>';
        return;
    }
    
    filteredHistory.forEach(game => {
        const item = document.createElement('div');
        item.className = 'game-history-item';
        const date = new Date(game.date);
        item.innerHTML = `
            <div>
                <div class="game-history-date">${date.toLocaleDateString()} ${date.toLocaleTimeString()}</div>
                <div class="game-history-details">
                    <span>Mode: ${game.mode}</span>
                    <span>Rounds: ${game.rounds}</span>
                    <span>Accuracy: ${game.accuracy}%</span>
                </div>
            </div>
            <div class="game-history-score">${game.score} pts</div>
        `;
        gameHistoryList.appendChild(item);
    });
}

// Export game history
function exportGameHistory() {
    const dataStr = JSON.stringify(gameHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flagfinder-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// ==================== CUSTOM COUNTRY SETS ====================

// Render custom sets list
function renderCustomSets() {
    if (!customSetsList) return;
    
    customSetsList.innerHTML = '';
    
    const sets = Object.keys(customCountrySets);
    if (sets.length === 0) {
        customSetsList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No custom sets yet. Create one to get started!</p>';
        return;
    }
    
    sets.forEach(setId => {
        const set = customCountrySets[setId];
        const item = document.createElement('div');
        item.className = 'custom-set-item';
        item.innerHTML = `
            <div>
                <div class="custom-set-name">${set.name}</div>
                <div class="custom-set-count">${set.countries.length} countries</div>
            </div>
            <div class="custom-set-actions">
                <button class="custom-set-action-button" data-action="use" data-set-id="${setId}">Use</button>
                <button class="custom-set-action-button" data-action="edit" data-set-id="${setId}">Edit</button>
                <button class="custom-set-action-button" data-action="delete" data-set-id="${setId}">Delete</button>
            </div>
        `;
        customSetsList.appendChild(item);
    });
}

// Use custom set as filter
function useCustomSet(setId) {
    const set = customCountrySets[setId];
    if (!set) return;
    
    const countryCodes = new Set(set.countries);
    gameState.filteredCountries = gameState.allCountries.filter(c => countryCodes.has(c.code));
    gameState.currentFilter = `custom-${setId}`;
    
    if (filterLabel) {
        filterLabel.textContent = set.name;
    }
    
    if (customSetsModal) {
        customSetsModal.classList.add('hidden');
    }
    
    restartGame();
}

// Render custom set editor
function renderCustomSetEditor(setId) {
    if (!customSetCountriesList || !editingSetNameInput) return;
    
    const set = customCountrySets[setId];
    if (!set) {
        // Creating new set
        editingSetNameInput.value = '';
        editingCustomSetId = null;
    } else {
        editingSetNameInput.value = set.name;
        editingCustomSetId = setId;
    }
    
    const selectedCountries = new Set(set ? set.countries : []);
    
    customSetCountriesList.innerHTML = '';
    
    gameState.allCountries.forEach(country => {
        const item = document.createElement('div');
        item.className = 'custom-set-country-item';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'custom-set-country-checkbox';
        checkbox.checked = selectedCountries.has(country.code);
        checkbox.dataset.countryCode = country.code;
        
        const name = document.createElement('span');
        name.className = 'custom-set-country-name';
        name.textContent = country.name;
        
        item.appendChild(checkbox);
        item.appendChild(name);
        customSetCountriesList.appendChild(item);
    });
}

// Save custom set
function saveCustomSet() {
    const name = editingSetNameInput ? editingSetNameInput.value.trim() : '';
    if (!name) {
        alert('Please enter a name for the set');
        return;
    }
    
    const checkboxes = customSetCountriesList ? customSetCountriesList.querySelectorAll('.custom-set-country-checkbox:checked') : [];
    const countries = Array.from(checkboxes).map(cb => cb.dataset.countryCode);
    
    if (countries.length === 0) {
        alert('Please select at least one country');
        return;
    }
    
    const setId = editingCustomSetId || `set-${Date.now()}`;
    customCountrySets[setId] = {
        name,
        countries,
        createdAt: editingCustomSetId ? customCountrySets[editingCustomSetId]?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    saveCustomSets();
    renderCustomSets();
    
    if (customSetEditorModal) {
        customSetEditorModal.classList.add('hidden');
    }
    
    editingCustomSetId = null;
}

// Delete custom set
function deleteCustomSet(setId) {
    if (confirm('Are you sure you want to delete this custom set?')) {
        delete customCountrySets[setId];
        saveCustomSets();
        renderCustomSets();
        
        if (customSetEditorModal) {
            customSetEditorModal.classList.add('hidden');
        }
    }
}

// ==================== COUNTRY BORDERS OVERLAY ====================

// Add country borders overlay layer for clearer borders
function addCountryBordersLayer() {
    if (!gameState.map) return;
    
    // If GeoJSON is already cached, use it immediately (no lag)
    if (bordersGeoJSONCache) {
        try {
            const style = getBorderStyle();
            
            // Remove existing layer
            if (countryBordersLayer) {
                gameState.map.removeLayer(countryBordersLayer);
                countryBordersLayer = null;
            }
            
            // Create layer synchronously since data is cached
            countryBordersLayer = L.geoJSON(bordersGeoJSONCache, {
                style: function(feature) {
                    return {
                        color: style.color,
                        weight: style.weight,
                        opacity: style.opacity,
                        fillColor: 'transparent',
                        fillOpacity: 0,
                        dashArray: borderSettings.thickness <= 2 ? '5,5' : 'none'
                    };
                },
                interactive: false,
                pane: 'overlayPane',
                renderer: L.canvas({ padding: 0.5 })
            });
            
            // Add to map if overlay is enabled
            if (borderSettings.overlay !== false) {
                countryBordersLayer.addTo(gameState.map);
            }
            return;
        } catch (error) {
            console.warn('Error using cached borders, falling back:', error);
        }
    }
    
    // Try to load GeoJSON borders (async)
    // Fallback to tile-based if GeoJSON fails
    loadCountryBordersGeoJSON().catch(() => {
        // Fallback: Use tile-based borders overlay
        addTileBasedBorders();
    });
}

// Add tile-based borders overlay (fallback method)
function addTileBasedBorders() {
    if (!gameState.map) return;
    
    // Remove existing borders layer if present
    if (countryBordersLayer) {
        gameState.map.removeLayer(countryBordersLayer);
        countryBordersLayer = null;
    }
    
    const borderStyle = getBorderStyle();
    
    // Use a borders-only tile layer for clearer country boundaries
    // This overlay shows only country borders
    countryBordersLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
        attribution: '',
        maxZoom: 6,
        subdomains: 'abcd',
        tileSize: 256,
        zoomOffset: 0,
        opacity: borderStyle.opacity * 0.8, // Adjust opacity based on contrast setting
        pane: 'overlayPane',
        className: 'country-borders-tile-layer'
    });
    
    // Add borders layer to map
    if (borderSettings.overlay !== false) {
        countryBordersLayer.addTo(gameState.map);
    }
}

// Get border style based on settings
function getBorderStyle() {
    const thickness = borderSettings.thickness || 3;
    const contrast = borderSettings.contrast || 3;
    
    // Calculate weight: 1-2 = 1.5px, 3 = 2px, 4-5 = 3px
    let weight;
    if (thickness <= 2) {
        weight = 1.5;
    } else if (thickness === 3) {
        weight = 2;
    } else {
        weight = 3;
    }
    
    // Calculate opacity: higher contrast = more visible
    const opacity = Math.max(0.5, Math.min(1.0, 0.4 + (contrast - 1) * 0.15));
    
    // Calculate color: higher contrast = darker
    let color;
    if (contrast <= 2) {
        color = '#888888';
    } else if (contrast === 3) {
        color = '#333333';
    } else {
        color = '#000000';
    }
    
    return {
        weight: weight,
        opacity: opacity,
        color: color,
        fillOpacity: 0
    };
}

// Update borders layer style
function updateBordersLayerStyle() {
    if (!gameState.map) return;
    
    const style = getBorderStyle();
    const wasAdded = countryBordersLayer && gameState.map.hasLayer(countryBordersLayer);
    
    // Check if it's a GeoJSON layer or tile layer
    if (countryBordersLayer && countryBordersLayer.eachLayer) {
        // GeoJSON layer - update style of each feature (smooth update)
        countryBordersLayer.eachLayer(function(layer) {
            layer.setStyle({
                color: style.color,
                weight: style.weight,
                opacity: style.opacity,
                dashArray: borderSettings.thickness <= 2 ? '5,5' : 'none'
            });
        });
    } else {
        // Tile layer or no layer - recreate with new style
        if (countryBordersLayer && wasAdded) {
            gameState.map.removeLayer(countryBordersLayer);
        }
        
        // If we have cached GeoJSON, recreate GeoJSON layer with new style
        if (bordersGeoJSONCache) {
            countryBordersLayer = L.geoJSON(bordersGeoJSONCache, {
                style: function(feature) {
                    return {
                        color: style.color,
                        weight: style.weight,
                        opacity: style.opacity,
                        fillColor: 'transparent',
                        fillOpacity: 0,
                        dashArray: borderSettings.thickness <= 2 ? '5,5' : 'none'
                    };
                },
                interactive: false,
                pane: 'overlayPane',
                renderer: L.canvas({ padding: 0.5 })
            });
        } else {
            // Fallback to tile layer
            countryBordersLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
                attribution: '',
                maxZoom: 6,
                subdomains: 'abcd',
                tileSize: 256,
                zoomOffset: 0,
                opacity: style.opacity * 0.8,
                pane: 'overlayPane',
                className: 'country-borders-tile-layer'
            });
        }
        
        if (wasAdded && borderSettings.overlay !== false) {
            countryBordersLayer.addTo(gameState.map);
        }
    }
}

// Pre-load country borders GeoJSON data (call early in initialization)
async function preloadCountryBordersGeoJSON() {
    // If already loading, return the existing promise
    if (bordersLoadingPromise) {
        return bordersLoadingPromise;
    }
    
    // If already cached, return immediately
    if (bordersGeoJSONCache) {
        return Promise.resolve(bordersGeoJSONCache);
    }
    
    // Start loading
    bordersLoadingPromise = (async () => {
        try {
            // Use Natural Earth 110m countries GeoJSON (simplified for performance)
            const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
            if (!response.ok) throw new Error('Failed to fetch borders');
            
            const geojson = await response.json();
            bordersGeoJSONCache = geojson; // Cache the data
            console.log('Country borders GeoJSON pre-loaded successfully');
            return geojson;
        } catch (error) {
            console.warn('Failed to pre-load GeoJSON borders:', error);
            bordersLoadingPromise = null; // Reset on error so we can retry
            throw error;
        }
    })();
    
    return bordersLoadingPromise;
}

// Load country borders from GeoJSON (more accurate)
async function loadCountryBordersGeoJSON() {
    if (!gameState.map) return;
    
    try {
        let geojson;
        
        // Use cached data if available, otherwise fetch
        if (bordersGeoJSONCache) {
            geojson = bordersGeoJSONCache;
        } else if (bordersLoadingPromise) {
            // Wait for ongoing load
            geojson = await bordersLoadingPromise;
        } else {
            // Start new fetch
            const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
            if (!response.ok) throw new Error('Failed to fetch borders');
            geojson = await response.json();
            bordersGeoJSONCache = geojson; // Cache for future use
        }
        
        const style = getBorderStyle();
        
        // Remove existing layer
        if (countryBordersLayer) {
            gameState.map.removeLayer(countryBordersLayer);
            countryBordersLayer = null;
        }
        
        // Create GeoJSON layer with borders only (no fill)
        // Use requestAnimationFrame to ensure smooth rendering
        requestAnimationFrame(() => {
            countryBordersLayer = L.geoJSON(geojson, {
                style: function(feature) {
                    return {
                        color: style.color,
                        weight: style.weight,
                        opacity: style.opacity,
                        fillColor: 'transparent',
                        fillOpacity: 0,
                        dashArray: borderSettings.thickness <= 2 ? '5,5' : 'none'
                    };
                },
                interactive: false,
                pane: 'overlayPane',
                renderer: L.canvas({ padding: 0.5 }) // Use canvas renderer for better performance
            });
            
            // Add to map if overlay is enabled
            if (borderSettings.overlay !== false) {
                countryBordersLayer.addTo(gameState.map);
            }
        });
        
        console.log('Country borders loaded successfully');
    } catch (error) {
        console.warn('Failed to load GeoJSON borders, using tile-based borders:', error);
        throw error; // Re-throw to trigger fallback
    }
}

// ==================== MAP STYLE TOGGLE ====================

// Map style definitions
const mapStyles = {
    political: {
        name: 'Political',
        icon: '🗺️',
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        needsBorders: true
    },
    dark: {
        name: 'Dark',
        icon: '🌙',
        url: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        needsBorders: true
    },
    satellite: {
        name: 'Satellite',
        icon: '🛰️',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; Esri',
        needsBorders: false
    }
};

// Set map style
function setMapStyle(style) {
    // If style doesn't exist, default to dark
    if (!mapStyles[style]) {
        style = 'dark';
    }
    
    mapStyle = style;
    
    // Update inline map style options active state
    const inlineMapStyleOptions = document.querySelectorAll('.map-style-option-inline');
    inlineMapStyleOptions.forEach(opt => {
        opt.classList.remove('active');
        if (opt.dataset.style === style) {
            opt.classList.add('active');
        }
    });
    
    saveMapStyle();
    
    // Update map tiles
    if (gameState.map && gameState.mapTileLayer) {
        gameState.map.removeLayer(gameState.mapTileLayer);
        
        const styleConfig = mapStyles[style];
        gameState.mapTileLayer = L.tileLayer(styleConfig.url, {
            attribution: styleConfig.attribution,
            maxZoom: style === 'satellite' ? 19 : 20,
            subdomains: style === 'watercolor' ? 'abcd' : 'abcd',
            tileSize: 256,
            zoomOffset: 0,
            errorTileUrl: '', // Prevent broken tile images
            crossOrigin: true,
            retry: 3,
            timeout: 10000
        });
        
        // Handle tile loading errors - retry failed tiles
        gameState.mapTileLayer.on('tileerror', function(error, tile) {
            console.warn('Tile loading error:', error, tile);
            // Retry loading the tile
            if (tile && tile.el) {
                const img = tile.el;
                if (img.tagName === 'IMG') {
                    // Retry by reloading the image
                    const src = img.src;
                    img.onerror = null; // Clear previous error handler
                    img.src = ''; // Clear src
                    setTimeout(() => {
                        img.src = src; // Retry loading
                    }, 1000);
                }
            }
        });
        
        // Handle borders overlay
        if (styleConfig.needsBorders) {
            if (countryBordersLayer && borderSettings.overlay !== false) {
                countryBordersLayer.addTo(gameState.map);
            } else {
                addCountryBordersLayer();
            }
        } else {
            if (countryBordersLayer) {
                gameState.map.removeLayer(countryBordersLayer);
            }
        }
        
        gameState.mapTileLayer.addTo(gameState.map);
    }
}

// Toggle map style (backward compatibility)
// toggleMapStyle removed - map style is now in settings

// ==================== DIFFICULTY LEVELS ====================

// Difficulty filter definitions
const difficultyFilters = {
    all: () => true,
    easy: (country) => {
        // Large, well-known countries (excluding Israel)
        const easyCountries = ['us', 'ca', 'ru', 'cn', 'br', 'au', 'in', 'ar', 'mx', 'id', 'fr', 'gb', 'de', 'it', 'es', 'za', 'eg', 'sa', 'ir', 'tr', 'th', 'vn', 'ph', 'my', 'sg', 'nz', 'jp', 'kr', 'bd', 'pk', 'ng', 'et', 'ke', 'tz', 'ug', 'gh', 'dz', 'ma', 'tn', 'ly', 'sd', 'so', 'ye', 'iq', 'af', 'uz', 'kz', 'mm', 'kh', 'la', 'np', 'lk', 'jo', 'lb', 'sy', 'ps', 'ae', 'om', 'kw', 'qa', 'bh', 'cy', 'mt', 'is', 'ie', 'pt', 'gr', 'fi', 'no', 'se', 'dk', 'nl', 'be', 'ch', 'at', 'cz', 'pl', 'ro', 'hu', 'bg', 'hr', 'rs', 'sk', 'si', 'ee', 'lv', 'lt', 'by', 'ua', 'md', 'ge', 'am', 'az', 'cl', 'co', 'pe', 'ec', 'bo', 'py', 'uy', 've', 'cr', 'pa', 'gt', 'hn', 'sv', 'ni', 'do', 'cu', 'jm', 'ht', 'tt', 'bb', 'gd', 'lc', 'vc', 'ag', 'bs', 'bz', 'sr', 'gy', 'gf', 'fk', 'ci', 'sn', 'ml', 'bf', 'ne', 'td', 'cm', 'cf', 'cg', 'cd', 'ga', 'gq', 'st', 'ao', 'zm', 'mw', 'mz', 'mg', 'mu', 'sc', 'km', 'dj', 'er', 'rw', 'bi', 'ss', 'lr', 'sl', 'gw', 'gn', 'mr', 'cv', 'mn', 'kp', 'tw', 'hk', 'mo', 'bn', 'tl', 'fj', 'pg', 'sb', 'vu', 'nc', 'pf', 'ws', 'to', 'tv', 'ki', 'nr', 'pw', 'fm', 'mh'];
        return easyCountries.includes(country.code);
    },
    medium: (country) => {
        // Mix of familiar and less common countries
        const mediumCountries = ['by', 'ba', 'me', 'mk', 'al', 'xk', 'xk', 'ad', 'mc', 'sm', 'va', 'li', 'lu', 'je', 'gg', 'im', 'fo', 'gl', 'sj', 'ax', 'gi', 'ad', 'aw', 'cw', 'sx', 'bq', 'pr', 'vi', 'gu', 'as', 'mp', 'pw', 'ck', 'nu', 'tk', 'pn', 'gs', 'tf', 'hm', 'io', 'bv', 'aq', 'eh', 'ps', 'gg', 'je', 'im', 'bl', 'mf', 'pm', 'yt', 're', 'sh', 'ac', 'ta', 'dg', 'ic', 'ea', 'cp', 'fx'];
        return !difficultyFilters.easy(country) && !difficultyFilters.hard(country) && !difficultyFilters.expert(country);
    },
    hard: (country) => {
        // Small countries, obscure flags
        const hardCountries = ['va', 'mc', 'sm', 'li', 'ad', 'mv', 'st', 'sc', 'ag', 'bb', 'gd', 'vc', 'ki', 'fm', 'bh', 'cy', 'lu', 'ws', 'km', 'dj', 'bs', 'bn', 'tt', 'tl', 'fj', 'mu', 'sg', 'nr', 'tv', 'pw', 'to', 'na', 'bw', 'ls', 'sz', 'rw', 'bi', 'er', 'dj', 'gw', 'gn', 'lr', 'sl', 'gm', 'cv', 'gq', 'st', 'km', 'sc', 'mu', 'mh', 'fm', 'pw', 'nr', 'tv', 'ki', 'to', 'ws', 'vu', 'sb', 'pg', 'nc', 'pf', 'fj', 'tl', 'bn', 'mo', 'hk', 'tw', 'kp', 'mn', 'tj', 'kg', 'tm', 'uz', 'kz', 'az', 'am', 'ge', 'md', 'by', 'ee', 'lv', 'lt', 'is', 'mt', 'cy', 'al', 'mk', 'me', 'ba', 'rs', 'xk', 'xk'];
        return hardCountries.includes(country.code);
    },
    expert: (country) => {
        // Microstates and territories
        const expertCountries = ['va', 'mc', 'sm', 'li', 'ad', 'na', 'sj', 'bv', 'hm', 'gs', 'tf', 'aq', 'io', 'eh', 'ps', 'ac', 'ta', 'dg', 'ic', 'ea', 'cp', 'fx', 'bl', 'mf', 'pm', 'yt', 're', 'sh', 'gi', 'ax', 'fo', 'gl', 'je', 'gg', 'im', 'aw', 'cw', 'sx', 'bq', 'pr', 'vi', 'gu', 'as', 'mp', 'ck', 'nu', 'tk', 'pn', 'pf', 'nc', 'wf'];
        return expertCountries.includes(country.code);
    }
};

// Set difficulty level
function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    
    if (difficultyLabel) {
        const labels = {
            all: 'All',
            easy: 'Easy',
            medium: 'Medium',
            hard: 'Hard',
            expert: 'Expert'
        };
        difficultyLabel.textContent = labels[difficulty] || 'All';
    }
    
    // Update active state
    if (difficultyOptions && difficultyOptions.length > 0) {
        difficultyOptions.forEach(opt => {
            opt.classList.toggle('active', opt.dataset.difficulty === difficulty);
        });
    }
    
    // Apply filter (but preserve any existing custom filter)
    if (difficulty === 'all') {
        // Check if there's a custom filter (not difficulty-based) that should be preserved
        const hasCustomFilter = gameState.currentFilter && 
            !gameState.currentFilter.startsWith('difficulty-') && 
            gameState.currentFilter !== 'all';
        
        if (hasCustomFilter) {
            // Preserve the custom filter - don't reset anything
            console.log('setDifficulty("all") - Preserving custom filter:', gameState.currentFilter);
        } else {
            // No custom filter, safe to reset to all countries
            if (!gameState.currentFilter || gameState.currentFilter.startsWith('difficulty-')) {
                gameState.filteredCountries = [...gameState.allCountries];
                gameState.currentFilter = 'all';
                if (filterLabel) {
                    filterLabel.textContent = 'All Countries';
                }
            }
        }
    } else {
        const filter = difficultyFilters[difficulty];
        if (filter) {
            // Check if there's a custom filter that should be preserved
            const hasCustomFilter = gameState.currentFilter && 
                !gameState.currentFilter.startsWith('difficulty-') && 
                gameState.currentFilter !== 'all';
            
            if (hasCustomFilter) {
                // Apply difficulty filter to current filtered countries (preserve custom filter)
                gameState.filteredCountries = gameState.filteredCountries.filter(filter);
                // Don't overwrite currentFilter - keep the custom filter name
            } else {
                // No custom filter, apply difficulty to all countries
                gameState.filteredCountries = gameState.allCountries.filter(filter);
                gameState.currentFilter = `difficulty-${difficulty}`;
                if (filterLabel) {
                    filterLabel.textContent = difficultyLabel ? difficultyLabel.textContent : 'All Countries';
                }
            }
        }
    }
    
    saveDifficulty();
    restartGame();
}

// ==================== LEVEL SYSTEM ====================

// Add XP and check for level up
function addXP(amount) {
    if (currentGameMode === 'practice') return; // No XP in practice mode
    
    playerXP += amount;
    
    // Check for level up
    while (playerXP >= xpToNextLevel) {
        playerXP -= xpToNextLevel;
        playerLevel++;
        xpToNextLevel = Math.floor(100 * Math.pow(1.2, playerLevel - 1)); // Exponential growth
        
        // Show level up notification
        showLevelUpNotification();
        playSound('achievement');
    }
    
    updateLevelDisplay();
    saveLevelSystem();
}

// Show level up notification
function showLevelUpNotification() {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification show';
    notification.innerHTML = `
        <div class="achievement-notification-content">
            <div class="achievement-notification-icon">🎉</div>
            <div>
                <div class="achievement-notification-title">Level Up!</div>
                <div class="achievement-notification-name">You reached Level ${playerLevel}!</div>
            </div>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Update level display
function updateLevelDisplay() {
    if (levelElement) {
        levelElement.textContent = playerLevel;
    }
    if (xpElement) {
        xpElement.textContent = playerXP;
    }
    
    // Update progress bar if it exists
    let progressBar = document.querySelector('.level-progress-fill');
    if (!progressBar && levelStatItem) {
        const bar = document.createElement('div');
        bar.className = 'level-progress-bar';
        bar.innerHTML = '<div class="level-progress-fill"></div>';
        levelStatItem.appendChild(bar);
        progressBar = bar.querySelector('.level-progress-fill');
    }
    
    if (progressBar) {
        const progress = (playerXP / xpToNextLevel) * 100;
        progressBar.style.width = `${progress}%`;
    }
}

// Calculate XP for correct answer
function calculateXP(distance, timeBonus = 0) {
    let baseXP = 10;
    
    // Distance bonus (closer = more XP)
    if (distance < 50) baseXP += 5;
    else if (distance < 100) baseXP += 3;
    else if (distance < 500) baseXP += 1;
    
    // Streak multiplier
    const streakMultiplier = Math.min(1 + (gameState.streak * 0.1), 2); // Max 2x
    
    // Time bonus (if in time challenge mode)
    baseXP += timeBonus;
    
    return Math.floor(baseXP * streakMultiplier);
}

// ==================== PERSONAL RECORDS ====================

// Update personal records
function updatePersonalRecords() {
    let updated = false;
    
    // Highest Score
    if (gameState.score > personalRecords.highestScore) {
        personalRecords.highestScore = gameState.score;
        updated = true;
    }
    
    // Longest Streak
    if (gameState.bestStreak > personalRecords.longestStreak) {
        personalRecords.longestStreak = gameState.bestStreak;
        updated = true;
    }
    
    // Best Accuracy
    const accuracy = gameState.correctAnswers + gameState.incorrectAnswers > 0 
        ? Math.round((gameState.correctAnswers / (gameState.correctAnswers + gameState.incorrectAnswers)) * 100) 
        : 0;
    if (accuracy > personalRecords.bestAccuracy) {
        personalRecords.bestAccuracy = accuracy;
        updated = true;
    }
    
    // Closest Guess
    if (gameState.bestAccuracy !== Infinity && gameState.bestAccuracy < personalRecords.closestGuess) {
        personalRecords.closestGuess = gameState.bestAccuracy;
        updated = true;
    }
    
    // Most Countries (for endless mode)
    if (currentGameMode === 'endless' && gameState.currentRound > personalRecords.mostCountries) {
        personalRecords.mostCountries = gameState.currentRound;
        updated = true;
    }
    
    if (updated) {
        savePersonalRecords();
        renderPersonalRecords();
    }
}

// Render personal records
function renderPersonalRecords() {
    if (recordHighestScore) {
        recordHighestScore.textContent = personalRecords.highestScore;
    }
    if (recordLongestStreak) {
        recordLongestStreak.textContent = personalRecords.longestStreak;
    }
    if (recordFastestRound) {
        recordFastestRound.textContent = personalRecords.fastestRound 
            ? `${personalRecords.fastestRound}s` 
            : '-';
    }
    if (recordBestAccuracy) {
        recordBestAccuracy.textContent = `${personalRecords.bestAccuracy}%`;
    }
    if (recordClosestGuess) {
        recordClosestGuess.textContent = personalRecords.closestGuess !== Infinity 
            ? formatDistance(personalRecords.closestGuess) 
            : '-';
    }
    if (recordMostCountries) {
        recordMostCountries.textContent = personalRecords.mostCountries;
    }
}

// ==================== COUNTRY HIGHLIGHTING ====================

// Highlight correct country on map
function highlightCountry(country) {
    if (!gameState.map || !country) return;
    
    // Remove existing highlight
    if (countryHighlightLayer) {
        gameState.map.removeLayer(countryHighlightLayer);
        countryHighlightLayer = null;
    }
    
    // Create highlight circle around country
    const highlight = L.circle([country.latlng[0], country.latlng[1]], {
        radius: 500000, // 500km radius
        color: '#667eea',
        fillColor: '#667eea',
        fillOpacity: 0.3,
        weight: 3,
        className: 'country-highlight'
    }).addTo(gameState.map);
    
    countryHighlightLayer = highlight;
    
    // Remove highlight after 3 seconds
    setTimeout(() => {
        if (countryHighlightLayer) {
            gameState.map.removeLayer(countryHighlightLayer);
            countryHighlightLayer = null;
        }
    }, 3000);
}

// ==================== COUNTRY LABELS ====================

// Toggle country labels on map
function toggleCountryLabels(show) {
    showCountryLabels = show;
    
    if (!gameState.map) return;
    
    if (show) {
        // Add labels layer
        if (!countryLabelsLayer) {
            countryLabelsLayer = L.layerGroup().addTo(gameState.map);
            
            // Add labels for all countries
            gameState.allCountries.forEach(country => {
                const label = L.marker([country.latlng[0], country.latlng[1]], {
                    icon: L.divIcon({
                        className: 'country-label',
                        html: `<div style="white-space: nowrap;">${country.name}</div>`,
                        iconSize: [100, 20]
                    }),
                    interactive: false
                });
                countryLabelsLayer.addLayer(label);
            });
        }
    } else {
        // Remove labels layer
        if (countryLabelsLayer) {
            gameState.map.removeLayer(countryLabelsLayer);
            countryLabelsLayer = null;
        }
    }
    
    saveCountryLabelsSetting();
}

// ==================== FONT SIZE CONTROLS ====================

// Apply font size
function applyFontSize(size) {
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add(`font-${size}`);
}

// ==================== EXPORT STATISTICS AS CSV ====================

// Export statistics as CSV
function exportStatisticsCSV() {
    const headers = ['Statistic', 'Value'];
    const rows = [
        ['Games Played', gameStatistics.gamesPlayed],
        ['Total Score', gameStatistics.totalScore],
        ['Best Score', gameStatistics.bestScore],
        ['Best Streak', gameStatistics.bestStreak],
        ['Total Correct', gameStatistics.totalCorrect],
        ['Total Incorrect', gameStatistics.totalIncorrect],
        ['Accuracy', gameStatistics.totalCorrect + gameStatistics.totalIncorrect > 0 
            ? `${Math.round((gameStatistics.totalCorrect / (gameStatistics.totalCorrect + gameStatistics.totalIncorrect)) * 100)}%` 
            : '0%'],
        ['Average Distance', gameStatistics.totalRounds > 0 
            ? `${Math.round(gameStatistics.totalDistance / gameStatistics.totalRounds)}km` 
            : '-'],
        ['Player Level', playerLevel],
        ['Player XP', playerXP],
        ['Highest Score (Record)', personalRecords.highestScore],
        ['Longest Streak (Record)', personalRecords.longestStreak],
        ['Best Accuracy (Record)', `${personalRecords.bestAccuracy}%`],
        ['Closest Guess (Record)', personalRecords.closestGuess !== Infinity 
            ? `${Math.round(personalRecords.closestGuess)}km` 
            : '-']
    ];
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flagfinder-stats-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

// ==================== SHARE RESULTS ====================

// Show share modal
function showShareModal() {
    if (!shareModal || !sharePreview) return;
    
    const accuracy = gameStatistics.totalCorrect + gameStatistics.totalIncorrect > 0 
        ? Math.round((gameStatistics.totalCorrect / (gameStatistics.totalCorrect + gameStatistics.totalIncorrect)) * 100) 
        : 0;
    
    sharePreview.innerHTML = `
        <h3>🎯 FlagFinder Results</h3>
        <div class="share-stats">
            <div class="share-stat">
                <div class="share-stat-label">Level</div>
                <div class="share-stat-value">${playerLevel}</div>
            </div>
            <div class="share-stat">
                <div class="share-stat-label">Games Played</div>
                <div class="share-stat-value">${gameStatistics.gamesPlayed}</div>
            </div>
            <div class="share-stat">
                <div class="share-stat-label">Best Score</div>
                <div class="share-stat-value">${gameStatistics.bestScore}</div>
            </div>
            <div class="share-stat">
                <div class="share-stat-label">Best Streak</div>
                <div class="share-stat-value">${gameStatistics.bestStreak}</div>
            </div>
            <div class="share-stat">
                <div class="share-stat-label">Accuracy</div>
                <div class="share-stat-value">${accuracy}%</div>
            </div>
            <div class="share-stat">
                <div class="share-stat-label">Achievements</div>
                <div class="share-stat-value">${Object.values(achievements).filter(a => a === true).length}/8</div>
            </div>
        </div>
        <p style="margin-top: 1rem; color: #666; font-size: 0.875rem;">
            Can you beat my FlagFinder score? 🚀
        </p>
    `;
    
    shareModal.classList.remove('hidden');
}

// Share to Twitter
function shareToTwitter() {
    const text = `I'm Level ${playerLevel} in FlagFinder! 🎯 Best Score: ${gameStatistics.bestScore} | Best Streak: ${gameStatistics.bestStreak} | Can you beat me? 🚀`;
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`, '_blank');
}

// Share to Facebook
function shareToFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

// Copy share link
function copyShareLink() {
    const text = `Check out FlagFinder! I'm Level ${playerLevel} with a best score of ${gameStatistics.bestScore}! 🎯\n${window.location.href}`;
    navigator.clipboard.writeText(text).then(() => {
        alert('Link copied to clipboard!');
    }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Link copied to clipboard!');
    });
}

// Download share image
function downloadShareImage() {
    if (!sharePreview) return;
    
    // Use html2canvas if available, otherwise show message
    if (typeof html2canvas === 'undefined') {
        alert('Image download requires html2canvas library. Please share via social media instead.');
        return;
    }
    
    html2canvas(sharePreview).then(canvas => {
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `flagfinder-results-${new Date().toISOString().split('T')[0]}.png`;
            link.click();
            URL.revokeObjectURL(url);
        });
    });
}

// ==================== KEYBOARD SHORTCUTS ====================

// Initialize keyboard shortcuts
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Don't trigger shortcuts when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // R - Restart game
        if (e.key === 'r' || e.key === 'R') {
            e.preventDefault();
            if (restartButton && !gameOverModal?.classList.contains('hidden')) {
                restartGame();
            }
        }
        
        // F - Open filter modal
        if (e.key === 'f' || e.key === 'F') {
            e.preventDefault();
            if (filterButton && filterModal) {
                filterModal.classList.remove('hidden');
            }
        }
        
        // Esc - Close modals
        if (e.key === 'Escape') {
            e.preventDefault();
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (!modal.classList.contains('hidden')) {
                    modal.classList.add('hidden');
                }
            });
        }
        
        // Arrow keys for navigation (when in modals)
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            // Could be used for tutorial navigation, etc.
        }
    });
}

// Initialize quiz modes
function initializeQuizModes() {
    if (quizModeButton) {
        quizModeButton.addEventListener('click', () => {
            if (quizModeSelection) {
                quizModeSelection.classList.toggle('hidden');
            }
        });
    }
    
    if (quizOptions && quizOptions.length > 0) {
        quizOptions.forEach(option => {
            option.addEventListener('click', () => {
                const quizType = option.dataset.quiz;
                setQuizType(quizType);
            });
        });
    }
    
    if (choiceOptions && choiceOptions.length > 0) {
        choiceOptions.forEach(button => {
            button.addEventListener('click', () => {
                const countryCode = button.dataset.countryCode;
                if (countryCode && !button.disabled) {
                    handleMultipleChoiceAnswer(countryCode);
                }
            });
        });
    }
}

// Initialize custom sets
function initializeCustomSets() {
    if (customSetsButton) {
        customSetsButton.addEventListener('click', () => {
            renderCustomSets();
            if (customSetsModal) {
                customSetsModal.classList.remove('hidden');
            }
        });
    }
    
    if (closeCustomSetsButton) {
        closeCustomSetsButton.addEventListener('click', () => {
            if (customSetsModal) {
                customSetsModal.classList.add('hidden');
            }
        });
    }
    
    if (createCustomSetButton) {
        createCustomSetButton.addEventListener('click', () => {
            renderCustomSetEditor(null);
            if (customSetEditorModal) {
                customSetEditorModal.classList.remove('hidden');
            }
        });
    }
    
    if (saveCustomSetButton) {
        saveCustomSetButton.addEventListener('click', saveCustomSet);
    }
    
    if (deleteCustomSetButton) {
        deleteCustomSetButton.addEventListener('click', () => {
            if (editingCustomSetId) {
                deleteCustomSet(editingCustomSetId);
            }
        });
    }
    
    if (cancelCustomSetEditorButton) {
        cancelCustomSetEditorButton.addEventListener('click', () => {
            if (customSetEditorModal) {
                customSetEditorModal.classList.add('hidden');
            }
            editingCustomSetId = null;
        });
    }
    
    if (selectAllCountriesButton && customSetCountriesList) {
        selectAllCountriesButton.addEventListener('click', () => {
            const checkboxes = customSetCountriesList.querySelectorAll('.custom-set-country-checkbox');
            checkboxes.forEach(cb => cb.checked = true);
        });
    }
    
    if (deselectAllCountriesButton && customSetCountriesList) {
        deselectAllCountriesButton.addEventListener('click', () => {
            const checkboxes = customSetCountriesList.querySelectorAll('.custom-set-country-checkbox');
            checkboxes.forEach(cb => cb.checked = false);
        });
    }
    
    // Handle custom set actions (use, edit, delete)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('custom-set-action-button')) {
            const action = e.target.dataset.action;
            const setId = e.target.dataset.setId;
            
            if (action === 'use') {
                useCustomSet(setId);
            } else if (action === 'edit') {
                renderCustomSetEditor(setId);
                if (customSetEditorModal) {
                    customSetEditorModal.classList.remove('hidden');
                }
            } else if (action === 'delete') {
                deleteCustomSet(setId);
            }
        }
    });
}

// Initialize map style
function initializeMapStyle() {
    // Handle inline map style options in settings - support both click and touch
    const inlineMapStyleOptions = document.querySelectorAll('.map-style-option-inline');
    if (inlineMapStyleOptions.length > 0) {
        inlineMapStyleOptions.forEach(option => {
            const handleStyleClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const style = option.dataset.style;
                setMapStyle(style);
                // Update active state
                inlineMapStyleOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
            };
            // Add both click and touchstart for better mobile support
            option.addEventListener('click', handleStyleClick);
            option.addEventListener('touchstart', handleStyleClick, { passive: false });
        });
        
        // Set active style on load
        inlineMapStyleOptions.forEach(opt => {
            if (opt.dataset.style === mapStyle) {
                opt.classList.add('active');
            }
        });
    }
    
    // Also handle modal options if they exist (for backward compatibility)
    if (mapStyleOptions.length > 0) {
        mapStyleOptions.forEach(option => {
            option.addEventListener('click', () => {
                const style = option.dataset.style;
                setMapStyle(style);
                if (mapStyleModal) {
                    mapStyleModal.classList.add('hidden');
                }
                // Update active state
                mapStyleOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                // Also update inline options if they exist
                inlineMapStyleOptions.forEach(opt => {
                    opt.classList.remove('active');
                    if (opt.dataset.style === style) {
                        opt.classList.add('active');
                    }
                });
            });
        });
    }
}

// Initialize leaderboards
function initializeLeaderboards() {
    loadLeaderboards();
    
    if (leaderboardButton) {
        leaderboardButton.addEventListener('click', () => {
            if (leaderboardModal) {
                renderLeaderboard('blitz'); // Default to blitz
                leaderboardModal.classList.remove('hidden');
            }
        });
    }
    
    if (leaderboardTabs.length > 0) {
        leaderboardTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const mode = tab.dataset.mode;
                renderLeaderboard(mode);
                // Update active tab
                leaderboardTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });
    }
    
    if (closeLeaderboardButton) {
        closeLeaderboardButton.addEventListener('click', () => {
            if (leaderboardModal) {
                leaderboardModal.classList.add('hidden');
            }
        });
    }
}

// Render leaderboard for a mode
function renderLeaderboard(mode) {
    if (!leaderboardContent) return;
    
    const scores = getTopScores(mode, 20);
    
    if (scores.length === 0) {
        leaderboardContent.innerHTML = `
            <div class="leaderboard-empty">
                <p>No scores yet!</p>
                <p>Play ${mode} mode to appear on the leaderboard.</p>
            </div>
        `;
        return;
    }
    
    leaderboardContent.innerHTML = scores.map((entry, index) => {
        const date = new Date(entry.date);
        const dateStr = date.toLocaleDateString();
        const rank = index + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
        
        return `
            <div class="leaderboard-entry ${rank <= 3 ? 'top-three' : ''}">
                <div class="leaderboard-rank">${medal || rank}</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${entry.playerName || 'Player'}</div>
                    <div class="leaderboard-date">${dateStr}</div>
                </div>
                <div class="leaderboard-score">
                    <div class="score-value">${entry.score}</div>
                    ${entry.flags ? `<div class="score-detail">${entry.flags} flags</div>` : ''}
                    ${entry.accuracy !== undefined ? `<div class="score-detail">${entry.accuracy}%</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Initialize mobile settings
function initializeMobileSettings() {
    // Settings tabs - handle both click and touch events for mobile
    if (settingsTabs.length > 0) {
        settingsTabs.forEach(tab => {
            const handleTabClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const tabName = tab.dataset.tab;
                // Hide all tab contents
                document.querySelectorAll('.settings-tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                // Show selected tab content
                const content = document.getElementById(`settings-${tabName}`);
                if (content) {
                    content.classList.add('active');
                }
                // Update active tab
                settingsTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            };
            // Add both click and touchstart for better mobile support
            tab.addEventListener('click', handleTabClick);
            tab.addEventListener('touchstart', handleTabClick, { passive: false });
        });
    }
    
    // Haptic feedback
    if (hapticFeedbackToggle) {
        hapticFeedbackToggle.addEventListener('change', (e) => {
            gameSettings.hapticFeedback = e.target.checked;
            saveSettings();
        });
    }
    
    // Swipe gestures (placeholder - would need touch event handlers)
    if (swipeGesturesToggle) {
        swipeGesturesToggle.addEventListener('change', (e) => {
            gameSettings.swipeGestures = e.target.checked;
            saveSettings();
        });
    }
    
    // Fullscreen
    if (fullscreenToggle) {
        fullscreenToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        });
    }
    
    // Landscape lock (placeholder - would need screen orientation API)
    if (landscapeLockToggle) {
        landscapeLockToggle.addEventListener('change', (e) => {
            gameSettings.landscapeLock = e.target.checked;
            saveSettings();
        });
    }
}

// Initialize difficulty system
function initializeDifficulty() {
    if (difficultyButton) {
        difficultyButton.addEventListener('click', () => {
            if (difficultyModal) {
                difficultyModal.classList.remove('hidden');
            }
        });
    }
    
    if (closeDifficultyButton) {
        closeDifficultyButton.addEventListener('click', () => {
            if (difficultyModal) {
                difficultyModal.classList.add('hidden');
            }
        });
    }
    
    if (difficultyOptions && difficultyOptions.length > 0) {
        difficultyOptions.forEach(option => {
            option.addEventListener('click', () => {
                const difficulty = option.dataset.difficulty;
                setDifficulty(difficulty);
                if (difficultyModal) {
                    difficultyModal.classList.add('hidden');
                }
            });
        });
    }
}

// Initialize personal records
function initializePersonalRecords() {
    if (exportStatsCsvButton) {
        exportStatsCsvButton.addEventListener('click', exportStatisticsCSV);
    }
}

// Initialize share functionality
function initializeShare() {
    if (shareStatsButton) {
        shareStatsButton.addEventListener('click', showShareModal);
    }
    
    if (closeShareButton) {
        closeShareButton.addEventListener('click', () => {
            if (shareModal) {
                shareModal.classList.add('hidden');
            }
        });
    }
    
    if (shareTwitterButton) {
        shareTwitterButton.addEventListener('click', shareToTwitter);
    }
    
    if (shareFacebookButton) {
        shareFacebookButton.addEventListener('click', shareToFacebook);
    }
    
    if (copyShareLinkButton) {
        copyShareLinkButton.addEventListener('click', copyShareLink);
    }
    
    if (downloadShareImageButton) {
        downloadShareImageButton.addEventListener('click', downloadShareImage);
    }
}

// Initialize font size controls
function initializeFontSizeControls() {
    if (fontSizeSelect) {
        fontSizeSelect.addEventListener('change', (e) => {
            applyFontSize(e.target.value);
            saveFontSize();
        });
    }
}

// Initialize country labels toggle
function initializeCountryLabels() {
    if (countryLabelsToggle) {
        countryLabelsToggle.addEventListener('change', (e) => {
            toggleCountryLabels(e.target.checked);
        });
    }
}

// Initialize game
async function initGame() {
    try {
        // Initialize data systems (statistics, settings, achievements)
        initializeDataSystems();
        
        // Initialize UI systems
        initializeSettings();
        initializeStatistics();
        initializeHints();
        initializeGameMode();
        initializeAchievements();
        initializeDailyChallenge();
        initializeTutorial();
        initializeQuizModes();
        initializeMapStyle();
        initializeKeyboardShortcuts();
        initializeDifficulty();
        initializePersonalRecords();
        initializeShare();
        initializeFontSizeControls();
        initializeCountryLabels();
        initializeOfflineIndicator();
        initializeMobileSettings();
        initializeBorderSettings();
        
        // Pre-load borders GeoJSON early (in parallel with country data)
        const bordersPreloadPromise = preloadCountryBordersGeoJSON().catch(err => {
            console.warn('Borders pre-load failed, will retry later:', err);
        });
        
        // Fetch country data
        await fetchCountries();
        
        // Generate daily challenge if needed
        if (gameState.allCountries.length > 0) {
            generateDailyChallenge();
        }
        
        // Check if pre-download is needed
        checkPreDownloadStatus();
        
        // Wait a bit for borders to finish pre-loading (but don't block)
        // This ensures borders are ready when map initializes
        await Promise.race([
            bordersPreloadPromise,
            new Promise(resolve => setTimeout(resolve, 100)) // Max 100ms wait
        ]);
        
        // Initialize map
        initMap();
        
        // Apply saved map style
        setMapStyle(mapStyle);
        
        // Validate countries were loaded
        if (!gameState.countries || gameState.countries.length === 0) {
            throw new Error('No countries loaded. API may have returned empty data.');
        }
        
        // Hide loading overlay
        loadingOverlay.classList.add('hidden');
        
        // Show tutorial if first time
        showTutorial();
        
        // Start first round
        startRound();
    } catch (error) {
        console.error('Error initializing game:', error);
        console.error('Game state:', {
            countriesCount: gameState.countries?.length || 0,
            currentCountry: gameState.currentCountry,
            error: error
        });
        const errorMessage = getErrorMessage(error);
        loadingMessage.textContent = errorMessage;
        
        // Show hint for CORS issues
        if (error.message && error.message.includes('CORS')) {
            loadingHint.classList.remove('hidden');
        } else {
            loadingHint.classList.add('hidden');
        }
        
        loadingOverlay.classList.remove('hidden');
    }
}

// Get user-friendly error message
function getErrorMessage(error) {
    // Check if still using file:// protocol
    if (window.location.protocol === 'file:') {
        return 'Error: You are still opening the file directly. Please access it through http://localhost (use a web server). Check the browser address bar - it should start with "http://" not "file://".';
    }
    
    if (error.message && error.message.includes('400')) {
        return 'API Error 400: The REST Countries API rejected the request. Check browser console (F12) for details. The API might be temporarily unavailable.';
    }
    if (error.message && error.message.includes('fetch')) {
        return 'Network error: Unable to connect to the API. Please check your internet connection and try again.';
    }
    if (error.message && error.message.includes('CORS')) {
        return 'CORS error: Please open this file through a web server (not file://). Use a local server or host it online.';
    }
    if (error.message && error.message.includes('Failed to fetch')) {
        return 'Connection failed: Unable to reach the API. Please check your internet connection.';
    }
    return `Error: ${error.message || 'Unknown error occurred'}. Check browser console (F12) for details.`;
}

// Fetch countries from REST Countries API
async function fetchCountries() {
    // Try multiple API endpoints and methods
    // Note: Some endpoints may require 'fields' parameter
    const apiEndpoints = [
        // Try v3.1 without fields (standard) - get all data including capital, population, area, region
        { url: 'https://restcountries.com/v3.1/all', method: 'GET' },
        // Try v3.1 with fields parameter (fallback if needed)
        { url: 'https://restcountries.com/v3.1/all?fields=name,cca2,latlng,capital,population,area,region,subregion', method: 'GET' },
        // Try v3
        { url: 'https://restcountries.com/v3/all', method: 'GET' },
        // Try v2 (older version)
        { url: 'https://restcountries.com/v2/all', method: 'GET' },
        // Alternative: try without explicit headers
        { url: 'https://restcountries.com/v3.1/all', method: 'GET', noHeaders: true }
    ];
    
    console.log('Attempting to fetch countries from API...');
    console.log('Current URL:', window.location.href);
    console.log('Protocol:', window.location.protocol);
    
    for (const endpointConfig of apiEndpoints) {
        try {
            const endpoint = endpointConfig.url;
            console.log(`Trying endpoint: ${endpoint}`);
            
            const fetchOptions = {
                method: endpointConfig.method || 'GET',
                mode: 'cors',
                cache: 'no-cache'
            };
            
            // Only add headers if not explicitly disabled
            if (!endpointConfig.noHeaders) {
                fetchOptions.headers = {
                    'Accept': 'application/json',
                };
            }
            
            const response = await fetch(endpoint, fetchOptions);
            
            console.log(`Response status: ${response.status} ${response.statusText}`);
            console.log(`Response headers:`, [...response.headers.entries()]);
            
            if (!response.ok) {
                // Try to get error details from response
                let errorDetails = '';
                try {
                    const errorData = await response.text();
                    errorDetails = errorData ? ` - ${errorData.substring(0, 100)}` : '';
                } catch (e) {
                    // Ignore if we can't read error body
                }
                
                // If 400 error, try next endpoint
                const currentIndex = apiEndpoints.findIndex(e => e.url === endpoint);
                if (response.status === 400 && currentIndex < apiEndpoints.length - 1) {
                    console.warn(`API endpoint ${endpoint} returned 400${errorDetails}, trying next...`);
                    continue;
                }
                
                throw new Error(`HTTP error! status: ${response.status}${errorDetails}`);
            }
            
            const data = await response.json();
            console.log(`Received data type:`, typeof data, 'Length:', Array.isArray(data) ? data.length : 'N/A');
            
            if (!data || !Array.isArray(data)) {
                throw new Error('Invalid data format received from API');
            }
            
            // Filter countries that have coordinates and flag
            // Handle both v2 and v3 API response formats
            gameState.countries = data.filter(country => {
                // Validate country structure
                if (!country) return false;
                
                // Exclude Israel
                const countryCode = (country.cca2 || country.alpha2Code || '').toLowerCase();
                if (countryCode === 'il') return false;
                
                // Check for latlng (v3 uses latlng, v2 uses latlng)
                const hasLatLng = country.latlng && Array.isArray(country.latlng) && country.latlng.length === 2;
                if (!hasLatLng) return false;
                
                // Check for country code (v3 uses cca2, v2 uses alpha2Code)
                const hasCode = country.cca2 || country.alpha2Code;
                if (!hasCode) return false;
                
                // Check for name (v3 uses name.common, v2 uses name)
                const hasName = (country.name && country.name.common) || country.name;
                if (!hasName) return false;
                
                return true;
            }).map(country => {
                // Safely extract country data (handle both v2 and v3 formats)
                const countryCode = (country.cca2 || country.alpha2Code || '').toLowerCase();
                const countryName = country.name?.common || country.name || 'Unknown';
                const countryLatLng = country.latlng || [0, 0];
                
                // Extract additional country information
                const capital = country.capital && Array.isArray(country.capital) && country.capital.length > 0 
                    ? country.capital[0] 
                    : (country.capital || null);
                const population = country.population || null;
                const area = country.area || null;
                const region = country.region || country.subregion || null;
                
                const countryData = {
                    name: countryName,
                    code: countryCode,
                    latlng: countryLatLng,
                    flag: `https://flagcdn.com/w320/${countryCode}.png`,
                    capital: capital,
                    population: population,
                    area: area,
                    region: region
                };
                
                // Validate the mapped data
                if (!countryData.name || countryData.name === 'Unknown' || 
                    !countryData.code || countryData.code.length !== 2) {
                    console.warn('Invalid country data mapped:', country, '->', countryData);
                    return null;
                }
                
                return countryData;
            }).filter(country => country !== null); // Remove any null entries
            
            if (gameState.countries.length === 0) {
                console.error('No valid countries found. Sample data:', data.slice(0, 3));
                throw new Error('No valid countries found in API response');
            }
            
            // Store all countries and set as filtered countries
            gameState.allCountries = [...gameState.countries];
            // Only reset filteredCountries if no custom filter is currently set
            // This preserves user's filter selection if fetchCountries() is called again
            if (!gameState.currentFilter || gameState.currentFilter === 'all' || gameState.currentFilter.startsWith('difficulty-')) {
                gameState.filteredCountries = [...gameState.countries];
            } else {
                // Custom filter is set - reapply it to the new country list
                console.log('fetchCountries() - Reapplying custom filter:', gameState.currentFilter);
                let filterTypes = [];
                let subtractTypes = [];
                
                // Check if filter contains subtraction (format: "add1,add2|subtract1,subtract2")
                if (gameState.currentFilter.includes('|')) {
                    const [addPart, subtractPart] = gameState.currentFilter.split('|');
                    if (addPart && addPart !== 'all') {
                        filterTypes = addPart.includes(',') ? addPart.split(',') : [addPart];
                    } else {
                        filterTypes = ['all'];
                    }
                    if (subtractPart) {
                        subtractTypes = subtractPart.includes(',') ? subtractPart.split(',') : [subtractPart];
                    }
                } else {
                    // No subtraction, just add filters
                    filterTypes = gameState.currentFilter.includes(',') 
                        ? gameState.currentFilter.split(',') 
                        : [gameState.currentFilter];
                }
                
                // Temporarily clear currentFilter to avoid recursion
                const savedFilter = gameState.currentFilter;
                gameState.currentFilter = null;
                applyFilter(filterTypes, subtractTypes);
                // Restore the filter name (applyFilter sets it, but just to be safe)
                gameState.currentFilter = savedFilter;
            }
            
            console.log(`Successfully loaded ${gameState.countries.length} countries from ${endpoint}`);
            console.log('Sample country:', gameState.countries[0]);
            
            // Initialize filter system after countries are loaded
            initializeFilterSystem();
            
            return; // Success, exit function
        } catch (error) {
            console.error(`Error fetching from ${endpoint}:`, error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            
            // If this is the last endpoint, throw the error
            const currentIndex = apiEndpoints.findIndex(e => e.url === endpoint);
            if (currentIndex === apiEndpoints.length - 1) {
                // Enhance error message for CORS issues
                if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed'))) {
                    const corsError = new Error('CORS: Cannot fetch from file:// protocol. Please use a web server.');
                    corsError.originalError = error;
                    throw corsError;
                }
                throw error;
            }
            // Otherwise, continue to next endpoint
        }
    }
}

// Initialize Leaflet map
function initMap() {
    gameState.map = L.map('map', {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 6,
        zoomControl: true,
        attributionControl: true,
        tap: true,
        touchZoom: true,
        doubleClickZoom: true,
        boxZoom: false,
        keyboard: false
    });
    
    // Position zoom controls at top right (moved from bottomright to avoid flag container)
    gameState.map.zoomControl.setPosition('topright');
    // Setup zoom button handlers
    setTimeout(() => {
        setupZoomButtonHandlers();
    }, 200);

    // Add map tiles with modern, clean style
    // Using CartoDB Voyager No Labels - modern, colorful, and clean
    gameState.mapTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors, © CARTO',
        maxZoom: 6,
        subdomains: 'abcd',
        tileSize: 256,
        zoomOffset: 0,
        errorTileUrl: '', // Prevent broken tile images
        crossOrigin: true,
        retry: 3,
        timeout: 10000
    }).addTo(gameState.map);
    
    // Handle tile loading errors - retry failed tiles
    gameState.mapTileLayer.on('tileerror', function(error, tile) {
        console.warn('Tile loading error:', error, tile);
        // Retry loading the tile
        if (tile && tile.el) {
            const img = tile.el;
            if (img.tagName === 'IMG') {
                // Retry by reloading the image
                const src = img.src;
                img.onerror = null; // Clear previous error handler
                img.src = ''; // Clear src
                setTimeout(() => {
                    img.src = src; // Retry loading
                }, 1000);
            }
        }
    });
    
    // Add country borders overlay layer for clearer borders
    addCountryBordersLayer();
    
    // Add click handler to map (works for both mouse and touch)
    gameState.map.on('click', handleMapClick);
}

// Handle map click
let lastClickTime = 0;
async function handleMapClick(e) {
    if (!gameState.isWaitingForClick || !gameState.currentCountry) {
        return;
    }

    // Prevent rapid double-clicks on mobile
    const currentTime = Date.now();
    if (currentTime - lastClickTime < 500) {
        return;
    }
    lastClickTime = currentTime;

    const { lat, lng } = e.latlng;
    
    // Disable further clicks while processing
    gameState.isWaitingForClick = false;

    // Remove previous marker if exists
    if (gameState.clickedMarker) {
        gameState.map.removeLayer(gameState.clickedMarker);
    }

    // Add marker at clicked location with smooth animation
    gameState.clickedMarker = L.marker([lat, lng], {
        icon: L.divIcon({
            className: 'click-marker',
            html: '<div style="width: 20px; height: 20px; background: #667eea; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.3); animation: markerPlace 0.3s ease;"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        })
    }).addTo(gameState.map);
    
    // Animate marker placement
    setTimeout(() => {
        if (gameState.clickedMarker) {
            gameState.clickedMarker.getElement()?.classList.add('marker-placed');
        }
    }, 10);

    // Show processing indicator
    processingOverlay.classList.remove('hidden');
    
    // Detect country at clicked location
    try {
        const clickedCountry = await detectCountry(lat, lng);
        processingOverlay.classList.add('hidden');
        checkAnswer(clickedCountry, { lat, lng });
    } catch (error) {
        console.error('Error detecting country:', error);
        processingOverlay.classList.add('hidden');
        showFeedback(false, 'Error detecting country. Please try again.');
        gameState.isWaitingForClick = true;
    }
}

// Detect country using Nominatim reverse geocoding
async function detectCountry(lat, lng) {
    try {
        // Add a small delay to respect rate limits (reduced since we show processing indicator)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=3&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'FlagFinder Game',
                    'Accept-Language': 'en'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.address && data.address.country_code) {
            const countryCode = data.address.country_code.toUpperCase();
            
            // Find matching country in our list
            const countryCodeLower = countryCode.toLowerCase();
            let country = gameState.countries.find(c => 
                c.code === countryCodeLower
            );
            
            // If not found by code, try matching by name (with normalization)
            if (!country && data.address.country) {
                const normalizedCountryName = normalizeCountryName(data.address.country);
                country = gameState.countries.find(c => 
                    normalizeCountryName(c.name) === normalizedCountryName
                );
            }
            
            if (country) {
                return country;
            }
            
            // If still not found, try fuzzy matching by name
            if (data.address.country) {
                const normalizedCountryName = normalizeCountryName(data.address.country);
                country = gameState.countries.find(c => {
                    const normalized = normalizeCountryName(c.name);
                    return normalized.includes(normalizedCountryName) || 
                           normalizedCountryName.includes(normalized);
                });
                
                if (country) {
                    return country;
                }
                
                // Last resort: return country from geocoding
                return {
                    name: data.address.country,
                    code: countryCodeLower,
                    latlng: [lat, lng]
                };
            }
        }
        
        // Fallback: return a placeholder
        return {
            name: 'Unknown',
            code: 'xx',
            latlng: [lat, lng]
        };
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        // Return a fallback object to prevent game crash
        return {
            name: 'Unknown',
            code: 'xx',
            latlng: [lat, lng]
        };
    }
}

// Normalize country name for matching (remove common variations)
function normalizeCountryName(name) {
    if (!name) return '';
    return name.toLowerCase()
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^the\s+/i, '')
        .replace(/\s+republic$|republic\s+of\s+/gi, '')
        .replace(/\s+kingdom$|kingdom\s+of\s+/gi, '');
}

// Calculate distance between two points (in kilometers)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Format number with thousand separators
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Format distance for display
function formatDistance(km) {
    if (km < 1) {
        return `${formatNumber(Math.round(km * 1000))}m`;
    } else if (km < 100) {
        return `${km.toFixed(1).replace('.', ',')}km`;
    } else {
        return `${formatNumber(Math.round(km))}km`;
    }
}

// Check if answer is correct
function checkAnswer(clickedCountry, clickedLatLng) {
    // Stop timer if in time challenge mode
    if (currentGameMode === 'time') {
        stopTimer();
    }
    
    // In blitz mode, immediately continue to next flag (no delay)
    const isBlitzMode = currentGameMode === 'blitz';
    
    const correctCountry = gameState.currentCountry;
    // Safety checks
    if (!correctCountry || !correctCountry.latlng || !Array.isArray(correctCountry.latlng) || correctCountry.latlng.length < 2) {
        console.error('checkAnswer: correctCountry or latlng is invalid', correctCountry);
        return;
    }
    
    if (!clickedCountry || !clickedCountry.code || !clickedCountry.name) {
        console.error('checkAnswer: clickedCountry is invalid', clickedCountry);
        return;
    }
    
    const codeMatch = clickedCountry.code === correctCountry.code;
    const nameMatch = normalizeCountryName(clickedCountry.name) === normalizeCountryName(correctCountry.name);
    const isCorrect = codeMatch || nameMatch;
    
    // Calculate distance between clicked point and correct country location
    const distance = calculateDistance(
        clickedLatLng.lat,
        clickedLatLng.lng,
        correctCountry.latlng[0],
        correctCountry.latlng[1]
    );
    
    // Store distance
    gameState.distances.push({
        round: gameState.currentRound,
        distance: distance,
        correct: isCorrect,
        country: correctCountry.name
    });
    
    gameState.totalDistance += distance;
    gameState.averageDistance = gameState.totalDistance / gameState.distances.length;
    
    // Update best accuracy (smallest distance)
    if (distance < gameState.bestAccuracy) {
        gameState.bestAccuracy = distance;
    }

    // Update regional and country statistics (only in classic/daily mode)
    if (currentGameMode !== 'practice') {
        updateRegionalStats(correctCountry, isCorrect);
        updateCountryStats(correctCountry, isCorrect, distance);
    }
    
    if (isCorrect) {
        // Correct answer
        gameState.streak++;
        gameState.correctAnswers++;
        if (gameState.streak > gameState.bestStreak) {
            gameState.bestStreak = gameState.streak;
        }
        const multiplier = getStreakMultiplier();
        const points = currentGameMode === 'practice' ? 0 : (10 * multiplier);
        gameState.score += points;
        
        updateUI();
        const multiplierText = multiplier > 1 ? ` (${multiplier}x streak!)` : '';
        const distanceText = distance < 50 ? ` 🎯 ${formatDistance(distance)} away!` : ` (${formatDistance(distance)} away)`;
        const feedbackText = currentGameMode === 'practice' 
            ? `Correct! ${distanceText}` 
            : `Correct! +${points} points${multiplierText}${distanceText}`;
        showFeedback(true, feedbackText, correctCountry.name);
        
        // Play sound (only if not practice mode or sound enabled)
        if (currentGameMode !== 'practice') {
            playSound('correct');
        }
        
        // Add XP
        const timeBonus = currentGameMode === 'time' && timeRemaining > 0 ? Math.floor(timeRemaining / 3) : 0;
        const xpGained = calculateXP(distance, timeBonus);
        addXP(xpGained);
        
        // Highlight correct country
        highlightCountry(correctCountry);
        
        // Celebration effects for streaks
        if (gameState.streak >= 3 && gameState.streak % 3 === 0 && currentGameMode !== 'practice') {
            showCelebration(`🔥 ${gameState.streak} STREAK! 🔥`);
            playSound('streak');
        }
        
        // Particle effects for correct answers
        createParticles({ lat: clickedLatLng.lat, lng: clickedLatLng.lng });
        
        // Highlight correct country with green marker
        if (gameState.clickedMarker) {
            gameState.clickedMarker.setIcon(L.divIcon({
                className: 'correct-marker',
                html: '<div style="width: 25px; height: 25px; background: #10b981; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
                iconSize: [25, 25],
                iconAnchor: [12, 12]
            }));
        }
        
        // Show correct country location marker (even when correct, for learning)
        setTimeout(() => {
            if (!correctCountry || !correctCountry.latlng || !Array.isArray(correctCountry.latlng) || correctCountry.latlng.length < 2) {
                console.error('Cannot show correct marker: invalid latlng');
                return;
            }
            
            if (!gameState.map) {
                console.error('Cannot show correct marker: map not initialized');
                return;
            }
            
            const correctMarker = L.marker(correctCountry.latlng, {
                icon: L.divIcon({
                    className: 'correct-country-marker',
                    html: '<div style="width: 30px; height: 30px; background: #10b981; border: 4px solid white; border-radius: 50%; box-shadow: 0 3px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px; animation: markerPulse 0.6s ease;">✓</div>',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                })
            }).addTo(gameState.map);
            
            // Animate marker appearance
            setTimeout(() => {
                const markerEl = correctMarker.getElement();
                if (markerEl) {
                    markerEl.style.animation = 'markerPulse 0.6s ease';
                }
            }, 10);
            
            // Pan to correct location if it's far from clicked location (smooth animation)
            if (gameState.clickedMarker) {
                try {
                    const clickedLatLng = gameState.clickedMarker.getLatLng();
                    const distance = gameState.map.distance(clickedLatLng, correctCountry.latlng);
                    if (distance > 500000) { // More than 500km away
                        gameState.map.setView(correctCountry.latlng, 3, {
                            animate: true,
                            duration: 1.5,
                            easeLinearity: 0.25
                        });
                    }
                } catch (e) {
                    console.warn('Error calculating distance for pan:', e);
                }
            }
        }, 1000);
    } else {
        // Incorrect answer
        gameState.streak = 0;
        gameState.incorrectAnswers++;
        const distanceText = `You were ${formatDistance(distance)} away`;
        showFeedback(false, 'Wrong!', `Correct answer: ${correctCountry.name}. ${distanceText}.`);
        
        // Play sound (only if not practice mode)
        if (currentGameMode !== 'practice') {
            playSound('incorrect');
        }
        
        // Highlight clicked location with red marker
        if (gameState.clickedMarker) {
            gameState.clickedMarker.setIcon(L.divIcon({
                className: 'incorrect-marker',
                html: '<div style="width: 25px; height: 25px; background: #ef4444; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
                iconSize: [25, 25],
                iconAnchor: [12, 12]
            }));
        }
        
        // Show correct country location
        setTimeout(() => {
            if (!correctCountry || !correctCountry.latlng || !Array.isArray(correctCountry.latlng) || correctCountry.latlng.length < 2) {
                console.error('Cannot show correct marker: invalid latlng');
                return;
            }
            
            if (!gameState.map) {
                console.error('Cannot show correct marker: map not initialized');
                return;
            }
            
            const correctMarker = L.marker(correctCountry.latlng, {
                icon: L.divIcon({
                    className: 'correct-country-marker',
                    html: '<div style="width: 30px; height: 30px; background: #10b981; border: 4px solid white; border-radius: 50%; box-shadow: 0 3px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px;">✓</div>',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                })
            }).addTo(gameState.map);
            
            // Pan to correct location
            try {
                if (correctCountry && correctCountry.latlng && Array.isArray(correctCountry.latlng) && correctCountry.latlng.length >= 2) {
                    gameState.map.setView(correctCountry.latlng, 3, {
                        animate: true,
                        duration: 1
                    });
                }
            } catch (e) {
                console.warn('Error panning to correct location:', e);
            }
        }, 1000);
    }

    // Wait before next round (longer on mobile for better UX)
    const delay = window.innerWidth <= 768 ? 3000 : 2500;
    // In blitz mode, use shorter delay and show country info card
    if (isBlitzMode) {
        // Show country info card briefly, then continue
        showCountryInfoCard(correctCountry, isCorrect, distance);
        setTimeout(() => {
            if (blitzTimeRemaining > 0) {
                nextRound();
            }
        }, 1500); // Shorter delay for blitz
    } else {
        // Show country info card for other modes
        showCountryInfoCard(correctCountry, isCorrect, distance);
        setTimeout(() => {
            nextRound();
        }, delay);
    }
}

// Get streak multiplier
function getStreakMultiplier() {
    if (gameState.streak >= 5) {
        return 3;
    } else if (gameState.streak >= 3) {
        return 2;
    }
    return 1;
}

// Show feedback message
function showFeedback(isCorrect, message, countryNameText = '') {
    feedbackMessage.textContent = message;
    feedbackMessage.className = `feedback-message ${isCorrect ? 'correct' : 'incorrect'}`;
    countryName.textContent = countryNameText;
    
    // Animate feedback appearance
    feedbackOverlay.style.opacity = '0';
    feedbackOverlay.classList.remove('hidden');
    
    // Trigger animation
    setTimeout(() => {
        feedbackOverlay.style.opacity = '1';
    }, 10);
    
    setTimeout(() => {
        feedbackOverlay.style.opacity = '0';
        setTimeout(() => {
            feedbackOverlay.classList.add('hidden');
        }, 300);
    }, 2000);
}

// Show celebration effect for streaks
function showCelebration(text) {
    const celebration = document.createElement('div');
    celebration.className = 'celebration-overlay';
    celebration.innerHTML = `<div class="celebration-text">${text}</div>`;
    document.body.appendChild(celebration);
    
    setTimeout(() => {
        celebration.remove();
    }, 800);
}

// Create particle effects
function createParticles(position) {
    const container = document.createElement('div');
    container.className = 'particles-container';
    document.body.appendChild(container);
    
    const particleCount = 15;
    const colors = ['', 'gold', 'purple'];
    
    // Get click position on screen (approximate center for now)
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        const colorClass = colors[Math.floor(Math.random() * colors.length)];
        particle.className = `particle ${colorClass}`;
        
        // Calculate random direction and distance
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
        const distance = 100 + Math.random() * 50;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        particle.style.left = `${centerX}px`;
        particle.style.top = `${centerY}px`;
        
        container.appendChild(particle);
    }
    
    setTimeout(() => {
        container.remove();
    }, 1500);
}

// Start a new round
function startRound() {
    // For endless mode, check if we should continue
    if (currentGameMode === 'endless' && gameState.streak === 0 && gameState.currentRound > 1) {
        endGame();
        return;
    }
    
    if (currentGameMode !== 'endless' && gameState.currentRound > gameState.totalRounds) {
        endGame();
        return;
    }

    // Use daily challenge countries if in daily mode
    let countryPool;
    if (currentGameMode === 'daily' && dailyChallengeCountries.length > 0) {
        // Restore full country objects from daily challenge
        countryPool = dailyChallengeCountries.map(dc => {
            return gameState.allCountries.find(c => c.code === dc.code || c.name === dc.name);
        }).filter(c => c !== undefined);
    } else {
        // Use filtered countries pool
        // Debug: Log the state BEFORE the condition check
        console.log(`Round ${gameState.currentRound}: DEBUG - filteredCountries exists:`, !!gameState.filteredCountries);
        console.log(`Round ${gameState.currentRound}: DEBUG - filteredCountries.length:`, gameState.filteredCountries?.length || 0);
        console.log(`Round ${gameState.currentRound}: DEBUG - filteredCountries is array:`, Array.isArray(gameState.filteredCountries));
        console.log(`Round ${gameState.currentRound}: DEBUG - currentFilter:`, gameState.currentFilter);
        console.log(`Round ${gameState.currentRound}: DEBUG - filteredCountries content:`, gameState.filteredCountries?.map(c => `${c.name} (${c.code})`) || 'null/undefined');
        
        // Ensure filteredCountries is valid - if it's empty or invalid, fall back to allCountries
        // but only if no custom filter is set (to avoid resetting user's filter)
        if (gameState.filteredCountries && Array.isArray(gameState.filteredCountries) && gameState.filteredCountries.length > 0) {
            // Create a copy to avoid reference issues
            countryPool = [...gameState.filteredCountries];
            // Debug: Log which pool is being used
            console.log(`Round ${gameState.currentRound}: Using filtered pool (${countryPool.length} countries), filter: ${gameState.currentFilter}`);
            console.log(`Round ${gameState.currentRound}: Filtered countries are:`, countryPool.map(c => `${c.name} (${c.code})`));
        } else if (gameState.currentFilter && gameState.currentFilter !== 'all' && !gameState.currentFilter.startsWith('difficulty-')) {
            // Custom filter is set but filteredCountries is empty - this shouldn't happen, reapply filter
            console.warn('Filtered countries pool is empty but custom filter is set. Reapplying filter:', gameState.currentFilter);
            let filterTypes = [];
            let subtractTypes = [];
            
            // Check if filter contains subtraction (format: "add1,add2|subtract1,subtract2")
            if (gameState.currentFilter.includes('|')) {
                const [addPart, subtractPart] = gameState.currentFilter.split('|');
                if (addPart && addPart !== 'all') {
                    filterTypes = addPart.includes(',') ? addPart.split(',') : [addPart];
                } else {
                    filterTypes = ['all'];
                }
                if (subtractPart) {
                    subtractTypes = subtractPart.includes(',') ? subtractPart.split(',') : [subtractPart];
                }
            } else {
                // No subtraction, just add filters
                filterTypes = gameState.currentFilter.includes(',') 
                    ? gameState.currentFilter.split(',') 
                    : [gameState.currentFilter];
            }
            applyFilter(filterTypes, subtractTypes);
            countryPool = gameState.filteredCountries && gameState.filteredCountries.length > 0 ? [...gameState.filteredCountries] : [...gameState.allCountries];
        } else {
            // No custom filter or filter is 'all', use all countries
            countryPool = [...gameState.allCountries];
            console.log(`Round ${gameState.currentRound}: Using all countries pool (${countryPool.length} countries), filter: ${gameState.currentFilter || 'none'}`);
            console.warn(`Round ${gameState.currentRound}: WARNING - Falling back to all countries even though filter is set!`);
        }
    }
    
    // Validate countries array
    if (!countryPool || countryPool.length === 0) {
        throw new Error('No countries available. Try changing the filter or refresh the page.');
    }

    // Select random country (avoid repeating the previous one)
    // Use Fisher-Yates shuffle for better randomness, then pick from shuffled array
    const shuffledPool = [...countryPool];
    for (let i = shuffledPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
    }
    
    // Find index of country that's not the previous one
    let randomIndex = 0;
    let attempts = 0;
    do {
        randomIndex = Math.floor(Math.random() * shuffledPool.length);
        attempts++;
        // Prevent infinite loop if there's only one country (shouldn't happen)
        if (attempts > 10) break;
    } while (shuffledPool[randomIndex] === gameState.previousCountry && shuffledPool.length > 1);
    
    // Use the shuffled pool for selection
    const selectedFromPool = shuffledPool[randomIndex];
    
    // Safety check
    if (!selectedFromPool) {
        console.error('startRound: No country selected from pool');
        throw new Error('Failed to select a country. Try changing the filter or refresh the page.');
    }
    
    // For daily mode, use sequential countries
    let selectedCountry;
    if (currentGameMode === 'daily' && dailyChallengeCountries.length > 0 && countryPool.length >= gameState.currentRound) {
        selectedCountry = countryPool[gameState.currentRound - 1];
    } else {
        // Use the randomly selected country from shuffled pool
        selectedCountry = selectedFromPool;
    }
    
    // Validate selected country has required properties
    if (!selectedCountry || !selectedCountry.name || !selectedCountry.code || !selectedCountry.latlng || !Array.isArray(selectedCountry.latlng) || selectedCountry.latlng.length < 2) {
        console.error('startRound: Selected country is invalid', selectedCountry);
        console.error('Countries array:', gameState.countries);
        throw new Error('Selected country has invalid data. Try changing the filter or refresh the page.');
    }
    
    // Debug: Log selected country and verify it's in the filtered pool
    console.log(`Round ${gameState.currentRound}: Selected country: ${selectedCountry.name} (${selectedCountry.code})`);
    console.log(`Round ${gameState.currentRound}: Country pool contains this country:`, countryPool.some(c => c.code === selectedCountry.code));
    console.log(`Round ${gameState.currentRound}: All countries in pool:`, countryPool.map(c => `${c.name} (${c.code})`));
    console.log(`Round ${gameState.currentRound}: Filter state - currentFilter: ${gameState.currentFilter}, filteredCountries.length: ${gameState.filteredCountries?.length || 0}`);
    
    gameState.previousCountry = gameState.currentCountry;
    gameState.currentCountry = selectedCountry;
    
    // Display flag with error handling and fade animation
    flagImage.style.opacity = '0';
    flagImage.style.transform = 'scale(0.9) translateY(-10px)';
    flagImage.classList.add('loading');
    flagImage.alt = `${gameState.currentCountry.name} flag`;
    
    const img = new Image();
    img.onload = () => {
        flagImage.src = gameState.currentCountry.flag;
        flagImage.classList.remove('loading', 'error');
        // Trigger fade-in animation
        setTimeout(() => {
            flagImage.style.opacity = '1';
            flagImage.style.transform = 'scale(1) translateY(0)';
        }, 50);
    };
    img.onerror = () => {
        flagImage.classList.remove('loading');
        flagImage.classList.add('error');
        flagImage.src = '';
        flagImage.alt = `Failed to load flag for ${gameState.currentCountry.name}`;
        flagImage.style.opacity = '1';
        flagImage.style.transform = 'scale(1) translateY(0)';
        // Try alternative flag source
        const altFlagUrl = `https://flagcdn.com/w320/${gameState.currentCountry.code}.png`;
        setTimeout(() => {
            flagImage.src = altFlagUrl;
            flagImage.classList.remove('error');
        }, 500);
    };
    img.src = gameState.currentCountry.flag;
    
    // Clear previous markers
    if (gameState.clickedMarker) {
        gameState.map.removeLayer(gameState.clickedMarker);
        gameState.clickedMarker = null;
    }
    
    // Clear all markers (in case of correct country marker)
    gameState.map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            gameState.map.removeLayer(layer);
        }
    });
    
    // Reset map view with smooth animation
    if (window.innerWidth > 768) {
        gameState.map.setView([20, 0], 2, { 
            animate: true, 
            duration: 0.8,
            easeLinearity: 0.25
        });
    } else {
        gameState.map.setView([20, 0], 2, {
            animate: true,
            duration: 0.5,
            easeLinearity: 0.25
        });
    }
    
    // Enable clicks
    gameState.isWaitingForClick = true;
    
    // Reset hints for new round
    resetHints();
    
    // Enable hint button
    if (hintButton) {
        hintButton.disabled = false;
    }
    
    // Start timer for time challenge mode
    if (currentGameMode === 'time') {
        startTimer();
    } else {
        stopTimer();
    }
    
    // Start blitz timer if in blitz mode
    if (currentGameMode === 'blitz') {
        if (gameState.currentRound === 1) {
            startBlitzTimer(); // Start timer on first round
        }
    } else {
        stopBlitzTimer();
    }
    
    // Handle quiz type
    if (currentQuizType === 'multiple') {
        generateMultipleChoice();
    }
    
    // Show practice answer immediately if in practice mode
    if (currentGameMode === 'practice') {
        setTimeout(() => showPracticeAnswer(), 100);
    } else {
        // Reset instruction text for non-practice modes
        const instruction = document.querySelector('.flag-instruction');
        if (instruction) {
            if (currentQuizType === 'multiple') {
                instruction.textContent = 'Select the correct country!';
            } else if (currentQuizType === 'reverse') {
                instruction.textContent = 'Select the flag for this country!';
            } else if (currentQuizType === 'capital') {
                instruction.textContent = 'Select the capital city!';
            } else {
                instruction.textContent = 'Click on the country with this flag!';
            }
        }
    }
    
    updateUI();
}

// Move to next round
function nextRound() {
    gameState.currentRound++;
    startRound();
}

// Update UI elements
function updateUI() {
    // Animate score update
    scoreElement.textContent = gameState.score;
    scoreElement.classList.add('updated');
    setTimeout(() => scoreElement.classList.remove('updated'), 500);
    
    // Animate streak update
    streakElement.textContent = gameState.streak;
    if (gameState.streak > 0) {
        streakElement.classList.add('updated');
        setTimeout(() => streakElement.classList.remove('updated'), 500);
    }
    
    roundElement.textContent = `${gameState.currentRound}/${gameState.totalRounds}`;
    
    // Update multiplier indicator
    const multiplier = getStreakMultiplier();
    if (multiplier > 1 && gameState.streak > 0) {
        multiplierValue.textContent = multiplier;
        multiplierIndicator.textContent = `x${multiplier}`;
        multiplierIndicator.className = `multiplier-indicator visible x${multiplier}`;
    } else {
        multiplierIndicator.classList.remove('visible', 'x2', 'x3');
    }
}

// End game
function endGame() {
    gameState.isWaitingForClick = false;
    
    // Disable hint button
    if (hintButton) {
        hintButton.disabled = true;
    }
    
    finalScoreElement.textContent = gameState.score;
    bestStreakElement.textContent = gameState.bestStreak;
    
    // Display distance metrics
    if (gameState.bestAccuracy !== Infinity) {
        bestAccuracyElement.textContent = formatDistance(gameState.bestAccuracy);
    } else {
        bestAccuracyElement.textContent = '-';
    }
    
    if (gameState.averageDistance > 0) {
        avgDistanceElement.textContent = formatDistance(gameState.averageDistance);
    } else {
        avgDistanceElement.textContent = '-';
    }
    
    // Stop timer
    stopTimer();
    stopBlitzTimer();
    
    // Update statistics (only in classic/daily/time/endless/blitz mode)
    if (currentGameMode !== 'practice') {
        updateStatistics();
        checkAchievements();
        addGameToHistory();
        updatePersonalRecords();
        
        // Update leaderboard for all game modes
        const flagsGuessed = gameState.correctAnswers + gameState.incorrectAnswers;
        const accuracy = flagsGuessed > 0 ? Math.round((gameState.correctAnswers / flagsGuessed) * 100) : 0;
        
        if (currentGameMode === 'blitz') {
            updateLeaderboard('blitz', {
                score: gameState.score,
                flags: flagsGuessed,
                accuracy: accuracy,
                date: new Date().toISOString()
            });
        } else if (currentGameMode === 'classic') {
            updateLeaderboard('classic', {
                score: gameState.score,
                accuracy: accuracy,
                date: new Date().toISOString()
            });
        } else if (currentGameMode === 'daily') {
            updateLeaderboard('daily', {
                score: gameState.score,
                accuracy: accuracy,
                date: new Date().toISOString()
            });
        } else if (currentGameMode === 'time') {
            updateLeaderboard('time', {
                score: gameState.score,
                accuracy: accuracy,
                date: new Date().toISOString()
            });
        }
    }
    
    // In practice mode, just show completion message
    if (currentGameMode === 'practice') {
        showFeedback(true, 'Practice Complete!', 'Great job learning!');
    }
    
    gameOverModal.classList.remove('hidden');
}

// Restart game
function restartGame() {
    // Stop timer
    stopTimer();
    stopBlitzTimer();
    
    // Debug: Log filter state before restart
    console.log('restartGame() called - Current filter:', gameState.currentFilter, 'Filtered countries:', gameState.filteredCountries?.length || 0);
    
    gameState.score = 0;
    gameState.streak = 0;
    gameState.bestStreak = 0;
    gameState.currentRound = 1;
    gameState.currentCountry = null;
    gameState.previousCountry = null;
    gameState.clickedMarker = null;
    gameState.isWaitingForClick = false;
    gameState.distances = [];
    gameState.totalDistance = 0;
    gameState.averageDistance = 0;
    gameState.bestAccuracy = Infinity;
    gameState.correctAnswers = 0;
    gameState.incorrectAnswers = 0;
    gameState.hintsUsed = [];
    
    // NOTE: We intentionally do NOT reset gameState.filteredCountries or gameState.currentFilter
    // These should persist across game restarts to maintain the user's filter selection
    
    // Reset hints
    resetHints();
    
    // Clear all markers
    gameState.map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            gameState.map.removeLayer(layer);
        }
    });
    
    gameOverModal.classList.add('hidden');
    updateUI();
    
    // Debug: Log filter state after restart (before startRound)
    console.log('restartGame() - After reset, filter:', gameState.currentFilter, 'Filtered countries:', gameState.filteredCountries?.length || 0);
    
    startRound();
}

// Event listeners
restartButton.addEventListener('click', restartGame);

// Keyboard accessibility
document.addEventListener('keydown', (e) => {
    // Enter or Space to restart when game over modal is visible
    if (!gameOverModal.classList.contains('hidden')) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            restartGame();
        }
    }
    
    // Escape to close modals (if we add any closable modals in future)
    if (e.key === 'Escape') {
        // Future: close any open modals
    }
});

// Make restart button focusable and accessible
restartButton.setAttribute('tabindex', '0');
restartButton.setAttribute('aria-label', 'Restart game');

// Filter system
let selectedFilters = ['all']; // Array of selected filter types (supports multiple selections)
let subtractFilters = []; // Array of filter types to subtract from the pool
// Filter states: null = not selected, 'add' = include, 'subtract' = exclude
let filterStates = {}; // { filterType: 'add' | 'subtract' | null }

// Country filter definitions
const countryFilters = {
    // Regions (using approximate coordinates)
    africa: (country) => country.latlng[0] >= -35 && country.latlng[0] <= 37 && country.latlng[1] >= -18 && country.latlng[1] <= 52,
    asia: (country) => country.latlng[0] >= -10 && country.latlng[0] <= 81 && country.latlng[1] >= 25 && country.latlng[1] <= 180,
    europe: (country) => country.latlng[0] >= 35 && country.latlng[0] <= 72 && country.latlng[1] >= -25 && country.latlng[1] <= 45,
    americas: (country) => country.latlng[1] >= -180 && country.latlng[1] <= -30,
    oceania: (country) => country.latlng[0] >= -50 && country.latlng[0] <= -10 && country.latlng[1] >= 110 && country.latlng[1] <= 180,
    
    // Sub-regions
    'middle-east': (country) => {
        const codes = ['sa', 'ae', 'iq', 'ir', 'jo', 'kw', 'lb', 'om', 'qa', 'sy', 'ye', 'bh', 'cy', 'tr', 'eg', 'ps', 'il'];
        return codes.includes(country.code);
    },
    'southeast-asia': (country) => {
        const codes = ['bn', 'kh', 'id', 'la', 'my', 'mm', 'ph', 'sg', 'th', 'tl', 'vn'];
        return codes.includes(country.code);
    },
    'central-asia': (country) => {
        const codes = ['kz', 'kg', 'tj', 'tm', 'uz', 'af'];
        return codes.includes(country.code);
    },
    'balkans': (country) => {
        const codes = ['al', 'ba', 'bg', 'hr', 'xk', 'me', 'mk', 'ro', 'rs', 'si', 'gr'];
        return codes.includes(country.code);
    },
    'scandinavia': (country) => {
        const codes = ['dk', 'fi', 'is', 'no', 'se'];
        return codes.includes(country.code);
    },
    'baltic': (country) => {
        const codes = ['ee', 'lv', 'lt'];
        return codes.includes(country.code);
    },
    'north-africa': (country) => {
        const codes = ['dz', 'eg', 'ly', 'ma', 'sd', 'tn', 'eh'];
        return codes.includes(country.code);
    },
    'central-africa': (country) => {
        const codes = ['td', 'cm', 'cf', 'cg', 'cd', 'gq', 'ga', 'ao', 'st'];
        return codes.includes(country.code);
    },
    'horn-of-africa': (country) => {
        const codes = ['dj', 'er', 'et', 'so'];
        return codes.includes(country.code);
    },
    'east-asia': (country) => {
        const codes = ['cn', 'jp', 'kp', 'kr', 'mn', 'tw', 'hk', 'mo'];
        return codes.includes(country.code);
    },
    'south-asia': (country) => {
        const codes = ['af', 'bd', 'bt', 'in', 'mv', 'np', 'pk', 'lk'];
        return codes.includes(country.code);
    },
    'west-asia': (country) => {
        const codes = ['am', 'az', 'bh', 'cy', 'ge', 'ir', 'iq', 'il', 'jo', 'kw', 'lb', 'om', 'ps', 'qa', 'sa', 'sy', 'tr', 'ae', 'ye'];
        return codes.includes(country.code);
    },
    'north-america': (country) => {
        const codes = ['ca', 'mx', 'us', 'gl', 'pm'];
        return codes.includes(country.code);
    },
    'andean': (country) => {
        const codes = ['bo', 'co', 'ec', 'pe', 've'];
        return codes.includes(country.code);
    },
    'mediterranean': (country) => {
        const codes = ['al', 'dz', 'ba', 'hr', 'cy', 'eg', 'fr', 'gr', 'il', 'it', 'lb', 'ly', 'mt', 'me', 'ma', 'si', 'es', 'sy', 'tn', 'tr', 'xk'];
        return codes.includes(country.code);
    },
    'benelux': (country) => {
        const codes = ['be', 'nl', 'lu'];
        return codes.includes(country.code);
    },
    'visegrad': (country) => {
        const codes = ['cz', 'hu', 'pl', 'sk'];
        return codes.includes(country.code);
    },
    'caribbean': (country) => {
        const codes = ['ag', 'bs', 'bb', 'cu', 'dm', 'do', 'gd', 'ht', 'jm', 'kn', 'lc', 'tt', 'vc', 'pr', 'vg', 'vi', 'aw', 'cw', 'sx', 'bq'];
        return codes.includes(country.code);
    },
    'central-america': (country) => {
        const codes = ['bz', 'cr', 'sv', 'gt', 'hn', 'ni', 'pa'];
        return codes.includes(country.code);
    },
    'south-america': (country) => {
        const codes = ['ar', 'bo', 'br', 'cl', 'co', 'ec', 'fk', 'gf', 'gy', 'py', 'pe', 'sr', 'uy', 've'];
        return codes.includes(country.code);
    },
    'west-africa': (country) => {
        const codes = ['bj', 'bf', 'cv', 'ci', 'gm', 'gh', 'gn', 'gw', 'lr', 'ml', 'mr', 'ne', 'ng', 'sn', 'sl', 'tg'];
        return codes.includes(country.code);
    },
    'east-africa': (country) => {
        const codes = ['bi', 'dj', 'er', 'et', 'ke', 'rw', 'so', 'ss', 'sd', 'tz', 'ug'];
        return codes.includes(country.code);
    },
    'southern-africa': (country) => {
        const codes = ['bw', 'ls', 'mw', 'mz', 'na', 'sz', 'za', 'zm', 'zw'];
        return codes.includes(country.code);
    },
    
    // Difficulty filters (using country codes for known countries)
    large: (country) => {
        const largeCountries = ['ru', 'ca', 'cn', 'us', 'br', 'au', 'in', 'ar', 'kz', 'dz', 'cd', 'sa', 'mx', 'id', 'ir', 'mn', 'td', 'ne', 'ma', 'ng', 'za', 'tz', 'mm', 'af', 'so', 'et', 'ye', 'th', 'es', 'tr', 'fr', 'pg', 'iq', 'uz', 'om', 'ph', 'my', 'nz', 'gb', 'gh', 'ro', 'la', 'gy', 'ke', 'sd', 'cm', 'zm', 'mw', 'ec', 'co', 'mz', 'fi', 've', 'mg', 'no', 'it', 'pk', 'bf', 'pl', 'ao', 'kh', 'ug', 'gm', 'tn', 'bg', 'sr', 'gr'];
        return largeCountries.includes(country.code);
    },
    medium: (country) => {
        const mediumCountries = ['bd', 'by', 'bo', 'bw', 'cf', 'td', 'cl', 'ci', 'cr', 'hr', 'cz', 'do', 'ec', 'sv', 'er', 'ee', 'fj', 'ga', 'ge', 'gh', 'gt', 'gn', 'gw', 'hn', 'hu', 'is', 'ie', 'jo', 'kg', 'la', 'lv', 'lb', 'lr', 'lt', 'ly', 'mk', 'mg', 'mw', 'my', 'ml', 'mr', 'mu', 'md', 'mn', 'me', 'mz', 'na', 'ni', 'kp', 'np', 'nz', 'ni', 'no', 'om', 'pk', 'pa', 'py', 'pe', 'ph', 'pt', 'qa', 'rw', 'sn', 'sk', 'si', 'so', 'za', 'kr', 'ss', 'lk', 'sr', 'sz', 'se', 'sy', 'tw', 'tj', 'tz', 'th', 'tl', 'tg', 'tn', 'tr', 'tm', 'ua', 'uy', 'uz', 've', 'vn', 'ye', 'zm', 'zw'];
        return mediumCountries.includes(country.code);
    },
    small: (country) => {
        const smallCountries = ['al', 'ad', 'ag', 'aw', 'bs', 'bh', 'bb', 'bz', 'bj', 'ba', 'bn', 'bg', 'bf', 'bi', 'cv', 'kh', 'cm', 'ky', 'km', 'cg', 'ck', 'cu', 'cy', 'dj', 'dm', 'gq', 'fj', 'ga', 'gm', 'gd', 'gw', 'gy', 'ht', 'hn', 'hk', 'hu', 'is', 'jm', 'ki', 'kw', 'kg', 'lv', 'lb', 'ls', 'lr', 'li', 'lt', 'lu', 'mo', 'mg', 'mw', 'mv', 'ml', 'mt', 'mh', 'mr', 'mu', 'fm', 'md', 'mc', 'mn', 'me', 'ms', 'mz', 'na', 'nr', 'np', 'nl', 'nc', 'nz', 'ni', 'ne', 'nu', 'nf', 'mp', 'om', 'pw', 'ps', 'pa', 'pg', 'py', 'ph', 'pn', 'pl', 'pt', 'pr', 'qa', 're', 'ro', 'rw', 'sh', 'kn', 'lc', 'pm', 'vc', 'ws', 'sm', 'st', 'sa', 'sn', 'rs', 'sc', 'sl', 'sg', 'sx', 'sk', 'si', 'sb', 'so', 'za', 'gs', 'ss', 'lk', 'bl', 'mf', 'pm', 'sr', 'sj', 'sz', 'se', 'ch', 'sy', 'tw', 'tj', 'tz', 'th', 'tl', 'tg', 'tk', 'to', 'tt', 'tn', 'tr', 'tm', 'tc', 'tv', 'ug', 'ua', 'ae', 'gb', 'us', 'uy', 'uz', 'vu', 've', 'vn', 'vg', 'vi', 'wf', 'eh', 'ye', 'zm', 'zw'];
        // Filter out large and microstates
        const large = ['ru', 'ca', 'cn', 'us', 'br', 'au', 'in', 'ar', 'kz', 'dz', 'cd', 'sa', 'mx', 'id', 'ir', 'mn', 'td', 'ne', 'ma', 'ng', 'za', 'tz', 'mm', 'af', 'so', 'et', 'ye', 'th', 'es', 'tr', 'fr', 'pg', 'iq', 'uz', 'om', 'ph', 'my', 'nz', 'gb', 'gh', 'ro', 'la', 'gy', 'ke', 'sd', 'cm', 'zm', 'mw', 'ec', 'co', 'mz', 'fi', 've', 'mg', 'no', 'it', 'pk', 'bf', 'pl', 'ao', 'kh', 'ug', 'gm', 'tn', 'bg', 'sr', 'gr'];
        const microstates = ['va', 'mc', 'na', 'sm', 'li', 'ad', 'mv', 'st', 'sc', 'ag', 'bb', 'gd', 'vc', 'ki', 'fm', 'bh', 'cy', 'lu', 'ws', 'km', 'dj', 'bs', 'bn', 'tt', 'tl', 'fj', 'mu', 'sg', 'nr', 'tv', 'pw', 'to'];
        return smallCountries.includes(country.code) && !large.includes(country.code) && !microstates.includes(country.code);
    },
    microstates: (country) => {
        const microstates = ['va', 'mc', 'sm', 'li', 'ad', 'mv', 'st', 'sc', 'ag', 'bb', 'gd', 'vc', 'ki', 'fm', 'bh', 'cy', 'lu', 'ws', 'km', 'dj', 'bs', 'bn', 'tt', 'tl', 'fj', 'mu', 'sg', 'nr', 'tv', 'pw', 'to', 'na'];
        return microstates.includes(country.code);
    },
    islands: (country) => {
        const islandNations = ['gb', 'is', 'ie', 'jp', 'ph', 'id', 'my', 'sg', 'nz', 'fj', 'pg', 'sb', 'vu', 'nc', 'pf', 'ws', 'to', 'ki', 'tv', 'nr', 'pw', 'fm', 'mh', 'bs', 'bb', 'cu', 'jm', 'ht', 'do', 'tt', 'gd', 'lc', 'vc', 'ag', 'dm', 'mt', 'cy', 'mv', 'lk', 'mg', 'mu', 'sc', 'km', 'cv', 'st', 'bi', 'tl', 'bn', 'fj', 'mu', 'sg', 'cy', 'bh', 'qa', 'bs', 'mv', 'mt', 'lu', 'bb', 'tt', 'bn', 'fj', 'km', 'dj', 'bt', 'sw', 'mu'];
        return islandNations.includes(country.code);
    },
    landlocked: (country) => {
        const landlockedCountries = ['ad', 'am', 'at', 'az', 'by', 'bt', 'bo', 'bw', 'bf', 'bi', 'cf', 'td', 'cz', 'et', 'hu', 'kz', 'kg', 'la', 'ls', 'li', 'lu', 'mk', 'mw', 'ml', 'md', 'mn', 'np', 'ne', 'rw', 'sm', 'rs', 'sk', 'ss', 'sz', 'ch', 'tj', 'tm', 'ug', 'uz', 'va', 'zw'];
        return landlockedCountries.includes(country.code);
    },
    
    // International organizations
    g20: (country) => {
        const g20 = ['ar', 'au', 'br', 'ca', 'cn', 'fr', 'de', 'in', 'id', 'it', 'jp', 'kr', 'mx', 'ru', 'sa', 'za', 'tr', 'gb', 'us'];
        return g20.includes(country.code);
    },
    'european-union': (country) => {
        const eu = ['at', 'be', 'bg', 'hr', 'cy', 'cz', 'dk', 'ee', 'fi', 'fr', 'de', 'gr', 'hu', 'ie', 'it', 'lv', 'lt', 'lu', 'mt', 'nl', 'pl', 'pt', 'ro', 'sk', 'si', 'es', 'se'];
        return eu.includes(country.code);
    },
    nato: (country) => {
        const nato = ['al', 'be', 'bg', 'ca', 'hr', 'cz', 'dk', 'ee', 'fi', 'fr', 'de', 'gr', 'hu', 'is', 'it', 'lv', 'lt', 'lu', 'me', 'nl', 'mk', 'no', 'pl', 'pt', 'ro', 'sk', 'si', 'es', 'tr', 'gb', 'us'];
        return nato.includes(country.code);
    },
    brics: (country) => {
        const brics = ['br', 'ru', 'in', 'cn', 'za'];
        return brics.includes(country.code);
    },
    commonwealth: (country) => {
        const commonwealth = ['ag', 'au', 'bs', 'bb', 'bz', 'bw', 'bn', 'cm', 'ca', 'cy', 'dm', 'fj', 'gh', 'gd', 'gy', 'in', 'jm', 'ke', 'ki', 'ls', 'mw', 'my', 'mt', 'mu', 'mz', 'na', 'nz', 'ng', 'pk', 'pg', 'rw', 'kn', 'lc', 'ws', 'sc', 'sg', 'sl', 'sb', 'za', 'lk', 'sz', 'tz', 'to', 'tt', 'tv', 'ug', 'gb', 'vu', 'zm'];
        return commonwealth.includes(country.code);
    },
    opec: (country) => {
        const opec = ['dz', 'ao', 'cd', 'cg', 'ec', 'gq', 'ga', 'ir', 'iq', 'kw', 'ly', 'ng', 'sa', 'ae', 've'];
        return opec.includes(country.code);
    },
    asean: (country) => {
        const asean = ['bn', 'kh', 'id', 'la', 'my', 'mm', 'ph', 'sg', 'th', 'vn'];
        return asean.includes(country.code);
    },
    'african-union': (country) => {
        // Major AU members (excluding disputed territories)
        const au = ['dz', 'ao', 'bj', 'bw', 'bf', 'bi', 'cv', 'cm', 'cf', 'td', 'km', 'cg', 'cd', 'ci', 'dj', 'eg', 'gq', 'er', 'sz', 'et', 'ga', 'gm', 'gh', 'gn', 'gw', 'ke', 'ls', 'lr', 'ly', 'mg', 'mw', 'ml', 'mr', 'mu', 'ma', 'mz', 'na', 'ne', 'ng', 'rw', 'st', 'sn', 'sc', 'sl', 'so', 'za', 'ss', 'sd', 'tz', 'tg', 'tn', 'ug', 'zm', 'zw'];
        return au.includes(country.code);
    },
    mercosur: (country) => {
        const mercosur = ['ar', 'br', 'py', 'uy', 've'];
        return mercosur.includes(country.code);
    },
    'pacific-islands': (country) => {
        const pacific = ['fj', 'pg', 'sb', 'vu', 'nc', 'pf', 'ws', 'to', 'ki', 'tv', 'nr', 'pw', 'fm', 'mh', 'ck', 'nu', 'tk', 'pn'];
        return pacific.includes(country.code);
    },
    
    // Cultural & Historical
    'latin-america': (country) => {
        const latinAmerica = ['ar', 'bo', 'br', 'cl', 'co', 'cr', 'cu', 'do', 'ec', 'sv', 'gf', 'gt', 'hn', 'mx', 'ni', 'pa', 'py', 'pe', 'pr', 'uy', 've'];
        return latinAmerica.includes(country.code);
    },
    'former-soviet': (country) => {
        const formerSoviet = ['am', 'az', 'by', 'ee', 'ge', 'kz', 'kg', 'lv', 'lt', 'md', 'ru', 'tj', 'tm', 'ua', 'uz'];
        return formerSoviet.includes(country.code);
    },
    'arab-league': (country) => {
        const arabLeague = ['dz', 'bh', 'km', 'dj', 'eg', 'iq', 'jo', 'kw', 'lb', 'ly', 'mr', 'ma', 'om', 'ps', 'qa', 'sa', 'so', 'sd', 'sy', 'tn', 'ae', 'ye'];
        return arabLeague.includes(country.code);
    },
    nordic: (country) => {
        const nordic = ['dk', 'fi', 'is', 'no', 'se'];
        return nordic.includes(country.code);
    },
    'commonwealth-realms': (country) => {
        const commonwealthRealms = ['ag', 'au', 'bs', 'bb', 'bz', 'ca', 'dm', 'fj', 'gd', 'jm', 'ki', 'kn', 'lc', 'nz', 'pg', 'ws', 'sb', 'sc', 'sl', 'tv', 'vc', 'gb'];
        return commonwealthRealms.includes(country.code);
    },
    maghreb: (country) => {
        const maghreb = ['dz', 'ly', 'ma', 'tn', 'eh'];
        return maghreb.includes(country.code);
    },
    sahel: (country) => {
        const sahel = ['td', 'ml', 'mr', 'ne', 'sn', 'bf', 'ng', 'cm', 'sd'];
        return sahel.includes(country.code);
    },
    'iberian-peninsula': (country) => {
        const iberian = ['es', 'pt', 'ad', 'gb']; // Including Gibraltar
        return iberian.includes(country.code);
    },
    'british-isles': (country) => {
        const britishIsles = ['gb', 'ie', 'im', 'je', 'gg'];
        return britishIsles.includes(country.code);
    },
    'low-countries': (country) => {
        const lowCountries = ['be', 'nl', 'lu'];
        return lowCountries.includes(country.code);
    },
    'slavic-countries': (country) => {
        const slavic = ['by', 'bg', 'ba', 'hr', 'cz', 'me', 'mk', 'pl', 'rs', 'ru', 'sk', 'si', 'ua', 'xk'];
        return slavic.includes(country.code);
    },
    'romance-countries': (country) => {
        const romance = ['ad', 'ar', 'bo', 'br', 'cl', 'co', 'cr', 'cu', 'do', 'ec', 'sv', 'fr', 'gf', 'gt', 'hn', 'it', 'mx', 'mc', 'ni', 'pa', 'py', 'pe', 'pt', 'pr', 'ro', 'sm', 'es', 'uy', 'va', 've'];
        return romance.includes(country.code);
    },
    'germanic-countries': (country) => {
        const germanic = ['at', 'be', 'dk', 'de', 'is', 'li', 'lu', 'nl', 'no', 'se', 'ch', 'gb'];
        return germanic.includes(country.code);
    },
    'celtic-nations': (country) => {
        const celtic = ['ie', 'gb', 'fr']; // Ireland, Scotland/Wales/Cornwall (GB), Brittany (FR)
        return celtic.includes(country.code);
    },
    'orthodox-countries': (country) => {
        const orthodox = ['am', 'bg', 'by', 'cy', 'ee', 'eg', 'et', 'ge', 'gr', 'kz', 'kg', 'mk', 'md', 'me', 'ro', 'rs', 'ru', 'ua'];
        return orthodox.includes(country.code);
    },
    'catholic-countries': (country) => {
        const catholic = ['ad', 'ag', 'ar', 'at', 'be', 'bo', 'br', 'bz', 'cl', 'co', 'cr', 'cu', 'do', 'ec', 'sv', 'fr', 'gt', 'hn', 'hr', 'hu', 'ie', 'it', 'li', 'lt', 'lu', 'mx', 'mc', 'ni', 'pa', 'py', 'pe', 'ph', 'pl', 'pt', 'pr', 'sm', 'es', 'uy', 'va', 've'];
        return catholic.includes(country.code);
    },
    'muslim-majority': (country) => {
        const muslimMajority = ['af', 'dz', 'al', 'az', 'bh', 'bd', 'bn', 'bf', 'bi', 'cm', 'td', 'km', 'dj', 'eg', 'gq', 'er', 'gm', 'gn', 'id', 'ir', 'iq', 'jo', 'kz', 'kw', 'kg', 'lb', 'ly', 'my', 'mv', 'ml', 'mr', 'ma', 'ne', 'ng', 'om', 'pk', 'ps', 'qa', 'sa', 'sn', 'so', 'sd', 'sy', 'tj', 'tn', 'tr', 'tm', 'ae', 'uz', 'ye'];
        return muslimMajority.includes(country.code);
    },
    'buddhist-majority': (country) => {
        const buddhistMajority = ['bt', 'kh', 'la', 'mm', 'np', 'lk', 'th'];
        return buddhistMajority.includes(country.code);
    },
    'hindu-majority': (country) => {
        const hinduMajority = ['in', 'np', 'mu'];
        return hinduMajority.includes(country.code);
    },
    'pacific-alliance': (country) => {
        const pacificAlliance = ['cl', 'co', 'mx', 'pe'];
        return pacificAlliance.includes(country.code);
    },
    'andean-community': (country) => {
        const andeanCommunity = ['bo', 'co', 'ec', 'pe'];
        return andeanCommunity.includes(country.code);
    },
    'organization-turkic-states': (country) => {
        const turkicStates = ['az', 'kz', 'kg', 'tr', 'uz', 'tm'];
        return turkicStates.includes(country.code);
    },
    'sica': (country) => {
        const sica = ['bz', 'cr', 'sv', 'gt', 'hn', 'ni', 'pa', 'do'];
        return sica.includes(country.code);
    },
    francophone: (country) => {
        const francophone = ['be', 'bf', 'bi', 'bj', 'cd', 'cf', 'cg', 'ci', 'cm', 'dj', 'fr', 'ga', 'gn', 'gq', 'ht', 'km', 'lu', 'mg', 'ml', 'mr', 'mu', 'nc', 'ne', 'pf', 'rw', 'sc', 'sn', 'td', 'tg', 'vu', 'ch'];
        return francophone.includes(country.code);
    },
    anglophone: (country) => {
        const anglophone = ['ag', 'au', 'bs', 'bb', 'bz', 'bw', 'cm', 'ca', 'dm', 'fj', 'gh', 'gd', 'gy', 'ie', 'jm', 'ke', 'ki', 'lr', 'ls', 'mw', 'mt', 'mu', 'fm', 'na', 'nz', 'ng', 'pk', 'pg', 'ph', 'rw', 'kn', 'lc', 'ws', 'sc', 'sg', 'sl', 'sb', 'za', 'lk', 'sz', 'tz', 'to', 'tt', 'tv', 'ug', 'gb', 'us', 'vu', 'zm', 'zw'];
        return anglophone.includes(country.code);
    },
    lusophone: (country) => {
        const lusophone = ['ao', 'br', 'cv', 'gw', 'mo', 'mz', 'pt', 'st', 'tl'];
        return lusophone.includes(country.code);
    },
    'spanish-speaking': (country) => {
        const spanishSpeaking = ['ar', 'bo', 'cl', 'co', 'cr', 'cu', 'do', 'ec', 'sv', 'gq', 'gt', 'hn', 'mx', 'ni', 'pa', 'py', 'pe', 'pr', 'uy', 've', 'es'];
        return spanishSpeaking.includes(country.code);
    },
    'arabic-speaking': (country) => {
        const arabicSpeaking = ['dz', 'bh', 'km', 'dj', 'eg', 'iq', 'jo', 'kw', 'lb', 'ly', 'mr', 'ma', 'om', 'ps', 'qa', 'sa', 'so', 'sd', 'sy', 'tn', 'ae', 'ye', 'er', 'il'];
        return arabicSpeaking.includes(country.code);
    },
    'german-speaking': (country) => {
        const germanSpeaking = ['de', 'at', 'ch', 'li', 'be', 'lu'];
        return germanSpeaking.includes(country.code);
    },
    'italian-speaking': (country) => {
        const italianSpeaking = ['it', 'sm', 'va', 'ch'];
        return italianSpeaking.includes(country.code);
    },
    'russian-speaking': (country) => {
        const russianSpeaking = ['ru', 'by', 'kz', 'kg', 'tj', 'tm', 'uz', 'am', 'az', 'ge', 'md', 'ua'];
        return russianSpeaking.includes(country.code);
    },
    'chinese-speaking': (country) => {
        const chineseSpeaking = ['cn', 'tw', 'hk', 'mo', 'sg'];
        return chineseSpeaking.includes(country.code);
    },
    'dutch-speaking': (country) => {
        const dutchSpeaking = ['nl', 'be', 'sr', 'aw', 'cw', 'sx', 'bq'];
        return dutchSpeaking.includes(country.code);
    },
    'turkish-speaking': (country) => {
        const turkishSpeaking = ['tr', 'cy'];
        return turkishSpeaking.includes(country.code);
    },
    'persian-speaking': (country) => {
        const persianSpeaking = ['ir', 'af', 'tj'];
        return persianSpeaking.includes(country.code);
    },
    'malay-speaking': (country) => {
        const malaySpeaking = ['my', 'bn', 'id', 'sg'];
        return malaySpeaking.includes(country.code);
    },
    'swahili-speaking': (country) => {
        const swahiliSpeaking = ['tz', 'ke', 'ug', 'rw', 'bi', 'cd', 'km'];
        return swahiliSpeaking.includes(country.code);
    },
    'hindi-speaking': (country) => {
        const hindiSpeaking = ['in', 'np', 'pk', 'bd', 'mu', 'fj'];
        return hindiSpeaking.includes(country.code);
    },
    'korean-speaking': (country) => {
        const koreanSpeaking = ['kp', 'kr'];
        return koreanSpeaking.includes(country.code);
    },
    'greek-speaking': (country) => {
        const greekSpeaking = ['gr', 'cy'];
        return greekSpeaking.includes(country.code);
    },
    'romanian-speaking': (country) => {
        const romanianSpeaking = ['ro', 'md'];
        return romanianSpeaking.includes(country.code);
    },
    'czech-speaking': (country) => {
        const czechSpeaking = ['cz', 'sk'];
        return czechSpeaking.includes(country.code);
    },
    'serbian-speaking': (country) => {
        const serbianSpeaking = ['rs', 'ba', 'me', 'xk', 'hr', 'si', 'mk'];
        return serbianSpeaking.includes(country.code);
    },
    'albanian-speaking': (country) => {
        const albanianSpeaking = ['al', 'xk', 'mk', 'me'];
        return albanianSpeaking.includes(country.code);
    },
    
    all: () => true
};

// Apply filter to countries (supports multiple filters combined with OR logic, and subtraction)
function applyFilter(filterTypes, subtractTypes = []) {
    // Ensure filterTypes is an array
    if (!Array.isArray(filterTypes)) {
        filterTypes = [filterTypes];
    }
    if (!Array.isArray(subtractTypes)) {
        subtractTypes = [];
    }
    
    // Start with base pool
    let basePool = [];
    
    // If no filters selected or only 'all', start with all countries
    if (filterTypes.length === 0 || (filterTypes.length === 1 && filterTypes[0] === 'all')) {
        basePool = [...gameState.allCountries];
    } else {
        // Remove 'all' if other filters are selected (all is exclusive)
        const activeFilters = filterTypes.filter(f => f !== 'all');
        
        if (activeFilters.length === 0) {
            basePool = [...gameState.allCountries];
        } else {
            // Combine multiple filters with OR logic (country matches any selected filter)
            const combinedFilter = (country) => {
                return activeFilters.some(filterType => {
                    const filter = countryFilters[filterType];
                    return filter && filter(country);
                });
            };
            
            basePool = gameState.allCountries.filter(combinedFilter);
        }
    }
    
    // Apply subtraction filters (exclude countries matching subtract filters)
    if (subtractTypes.length > 0) {
        const subtractFilter = (country) => {
            return !subtractTypes.some(filterType => {
                const filter = countryFilters[filterType];
                return filter && filter(country);
            });
        };
        
        gameState.filteredCountries = basePool.filter(subtractFilter);
    } else {
        gameState.filteredCountries = basePool;
    }
    
    // Debug: Log filter application
    console.log('Filter applied:', filterTypes);
    console.log('Filtered countries count:', gameState.filteredCountries.length);
    console.log('Filtered countries:', gameState.filteredCountries.map(c => c.name).slice(0, 10));
    
    // Store current filter as comma-separated string for compatibility
    // Format: "add1,add2|subtract1,subtract2" or just "all" or "add1,add2"
    if (filterTypes.length === 0 || (filterTypes.length === 1 && filterTypes[0] === 'all')) {
        if (subtractTypes.length > 0) {
            gameState.currentFilter = `all|${subtractTypes.join(',')}`;
        } else {
            gameState.currentFilter = 'all';
        }
    } else {
        const activeFilters = filterTypes.filter(f => f !== 'all');
        if (subtractTypes.length > 0) {
            gameState.currentFilter = `${activeFilters.join(',')}|${subtractTypes.join(',')}`;
        } else {
            gameState.currentFilter = activeFilters.join(',');
        }
    }
    
    // Track filter usage for Explorer achievement
    filterTypes.forEach(filterType => {
        if (filterType !== 'all' && !gameStatistics.filtersUsed[filterType]) {
            gameStatistics.filtersUsed[filterType] = true;
            achievements.progress.explorer.add(filterType);
        }
    });
    subtractTypes.forEach(filterType => {
        if (!gameStatistics.filtersUsed[filterType]) {
            gameStatistics.filtersUsed[filterType] = true;
            achievements.progress.explorer.add(filterType);
        }
    });
    saveStatistics();
    saveAchievements();
    
    // Update filter label to show multiple selections and subtractions
    const filterLabels = {
        'all': 'All Countries',
        'africa': 'Africa',
        'asia': 'Asia',
        'europe': 'Europe',
        'americas': 'Americas',
        'oceania': 'Oceania',
        'middle-east': 'Middle East',
        'southeast-asia': 'Southeast Asia',
        'central-asia': 'Central Asia',
        'east-asia': 'East Asia',
        'south-asia': 'South Asia',
        'west-asia': 'West Asia',
        'balkans': 'Balkans',
        'scandinavia': 'Scandinavia',
        'baltic': 'Baltic States',
        'benelux': 'Benelux',
        'visegrad': 'Visegrad Group',
        'mediterranean': 'Mediterranean',
        'caribbean': 'Caribbean',
        'central-america': 'Central America',
        'north-america': 'North America',
        'south-america': 'South America',
        'andean': 'Andean Countries',
        'north-africa': 'North Africa',
        'west-africa': 'West Africa',
        'central-africa': 'Central Africa',
        'east-africa': 'East Africa',
        'horn-of-africa': 'Horn of Africa',
        'southern-africa': 'Southern Africa',
        'pacific-islands': 'Pacific Islands',
        'large': 'Large Countries',
        'medium': 'Medium Countries',
        'small': 'Small Countries',
        'microstates': 'Microstates',
        'islands': 'Island Nations',
        'landlocked': 'Landlocked',
        'g20': 'G20 Countries',
        'european-union': 'European Union',
        'nato': 'NATO Members',
        'brics': 'BRICS',
        'commonwealth': 'Commonwealth',
        'opec': 'OPEC',
        'asean': 'ASEAN',
        'african-union': 'African Union',
        'mercosur': 'Mercosur',
        'latin-america': 'Latin America',
        'former-soviet': 'Former Soviet Union',
        'arab-league': 'Arab League',
        'nordic': 'Nordic Countries',
        'francophone': 'Francophone',
        'anglophone': 'Anglophone',
        'lusophone': 'Lusophone',
        'spanish-speaking': 'Spanish-Speaking',
        'arabic-speaking': 'Arabic-Speaking',
        'german-speaking': 'German-Speaking',
        'italian-speaking': 'Italian-Speaking',
        'russian-speaking': 'Russian-Speaking',
        'chinese-speaking': 'Chinese-Speaking',
        'dutch-speaking': 'Dutch-Speaking',
        'turkish-speaking': 'Turkish-Speaking',
        'persian-speaking': 'Persian-Speaking',
        'malay-speaking': 'Malay-Speaking',
        'swahili-speaking': 'Swahili-Speaking',
        'hindi-speaking': 'Hindi-Speaking',
        'korean-speaking': 'Korean-Speaking',
        'greek-speaking': 'Greek-Speaking',
        'romanian-speaking': 'Romanian-Speaking',
        'czech-speaking': 'Czech-Speaking',
        'serbian-speaking': 'Serbian-Speaking',
        'albanian-speaking': 'Albanian-Speaking',
        'commonwealth-realms': 'Commonwealth Realms',
        'maghreb': 'Maghreb',
        'sahel': 'Sahel',
        'iberian-peninsula': 'Iberian Peninsula',
        'british-isles': 'British Isles',
        'low-countries': 'Low Countries',
        'slavic-countries': 'Slavic Countries',
        'romance-countries': 'Romance Countries',
        'germanic-countries': 'Germanic Countries',
        'celtic-nations': 'Celtic Nations',
        'orthodox-countries': 'Orthodox Countries',
        'catholic-countries': 'Catholic Countries',
        'muslim-majority': 'Muslim-Majority',
        'buddhist-majority': 'Buddhist-Majority',
        'hindu-majority': 'Hindu-Majority',
        'pacific-alliance': 'Pacific Alliance',
        'andean-community': 'Andean Community',
        'organization-turkic-states': 'Turkic States',
        'sica': 'SICA'
    };
    
    // Build label from selected filters
    const activeFilters = filterTypes.filter(f => f !== 'all');
    let labelParts = [];
    
    if (activeFilters.length === 0) {
        labelParts.push('All Countries');
    } else if (activeFilters.length === 1) {
        labelParts.push(filterLabels[activeFilters[0]] || activeFilters[0]);
    } else if (activeFilters.length <= 3) {
        labelParts.push(activeFilters.map(f => filterLabels[f] || f).join(' + '));
    } else {
        labelParts.push(`${activeFilters.length} Filters`);
    }
    
    // Add subtract filters to label
    if (subtractTypes.length > 0) {
        if (subtractTypes.length === 1) {
            labelParts.push(`- ${filterLabels[subtractTypes[0]] || subtractTypes[0]}`);
        } else if (subtractTypes.length <= 2) {
            labelParts.push(`- ${subtractTypes.map(f => filterLabels[f] || f).join(', ')}`);
        } else {
            labelParts.push(`- ${subtractTypes.length} Excluded`);
        }
    }
    
    filterLabel.textContent = labelParts.join(' ');
    
    updateFilterCount();
}

// Update filter count display (works with multiple filters and subtraction)
function updateFilterCount() {
    if (!filterCount) return;
    
    // Calculate preview count based on current filter states
    let basePool = [];
    
    // Determine base pool from add filters
    const addFilters = Object.keys(filterStates).filter(f => filterStates[f] === 'add');
    const hasAll = selectedFilters.includes('all') && addFilters.length === 0;
    
    if (hasAll || addFilters.length === 0) {
        basePool = [...gameState.allCountries];
    } else {
        const combinedFilter = (country) => {
            return addFilters.some(filterType => {
                const filter = countryFilters[filterType];
                return filter && filter(country);
            });
        };
        basePool = gameState.allCountries.filter(combinedFilter);
    }
    
    // Apply subtract filters
    const subtractFilters = Object.keys(filterStates).filter(f => filterStates[f] === 'subtract');
    if (subtractFilters.length > 0) {
        const subtractFilter = (country) => {
            return !subtractFilters.some(filterType => {
                const filter = countryFilters[filterType];
                return filter && filter(country);
            });
        };
        basePool = basePool.filter(subtractFilter);
    }
    
    const previewCount = basePool.length;
    filterCount.textContent = `${previewCount} ${previewCount === 1 ? 'country' : 'countries'} available`;
}

// Initialize filter system
let filterSystemInitialized = false;

function initializeFilterSystem() {
    // Prevent multiple initializations
    if (filterSystemInitialized) {
        return;
    }
    filterSystemInitialized = true;
    
    // Initialize selectedFilters and filterStates from current filter state
    function syncSelectedFiltersFromCurrent() {
        // Reset states
        selectedFilters = ['all'];
        subtractFilters = [];
        filterStates = {};
        
        if (gameState.currentFilter && gameState.currentFilter !== 'all') {
            // Check if filter contains subtraction (format: "add1,add2|subtract1,subtract2")
            if (gameState.currentFilter.includes('|')) {
                const [addPart, subtractPart] = gameState.currentFilter.split('|');
                if (addPart && addPart !== 'all') {
                    selectedFilters = addPart.split(',');
                    selectedFilters.forEach(f => {
                        filterStates[f] = 'add';
                    });
                } else {
                    selectedFilters = ['all'];
                }
                if (subtractPart) {
                    subtractFilters = subtractPart.split(',');
                    subtractFilters.forEach(f => {
                        filterStates[f] = 'subtract';
                    });
                }
            } else {
                // No subtraction, just add filters
                if (gameState.currentFilter.includes(',')) {
                    selectedFilters = gameState.currentFilter.split(',');
                } else {
                    selectedFilters = [gameState.currentFilter];
                }
                selectedFilters.forEach(f => {
                    if (f !== 'all') {
                        filterStates[f] = 'add';
                    }
                });
            }
        }
    }
    
    // Initialize on load
    syncSelectedFiltersFromCurrent();
    
    // Set up filter button click
    filterButton.addEventListener('click', () => {
        // Sync selectedFilters from current filter state before opening modal
        syncSelectedFiltersFromCurrent();
        
        filterModal.classList.remove('hidden');
        
        // Highlight currently selected filters (re-query to get fresh elements)
        const currentFilterOptions = document.querySelectorAll('.filter-option');
        currentFilterOptions.forEach(btn => {
            const filterType = btn.dataset.filter;
            btn.classList.remove('active', 'subtract');
            
            if (filterType === 'all' && selectedFilters.includes('all') && Object.keys(filterStates).length === 0) {
                btn.classList.add('active');
            } else if (filterStates[filterType] === 'add') {
                btn.classList.add('active');
            } else if (filterStates[filterType] === 'subtract') {
                btn.classList.add('active', 'subtract');
            }
        });
        
        updateFilterCount();
    });
    
    // Set up filter option clicks (three-state toggle: not selected -> add -> subtract -> not selected)
    // Use event delegation on the modal to handle clicks dynamically
    filterModal.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-option');
        if (!btn) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const filterType = btn.dataset.filter;
        
        // Ensure selectedFilters is an array
        if (!Array.isArray(selectedFilters)) {
            selectedFilters = selectedFilters ? [selectedFilters] : ['all'];
        }
        
        // Special handling for 'all' filter
        if (filterType === 'all') {
            // If 'all' is clicked, reset everything to 'all'
            selectedFilters = ['all'];
            subtractFilters = [];
            filterStates = {};
            
            // Update all button states
            document.querySelectorAll('.filter-option').forEach(b => {
                b.classList.remove('active', 'subtract');
                if (b.dataset.filter === 'all') {
                    b.classList.add('active');
                }
            });
        } else {
            // Three-state toggle: not selected -> add -> subtract -> not selected
            const currentState = filterStates[filterType];
            
            if (currentState === null || currentState === undefined) {
                // First click: Always add mode (include countries)
                // Remove 'all' if it's selected and we're adding a specific filter
                if (selectedFilters.includes('all')) {
                    selectedFilters = selectedFilters.filter(f => f !== 'all');
                    const allBtn = document.querySelector('.filter-option[data-filter="all"]');
                    if (allBtn) allBtn.classList.remove('active');
                }
                
                filterStates[filterType] = 'add';
                if (!selectedFilters.includes(filterType)) {
                    selectedFilters.push(filterType);
                }
                if (subtractFilters.includes(filterType)) {
                    subtractFilters = subtractFilters.filter(f => f !== filterType);
                }
                btn.classList.add('active');
                btn.classList.remove('subtract');
            } else if (currentState === 'add') {
                // Second click: Switch from add to subtract mode
                filterStates[filterType] = 'subtract';
                // Remove from add filters, add to subtract filters
                selectedFilters = selectedFilters.filter(f => f !== filterType);
                if (!subtractFilters.includes(filterType)) {
                    subtractFilters.push(filterType);
                }
                btn.classList.add('active', 'subtract');
            } else if (currentState === 'subtract') {
                // Third click: Remove filter
                filterStates[filterType] = null;
                delete filterStates[filterType];
                selectedFilters = selectedFilters.filter(f => f !== filterType);
                subtractFilters = subtractFilters.filter(f => f !== filterType);
                btn.classList.remove('active', 'subtract');
                
                // If no filters selected, default to 'all'
                const hasAddFilters = Object.keys(filterStates).some(f => filterStates[f] === 'add');
                if (selectedFilters.length === 0 && !hasAddFilters && subtractFilters.length === 0) {
                    selectedFilters = ['all'];
                    const allBtn = document.querySelector('.filter-option[data-filter="all"]');
                    if (allBtn) allBtn.classList.add('active');
                }
            }
        }
        
        // Debug log to verify state
        console.log('Selected filters (add):', selectedFilters);
        console.log('Subtract filters:', subtractFilters);
        console.log('Filter states:', filterStates);
        
        updateFilterCount();
    });
    
    // Apply filter button
    applyFilterButton.addEventListener('click', () => {
        // Get add and subtract filters from filterStates
        const addFilters = selectedFilters.filter(f => f !== 'all');
        const subtractFiltersList = Object.keys(filterStates).filter(f => filterStates[f] === 'subtract');
        
        // If 'all' is selected and no add filters, use 'all' as base
        const finalAddFilters = (selectedFilters.includes('all') && addFilters.length === 0) ? ['all'] : addFilters;
        
        applyFilter(finalAddFilters, subtractFiltersList);
        filterModal.classList.add('hidden');
        // Restart game with new filter
        restartGame();
    });
    
    // Close filter button
    closeFilterButton.addEventListener('click', () => {
        filterModal.classList.add('hidden');
        // Reset selection to current filter
        syncSelectedFiltersFromCurrent();
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !filterModal.classList.contains('hidden')) {
            filterModal.classList.add('hidden');
            // Reset selection to current filter
            syncSelectedFiltersFromCurrent();
        }
    });
}

// Border settings
let borderSettings = {
    thickness: 3,
    contrast: 3,
    overlay: true
};

// Apply border settings to map
function applyBorderSettings() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    
    // Remove all existing border styles first
    mapContainer.classList.remove('border-thin', 'border-medium', 'border-thick');
    mapContainer.classList.remove('contrast-low', 'contrast-medium', 'contrast-high');
    mapContainer.classList.remove('border-overlay-on', 'border-overlay-off');
    
    // Small delay to ensure classes are removed before adding new ones
    setTimeout(() => {
        // Apply thickness (1-2 = thin, 3 = medium, 4-5 = thick)
        if (borderSettings.thickness <= 2) {
            mapContainer.classList.add('border-thin');
        } else if (borderSettings.thickness === 3) {
            mapContainer.classList.add('border-medium');
        } else {
            mapContainer.classList.add('border-thick');
        }
        
        // Apply contrast (1-2 = low, 3 = medium, 4-5 = high)
        if (borderSettings.contrast <= 2) {
            mapContainer.classList.add('contrast-low');
        } else if (borderSettings.contrast === 3) {
            mapContainer.classList.add('contrast-medium');
        } else {
            mapContainer.classList.add('contrast-high');
        }
        
        // Apply overlay
        if (borderSettings.overlay) {
            mapContainer.classList.add('border-overlay-on');
        } else {
            mapContainer.classList.add('border-overlay-off');
        }
        
        // Update borders overlay layer style
        updateBordersLayerStyle();
        
        // Toggle borders layer visibility
        if (gameState.map && countryBordersLayer) {
            if (borderSettings.overlay) {
                if (!gameState.map.hasLayer(countryBordersLayer)) {
                    countryBordersLayer.addTo(gameState.map);
                }
            } else {
                if (gameState.map.hasLayer(countryBordersLayer)) {
                    gameState.map.removeLayer(countryBordersLayer);
                }
            }
        }
        
        // Force map to invalidate size and refresh tiles if needed
        if (gameState.map) {
            setTimeout(() => {
                gameState.map.invalidateSize();
            }, 100);
        }
    }, 10);
}


// Initialize border settings system
function initializeBorderSettings() {
    // Get DOM elements (now in settings, not modal)
    borderThicknessSlider = document.getElementById('border-thickness');
    borderContrastSlider = document.getElementById('border-contrast');
    borderOverlayCheckbox = document.getElementById('border-overlay');
    
    // Check if elements exist
    if (!borderThicknessSlider || !borderContrastSlider || !borderOverlayCheckbox) {
        console.warn('Border settings elements not found, skipping initialization');
        return;
    }
    
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('flagfinder-border-settings');
    if (savedSettings) {
        try {
            borderSettings = { ...borderSettings, ...JSON.parse(savedSettings) };
        } catch (e) {
            console.error('Error loading border settings:', e);
        }
    }
    
    // Apply initial settings
    applyBorderSettings();
    
    // Set slider values
    borderThicknessSlider.value = borderSettings.thickness;
    borderContrastSlider.value = borderSettings.contrast;
    borderOverlayCheckbox.checked = borderSettings.overlay;
    
    // Apply border settings on change (no modal needed)
    borderThicknessSlider.addEventListener('input', () => {
        borderSettings.thickness = parseInt(borderThicknessSlider.value);
        localStorage.setItem('flagfinder-border-settings', JSON.stringify(borderSettings));
        applyBorderSettings();
    });
    
    borderContrastSlider.addEventListener('input', () => {
        borderSettings.contrast = parseInt(borderContrastSlider.value);
        localStorage.setItem('flagfinder-border-settings', JSON.stringify(borderSettings));
        applyBorderSettings();
    });
    
    borderOverlayCheckbox.addEventListener('change', () => {
        borderSettings.overlay = borderOverlayCheckbox.checked;
        localStorage.setItem('flagfinder-border-settings', JSON.stringify(borderSettings));
        applyBorderSettings();
    });
}

// ==================== SERVICE WORKER & OFFLINE FUNCTIONALITY ====================

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
              console.log('New version available! Refresh to update.');
            }
          });
        });
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// Pre-download state
let preDownloadState = {
  flagsDownloaded: 0,
  flagsTotal: 0,
  dataDownloaded: 0,
  dataTotal: 0,
  isDownloading: false,
  downloadProgress: 0,
  startTime: null,
  lastUpdateTime: null,
  bytesDownloaded: 0,
  estimatedTotalBytes: 0,
  downloadSpeed: 0,
  timeRemaining: 0
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
    // Show pre-download option after a short delay
    setTimeout(() => {
      showPreDownloadPrompt();
    }, 2000);
  }
}

// Show pre-download prompt
function showPreDownloadPrompt() {
  // Check if prompt already exists
  if (document.getElementById('pre-download-prompt')) {
    return;
  }
  
  // Add UI element to prompt user
  const prompt = document.createElement('div');
  prompt.id = 'pre-download-prompt';
  prompt.className = 'pre-download-prompt';
  prompt.innerHTML = `
    <div class="pre-download-content">
      <h3>📥 Download Game Assets</h3>
      <p>Download all flags and country data to play offline?</p>
      <p class="pre-download-note">This will download ~2-4MB of data. You can continue playing while downloading.</p>
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
    localStorage.setItem('preDownloadStatus', 'skipped');
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
  preDownloadState.flagsDownloaded = 0;
  preDownloadState.dataDownloaded = 0;
  preDownloadState.startTime = Date.now();
  preDownloadState.lastUpdateTime = Date.now();
  preDownloadState.downloadSpeed = 0;
  preDownloadState.timeRemaining = 0;
  preDownloadState.estimatedTotalBytes = (preDownloadState.flagsTotal * 15 * 1024) + (preDownloadState.dataTotal * 2 * 1024);
  
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
  if (!('caches' in window)) {
    console.error('Cache API not available');
    return;
  }
  
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
  if (!('caches' in window)) {
    console.error('Cache API not available');
    return;
  }
  
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
  preDownloadState.downloadProgress = total > 0 ? Math.round((downloaded / total) * 100) : 0;
  
  // Calculate download speed and time remaining
  const now = Date.now();
  if (preDownloadState.startTime && preDownloadState.lastUpdateTime) {
    const timeDiff = (now - preDownloadState.lastUpdateTime) / 1000; // seconds
    if (timeDiff > 0) {
      // Estimate: each flag ~15KB, each data ~2KB
      const estimatedBytesPerFlag = 15 * 1024;
      const estimatedBytesPerData = 2 * 1024;
      const bytesPerItem = (preDownloadState.flagsDownloaded * estimatedBytesPerFlag + 
                           preDownloadState.dataDownloaded * estimatedBytesPerData) / Math.max(1, downloaded);
      const itemsPerSecond = downloaded / ((now - preDownloadState.startTime) / 1000);
      preDownloadState.downloadSpeed = itemsPerSecond * bytesPerItem;
      
      if (itemsPerSecond > 0) {
        const remaining = total - downloaded;
        preDownloadState.timeRemaining = Math.ceil(remaining / itemsPerSecond);
      }
    }
  }
  preDownloadState.lastUpdateTime = now;
  
  const progressBar = document.getElementById('pre-download-progress-bar');
  const progressText = document.getElementById('pre-download-progress-text');
  const progressDetails = document.getElementById('pre-download-progress-details');
  
  if (progressBar) {
    progressBar.style.width = `${preDownloadState.downloadProgress}%`;
  }
  
  if (progressText) {
    progressText.textContent = `${preDownloadState.downloadProgress}% Complete`;
  }
  
  if (progressDetails) {
    const flagsText = `Flags: ${preDownloadState.flagsDownloaded}/${preDownloadState.flagsTotal}`;
    const dataText = `Data: ${preDownloadState.dataDownloaded}/${preDownloadState.dataTotal}`;
    const speedText = formatBytes(preDownloadState.downloadSpeed) + '/s';
    const timeText = formatTime(preDownloadState.timeRemaining);
    const totalText = `Total: ${downloaded}/${total} items`;
    
    progressDetails.innerHTML = `
      <div class="progress-detail-row">
        <span>${flagsText}</span>
        <span>${dataText}</span>
      </div>
      <div class="progress-detail-row">
        <span>${totalText}</span>
      </div>
      <div class="progress-detail-row">
        <span>Speed: ${speedText}</span>
        <span>Time remaining: ${timeText}</span>
      </div>
    `;
  }
}

// Format bytes to human readable format
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Format seconds to human readable time
function formatTime(seconds) {
  if (seconds === 0 || !isFinite(seconds)) return 'Calculating...';
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
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
          <div id="pre-download-progress-details" class="pre-download-progress-details"></div>
        </div>
        <p class="pre-download-note">This may take a few minutes. You can continue playing while downloading.</p>
        <button id="cancel-pre-download" class="close-filter-button">Cancel</button>
      </div>
    `;
    
    document.getElementById('cancel-pre-download').addEventListener('click', () => {
      preDownloadState.isDownloading = false;
      hidePreDownloadProgress();
    });
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

// Format bytes to human-readable
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Clear all caches
async function clearAllCaches() {
  if (confirm('Are you sure you want to clear all cached data? You will need to download assets again for offline play.')) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    localStorage.removeItem('preDownloadStatus');
    localStorage.removeItem('preDownloadDate');
    alert('Cache cleared successfully.');
    location.reload();
  }
}

// Add pre-download button to settings
function addPreDownloadToSettings() {
  const settingsContent = document.querySelector('.settings-modal-content .settings-options');
  if (settingsContent && !document.getElementById('manual-pre-download')) {
    const downloadSection = document.createElement('div');
    downloadSection.className = 'setting-item';
    downloadSection.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <button id="manual-pre-download" class="apply-filter-button">Download All Game Assets</button>
        <p class="setting-description">Download flags and country data for offline play (~2-4MB). Requires internet connection.</p>
        <button id="clear-cache-button" class="close-filter-button" style="margin-top: 0.5rem;">Clear Cache</button>
        <p id="cache-size-display" class="setting-description" style="font-size: 0.75rem;"></p>
      </div>
    `;
    settingsContent.appendChild(downloadSection);
    
    document.getElementById('manual-pre-download').addEventListener('click', startPreDownload);
    document.getElementById('clear-cache-button').addEventListener('click', clearAllCaches);
    
    // Display cache size
    getCacheSize().then(size => {
      const sizeElement = document.getElementById('cache-size-display');
      if (sizeElement) {
        sizeElement.textContent = `Cache size: ${formatBytes(size)}`;
      }
    });
  }
}

// Initialize game when page loads
initGame();

// Initialize border settings after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBorderSettings);
} else {
    // DOM is already ready
    setTimeout(initializeBorderSettings, 100);
}

