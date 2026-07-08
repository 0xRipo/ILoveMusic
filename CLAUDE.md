# CLAUDE.md - ILoveMusic Project Documentation
**Complete Project Understanding for AI Assistants**

---

## 📋 PROJECT OVERVIEW

### Identitas Project
- **Nama**: ILoveMusic Desktop
- **Versi**: 0.2.1
- **Deskripsi**: Desktop application untuk download, organize, dan preview musik dari SoundCloud & Spotify
- **Target User**: DJs, music collectors, music enthusiasts
- **Platform**: Cross-platform (macOS, Windows, Linux)
- **Lisensi**: MIT
- **Author**: CactusDomain (@cactusdomain)

### Filosofi Project
- **Lightweight**: Tidak bloated, efisien
- **Local-first**: Semua data disimpan lokal
- **Hackable**: Code mudah dimengerti dan dimodifikasi
- **Maintainable**: Struktur sederhana, tidak over-engineered
- **Quality-focused**: Premium audio quality (320kbps)

---

## 🏗️ ARCHITECTURE

### Stack Teknologi
```
┌─────────────────────────────────────┐
│         ELECTRON APP                │
│  (Desktop Application Framework)    │
├─────────────────────────────────────┤
│                                     │
│  MAIN PROCESS (main.js)             │
│  - Electron backend                 │
│  - IPC handlers                     │
│  - File system operations           │
│  - External tools integration       │
│  - Spotify API integration          │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  RENDERER PROCESS                   │
│  - React (UI framework)             │
│  - Vite (Build tool)                │
│  - ILoveMusic.jsx (Main component)  │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  EXTERNAL TOOLS                     │
│  - ffmpeg (audio processing)        │
│  - aubio (BPM detection)            │
│  - spotdl (Spotify downloads)       │
│  - yt-dlp (YouTube fallback)        │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  NODE MODULES                       │
│  - soundcloud-downloader            │
│  - music-metadata                   │
│  - node-id3                         │
│  - archiver                         │
│  - dotenv                           │
│                                     │
└─────────────────────────────────────┘
```

### Folder Structure
```
ILoveMusic/
├── main.js                 # Electron main process
├── preload.js             # Preload script for IPC
├── package.json           # Project dependencies
├── .env                   # Environment variables (Spotify credentials)
├── .env.example          # Template untuk .env
├── electron-builder.yml  # Build configuration
│
├── renderer/             # React frontend
│   ├── src/
│   │   ├── ILoveMusic.jsx   # Main UI component
│   │   ├── App.jsx          # App wrapper
│   │   ├── main.jsx         # Entry point
│   │   ├── index.css        # Global styles
│   │   └── assets/          # Images, videos
│   ├── dist/              # Build output
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
│
├── md files/             # Documentation
│   ├── APP_SUMMARY.md
│   ├── SPOTIFY_INTEGRATION_COMPLETE.md
│   ├── VERSION_0.2.0_SUMMARY.md
│   └── ... (other docs)
│
├── build/                # Build artifacts
├── dist/                 # Distribution builds
│
├── README.md             # Project overview
├── CHANGELOG.md          # Version history
├── UI_DESIGN_SPEC.md    # UI design documentation
├── UI_REDESIGN_COMPLETE.md  # Latest UI redesign docs
└── CLAUDE.md            # This file
```

---

## 🎯 CORE FEATURES

### 1. Multi-Source Downloads
**SoundCloud Support:**
- Download via URL
- Menggunakan `soundcloud-downloader` npm package
- Automatic metadata extraction
- Artwork embedding

**Spotify Support:**
- Download via Spotify track URL
- Menggunakan `spotdl` (Python tool)
- 320kbps MP3 quality
- Fetch metadata dari Spotify API
- YouTube Music sebagai audio source (via spotdl)
- Fallback ke YouTube search jika gagal

### 2. Audio Processing
**BPM Detection:**
- Menggunakan `aubio` tempo detection
- Convert audio ke WAV 44.1kHz mono
- Deteksi BPM range 60-200
- Auto double untuk half-time detection

