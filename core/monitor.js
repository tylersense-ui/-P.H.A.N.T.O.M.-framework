/*
╔══════════════════════════════════════════════════════════╗
║  👻 P.H.A.N.T.O.M. - MONITOR ORCHESTRATOR v0.4.0        ║
╠══════════════════════════════════════════════════════════╣
║  Orchestre le framework et choisit le bon batcher        ║
║                                                          ║
║  Usage: run core/monitor.js                              ║
║                                                          ║
║  Features:                                               ║
║    - Target selection intégrée (toutes les 5min)         ║
║    - Détection auto du meilleur batcher                  ║
║    - Switch automatique micro → proto → hwgw             ║
║    - Sauvegarde état dans /state/                        ║
║                                                          ║
║  Batcher selection:                                      ║
║    - micro.js : 8GB home, < 10M$, < 100 hacking          ║
║    - proto.js : 64GB+ home, 10M-1B$, 100-500 hacking     ║
║    - hwgw.js  : 256GB+ home, 1B+$, 500+ hacking          ║
║                                                          ║
║  Changelog:                                              ║
║    v0.4.0 - Target selection + batcher orchestration     ║
╚══════════════════════════════════════════════════════════╝

@author Claude (Godlike AI Operator)
@version 0.4.0
@ram ~4.5GB
*/

/**
 * Monitor orchestrator daemon
 * @param {NS} ns - Netscript API
 */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.tail();
  
  let currentBatcher = null;
  let currentBatcherPid = 0;
  let lastTargetUpdate = 0;
  let lastBatcherCheck = 0;
  
  while (true) {
    ns.clearLog();
    
    ns.print("╔═══════════════════════════════════╗");
    ns.print("║  👻 MONITOR - Orchestrator v0.4.0║");
    ns.print("╚═══════════════════════════════════╝");
    ns.print("");
    
    const now = Date.now();
    
    // ═══════════════════════════════════════════════
    // TARGET SELECTION (toutes les 5min)
    // ═══════════════════════════════════════════════
    if (now - lastTargetUpdate > 300000 || lastTargetUpdate === 0) {
      ns.print("🎯 Updating target selection...");
      updateTarget(ns);
      lastTargetUpdate = now;
      ns.print("");
    }
    
    // ═══════════════════════════════════════════════
    // BATCHER DETECTION (toutes les 60s)
    // ═══════════════════════════════════════════════
    if (now - lastBatcherCheck > 60000 || lastBatcherCheck === 0) {
      const bestBatcher = detectBestBatcher(ns);
      
      if (bestBatcher !== currentBatcher) {
        ns.print(`🔄 Batcher switch detected: ${currentBatcher || "NONE"} → ${bestBatcher}`);
        
        // Kill ancien batcher
        if (currentBatcherPid !== 0) {
          ns.kill(currentBatcherPid);
          ns.print(`  ├─ Killed old batcher (PID: ${currentBatcherPid})`);
        }
        
        // Lance nouveau batcher
        currentBatcherPid = ns.exec(bestBatcher, "home", 1);
        
        if (currentBatcherPid === 0) {
          ns.toast(`❌ Failed to start ${bestBatcher}`, "error");
          ns.print(`  └─ ❌ Failed to start ${bestBatcher}`);
        } else {
          currentBatcher = bestBatcher;
          ns.toast(`🔄 Switched to ${bestBatcher}`, "info", 3000);
          ns.print(`  └─ ✅ Started ${bestBatcher} (PID: ${currentBatcherPid})`);
          
          // Sauvegarder état
          const state = {
            batcher: currentBatcher,
            pid: currentBatcherPid,
            timestamp: now
          };
          await ns.write("/state/batcher-mode.json", JSON.stringify(state, null, 2), "w");
        }
        
        ns.print("");
      }
      
      lastBatcherCheck = now;
    }
    
    // ═══════════════════════════════════════════════
    // STATUS DISPLAY
    // ═══════════════════════════════════════════════
    const player = ns.getPlayer();
    const homeRam = ns.getServerMaxRam("home");
    
    ns.print("📊 System Status:");
    ns.print(`  ├─ Home RAM: ${homeRam}GB`);
    ns.print(`  ├─ Money: ${ns.formatNumber(player.money)}`);
    ns.print(`  ├─ Hacking: ${player.skills.hacking}`);
    ns.print(`  └─ Active batcher: ${currentBatcher || "NONE"}`);
    
    // Afficher target actuelle
    try {
      const targetData = ns.read("/state/target.json");
      if (targetData) {
        const target = JSON.parse(targetData);
        ns.print("");
        ns.print("🎯 Current Target:");
        ns.print(`  ├─ Server: ${target.hostname}`);
        ns.print(`  ├─ Max $: ${ns.formatNumber(target.maxMoney)}`);
        ns.print(`  ├─ Hack req: ${target.hackReq}`);
        ns.print(`  └─ Score: ${ns.formatNumber(target.score)}/s`);
      }
    } catch (e) {
      ns.print("");
      ns.print("⚠️  No target selected yet");
    }
    
    await ns.sleep(5000);
  }
}

/**
 * Met à jour la sélection de cible
 * @param {NS} ns - Netscript API
 */
function updateTarget(ns) {
  try {
    // Lire network.json
    const networkData = ns.read("/state/network.json");
    if (!networkData) {
      ns.print("  └─ ⚠️  No network data available");
      return;
    }
    
    const network = JSON.parse(networkData);
    const player = ns.getPlayer();
    
    let bestTarget = null;
    let bestScore = 0;
    
    // Filtrer et scorer les serveurs
    for (const server of network.servers) {
      // Vérifications de base
      if (server.hostname === "home") continue;
      if (!server.hasRoot) continue;
      if (server.hackReq > player.skills.hacking) continue;
      if (server.maxMoney === 0) continue;
      
      // Calculer score : maxMoney / weakenTime
      const weakenTime = ns.getWeakenTime(server.hostname);
      const score = server.maxMoney / (weakenTime / 1000); // $ par seconde
      
      if (score > bestScore) {
        bestScore = score;
        bestTarget = {
          hostname: server.hostname,
          maxMoney: server.maxMoney,
          hackReq: server.hackReq,
          minSec: server.minSec,
          score: score
        };
      }
    }
    
    if (bestTarget) {
      // Sauvegarder nouveau target
      await ns.write("/state/target.json", JSON.stringify(bestTarget, null, 2), "w");
      ns.print(`  └─ ✅ Target: ${bestTarget.hostname} (${ns.formatNumber(bestTarget.score)}/s)`);
    } else {
      ns.print("  └─ ⚠️  No valid target found");
    }
  } catch (e) {
    ns.print(`  └─ ❌ Error updating target: ${e}`);
  }
}

/**
 * Détecte le meilleur batcher selon les conditions
 * @param {NS} ns - Netscript API
 * @returns {string} - Chemin du batcher à utiliser
 */
function detectBestBatcher(ns) {
  const homeRam = ns.getServerMaxRam("home");
  const player = ns.getPlayer();
  const money = player.money;
  const hacking = player.skills.hacking;
  
  // Late game: Full HWGW batches
  if (homeRam >= 256 && money >= 1e9 && hacking >= 500) {
    return "/batchers/hwgw.js";
  }
  
  // Mid game: Proto-batcher
  if (homeRam >= 64 && money >= 10e6 && hacking >= 100) {
    return "/batchers/proto.js";
  }
  
  // Early game: Micro-batcher
  return "/batchers/micro.js";
}
