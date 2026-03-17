/**
 * ╔════════════════════════════════════════════════════════════════════╗
 * ║           👻 PHANTOM RAM PROFILER v0.2.0                          ║
 * ║              "Every byte counts at 8GB"                           ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ Author: Claude (Godlike AI Operator)                              ║
 * ║ RAM Cost: ~1.50 GB                                                 ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ USAGE:                                                             ║
 * ║   run tools/ram-profiler.js                                       ║
 * ║                                                                    ║
 * ║ WHAT IT DOES:                                                      ║
 * ║   • Profiles RAM cost of all PHANTOM scripts                      ║
 * ║   • Tests different import combinations                           ║
 * ║   • Estimates monitor/analyzer RAM budgets                        ║
 * ║   • Exports results to /state/ram-profile.json                    ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ CHANGELOG:                                                         ║
 * ║   v0.2.0 (2026-03-17) - Initial RAM profiling                     ║
 * ╚════════════════════════════════════════════════════════════════════╝
 */

import { Debug, ICONS } from "/lib/debug.js";
import * as fmt from "/lib/format.js";

/** @param {NS} ns */
export async function main(ns) {
    const dbg = new Debug(ns, 1);
    
    ns.disableLog("ALL");
    ns.tail();
    ns.resizeTail(900, 700);
    
    dbg.clear();
    dbg.header("👻 PHANTOM RAM PROFILER v0.2.0");
    dbg.separator();
    
    const results = {
        timestamp: new Date().toISOString(),
        homeRAM: ns.getServerMaxRam("home"),
        profiles: []
    };
    
    dbg.normal(`${ICONS.SERVER} Home RAM: ${fmt.ram(results.homeRAM)}`);
    dbg.separator();
    
    // ============================================
    // PROFILE 1: EXISTING SCRIPTS
    // ============================================
    
    dbg.normal(`${ICONS.SCAN} PHASE 1: Existing Scripts`);
    dbg.separator();
    
    const scripts = [
        "/lib/debug.js",
        "/lib/format.js",
        "/lib/math.js",
        "/tools/scanner.js",
        "/tools/test-formulas.js",
        "/tools/benchmark-timing.js"
    ];
    
    for (const script of scripts) {
        if (ns.fileExists(script)) {
            const ram = ns.getScriptRam(script);
            results.profiles.push({
                script,
                ram,
                category: "existing"
            });
            dbg.normal(`  ${script.padEnd(35)} ${fmt.ram(ram)}`);
        } else {
            dbg.normal(`  ${script.padEnd(35)} NOT FOUND`);
        }
    }
    
    dbg.separator();
    
    // ============================================
    // PROFILE 2: TEST MONITOR VARIATIONS
    // ============================================
    
    dbg.normal(`${ICONS.CHART} PHASE 2: Monitor Variations (Simulated)`);
    dbg.separator();
    
    // Create test scripts with different import combinations
    
    // Minimal monitor (no imports)
    const minimalMonitor = `
export async function main(ns) {
    while (true) {
        const plan = JSON.parse(ns.read("/state/batch-plan.json"));
        ns.exec("/workers/h.js", "n00dles", 1, "n00dles");
        await ns.sleep(1000);
    }
}`;
    
    await ns.write("/tmp/test-monitor-minimal.js", minimalMonitor, "w");
    const minimalRAM = ns.getScriptRam("/tmp/test-monitor-minimal.js");
    
    results.profiles.push({
        script: "monitor-minimal",
        ram: minimalRAM,
        category: "test",
        description: "Minimal monitor (no imports, basic loop)"
    });
    
    dbg.normal(`  Monitor (Minimal):          ${fmt.ram(minimalRAM)}`);
    
    // Monitor with Debug import
    const debugMonitor = `
import { Debug } from "/lib/debug.js";
export async function main(ns) {
    const dbg = new Debug(ns, 1);
    while (true) {
        const plan = JSON.parse(ns.read("/state/batch-plan.json"));
        dbg.normal("Running batch...");
        ns.exec("/workers/h.js", "n00dles", 1, "n00dles");
        await ns.sleep(1000);
    }
}`;
    
    await ns.write("/tmp/test-monitor-debug.js", debugMonitor, "w");
    const debugRAM = ns.getScriptRam("/tmp/test-monitor-debug.js");
    
    results.profiles.push({
        script: "monitor-debug",
        ram: debugRAM,
        category: "test",
        description: "Monitor with Debug import"
    });
    
    dbg.normal(`  Monitor (+ Debug):          ${fmt.ram(debugRAM)}`);
    
    // Monitor with Math import
    const mathMonitor = `
import { Debug } from "/lib/debug.js";
import * as math from "/lib/math.js";
export async function main(ns) {
    const dbg = new Debug(ns, 1);
    const player = ns.getPlayer();
    while (true) {
        const plan = JSON.parse(ns.read("/state/batch-plan.json"));
        dbg.normal("Running batch...");
        ns.exec("/workers/h.js", "n00dles", 1, "n00dles");
        await ns.sleep(1000);
    }
}`;
    
    await ns.write("/tmp/test-monitor-math.js", mathMonitor, "w");
    const mathRAM = ns.getScriptRam("/tmp/test-monitor-math.js");
    
    results.profiles.push({
        script: "monitor-math",
        ram: mathRAM,
        category: "test",
        description: "Monitor with Debug + Math + getPlayer"
    });
    
    dbg.normal(`  Monitor (+ Math + Player):  ${fmt.ram(mathRAM)}`);
    
    dbg.separator();
    
    // ============================================
    // PROFILE 3: ANALYZER VARIATIONS
    // ============================================
    
    dbg.normal(`${ICONS.LIGHTNING} PHASE 3: Analyzer Variations (Simulated)`);
    dbg.separator();
    
    // Heavy analyzer (all imports + API calls)
    const heavyAnalyzer = `
import { Debug } from "/lib/debug.js";
import * as fmt from "/lib/format.js";
import * as math from "/lib/math.js";

export async function main(ns) {
    const dbg = new Debug(ns, 1);
    const network = JSON.parse(ns.read("/state/network.json"));
    const player = ns.getPlayer();
    
    // Simulate heavy analysis
    for (const server of network.servers) {
        const ev = math.calculateEVperSecond(server, player, 100);
        const batch = math.calculateWGHBatch(server, player);
    }
    
    const plan = { target: "best", batch: {} };
    await ns.write("/state/batch-plan.json", JSON.stringify(plan), "w");
}`;
    
    await ns.write("/tmp/test-analyzer-heavy.js", heavyAnalyzer, "w");
    const heavyAnalyzerRAM = ns.getScriptRam("/tmp/test-analyzer-heavy.js");
    
    results.profiles.push({
        script: "analyzer-heavy",
        ram: heavyAnalyzerRAM,
        category: "test",
        description: "Full analyzer with all imports"
    });
    
    dbg.normal(`  Analyzer (Full):            ${fmt.ram(heavyAnalyzerRAM)}`);
    
    dbg.separator();
    
    // ============================================
    // BUDGET ANALYSIS
    // ============================================
    
    dbg.normal(`${ICONS.MONEY} RAM BUDGET ANALYSIS (8GB Home)`);
    dbg.separator();
    
    const homeRAM = 8.0;
    
    // Option A: Nano-Batcher (Pulse)
    const nanoBatcherBudget = {
        name: "Nano-Batcher (Pulse System)",
        monitor: mathRAM, // Persistent
        analyzer: heavyAnalyzerRAM, // Ephemeral (not concurrent)
        peak: mathRAM, // Only monitor runs continuously
        fits: mathRAM <= homeRAM
    };
    
    dbg.normal(`  Option A: Nano-Batcher (Pulse)`);
    dbg.normal(`    Monitor (persistent):  ${fmt.ram(nanoBatcherBudget.monitor)}`);
    dbg.normal(`    Analyzer (ephemeral):  ${fmt.ram(nanoBatcherBudget.analyzer)}`);
    dbg.normal(`    Peak RAM usage:        ${fmt.ram(nanoBatcherBudget.peak)}`);
    dbg.normal(`    Fits in 8GB: ${nanoBatcherBudget.fits ? "✅ YES" : "❌ NO"}`);
    
    dbg.separator();
    
    // Option B: Ultra-Light Monitor
    const ultraLightBudget = {
        name: "Ultra-Light Monitor",
        monitor: minimalRAM,
        scanner: ns.getScriptRam("/tools/scanner.js"),
        fits: minimalRAM <= homeRAM
    };
    
    dbg.normal(`  Option B: Ultra-Light Monitor`);
    dbg.normal(`    Monitor (minimal):     ${fmt.ram(ultraLightBudget.monitor)}`);
    dbg.normal(`    Scanner (offline):     ${fmt.ram(ultraLightBudget.scanner)}`);
    dbg.normal(`    Peak RAM usage:        ${fmt.ram(ultraLightBudget.monitor)}`);
    dbg.normal(`    Fits in 8GB: ${ultraLightBudget.fits ? "✅ YES" : "❌ NO"}`);
    
    results.budgets = [nanoBatcherBudget, ultraLightBudget];
    
    dbg.separator();
    
    // ============================================
    // RECOMMENDATIONS
    // ============================================
    
    dbg.normal(`${ICONS.TARGET} RECOMMENDATIONS`);
    dbg.separator();
    
    if (nanoBatcherBudget.fits) {
        dbg.normal(`  ✅ Nano-Batcher (pulse) is VIABLE`);
        dbg.normal(`     Monitor runs 24/7, analyzer runs every 5min`);
        dbg.normal(`     Available RAM for workers: ${fmt.ram(homeRAM - nanoBatcherBudget.peak)}`);
    } else {
        dbg.normal(`  ❌ Nano-Batcher exceeds 8GB`);
    }
    
    dbg.separator();
    
    if (ultraLightBudget.fits) {
        dbg.normal(`  ✅ Ultra-Light Monitor is VIABLE`);
        dbg.normal(`     Minimal RAM footprint`);
        dbg.normal(`     Scanner runs manually (offline)`);
        dbg.normal(`     Available RAM for workers: ${fmt.ram(homeRAM - ultraLightBudget.monitor)}`);
    }
    
    dbg.separator();
    
    // Clean up test files
    ns.rm("/tmp/test-monitor-minimal.js");
    ns.rm("/tmp/test-monitor-debug.js");
    ns.rm("/tmp/test-monitor-math.js");
    ns.rm("/tmp/test-analyzer-heavy.js");
    
    // Export results
    const json = JSON.stringify(results, null, 2);
    await ns.write("/state/ram-profile.json", json, "w");
    
    dbg.toastSuccess(`RAM profiling complete!`);
    dbg.normal(`${ICONS.SUCCESS} Results exported to /state/ram-profile.json`);
}