**Metadata Management:**
- Extract metadata dari audio files
- Edit title, artist, BPM, key
- Embed artwork ke audio
- Write metadata menggunakan ffmpeg dan node-id3

**Audio Formats Supported:**
- MP3
- M4A (AAC)
- WAV
- FLAC
- OGG

### 3. UI/UX Features
**Track Management:**
- Add tracks via URL
- Preview/play audio in-app
- Search dan filter tracks
- Sort by title, artist, BPM, duration
- BPM range filter
- Artist filter
- Select multiple tracks
- Batch operations

**Download System:**
- Single track download
- Multi-track ZIP download
- Progress indicator
- Download ke ~/Downloads folder

**Playback:**
- In-app audio player
- Play/pause controls
- Progress bar (seekable)
- Current time / total duration display
- Only one track plays at a time

**Design System:**
- Brutalist/minimal aesthetic
- Gradient background (animated)
- Glassmorphism UI
- Electric blue accent (#00D4FF)
- Monospace fonts (SF Mono, Monaco)
- All text UPPERCASE
- Sharp corners (no border-radius)
- Dark theme

---

## 🔧 TECHNICAL IMPLEMENTATION

### Main Process (main.js)

#### External Tools Detection
```javascript
// Prioritas pencarian tools:
1. System PATH (/opt/homebrew/bin, /usr/local/bin, /usr/bin)
2. Bundled dengan app (resources/bin)
3. Common install locations

Tools yang dideteksi:
- ffmpeg, ffprobe
- aubio
- spotdl
- yt-dlp
```

#### Spotify API Integration
```javascript
Flow:
1. Load credentials dari .env (SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET)
2. Client Credentials Flow untuk get access token
3. Token cache (50 menit expiry)
4. Fetch track metadata dari /v1/tracks/{id}
5. Extract: title, artist, album, artwork URL, duration
```

#### Download Workflow - Spotify
```javascript
1. Detect URL source (Spotify vs SoundCloud)
2. Extract Spotify track ID
3. Fetch metadata dari Spotify API
4. Download audio menggunakan spotdl:
   - Format: MP3 320kbps
   - Audio provider: YouTube Music (preferred)
   - Fallback: YouTube search
   - Sponsor block enabled
5. Verify download (file exists & size > 0)
6. Detect BPM menggunakan aubio
7. Write metadata ke file (ffmpeg)
8. Embed artwork
9. Return track object
```

#### Download Workflow - SoundCloud
```javascript
1. Download menggunakan soundcloud-downloader
2. Save as MP3
3. Extract metadata (music-metadata)
4. Detect BPM (aubio)
5. Write metadata (ffmpeg)
6. Embed artwork if available
7. Return track object
```

#### Track Object Structure
```javascript
{
  id: number,           // Unique ID (timestamp)
  title: string,        // Track title
  artist: string,       // Artist name
  url: string,         // file:// URL to audio file
  bpm: number,         // BPM (detected or null)
  key: string,         // Musical key (if available)
  duration: number,    // Duration in seconds
  currentTime: number, // Current playback position
  thumbnail: string,   // Artwork URL or file path
  source: string,      // 'soundcloud' or 'spotify'
  downloadSource: string // 'spotdl' or 'youtube-fallback'
}
```

### Renderer Process (ILoveMusic.jsx)

#### State Management
```javascript
// Track states
- tracks: Array<Track>          // All tracks
- tracksLoaded: boolean         // Tracks loaded from file
- selected: Set<number>         // Selected track IDs
- playingTrack: number | null   // Currently playing ID
- editingTrack: Track | null    // Track being edited

// UI states
- activeTab: 'about' | 'preview'
- pastedUrl: string
- loadingTrack: boolean
- downloading: boolean
- downloadProgress: number

// Filter states
- searchQuery: string
- filterBpmMin: string
- filterBpmMax: string
- filterArtist: string
- sortBy: 'title' | 'artist' | 'bpm' | 'duration'
- sortOrder: 'asc' | 'desc'
```

#### IPC Communication
```javascript
// Main -> Renderer
window.electron.addSoundCloud(url) → Track
window.electron.downloadTracks(ids, tracks) → { success, filePath }
window.electron.saveTracks(tracks) → void
window.electron.loadTracks() → { success, tracks }
window.electron.onDownloadProgress(callback) → void

// Preload.js exposes safe API via contextBridge
```

#### Data Persistence
```javascript
// Auto-save system
- Tracks saved ke: ~/Documents/ILoveMusic/tracks.json
- Save triggered on tracks state change
- Load on app mount
- Fallback ke localStorage untuk development
```

#### UI Components

**Header Bar:**
- Glass background dengan blur
- Input untuk paste URL
- Add button (electric blue accent on hover)

**Tab Navigation:**
- About tab (info & Instagram link)
- Preview tab (main interface)
- Glass buttons, active state dengan blue accent

**Filter Section:**
- Search bar
- BPM min/max inputs
- Artist filter
- Sort controls
- Select all/deselect all button
- Glass panel dengan blur effect

**Track Cards:**
- Glass background dengan hover effect
- Play/pause button (blue when playing)
- Track title & artist (uppercase)
- BPM display
- Time display (current/total)
- Progress bar (gradient with glow)
- Action buttons: Select, Edit, Remove
- Hover: translateY(-2px), blue border glow

**Download Bar (Bottom):**
- Fixed position, appears when tracks selected
- Dark glass dengan blue border
- Track count display
- Download button (blue accent)
- Progress bar dengan gradient

**Edit Modal:**
- Dark glass overlay
- Modal dengan blur effect
- Blue accent title
- Input fields untuk title & artist
- Cancel & Save buttons (glass with hover)

---

## 🎨 DESIGN SYSTEM

### Color Palette
```css
/* Background */
--gradient-start: #0a0a0a
--gradient-mid: #1a1a1a
--gradient-end: #252525

/* Glass Effects */
--glass-light: rgba(255, 255, 255, 0.05)
--glass-medium: rgba(255, 255, 255, 0.08)
--glass-dark: rgba(0, 0, 0, 0.3)
--glass-darker: rgba(0, 0, 0, 0.6)

/* Borders */
--border-subtle: rgba(255, 255, 255, 0.1)
--border-normal: rgba(255, 255, 255, 0.2)

/* Accent (Electric Blue) */
--accent: #00D4FF
--accent-secondary: #0099FF
--accent-bg: rgba(0, 212, 255, 0.2)
--accent-border: rgba(0, 212, 255, 0.5)

/* Text */
--text-primary: #ffffff
--text-secondary: #a0a0a0

/* Error/Delete */
--error-bg: rgba(255, 0, 0, 0.2)
--error-border: rgba(255, 0, 0, 0.5)
```

### Typography
```css
font-family: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace
text-transform: uppercase
letter-spacing: 0.01em - 0.02em

Sizes:
- Headers: 12px (bold)
- Body: 11px
- Small: 10px
```

### Effects
```css
/* Glassmorphism */
background: rgba(255, 255, 255, 0.05)
backdrop-filter: blur(10px)
border: 1px solid rgba(255, 255, 255, 0.1)

/* Gradient Animation */
@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
animation: gradient-shift 20s ease infinite

/* Progress Bar Glow */
background: linear-gradient(90deg, #00D4FF, #0099FF)
box-shadow: 0 0 10px rgba(0, 212, 255, 0.5)

/* Hover Effects */
transform: translateY(-2px)
border-color: rgba(0, 212, 255, 0.3)
```

---

## 📦 DEPENDENCIES

### Main Process
```json
{
  "electron": "^39.2.7",
  "dotenv": "^17.4.2",
  "soundcloud-downloader": "^1.0.0",
  "music-metadata": "^11.10.3",
  "node-id3": "^0.2.9",
  "archiver": "^7.0.1"
}
```

### Renderer Process
```json
{
  "react": "^19.0.0",
  "vite": "^6.2.3"
}
```

### External Tools (Required)
```bash
# macOS (Homebrew)
brew install ffmpeg aubio

# Python tools
pip3 install spotdl

# yt-dlp (optional, fallback)
brew install yt-dlp
```

---

## ⚙️ CONFIGURATION

### Environment Variables (.env)
```env
# Spotify API Credentials
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here

# Get credentials from:
# https://developer.spotify.com/dashboard
```

### Build Configuration (electron-builder.yml)
```yaml
appId: com.cactusdomain.ilovemusic
productName: ILoveMusic
directories:
  output: dist
files:
  - "**/*"
  - "!renderer/src"
  - "!renderer/node_modules"
asarUnpack:
  - "node_modules/soundcloud-downloader/**/*"
  - "node_modules/music-metadata/**/*"
  - "node_modules/node-id3/**/*"
mac:
  category: public.app-category.music
  target: dmg
win:
  target: nsis
linux:
  target: AppImage
```

---

## 🚀 DEVELOPMENT WORKFLOW

### Setup
```bash
# Clone repository
git clone https://github.com/0xRipo/ILoveMusic.git
cd ILoveMusic

# Install dependencies
npm install
npm install --prefix renderer

# Setup environment
cp .env.example .env
# Edit .env dengan Spotify credentials

# Install external tools
brew install ffmpeg aubio
pip3 install spotdl
```

### Development
```bash
# Start dev server
npm run dev

# This runs:
# 1. Vite dev server (renderer)
# 2. Electron app (main process)

# Traffic lights akan muncul di macOS (🔴 🟡 🟢)
```

### Building
```bash
# Build for current platform
npm run build

# Build for specific platform
npm run build:mac
npm run build:win
npm run build:linux
```

### Folder Locations
```
Development:
- Tracks data: ~/Documents/ILoveMusic/tracks.json
- Downloaded audio: ~/Documents/ILoveMusic/downloads/
- Temp files: ~/Documents/ILoveMusic/temp/

Production:
- Same locations
- Downloaded ZIPs: ~/Downloads/
```

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue: "ffmpeg is required but not found"
**Penyebab:** ffmpeg tidak terinstall atau tidak di PATH
**Solusi:**
```bash
# macOS
brew install ffmpeg

# Verify
which ffmpeg
# Should output: /opt/homebrew/bin/ffmpeg
```

### Issue: "Failed to add track: spawn yt-dlp ENOENT"
**Penyebab:** yt-dlp tidak terinstall (untuk YouTube fallback)
**Solusi:**
```bash
brew install yt-dlp
# atau
pip3 install yt-dlp
```

### Issue: "Spotify credentials not configured"
**Penyebab:** .env file tidak ada atau credentials kosong
**Solusi:**
1. Copy `.env.example` ke `.env`
2. Daftar di https://developer.spotify.com/dashboard
3. Create app, copy Client ID & Secret
4. Paste ke `.env` file

### Issue: "spotdl not found"
**Penyebab:** spotdl tidak terinstall
**Solusi:**
```bash
pip3 install spotdl

# Verify
which spotdl
# Should output: /Users/[user]/Library/Python/3.9/bin/spotdl
```

### Issue: Download gagal atau track tidak match
**Penyebab:** spotdl mencari lagu yang salah di YouTube
**Catatan:** 
- spotdl memiliki accuracy ~95-99%
- Gunakan Spotify Premium untuk hasil terbaik
- Fallback ke YouTube search jika spotdl gagal
- Beberapa lagu remix/unofficial mungkin tidak exact match

### Issue: BPM tidak terdeteksi
**Penyebab:** aubio gagal detect atau audio quality rendah
**Solusi:** 
- Install aubio: `brew install aubio`
- BPM detection membutuhkan audio quality bagus
- Manual edit BPM jika perlu (klik Edit button)

---

## 📊 PERFORMANCE METRICS

### Before UI Redesign (v0.2.0)
```
Memory: 250-470 MB (with video background)
CPU: 5-10% idle
Load Time: 2-3 seconds
GPU: Active (video decoding)
```

### After UI Redesign (v0.2.1)
```
Memory: 180-400 MB (↓ 40-70 MB saved)
CPU: 1-2% idle (↓ 80% reduction)
Load Time: 1-2 seconds (↓ 50% faster)
GPU: Minimal (CSS only)
```

### Audio Quality
```
Spotify (spotdl): 320kbps MP3
SoundCloud: Original quality (varies)
Format support: MP3, M4A, WAV, FLAC, OGG
```

---

## 🗺️ ROADMAP

### Current Version (0.2.1)
- ✅ SoundCloud integration
- ✅ Spotify integration (320kbps)
- ✅ BPM detection
- ✅ Metadata editing
- ✅ Batch downloads
- ✅ UI redesign (glassmorphism)
- ✅ Performance optimization

### Planned Features
- [ ] Rekordbox XML export
- [ ] Playlist management
- [ ] Advanced key detection
- [ ] Waveform visualization
- [ ] Duplicate detection
- [ ] Library organization tools
- [ ] Color theme customization
- [ ] Audio file lazy loading
- [ ] Virtual scrolling for large libraries
- [ ] Component memoization

---

## 🤝 CONTRIBUTION GUIDELINES

### Code Style
- **Format**: 2 spaces indentation
- **Naming**: camelCase untuk variables/functions
- **Comments**: Explain WHY, not WHAT
- **Commits**: Clear, descriptive messages

### Before Contributing
1. Fork repository
2. Create feature branch
3. Test locally
4. Ensure no breaking changes
5. Submit PR dengan deskripsi jelas

### What to Contribute
**Welcome:**
- Bug fixes
- Performance improvements
- UI/UX enhancements
- Documentation improvements
- New features (diskusikan dulu)

**Avoid:**
- Unnecessary rewrites
- Over-engineering
- Breaking changes tanpa diskusi
- AI-generated code tanpa review

### Testing
```bash
# Manual testing checklist:
- [ ] Add SoundCloud track
- [ ] Add Spotify track
- [ ] Play/pause audio
- [ ] Edit metadata
- [ ] Download single track
- [ ] Download multiple tracks (ZIP)
- [ ] Search & filter
- [ ] Sort tracks
- [ ] BPM detection
```

---

## 📚 TECHNICAL DETAILS

### IPC Handlers (main.js)
```javascript
ipcMain.handle('soundcloud:add', async (event, url) => {
  // Handle SoundCloud & Spotify URLs
  // Returns: Track object
})

ipcMain.handle('tracks:download', async (event, trackIds, allTracks) => {
  // Download single or multiple tracks
  // Returns: { success, filePath }
})

ipcMain.handle('tracks:save', async (event, tracks) => {
  // Save tracks to JSON file
})

ipcMain.handle('tracks:load', async () => {
  // Load tracks from JSON file
  // Returns: { success, tracks }
})
```

### Audio Processing Pipeline
```
1. Download
   ↓
2. Save to temp folder
   ↓
3. Extract metadata (music-metadata)
   ↓
4. Convert to WAV for BPM (ffmpeg)
   ↓
5. Detect BPM (aubio)
   ↓
6. Download artwork (if available)
   ↓
7. Write metadata (ffmpeg + node-id3)
   ↓
8. Embed artwork (ffmpeg)
   ↓
9. Move to final location
   ↓
10. Return track object with file:// URL
```

### Spotify Integration Flow
```
User pastes URL
   ↓
Detect source (Spotify/SoundCloud)
   ↓
Extract track ID
   ↓
Get Spotify access token
   ↓
Fetch metadata from API
   ↓
Download audio via spotdl
   ↓
Verify download
   ↓
Process audio (BPM, metadata, artwork)
   ↓
Return track object
```

### File Management
```javascript
// Directories
const baseDir = path.join(os.homedir(), 'Documents', 'ILoveMusic')
const downloadsDir = path.join(baseDir, 'downloads')
const tempDir = path.join(baseDir, 'temp')
const tracksFile = path.join(baseDir, 'tracks.json')

// Audio files naming
const filename = `${trackId}.mp3`  // or .m4a

// Artwork naming
const artworkFile = `${trackId}.jpg`

// ZIP naming
const zipName = `ILoveMusic_Export_${Date.now()}.zip`
```

---

## 🔐 SECURITY NOTES

### API Credentials
- Spotify credentials di .env (NOT committed)
- Client Credentials Flow (no user auth)
- Token cached in-memory (50 min expiry)

### File System
- All operations in user's Documents folder
- No system-wide writes
- Temp files cleaned after use

### External Tools
- Tools dari system PATH (trusted sources)
- No arbitrary command execution
- Timeout untuk external processes
- Error handling untuk malformed input

---

## 📝 VERSION HISTORY

### v0.2.2 (Current) - June 2026
- macOS traffic lights support (native window controls)
- Drag region implementation
- UI padding adjustments untuk traffic lights
- Discord-style window behavior

### v0.2.1 - June 2026
- UI redesign: Gradient + Glassmorphism
- Removed video background (performance)
- Electric blue accent color
- 40-70 MB memory saved
- 80% CPU reduction

### v0.2.0 - May 2026
- Spotify integration
- spotdl implementation (320kbps)
- Improved track matching
- Enhanced metadata system
- Better error handling

### v0.1.x - April 2026
- Initial release
- SoundCloud support
- BPM detection
- Basic UI
- Metadata editing

---

## 🎯 PROJECT GOALS

### Core Mission
Create a **simple, powerful, local-first** music management tool for people who care about:
- Audio quality
- Metadata accuracy
- BPM information
- Local music libraries
- Fast workflow

### Non-Goals
- Streaming service (not a player)
- Cloud sync (local-first)
- Social features
- Playlist sharing
- Mobile app

### Design Principles
1. **Lightweight** - Fast, efficient, no bloat
2. **Hackable** - Easy to understand and modify
3. **Reliable** - Works offline, stable
4. **Professional** - For DJs and collectors
5. **Beautiful** - Modern, minimal, intentional

---

## 🛠️ TROUBLESHOOTING

### Debug Mode
```javascript
// Enable verbose logging in main.js
console.log('Debug info:', ...)

// Check Electron DevTools
// View → Toggle Developer Tools

// Check main process logs
// stdout/stderr in terminal
```

### Common Debug Steps
1. Check external tools installed
   ```bash
   which ffmpeg
   which aubio
   which spotdl
   ```

2. Verify .env file
   ```bash
   cat .env
   # Should have SPOTIFY_CLIENT_ID and SECRET
   ```

3. Check file permissions
   ```bash
   ls -la ~/Documents/ILoveMusic/
   ```

4. Clear cache
   ```bash
   rm -rf ~/Documents/ILoveMusic/temp/*
   ```

5. Check logs in DevTools Console

---

## 📞 SUPPORT & RESOURCES

### Documentation
- README.md - Project overview
- CHANGELOG.md - Version history
- UI_DESIGN_SPEC.md - Design system
- UI_REDESIGN_COMPLETE.md - Latest UI update
- This file (CLAUDE.md) - Complete docs

### External Resources
- Spotify API Docs: https://developer.spotify.com/documentation/web-api
- spotdl Docs: https://spotdl.readthedocs.io
- ffmpeg Docs: https://ffmpeg.org/documentation.html
- Electron Docs: https://www.electronjs.org/docs

### Community
- GitHub Issues: https://github.com/0xRipo/ILoveMusic/issues
- Instagram: @cactusdomain

---

## 🎓 FOR AI ASSISTANTS

### When Helping Users
1. **Understand context first**
   - Check current version (package.json)
   - Read error messages carefully
   - Verify external tools installed

2. **Provide clear solutions**
   - Step-by-step instructions
   - Copy-pasteable commands
   - Explain WHY, not just WHAT

3. **Reference this document**
   - Architecture section untuk system design
   - Technical Details untuk implementation
   - Common Issues untuk troubleshooting

4. **Maintain project philosophy**
   - Keep solutions simple
   - Avoid over-engineering
   - Respect existing patterns
   - Don't suggest unnecessary rewrites

### When Suggesting Code Changes
- Match existing code style
- Update relevant documentation
- Consider backward compatibility
- Test instructions included
- Explain tradeoffs clearly

### When Debugging
- Check external tools first
- Verify environment setup
- Review IPC communication
- Check file permissions
- Look at error context

---

## 📜 LICENSE

MIT License - Free to use, modify, and distribute

---

**Last Updated**: June 2026
**Document Version**: 1.0
**Project Version**: 0.2.1

---

*Made with love, caffeine, and loud speakers.*
*Keep the music local, keep the quality high.*
