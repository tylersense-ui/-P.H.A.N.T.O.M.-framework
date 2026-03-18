# 📜 PHANTOM Framework - Changelog

## [0.4.0] - 2025-01-XX - EARLY BATCHER

### 🎯 ÉTAPE 3 COMPLÈTE : Early Batcher avec FFD Packing

**Nouveau système évolutif** : Le framework détecte automatiquement les conditions et lance le bon batcher.

### ✅ Fichiers Ajoutés

#### Core System
- **boot.js** - Point d'entrée avec killall global
  - Phase 0 : Cleanup complet (home + réseau)
  - Phase 1 : Scanner réseau
  - Phase 2 : Auto-nuke daemon
  - Phase 3 : Monitor orchestrator
  - Toast + logs détaillés

- **core/autonuke.js** (2.5GB)
  - Daemon permanent
  - BFS network scan (60s)
  - Tente tous port openers
  - Nuke automatique
  - Toast sur nouveaux roots

- **core/monitor.js** (4.5GB)
  - Orchestrateur principal
  - Target selection intégrée (5min)
  - Détection batcher optimal (60s)
  - Auto-switch micro → proto → hwgw
  - Sauvegarde état `/state/batcher-mode.json`

#### Batchers
- **batchers/micro.js** (4.0GB)
  - Early game WGH loop
  - Prep phase (weaken to min, grow to max)
  - Simple séquentiel (W → G → H)
  - FFD packing sur réseau
  - Utilisation 90%+ RAM réseau

#### Libraries
- **lib/ffd.js** (0.1GB)
  - First-Fit Decreasing algorithm
  - Tri jobs par taille décroissante
  - Distribution optimale sur réseau
  - Ignore home (réservé orchestration)
  - Helpers : `killAllWorkers`, `getNetworkRamUsage`

#### Workers
- **workers/h.js** (1.7GB) - Hack minimaliste
- **workers/g.js** (1.7GB) - Grow minimaliste
- **workers/w.js** (1.7GB) - Weaken minimaliste

### 🎯 Features

#### Auto-Progression
- **Target dynamique** : n00dles → foodnstuff → joesguns → etc
- Réévaluation toutes les 5min
- Score : `maxMoney / weakenTime`
- Switch automatique vers meilleure cible

#### FFD Packing
- Utilisation réseau : **90-95%** (vs 5% naïf)
- Gain threads : **~18x** vs stratégie simple
- Workers sur serveurs distants (pas home)
- Home réservé pour orchestration

#### Architecture Évolutive
```
Micro  : 8GB home, < 10M$, < 100 hacking
Proto  : 64GB+ home, 10M-1B$, 100-500 hacking [TODO]
HWGW   : 256GB+ home, 1B+$, 500+ hacking [TODO]
```

### 📊 RAM Budget (Early - 8GB Home)

**Home** :
```
autonuke.js : 2.5GB
monitor.js  : 4.5GB
────────────────────
TOTAL       : 7.0GB / 8GB ✅
```

**Réseau** :
- Workers FFD packing
- 90%+ utilisation
- Aucun worker sur home

### 🔧 Fixes & Optimizations

- ✅ Killall global dans boot.js (évite doublons daemons)
- ✅ Target selection intégrée dans monitor (économie RAM)
- ✅ Workers ultra-minimalistes (1.7GB chacun)
- ✅ FFD algorithm optimisé (tri + packing)
- ✅ Toasts informatifs partout
- ✅ Error handling robuste

### 📝 Documentation

- ✅ README.md complet
- ✅ Headers ASCII art sur tous fichiers
- ✅ JSDoc complet
- ✅ Manifest.json à jour

---

## [0.3.2] - 2025-01-XX - BENCHMARK FIXES

### 🐛 Bugs Fixed

#### tools/benchmark-math.js
- **Import errors** : Corrigé `formatMoney` → `fmt.money`
- **Grow test RAM** : Hardcodé à 1 thread (pas 10)
- **Auto-tail** : Ajouté `ns.tail()`

#### tools/test-formulas.js
- **RAM calculation** : Hardcodé à 1 thread (calcul simplifié)
- **serverGrowth** : Ajouté au server object (fix NaN)

### 📊 Résultats Benchmark

- **Pure Math** : 2691% erreur sur grow (INUTILISABLE)
- **NS API** : 0.01% erreur timing (PARFAIT)
- **Décision** : math-ns.js OBLIGATOIRE pour production

---

## [0.3.0] - 2025-01-XX - MATH LIBRARY REFACTOR

### 🎯 ÉTAPE 2 COMPLÈTE : Validation mathématique

### ✅ Fichiers Ajoutés

#### Math Libraries
- **lib/math-shared.js** (0GB) - Constantes du jeu
- **lib/math-pure.js** (0GB) - Formules approximatives
- **lib/math-ns.js** (0.4GB) - NS API wrappers (PRODUCTION)

#### Tools
- **tools/benchmark-math.js** (3.5GB) - Comparaison scientifique
- **tools/test-formulas.js** (2.5GB) - Tests validation

### 📊 Découvertes

- **Timing Pure Math** : 91.94% erreur (15s vs 189s) ❌
- **Timing NS API** : 0.00% erreur (perfect) ✅
- **Grow Pure Math** : 2691% erreur ❌
- **Grow NS API** : Exact ✅

**Conclusion** : NS API est OBLIGATOIRE.

---

## [0.2.1] - 2025-01-XX - HOTFIXES

### 🐛 Bugs Fixed
- deploy-phantom.js : state directory creation
- lib/math.js : serverGrowth missing
- tools/test-formulas.js : RAM overflow

---

## [0.1.0] - 2025-01-XX - INITIAL FRAMEWORK

### 🎯 ÉTAPE 0 & 1 : Foundation + Phase 0

### ✅ Fichiers Créés
- lib/debug.js - Système debug multi-niveaux
- lib/format.js - Formatters
- tools/scanner.js - Network scan
- deploy-phantom.js - GitHub deployment

---

*"Il y a une différence entre connaître le chemin et arpenter le chemin." - Morpheus*