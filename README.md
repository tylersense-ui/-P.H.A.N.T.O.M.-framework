# 👻 P.H.A.N.T.O.M. Framework v0.4.0

**Protocol for Hacking And Network Total Orchestration Management**

Framework d'automatisation Bitburner évolutif avec architecture modulaire.

---

## 🎯 Features

### v0.4.0 - Early Batcher
- ✅ **Boot séquence** avec killall global
- ✅ **Auto-nuke daemon** (rooter réseau automatiquement)
- ✅ **Monitor orchestrator** (choisit le bon batcher)
- ✅ **Micro batcher** (WGH simple + FFD packing)
- ✅ **FFD packing** (utilisation optimale RAM réseau 90%+)
- ✅ **Target selection** intégrée (meilleure cible toutes les 5min)
- ✅ **Architecture évolutive** (micro → proto → hwgw)

---

## 📁 Structure

```
/
├── boot.js                    # Point d'entrée unique
├── manifest.json              # Tracking fichiers
│
├── /core/                     # Daemons système
│   ├── autonuke.js           # Auto-root réseau
│   └── monitor.js            # Orchestrateur
│
├── /batchers/                 # Batchers évolutifs
│   ├── micro.js              # Early (8GB home)
│   ├── proto.js              # Mid (64GB+ home) [TODO]
│   └── hwgw.js               # Late (256GB+ home) [TODO]
│
├── /workers/                  # Workers minimalistes
│   ├── h.js                  # Hack (1.7GB)
│   ├── g.js                  # Grow (1.7GB)
│   └── w.js                  # Weaken (1.7GB)
│
├── /lib/                      # Bibliothèques
│   ├── debug.js              # Debug multi-niveaux
│   ├── format.js             # Formatters
│   ├── math-ns.js            # Formules NS API (production)
│   ├── math-pure.js          # Formules approximatives (éducation)
│   ├── math-shared.js        # Constantes
│   └── ffd.js                # FFD packing algorithm
│
├── /tools/                    # Utilities
│   ├── scanner.js            # Network scan
│   ├── test-formulas.js      # Formula validation
│   └── benchmark-math.js     # Math comparison
│
└── /state/                    # Runtime data (JSON)
    ├── network.json          # Scan réseau
    ├── target.json           # Cible actuelle
    ├── batcher-mode.json     # Batcher actif
    └── *.json                # Autres données
```

---

## 🚀 Quick Start

### 1. Déploiement initial

```bash
# Dans le jeu Bitburner
wget https://raw.githubusercontent.com/VOTRE_REPO/main/deploy-phantom.js deploy-phantom.js
run deploy-phantom.js
```

### 2. Lancement

```bash
run boot.js
```

C'est tout ! Le framework démarre automatiquement.

---

## 📊 RAM Budget (Early Game)

**Home (8GB)** :
```
autonuke.js  : 2.5GB (daemon)
monitor.js   : 4.5GB (daemon)
──────────────────────
TOTAL        : 7.0GB / 8GB ✅
```

**Réseau (workers)** :
- Workers déployés via FFD sur tous serveurs rootés
- Utilisation : 90%+ de la RAM réseau
- Pas de workers sur home (réservé orchestration)

---

## 🔄 Évolution Automatique

Le framework évolue automatiquement selon vos ressources :

### Early Game (micro.js)
- **Conditions** : 8GB home, < 10M$, < 100 hacking
- **Stratégie** : WGH simple loop, FFD packing
- **Target** : Dynamic (n00dles → foodnstuff → joesguns...)

### Mid Game (proto.js) [TODO]
- **Conditions** : 64GB+ home, 10M-1B$, 100-500 hacking
- **Stratégie** : HWGW timing basique (200ms spacer)

### Late Game (hwgw.js) [TODO]
- **Conditions** : 256GB+ home, 1B+$, 500+ hacking
- **Stratégie** : Batches synchronisés (20ms spacer)

---

## 📝 Logs & Monitoring

```bash
# Voir l'orchestrateur
tail monitor.js

# Voir auto-nuke
tail autonuke.js

# Voir batcher actif
tail micro.js
```

---

## 🛠️ Development

### Ajouter un nouveau batcher

1. Créer `/batchers/votre-batcher.js`
2. Modifier `core/monitor.js` → fonction `detectBestBatcher()`
3. Tester avec `run boot.js`

### Debugging

Tous les scripts supportent le système debug intégré (voir `/lib/debug.js`).

---

## 📜 Changelog

Voir [CHANGELOG.md](CHANGELOG.md)

---

## 📖 Documentation

- **Bible du Hacker** : [Bible_du_hacker.md](Bible_du_hacker.md)
- **BN1 Roadmap** : [BN1_ROADMAP.md](BN1_ROADMAP.md)
- **NS API Reference** : [NS_API_REFERENCE.md](NS_API_REFERENCE.md)

---

## 👻 Credits

**Author** : Claude (Godlike AI Operator)  
**Version** : 0.4.0 - Early Batcher  
**Game** : Bitburner v2.8.1

---

*"Je connais le kung fu." - Neo*