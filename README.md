# Algorithmic Topology Synthesizer


[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Try_it_Online-2ea44f?style=for-the-badge&logo=vercel)](https://algorithmic-topology-synthesizer.vercel.app/)

![Hero Demo](screenshots/Binary%20Space%20Partitioning%20and%20A.PNG)

> **A high-performance interactive visualization tool demonstrating how algorithms create and solve artificial environments.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18.0-blue)
![Vite](https://img.shields.io/badge/Vite-5.0-purple)

## 🌟 Overview

This project bridges the gap between **Procedural Generation** (creating worlds) and **Pathfinding AI** (navigating worlds). It serves as an educational sandbox to visualize:
1.  How **Dungeons (BSP)** and **Caves (Cellular Automata)** are mathematically generated.
2.  How AI agents (**BFS** vs **A***) "think" when searching for a path.

---

## 📸 Visual Algorithm Comparison

### 1. Scenario A: Structured Dungeons (Binary Space Partitioning)
*Best for: FPS Levels, Office Layouts, RPG Dungeons.*

| **BFS Solver (The Flood)** | **A* Solver (The Sniper)** |
|:---:|:---:|
| **Inefficient search.** Floods the entire dungeon. | **Efficient search.** Goes straight for the target. |
| ![BSP BFS](screenshots/Binary%20Space%20Partitioning%20and%20BFS%20(Flooding).PNG) | ![BSP A*](screenshots/Binary%20Space%20Partitioning%20and%20A.PNG) |

### 2. Scenario B: Organic Caves (Cellular Automata)
*Best for: Survival Games, Terrain, Biological Sims.*

| **BFS Solver (The Flood)** | **A* Solver (The Sniper)** |
|:---:|:---:|
| **Inefficient search.** Explores every nook and cranny. | **Efficient search.** Navigates mostly the main path. |
| ![CA BFS](screenshots/Cellular%20Automata%20and%20BFS.PNG) | ![CA A*](screenshots/Cellular%20Automata%20and%20A.PNG) |

---

## 🚀 Features

### 🎮 Procedural Generation
- **Binary Space Partitioning (BSP)**: Recursive division of space.
- **Cellular Automata**: Iterative neighbor-checking simulation.
- **Customizable**: Adjust Map Width/Height, Split Depth, and Simulation Steps in real-time.

### 🧠 AI Pathfinding Experiments
- **Visual Search Space**: Floating yellow particles show *exactly* which nodes the algorithm considered.
- **BFS**: Demonstrates the inefficiency of uninformed search.
- **A***: Demonstrates the power of heuristics.

### 🎨 Premium Visualization
- **Canvas API**: Custom rendering engine for 60FPS performance.
- **Sci-Fi UI**: "Dark Mode" aesthetic with neon accents and scanline effects.
- **Animations**: Live "printing" of the map and "snake" animation for the solution path.

---

## 🛠️ Tech Stack

- **Core**: React 18, TypeScript (Strict Mode)
- **Build**: Vite
- **Styling**: Tailwind CSS
- **Graphics**: HTML5 Canvas API (Custom Renderer)
- **Deployment**: Vercel Ready

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/EfeArslan-Git-Hub/Algorithmic-Topology-Synthesizer.git
   cd Algorithmic-Topology-Synthesizer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run locally**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## 🚀 Deployment (Vercel)

This project is optimized for Vercel.

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root.
3. Follow the prompts (Keep default settings: Output Directory `dist`).

Alternatively, connect your GitHub repository to Vercel Dashboard for auto-deployments.

## 👥 Credits

Made by **Efe Arslan**.
- [Portfolio](https://efe-arslan-portfolio.vercel.app/)

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.
