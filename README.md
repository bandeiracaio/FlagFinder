# 🗺️ FlagFinder

A fun and educational geography quiz game where you identify countries by their flags on an interactive world map!

**Version: v1.0.2**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PWA](https://img.shields.io/badge/PWA-enabled-667eea.svg)](https://web.dev/progressive-web-apps/)

## 🎮 Features

### Game Modes
- **Classic Mode** - 10 rounds with scoring and streak multipliers
- **Practice Mode** - Learn flags without pressure
- **Daily Challenge** - Same flags for everyone, changes daily
- **Time Challenge** - 4 seconds per flag (fast-paced!)
- **Blitz Mode** - 60-second countdown, score as many as you can!
- **Endless Mode** - Play until you get one wrong

### Advanced Filtering System
- **80+ Filter Options** including:
  - **Regions**: Africa, Asia, Europe, Americas, Oceania
  - **Sub-Regions**: Middle East, Southeast Asia, Balkans, Caribbean, and many more
  - **Language Groups**: Francophone, Anglophone, Spanish-Speaking, Arabic-Speaking, and 20+ more
  - **International Organizations**: G20, EU, NATO, BRICS, ASEAN, OPEC, and more
  - **Cultural & Historical**: Former Soviet Union, Latin America, Commonwealth Realms, and more
  - **Difficulty**: Large, Medium, Small countries, Microstates, Islands, Landlocked
- **Smart Filtering**: Add filters to include countries, or subtract filters to exclude them
- **Three-State Filter System**: Click once to add, twice to subtract, three times to remove

### Game Features
- 🎯 **Interactive World Map** - Click on countries using Leaflet.js
- 🏆 **Achievement System** - Unlock achievements as you play
- 📊 **Statistics Tracking** - Track your progress by region, country, and game mode
- 💡 **Hint System** - Get hints about continent, capital, population, or neighbors
- 🎨 **Multiple Map Styles** - Political (light), Dark mode, and Satellite view
- 🌓 **Dark Mode** - Easy on the eyes
- 📱 **Progressive Web App** - Install and play offline
- ⚙️ **Customizable Settings** - Border visibility, country labels, sound effects, and more

### Quiz Modes
- **Map Click** - Click on the map where you think the country is
- **Multiple Choice** - Choose from 4 options
- **Reverse Quiz** - See the country, identify the flag
- **Capital Quiz** - Name the capital city

## 🚀 Quick Start

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (required due to CORS restrictions)

### Running Locally

#### Option 1: Python (Easiest)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Then open `http://localhost:8000` in your browser.

#### Option 2: Node.js
```bash
npm install -g http-server
http-server
```
Then open the URL shown in the terminal (usually `http://localhost:8080`).

#### Option 3: VS Code Live Server
1. Install the "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

#### Option 4: Online Hosting
Deploy to:
- [GitHub Pages](https://pages.github.com/)
- [Netlify](https://www.netlify.com/)
- [Vercel](https://vercel.com/)
- Any static web hosting service

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Map Library**: [Leaflet.js](https://leafletjs.com/) v1.9.4
- **APIs**:
  - [REST Countries API](https://restcountries.com/) - Country data
  - [FlagCDN](https://flagcdn.com/) - Flag images
  - [Nominatim (OpenStreetMap)](https://nominatim.org/) - Reverse geocoding
- **PWA**: Service Worker for offline support
- **Storage**: LocalStorage for game data persistence

## 📁 Project Structure

```
FlagFinder/
├── index.html          # Main HTML file
├── script.js           # Game logic and functionality
├── styles.css          # Styling and responsive design
├── manifest.json       # PWA manifest
├── sw.js              # Service Worker for offline support
├── icons/             # PWA icons (72x72 to 512x512)
├── HOW_TO_RUN.md      # Detailed setup instructions
└── README.md          # This file
```

## 🎯 How to Play

1. **Start a Game**: Choose your game mode and filters
2. **View the Flag**: A flag appears at the top of the screen
3. **Click on the Map**: Click where you think that country is located
4. **Get Feedback**: See if you're correct and how close you were
5. **Earn Points**: Correct answers give points, streaks multiply your score!
6. **Use Hints**: Get hints at the cost of 2 points each
7. **Track Progress**: View your statistics and achievements

## 🎨 Customization

### Filter System
- **Add Filters**: Click once on a filter to include those countries
- **Subtract Filters**: Click twice on a filter to exclude those countries
- **Combine Filters**: Select multiple filters to create custom country pools

### Settings
- **Dark Mode**: Toggle dark theme
- **Map Style**: Choose from Political (light), Dark mode, or Satellite view
- **Border Settings**: Adjust border thickness, contrast, and overlay visibility
- **Country Labels**: Show/hide country names on the map
- **Sound Effects**: Enable/disable game sounds
- **Font Size**: Adjust text size for accessibility
- **Header Spacing**: Control spacing of header elements (Default, Compact, Minimal)
- **Mobile Settings**: Haptic feedback, swipe gestures, fullscreen mode, landscape lock

## 📊 Statistics & Achievements

Track your progress with comprehensive statistics:
- Overall stats (games played, total score, accuracy)
- Regional statistics
- Per-country statistics
- Game history
- Personal records
- Achievement progress

## 🌍 Filter Categories

### Regions (5)
- Africa, Asia, Europe, Americas, Oceania

### Sub-Regions (24)
- Middle East, Southeast Asia, Central Asia, East Asia, South Asia, West Asia
- Balkans, Scandinavia, Baltic States, Benelux, Visegrad Group, Mediterranean
- Caribbean, Central America, North America, South America, Andean Countries
- North Africa, West Africa, Central Africa, East Africa, Horn of Africa, Southern Africa
- Pacific Islands

### Language Groups (17)
- Francophone, Anglophone, Lusophone, Spanish-Speaking
- Arabic-Speaking, German-Speaking, Italian-Speaking, Russian-Speaking
- Chinese-Speaking, Dutch-Speaking, Turkish-Speaking, Persian-Speaking
- Malay-Speaking, Swahili-Speaking, Hindi-Speaking, Korean-Speaking
- Greek-Speaking, Romanian-Speaking, Czech-Speaking, Serbian-Speaking, Albanian-Speaking

### International Organizations (9)
- G20, European Union, NATO, BRICS, Commonwealth, OPEC
- ASEAN, African Union, Mercosur

### Cultural & Historical (24)
- Latin America, Former Soviet Union, Arab League, Nordic Countries
- Commonwealth Realms, Maghreb, Sahel, Iberian Peninsula
- British Isles, Low Countries, Slavic Countries, Romance Countries
- Germanic Countries, Celtic Nations, Orthodox Countries, Catholic Countries
- Muslim-Majority, Buddhist-Majority, Hindu-Majority
- Pacific Alliance, Andean Community, Turkic States, SICA

### Difficulty (6)
- Large Countries, Medium Countries, Small Countries
- Microstates, Island Nations, Landlocked Countries

## 🔧 Development

### Browser Compatibility
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

### Known Issues
- Requires a web server (cannot run from `file://` protocol due to CORS)
- Some older browsers may not support all PWA features

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Credits

- **Flag Images**: [FlagCDN](https://flagcdn.com/)
- **Country Data**: [REST Countries API](https://restcountries.com/)
- **Map Tiles**: [OpenStreetMap](https://www.openstreetmap.org/) contributors
- **Map Library**: [Leaflet.js](https://leafletjs.com/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Areas for Contribution
- Additional filter options
- New game modes
- UI/UX improvements
- Bug fixes
- Performance optimizations
- Documentation improvements

## 📧 Support

If you encounter any issues or have suggestions, please open an issue on GitHub.

---

**Enjoy testing your geography knowledge! 🌍🚩**

