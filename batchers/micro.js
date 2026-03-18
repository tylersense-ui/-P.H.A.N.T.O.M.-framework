/*
╔══════════════════════════════════════════════════════════╗
║  👻 P.H.A.N.T.O.M. - MICRO BATCHER v0.4.0               ║
╠══════════════════════════════════════════════════════════╣
║  Early game simple WGH loop avec FFD packing             ║
║                                                          ║
║  Usage: Lancé automatiquement par monitor.js             ║
║                                                          ║
║  Requirements:                                           ║
║    - Home RAM: 8GB                                       ║
║    - Money: < 10M                                        ║
║    - Hacking: < 100                                      ║
║                                                          ║
║  Strategy:                                               ║
║    1. Prep phase: Weaken to min, Grow to max             ║
║    2. Loop phase: W → G → H (simple séquentiel)          ║
║    3. FFD packing: Utilise tout le réseau                ║
║                                                          ║
║  Changelog:                                              ║
║    v0.4.0 - Initial micro batcher with FFD               ║
╚══════════════════════════════════════════════════════════╝

@author Claude (Godlike AI Operator)
@version 0.4.0
@ram ~4.0GB
*/

import { ffdPack, killAllWorkers, getNetworkRamUsage } from "/lib/ffd.js";

const WORKER_RAM = 1.75; // RAM par thread (h.js, g.js, w.js)

/**
 * Micro batcher - Early game WGH loop
 * @param {NS} ns - Netscript API
 */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.tail();
  
  ns.print("╔═══════════════════════════════════╗");
  ns.print("║  👻 MICRO BATCHER v0.4.0         ║");
  ns.print("╚═══════════════════════════════════╝");
  ns.print("");
  
  let cycleCount = 0;
  
  while (true) {
    cycleCount++;
    ns.clearLog();
    
    ns.print("╔═══════════════════════════════════╗");
    ns.print("║  👻 MICRO BATCHER v0.4.0         ║");
    ns.print("╚═══════════════════════════════════╝");
    ns.print("");
    ns.print(`Cycle #${cycleCount} - ${new Date().toLocaleTimeString()}`);
    ns.print("");
    
    // ═══════════════════════════════════════════════
    // LOAD DATA
    // ═══════════════════════════════════════════════
    let target, network;
    
    try {
      const targetData = ns.read("/state/target.json");
      const networkData = ns.read("/state/network.json");
      
      if (!targetData || !networkData) {
        ns.print("⚠️  Waiting for target/network data...");
        await ns.sleep(5000);
        continue;
      }
      
      target = JSON.parse(targetData);
      network = JSON.parse(networkData);
      
      ns.print(`🎯 Target: ${target.hostname}`);
      ns.print(`   └─ Max $: ${ns.formatNumber(target.maxMoney)}`);
      ns.print("");
    } catch (e) {
      ns.print(`❌ Error loading data: ${e}`);
      await ns.sleep(5000);
      continue;
    }
    
    // ═══════════════════════════════════════════════
    // PREP PHASE (si nécessaire)
    // ═══════════════════════════════════════════════
    const currentSec = ns.getServerSecurityLevel(target.hostname);
    const minSec = ns.getServerMinSecurityLevel(target.hostname);
    const currentMoney = ns.getServerMoneyAvailable(target.hostname);
    const maxMoney = ns.getServerMaxMoney(target.hostname);
    
    const needsPrep = (currentSec > minSec + 1) || (currentMoney < maxMoney * 0.9);
    
    if (needsPrep) {
      ns.print("🔧 PREP PHASE:");
      ns.print(`   ├─ Security: ${currentSec.toFixed(2)} / ${minSec.toFixed(2)}`);
      ns.print(`   └─ Money: ${ns.formatNumber(currentMoney)} / ${ns.formatNumber(maxMoney)}`);
      ns.print("");
      
      await prepServer(ns, target, network);
      continue; // Re-loop après prep
    }
    
    // ═══════════════════════════════════════════════
    // CALCULATE BATCH (WGH simple)
    // ═══════════════════════════════════════════════
    const batch = calculateSimpleBatch(ns, target);
    
    ns.print("📊 Batch calculated:");
    ns.print(`   ├─ Weaken: ${batch.w} threads`);
    ns.print(`   ├─ Grow: ${batch.g} threads`);
    ns.print(`   └─ Hack: ${batch.h} threads`);
    ns.print("");
    
    // ═══════════════════════════════════════════════
    // FFD PACKING & DEPLOYMENT
    // ═══════════════════════════════════════════════
    ns.print("🚀 Deploying workers (FFD packing)...");
    
    // Kill workers précédents
    killAllWorkers(ns, network);
    await ns.sleep(500);
    
    // Préparer jobs
    const jobs = [
      { script: "/workers/w.js", threads: batch.w, ram: WORKER_RAM },
      { script: "/workers/g.js", threads: batch.g, ram: WORKER_RAM },
      { script: "/workers/h.js", threads: batch.h, ram: WORKER_RAM }
    ];
    
    // FFD pack
    const stats = ffdPack(ns, jobs, network, target);
    
    ns.print(`   ├─ Jobs deployed: ${stats.totalJobs}`);
    ns.print(`   ├─ Total threads: ${stats.totalThreads}`);
    ns.print(`   ├─ Servers used: ${stats.serversUsed}`);
    ns.print(`   ├─ RAM used: ${stats.ramUsed.toFixed(2)}GB / ${stats.ramTotal.toFixed(2)}GB`);
    ns.print(`   └─ Utilization: ${((stats.ramUsed / stats.ramTotal) * 100).toFixed(1)}%`);
    ns.print("");
    
    if (stats.ramUsed / stats.ramTotal > 0.9) {
      ns.toast(`⚡ Network RAM: ${((stats.ramUsed / stats.ramTotal) * 100).toFixed(0)}%`, "success", 2000);
    }
    
    // ═══════════════════════════════════════════════
    // WAIT FOR CYCLE COMPLETION
    // ═══════════════════════════════════════════════
    const cycleTime = ns.getWeakenTime(target.hostname);
    ns.print(`⏳ Waiting ${(cycleTime / 1000).toFixed(0)}s for cycle completion...`);
    
    await ns.sleep(cycleTime + 1000);
  }
}

