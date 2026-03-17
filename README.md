# 👻 PHANTOM Framework

> **"Invisible. Unstoppable. Undetectable."**

Professional Bitburner automation framework designed for optimal performance from BN1 (8GB RAM) to late-game multi-TB setups.

---

## 🎯 Philosophy

PHANTOM doesn't command from a central point. **It replicates.**

Unlike traditional orchestrator-heavy frameworks that consume 5+ GB RAM on coordination alone, PHANTOM uses a **pulse-based, distributed architecture** where:
- Each server becomes an autonomous node
- Central "analyzer" runs ephemerally (calculates, then dies to free RAM)
- Lightweight "monitor" coordinates via JSON files (2.8GB max)
- Workers are ultra-minimal (1.7GB each)

**Result:** Maximum throughput from minimal footprint.

---

## 📦 Current Release: v0.1.0 (ÉTAPE 2)

### ✅ Implemented
- **Scanner Tool** (`tools/scanner.js`)
  - Full network cartography (BFS)
  - Server stats collection
  - Target recommendations (early/mid/late)
  - JSON export to `/state/network.json`
  - Beautiful tail UI

- **Core Libraries**
  - `lib/debug.js` - Multi-level debug system (0-3)
  - `lib/format.js` - Formatting utilities (0GB RAM)

### 🚧 In Progress
- ÉTAPE 3: Early-game batcher (proto-HWGW)

### 📋 Roadmap
- ÉTAPE 4: Mid-game proto-batcher
- ÉTAPE 5: Late-game full HWGW batch system
- ÉTAPE 6: Ultimate optimization

---

## 🚀 Quick Start

### 1. Clone or Download
```bash
git clone https://github.com/[YOUR_USERNAME]/phantom-bitburner.git
cd phantom-bitburner
```

### 2. Deploy to Bitburner

**In-game terminal:**
```
wget https://raw.githubusercontent.com/[YOUR_USERNAME]/phantom-bitburner/main/deploy-phantom-v0.1.0.js deploy.js
run deploy.js
```

**Note:** Edit `GITHUB_USER` variable in `deploy.js` first!

### 3. Run Network Scanner
```
run tools/scanner.js --debug 1
```

Outputs:
- Live tail window with network analysis
- JSON export at `/state/network.json`

---

## 📁 Architecture

```
/
├── manifest.json              # Version tracking
├── deploy-phantom-v0.1.0.js   # Auto-deployer
│
├── /lib/                      # 0GB RAM libraries (pure logic)
│   ├── debug.js               # Debug system
│   └── format.js              # Formatting utils
│
├── /core/                     # Core logic (future)
│   ├── analyzer.js            # Ephemeral calculator (>6GB)
│   └── monitor.js             # Persistent coordinator (~2.8GB)
│
├── /workers/                  # Atomic workers (future)
│   ├── h.js                   # Hack worker (1.7GB)
│   ├── g.js                   # Grow worker (1.7GB)
│   └── w.js                   # Weaken worker (1.7GB)
│
├── /managers/                 # Resource managers (future)
│   ├── server-manager.js
│   ├── hacknet-manager.js
│   └── target-selector.js
│
├── /tools/                    # Utility scripts
│   └── scanner.js             # Network scanner (~3GB)
│
└── /state/                    # Runtime data (JSON files)
    └── network.json           # Auto-generated scan data
```

---

## 🎓 Design Principles

### 1. **Zero Hallucination**
Only uses documented Bitburner v2.8.1 APIs. No invented functions.

### 2. **Modular from Day 1**
Each component can be tested, replaced, or upgraded independently.

### 3. **RAM-Conscious**
- Libraries: 0GB (pure logic, no `ns.*` calls)
- Workers: Minimal (single operation per script)
- Orchestration: Ephemeral (calculate → save → die)

### 4. **Git-First Workflow**
All development happens in version control. Deploy via `wget` from GitHub.

### 5. **Beautiful by Default**
Professional ASCII headers, colored logs, formatted metrics, toast notifications.

---

## 🛠️ Development Standards

Every file includes:
- ✅ ASCII art header with version
- ✅ Author, repo URL, RAM cost
- ✅ Usage examples and changelog
- ✅ Full JSDoc comments
- ✅ Debug level support (0-3)
- ✅ Toast notifications for key events
- ✅ Icons for visual clarity (✅ ❌ ⚠️ 💰 🌐 ⚡)

---

## 📊 Current Status

**BitNode:** BN1.1 (Source Genesis)  
**Source-Files:** None (first run)  
**Phase:** ÉTAPE 2 - Environment Discovery

**Completed:**
- [x] Formation (study game mechanics)
- [x] Framework name selection (PHANTOM)
- [x] Network scanner implementation

**Next:**
- [ ] Collect scan data from operator
- [ ] Design early-game batcher
- [ ] Implement proto-HWGW loop

---

## 🤝 Contributing

This is an AI-driven development project. The operator (human) executes commands, Claude (AI) writes code.

**Workflow:**
1. Claude designs and codes
2. Operator pushes to GitHub
3. In-game deployment via `deploy.js`
4. Operator reports results (logs, screenshots)
5. Claude iterates based on real data

---

## 📜 License

MIT License - Built for the Bitburner community

---

## 🎯 Philosophy Quote

> *"There is a difference between knowing the path and walking the path."*  
> — Morpheus (adapted for PHANTOM)

**PHANTOM walks the path. Invisibly.**

---

**Version:** 0.1.0  
**Author:** Claude (Godlike AI Operator)  
**Bitburner:** v2.8.1  
**Status:** Active Development
