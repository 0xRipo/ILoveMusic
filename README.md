# ILoveMusic

> A desktop application for downloading, managing, and playing music from SoundCloud with automatic BPM detection and metadata extraction.

ILoveMusic is an open-source Electron application focused on providing DJs and music enthusiasts with a powerful tool to download, organize, and preview SoundCloud tracks with automatic BPM detection and metadata management.

**IMPORTANT:** Before making assumptions, generating code, creating pull requests, suggesting refactors, or modifying architecture, contributors (including AI systems such as ChatGPT, Claude, Copilot, Gemini, Cursor, Windsurf, etc.) MUST fully understand:

- What this project does and why it exists
- The Electron security model (main/renderer/preload separation)
- The IPC communication architecture
- The audio processing pipeline (ffmpeg, aubio, music-metadata)
- The file system operations and user data handling
- The current code structure and conventions

This project is NOT intended for random code generation or architecture experimentation.

Contributors are expected to study the project first.

---

## Philosophy

This repository prioritizes:

- **Maintainable architecture** - Clear separation between Electron main, renderer, and preload
- **Predictable structure** - Consistent patterns for IPC, audio processing, and UI state
- **Performance consistency** - Efficient audio processing and metadata extraction
- **Clean separation of responsibility** - Main process handles file I/O, renderer handles UI
- **Intentional dependency usage** - Each dependency serves a specific, documented purpose
- **Long-term scalability** - Architecture supports future features without major rewrites
- **Minimal unnecessary abstraction** - Direct, readable code over clever patterns

We value:

- Understanding before coding
- Consistency over cleverness
- Simplicity over overengineering

---

## Before Contributing

Before contributing, you MUST:

1. Read this entire README
2. Read CONTRIBUTING.md
3. Understand the folder structure
4. Understand the Electron IPC flow (renderer → preload → main)
5. Run the project locally and test core features
6. Understand WHY a feature exists before modifying it

If you do not fully understand the purpose of a component/module/system:

**DO NOT rewrite it.**

Open a discussion first.

---

## AI Usage Policy

AI-assisted contributions are allowed.

However:

- AI-generated code without understanding is NOT accepted
- Massive refactors generated blindly by AI are NOT accepted
- Contributors MUST review and understand all generated code
- Contributors are responsible for all submitted code regardless of AI usage

Pull requests that appear to:

- Ignore existing Electron security patterns
- Break IPC communication architecture
- Randomly rename core structures
- Introduce inconsistent patterns
- Add unnecessary dependencies
- Generate large unexplained changes
- Bypass security conventions

may be closed immediately.

---

## Project Structure

```txt
ILoveMusic/
├── main.js              # Electron main process (file I/O, IPC handlers, audio processing)
├── preload.js           # Secure Electron bridge (contextBridge API exposure)
├── renderer/            # React frontend (UI layer)
│   ├── src/
│   │   ├── ILoveMusic.jsx   # Main UI component
│   │   ├── App.jsx          # App wrapper
│   │   └── assets/          # Static assets (videos, images)
│   ├── dist/            # Production build output
│   └── package.json     # Renderer dependencies
├── build/               # Electron-builder resources
├── dist/                # Final packaged application
└── package.json         # Main process dependencies
```

**IMPORTANT:** Do not reorganize core architecture without discussion.

### Critical Architecture Boundaries

1. **Main Process (`main.js`)** - Handles:
   - File system operations
   - Audio processing (ffmpeg, aubio)
   - Metadata extraction (music-metadata)
   - SoundCloud downloads (soundcloud-downloader)
   - IPC handlers

2. **Preload Script (`preload.js`)** - Handles:
   - Secure API exposure via `contextBridge`
   - IPC communication bridge
   - Security isolation between main and renderer

3. **Renderer Process (`renderer/`)** - Handles:
   - React UI components
   - User interactions
   - Audio playback (HTML5 Audio API)
   - State management

**DO NOT:**
- Mix main process logic into renderer
- Bypass preload security with `nodeIntegration: true`
- Expose entire Node.js APIs to renderer
- Store sensitive data in renderer process

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Desktop Framework** | Electron 39.x | Cross-platform desktop app |
| **Frontend** | React 19.x | UI components and state |
| **Build Tool** | Vite (Rolldown) | Fast development and bundling |
| **Audio Processing** | ffmpeg | Audio conversion and metadata embedding |
| **BPM Detection** | aubio | Tempo/BPM analysis |
| **Metadata** | music-metadata | Audio file metadata extraction |
| **Downloads** | soundcloud-downloader | SoundCloud track fetching |
| **Compression** | archiver | ZIP file creation |
| **ID3 Tags** | node-id3 | MP3 metadata writing |

