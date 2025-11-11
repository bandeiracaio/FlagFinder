# How to Run FlagFinder

## The Problem
If you're seeing an error when opening `index.html` directly, it's because browsers block API requests when opening files using the `file://` protocol (CORS security restriction).

## Solution: Use a Local Web Server

### Option 1: Python (Easiest)
If you have Python installed:

1. Open a terminal/command prompt in the FlagFinder folder
2. Run one of these commands:

**Python 3:**
```bash
python -m http.server 8000
```

**Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

3. Open your browser and go to: `http://localhost:8000`

### Option 2: Node.js (if you have it)
1. Install a simple server globally:
```bash
npm install -g http-server
```

2. Navigate to the FlagFinder folder and run:
```bash
http-server
```

3. Open the URL shown in the terminal (usually `http://localhost:8080`)

### Option 3: VS Code Live Server
If you use VS Code:
1. Install the "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 4: Online Hosting
Upload the files to:
- GitHub Pages
- Netlify
- Vercel
- Any web hosting service

## Quick Test
Once running on a local server, the game should load without errors!