/**
 * Prep server (weaken to min, grow to max)
 * @param {NS} ns - Netscript API
 * @param {Object} target - Target server
 * @param {Object} network - Network data
 */
async function prepServer(ns, target, network) {
  const currentSec = ns.getServerSecurityLevel(target.hostname);
  const minSec = ns.getServerMinSecurityLevel(target.hostname);
  const currentMoney = ns.getServerMoneyAvailable(target.hostname);
  const maxMoney = ns.getServerMaxMoney(target.hostname);
  
  // Kill workers
  killAllWorkers(ns, network);
  await ns.sleep(500);
  
  let jobs = [];
  
  // Weaken si nécessaire
  if (currentSec > minSec + 1) {
    const secToReduce = currentSec - minSec;
    const weakenThreads = Math.ceil(secToReduce / 0.05);
    
    jobs.push({ script: "/workers/w.js", threads: weakenThreads, ram: WORKER_RAM });
    ns.print(`   Deploying ${weakenThreads} weaken threads...`);
  }
  
  // Grow si nécessaire
  if (currentMoney < maxMoney * 0.9) {
    const growThreads = Math.ceil(ns.growthAnalyze(target.hostname, maxMoney / Math.max(1, currentMoney)));
    
    jobs.push({ script: "/workers/g.js", threads: growThreads, ram: WORKER_RAM });
    ns.print(`   Deploying ${growThreads} grow threads...`);
  }
  
  // Deploy
  if (jobs.length > 0) {
    const stats = ffdPack(ns, jobs, network, target);
    ns.print(`   └─ Deployed ${stats.totalThreads} threads on ${stats.serversUsed} servers`);
    
    const prepTime = ns.getWeakenTime(target.hostname);
    await ns.sleep(prepTime + 1000);
  }
}

/**
 * Calcule un batch WGH simple
 * @param {NS} ns - Netscript API
 * @param {Object} target - Target server
 * @returns {Object} - {w, g, h}
 */
function calculateSimpleBatch(ns, target) {
  const player = ns.getPlayer();
  
  // Hack : viser 50% du max money
  const hackPercent = 0.5;
  const hackThreads = Math.floor(ns.hackAnalyzeThreads(target.hostname, target.maxMoney * hackPercent));
  
  // Grow : compenser le hack
  const moneyAfterHack = target.maxMoney * (1 - hackPercent);
  const growMultiplier = target.maxMoney / Math.max(1, moneyAfterHack);
  const growThreads = Math.ceil(ns.growthAnalyze(target.hostname, growMultiplier));
  
  // Weaken : compenser hack + grow security
  const hackSec = hackThreads * 0.002;
  const growSec = growThreads * 0.004;
  const totalSec = hackSec + growSec;
  const weakenThreads = Math.ceil(totalSec / 0.05);
  
  return {
    w: Math.max(1, weakenThreads),
    g: Math.max(1, growThreads),
    h: Math.max(1, hackThreads)
  };
}