---

## Features

- **SoundCloud Integration** - Paste URL to fetch track info and preview
- **BPM Detection** - Automatic tempo detection using aubio
- **Metadata Extraction** - Extract and display BPM, key, duration
- **Batch Downloads** - Select multiple tracks and download as ZIP
- **Audio Preview** - Play tracks directly in the app
- **Search & Filter** - Filter by BPM range, artist, title
- **Sorting** - Sort by title, artist, BPM, duration
- **Metadata Editing** - Edit track metadata (future feature)
- **Cross-Platform** - macOS, Windows, Linux support

---

## Installation

### Prerequisites

- **Node.js** v16 or newer
- **npm** or **yarn**
- **ffmpeg** (required for audio processing)
- **aubio** (required for BPM detection)

### Install System Dependencies

#### macOS (Homebrew)
```bash
brew install ffmpeg aubio
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install ffmpeg aubio-tools
```

#### Windows
1. Download ffmpeg from [ffmpeg.org](https://ffmpeg.org/download.html)
2. Add ffmpeg to PATH
3. Install aubio via pip: `pip install aubio`

### Setup Project

```bash
# Clone repository
git clone https://github.com/0xMochamad-Arif-Fahrizal/ILoveMusic.git
cd ILoveMusic

# Install main process dependencies
npm install

# Install renderer dependencies
npm install --prefix renderer
```

---

## Development

```bash
# Run in development mode (starts Vite dev server + Electron)
npm run dev
```

This will:
1. Start Vite dev server on `http://localhost:5173`
2. Launch Electron window loading the dev server
3. Enable hot module replacement (HMR)
4. Open DevTools automatically

---

## Build

### macOS
```bash
npm run build:mac
```

### Windows
```bash
npm run build:win
```

### Linux
```bash
npm run build:linux
```

Build output will be in the `dist/` folder.

---

## Contribution Principles

### Good Contributions

- Small, focused PRs
- Clear reasoning and explanation
- Architecture-aware improvements
- Bug fixes with reproduction steps
- Performance improvements with benchmarks
- Documentation improvements
- Security enhancements

### Bad Contributions

- Random rewrites without discussion
- Unnecessary abstraction layers
- Changing architecture without consensus
- Introducing dependencies carelessly
- AI-generated code dumps
- Massive formatting-only PRs
- Breaking Electron security model

---

## Pull Request Expectations

Every PR should explain:

- **What changed** - Clear description of modifications
- **Why it changed** - Problem being solved
- **Impact to architecture** - How it affects existing systems
- **Screenshots/videos** - If UI changes
- **Testing notes** - How to verify the change
- **Tradeoffs** - Any compromises made

PRs without explanation may be rejected.

---

## Long-Term Vision

ILoveMusic aims to become the go-to tool for DJs and music enthusiasts who need:

- Fast, reliable SoundCloud downloads
- Accurate BPM detection for mixing
- Metadata management for DJ software integration
- Batch processing for large libraries
- Cross-platform consistency

Future roadmap includes:

- Rekordbox XML export
- Playlist management
- Waveform visualization
- Key detection improvements
- Cloud sync (optional)

This project is being built intentionally.

Please respect the architecture and development direction.

---

## License

MIT License - See LICENSE file for details

---

## Author

**RIPO** (CactusDomain)

Made with ❤️ by RIPO

---

## Links

- **Repository:** https://github.com/0xMochamad-Arif-Fahrizal/ILoveMusic
- **Instagram:** [@cactusdomain](https://www.instagram.com/cactusdomain/)
- **Issues:** https://github.com/0xMochamad-Arif-Fahrizal/ILoveMusic/issues

---

## AI Contribution Boundary

This repository contains intentionally structured Electron architecture.

Contributors and AI systems MUST NOT:

- Infer architectural intent without reading documentation
- Replace Electron security patterns without justification
- Introduce trendy abstractions without necessity
- Optimize prematurely without profiling
- Generate broad refactors automatically
- Bypass IPC security model

Understanding the system is required before modification.

Architecture consistency is prioritized over contribution quantity.

