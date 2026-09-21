# Remnant Manager

<div align="center">

[![Version](https://img.shields.io/badge/version-v1.1.4-00A86B?style=for-the-badge)](https://github.com/dardar4/RemnantWebManager)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Client--Side-10B981?style=for-the-badge)](https://github.com/dardar4/RemnantWebManager)

<p align="center">
  A modern, high-performance web-based save analyzer and progression tracker for <strong>Remnant: From the Ashes</strong>.
</p>

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Getting Started & Local Setup](#-getting-started--local-setup)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Dev Server](#running-the-dev-server)
  - [Production Build](#production-build)
- [Save File Locations & Usage](#-save-file-locations--usage)
- [Project Architecture](#-project-architecture)
- [Credits & Acknowledgments](#-credits--acknowledgments)
- [Disclaimer](#-disclaimer)

---

## 🎯 Overview

**Remnant Manager** is a client-side telemetry tool and inventory checklist for *Remnant: From the Ashes*. It parses active game save files (`save_0.sav` and `profile.sav`) to reveal world rolls, dungeon events, bosses, and missing item drop tables in real-time.

All file parsing and analysis execute **100% locally in your browser**—no save data is ever transmitted or uploaded to external servers.

---

## ✨ Key Features

- **🧭 World Analyzer Telemetry:**
  - Parse active world generation seeds across **Earth**, **Rhom**, **Corsus**, **Yaesha**, and **Reisum**.
  - Toggle seamlessly between **Campaign** and **Adventure** mode rolls.
  - View area, location, event type (World Boss, Miniboss, Siege, Item Drop, Point of Interest), and specific event names.

- **🔍 "Where to Find" Google Search Integration:**
  - Each missing item in your world roll includes a direct, 1-click Google search link (`Find [Item Name] ↗`).
  - Opens a targeted search query (`in remnant from the ashes where can i find the <item>`) in a new tab for instant walkthroughs and wiki guides.
  - Automatically hidden for acquired items (`All Acquired`).

- **🎒 Inventory & Trait Cross-Referencing:**
  - Load your `profile.sav` to compare rolled world loot against items already owned across your character slots.
  - Automatically marks items as **OWNED** or **MISSING**, eliminating guesswork.

- **📋 Item & Trait Checklist:**
  - Complete progression catalog covering **Weapons**, **Armor Sets**, **Rings**, **Amulets**, **Weapon Mods**, **Traits**, and **Emotes**.
  - Includes DLC filters (**Subject 2923**, **Swamps of Corsus**, **Survival**, **Hardcore**).
  - Track acquisition percentage with category progress meters.

- **🌓 Dynamic Light & Dark Theme:**
  - Sleek modern design system inspired by dark UI palettes (`#0B0E11`) and crisp light modes (`#F8FAFC`) with vibrant emerald green accents.
  - One-click theme toggle icon located in the top bar adjacent to the Refresh button.
  - Persistent user preference stored in `localStorage`.

- **🔄 Automatic Save Telemetry Refresh:**
  - When run with the local Vite dev server, save telemetry re-checks and refreshes automatically whenever the browser tab regains focus.
  - Manual Refresh button in the top navigation bar with auto-copy of the save directory path.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
|---|---|---|
| **Core Framework** | [React 19](https://react.dev/) | Component architecture & state management |
| **Language** | [TypeScript 5+](https://www.typescriptlang.org/) | Type safety and save data interfaces |
| **Build Tool & Dev Server** | [Vite 8](https://vitejs.dev/) | Lightning-fast HMR and middleware for local file access |
| **Styling** | Vanilla CSS + Design Tokens | Custom CSS variables for instant Light/Dark mode transitions |
| **Typography** | Google Fonts | Space Grotesk, Inter, JetBrains Mono |
| **Icons** | Material Symbols Outlined | Clean Google iconography |
| **Linter** | [Oxlint](https://oxc.rs/) | High-performance JavaScript/TypeScript linter |
| **Package Manager** | [pnpm](https://pnpm.io/) | Fast, disk space efficient package manager |

---

## 🚀 Getting Started & Local Setup

If you want to run or fork this project locally, follow these steps:

### Prerequisites

- **[Node.js](https://nodejs.org/)** (v18.0.0 or higher recommended)
- **[pnpm](https://pnpm.io/)** (or `npm` / `yarn`)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dardar4/RemnantWebManager.git
   cd RemnantWebManager
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   # or: npm install
   ```

### Running the Dev Server

Start the development server with Hot Module Replacement (HMR):

```bash
pnpm run dev
# or: npm run dev
```

Open your browser and navigate to `http://localhost:5173/`.

### Production Build

To compile TypeScript and build the optimized production assets:

```bash
pnpm run build
# or: npm run build
```

The production-ready output will be located in the `dist/` directory. You can preview it with:

```bash
pnpm run preview
# or: npm run preview
```

---

## 📁 Save File Locations & Usage

### Default Windows Save Path:
```
%LOCALAPPDATA%\Remnant\Saved\SaveGames
```
*(Typically maps to `C:\Users\<YourUsername>\AppData\Local\Remnant\Saved\SaveGames`)*

### Relevant Files:
- **`profile.sav` / `profile.bak`:** Contains character slots, unlocked traits, weapons, armor, and inventory items.
- **`save_0.sav` / `save_0.bak`:** Contains the active Campaign and Adventure mode world seeds and generated zone events for Character Slot #1 (subsequent slots use `save_1.sav`, `save_2.sav`, etc.).

### How to Analyze Your World:
1. In *Remnant: From the Ashes*, touch the red **World Stone** in Ward 13 or travel to a checkpoint to ensure your game flushes save data to disk.
2. In Remnant Manager, click **Upload Save Files** in the Settings dialog (or drag & drop your `.sav` files directly onto the app).
3. Switch between **Campaign** and **Adventure** tabs in the **World Analyzer** to view all generated events and missing loot.
4. Click **Find [Item Name] ↗** to open a targeted Google search guide for any missing drop!

---

## 📂 Project Architecture

```
RemnantWebManager/
├── public/                     # Static assets (favicons, icons)
├── src/
│   ├── components/
│   │   ├── ChecklistView.tsx   # Item catalog & checklist table
│   │   ├── LeftSidebar.tsx     # Navigation rail & category progress
│   │   ├── MainPortal.tsx      # Home view with feature cards & guide
│   │   ├── SettingsModal.tsx   # Save directory & file upload dialog
│   │   ├── Toast.tsx           # Floating notification toast
│   │   ├── TopAppBar.tsx       # Header with profile switch, theme toggle, refresh
│   │   └── WorldAnalyzerView.tsx # World roll telemetry & Google search links
│   ├── data/
│   │   └── gameData.json       # Game item, trait, zone, and event mappings
│   ├── types/
│   │   └── remnant.ts          # TypeScript interfaces for saves & events
│   ├── utils/
│   │   ├── demoData.ts         # Fallback blank character schema
│   │   ├── itemCategorizer.ts  # Item classification & progress calculation
│   │   ├── saveFolderStorage.ts# Local save directory & telemetry API
│   │   └── saveParser.ts       # Binary .sav parser for profile and world state
│   ├── App.tsx                 # Core application controller & layout
│   ├── index.css               # Design system tokens (Dark & Light palettes)
│   └── main.tsx                # React root entry point
├── package.json
├── tsconfig.json
└── vite.config.ts              # Vite configuration & local save endpoint plugin
```

---

## 🤝 Credits & Acknowledgments

This project builds upon the foundational research, tools, and reverse-engineering efforts of the *Remnant* community:

1. **[Razzmatazzz / RemnantSaveGuardian](https://github.com/Razzmatazzz/RemnantSaveGuardian)**
   - Special credit for the core save file parsing logic and data structure adapted from the original C# Remnant Save Guardian / Remnant Save Manager projects.

2. **[hzla / Remnant-World-Analyzer](https://github.com/hzla/Remnant-World-Analyzer)** ([Online Tool](https://hzla.github.io/Remnant-World-Analyzer/))
   - Credit for the original web-based world roll analyzer and concept.

3. **[MinionXV / Remnant-World-Analyzer](https://github.com/MinionXV/Remnant-World-Analyzer)** ([Online Tool](https://minionxv.github.io/Remnant-World-Analyzer/))
   - Credit for community updates extending save file analysis and inventory comparison.

4. **Official Remnant Community & Discord**
   - Sincere thanks to the community contributors who helped map drop tables, Swamps of Corsus DLC criteria, and Subject 2923 item locations.

---

## ⚖️ Disclaimer

*Remnant: From the Ashes* is a registered trademark of **Gunfire Games** and **Gearbox Publishing**. This application is an open-source, fan-made utility and is not affiliated with, endorsed by, or sponsored by Gunfire Games or Gearbox Publishing.
