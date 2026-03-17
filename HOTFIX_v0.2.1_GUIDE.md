# 🔧 PHANTOM v0.2.1 - CORRECTIONS CRITIQUES

**Date:** 2026-03-17  
**Version:** 0.2.1 (Hotfix Phase 0)  
**Status:** 🔴 **BUGS CRITIQUES CORRIGÉS**

---

## ❌ BUGS IDENTIFIÉS (v0.2.0)

### Bug #1: Deploy-phantom.js - Invalid filename
**Erreur:**
```
RUNTIME ERROR deploy-phantom.js@home (PID - 9)  
write: Invalid filename, was not a valid path: /state/.gitkeep
```

**Cause:** Bitburner n'accepte pas `.gitkeep` comme nom de fichier valide.

**Fix:** Remplacer par `/state/README.txt`

---

### Bug #2: Math.js - Formule grow retourne NaN
**Erreur:**
```
Predicted threads needed: NaN
Predicted result (10 threads): $NaNT
```

**Cause:** `serverGrowth` est déjà un multiplicateur (ex: 3000), pas un pourcentage. Diviser par 100 créait des valeurs incorrectes.

**Problème dans le code:**
```javascript
// ❌ AVANT (incorrect)
const serverGrowthRate = server.serverGrowth / 100; // serverGrowth = 3000 → 30 (faux)
const adjustedGrowthRate = baseGrowth * (1 + serverGrowthRate) * hackMult;
```

**Fix:**
```javascript
// ✅ APRÈS (correct)
const serverGrowthRate = server.serverGrowth; // serverGrowth = 3000
const adjustedGrowthRate = 1 + (serverGrowthRate * hackMult / 100);
```

**Résultat:** La formule grow calcule maintenant des threads valides.

---

### Bug #3: Test-formulas.js - Too many threads
**Erreur:**
```
RUNTIME ERROR tools/test-formulas.js@home (PID - 14)  
weaken: Too many threads requested by weaken. Requested: 20. Has: 1.
```

**Cause:** Le script demandait 20 threads pour weaken, mais seulement 1 thread disponible en RAM.

**Fix:** Vérifier la RAM disponible et limiter les threads :
```javascript
// Check available RAM
const homeRAM = ns.getServerMaxRam("home") - ns.getServerUsedRam("home");
const weakenRAMCost = 1.75;
const maxThreads = Math.floor(homeRAM / weakenRAMCost);

// Use fewer threads if not enough RAM
const actualThreads = Math.min(predictedWeakenThreads, maxThreads, 5);
```

**Résultat:** Le test s'adapte à la RAM disponible.

---

## 📦 FICHIERS CORRIGÉS (v0.2.1)

**3 fichiers modifiés :**

1. `deploy-phantom.js` → `deploy-phantom_v0.2.1_FIXED.js`
   - Fix: `/state/.gitkeep` → `/state/README.txt`

2. `lib/math.js` → `lib_math_v0.2.1_FIXED.js`
   - Fix: Formule grow corrigée (serverGrowth)
   - Fix: estimateGrowResult corrigée

3. `tools/test-formulas.js` → `tools_test-formulas_v0.2.1_FIXED.js`
   - Fix: Vérification RAM avant weaken
   - Fix: Cap à 5 threads max pour test

---

## 🚀 DÉPLOIEMENT HOTFIX

### Option A: Push complet (recommandé)

```bash
cd phantom-bitburner

# Remplacer les fichiers corrigés
# (Si tu as téléchargé les _FIXED, renomme-les)
mv deploy-phantom_v0.2.1_FIXED.js deploy-phantom.js
mv lib_math_v0.2.1_FIXED.js lib/math.js
mv tools_test-formulas_v0.2.1_FIXED.js tools/test-formulas.js

# Git push
git add deploy-phantom.js lib/math.js tools/test-formulas.js
git commit -m "PHANTOM v0.2.1: Hotfix - deploy path, grow formula, test threads"
git push
```

**In-game:**
```
run deploy-phantom.js
```

Le deployer s'auto-update et télécharge les fichiers corrigés.

---

### Option B: Patch manuel (si GitHub problème)

**In-game, copie directement le code corrigé dans nano :**

```bash
# 1. Fix deploy-phantom.js
nano deploy-phantom.js
# Ligne 176, remplacer :
# await ns.write("/state/.gitkeep", "...", "w");
# par :
# await ns.write("/state/README.txt", "PHANTOM state directory - Runtime JSON files generated here", "w");

# 2. Fix lib/math.js
nano lib/math.js
# Dans calculateGrowThreads (ligne ~135), remplacer :
# const serverGrowthRate = server.serverGrowth / 100;
# const adjustedGrowthRate = baseGrowth * (1 + serverGrowthRate) * hackMult;
# par :
# const serverGrowthRate = server.serverGrowth;
# const adjustedGrowthRate = 1 + (serverGrowthRate * hackMult / 100);

# 3. Fix tools/test-formulas.js
nano tools/test-formulas.js
# Dans TEST 3 (ligne ~195), ajouter avant await ns.weaken() :
# const homeRAM = ns.getServerMaxRam("home") - ns.getServerUsedRam("home");
# const weakenRAMCost = 1.75;
# const maxThreads = Math.floor(homeRAM / weakenRAMCost);
# const actualThreads = Math.min(predictedWeakenThreads, maxThreads, 5);
```

---

## ✅ VÉRIFICATION POST-FIX

**Après déploiement, teste les 3 scripts :**

```bash
# Test 1: Deploy doit réussir
run deploy-phantom.js
# ✅ Attendu: "DEPLOYMENT SUCCESSFUL" sans erreur .gitkeep

# Test 2: Formula test doit terminer
run tools/test-formulas.js n00dles
# ✅ Attendu: 3 tests complets sans NaN ni crash

# Test 3: Benchmark doit fonctionner
run tools/benchmark-timing.js n00dles
# ✅ Attendu: Timing complet sans erreur
```

---

## 📊 RÉSULTATS ATTENDUS (Post-Fix)

**Test Formula (n00dles) :**
```
✅ HACK: ~0-20% error (acceptable)
✅ GROW: Threads calculés correctement (pas de NaN)
✅ WEAKEN: ~0-5% error (précis)
```

**Benchmark Timing (n00dles) :**
```
✅ Weaken time: mesure réussie
✅ Grow time: mesure réussie
✅ Hack time: mesure réussie
```

**RAM Profiler :**
```
✅ Monitor minimal: ~2GB
✅ Nano-Batcher viable: OUI/NON (selon résultats)
```

---

## 🎯 PROCHAINES ÉTAPES

**Une fois les 3 tests terminés avec succès :**

1. Envoie-moi les 3 JSON complets :
   - `/state/formula-validation.json`
   - `/state/timing-benchmark.json`
   - `/state/ram-profile.json`

2. Je vais analyser les résultats

3. Je déciderai de l'architecture optimale :
   - Nano-Batcher pulse ?
   - Ultra-Light Monitor ?
   - Hybrid ?

4. On passera à **ÉTAPE 3 : Early Batcher** avec l'architecture validée

---

## 📝 CHANGELOG v0.2.1

**Hotfix (2026-03-17):**
- 🔧 Fixed deploy-phantom.js: `/state/.gitkeep` → `/state/README.txt`
- 🔧 Fixed lib/math.js: Grow formula (serverGrowth multiplication)
- 🔧 Fixed tools/test-formulas.js: RAM check before weaken threads
- ✅ All Phase 0 tests should now complete without errors

---

👻 **PHANTOM v0.2.1 - Bugs critiques corrigés.**

**Lance les tests maintenant et envoie les JSON !**
