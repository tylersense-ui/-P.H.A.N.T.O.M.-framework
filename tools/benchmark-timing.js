/**
 * ╔════════════════════════════════════════════════════════════════════╗
 * ║           👻 PHANTOM TIMING BENCHMARK v0.2.0                      ║
 * ║              "Time is money, measure accurately"                  ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ Author: Claude (Godlike AI Operator)                              ║
 * ║ RAM Cost: ~2.00 GB                                                 ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ USAGE:                                                             ║
 * ║   run tools/benchmark-timing.js [target]                          ║
 * ║   run tools/benchmark-timing.js n00dles                           ║
 * ║                                                                    ║
 * ║ WHAT IT DOES:                                                      ║
 * ║   • Measures actual hack/grow/weaken times                        ║
 * ║   • Compares with estimated times from math.js                    ║
 * ║   • Tests timing on multiple servers                              ║
 * ║   • Exports results to /state/timing-benchmark.json               ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ CHANGELOG:                                                         ║
 * ║   v0.2.0 (2026-03-17) - Initial benchmark suite                   ║
 * ╚════════════════════════════════════════════════════════════════════╝
 */

import { Debug, ICONS } from "/lib/debug.js";
import * as fmt from "/lib/format.js";
import * as math from "/lib/math.js";

/** @param {NS} ns */
export async function main(ns) {
    const dbg = new Debug(ns, 2); // Verbose
    
    ns.disableLog("ALL");
    ns.tail();
    ns.resizeTail(900, 600);
    
    dbg.clear();
    dbg.header("👻 PHANTOM TIMING BENCHMARK v0.2.0");
    
    const target = ns.args[0] || "n00dles";
    
    dbg.normal(`${ICONS.TARGET} Target: ${target}`);
    dbg.separator();
    
    // Check root access
    if (!ns.hasRootAccess(target)) {
        dbg.toastError(`No root access to ${target}`);
        return;
    }
    
    const player = {
        hacking: ns.getPlayer().skills.hacking,
        hackingMult: ns.getPlayer().mults.hacking || 1.0
    };
    
    const server = {
        currentSecurity: ns.getServerSecurityLevel(target),
        minSecurity: ns.getServerMinSecurityLevel(target),
        hackReq: ns.getServerRequiredHackingLevel(target),
        serverGrowth: ns.getServerGrowth(target)
    };
    
    dbg.normal(`${ICONS.GHOST} Player Hacking: ${player.hacking}`);
    dbg.normal(`${ICONS.SERVER} Server Security: ${server.currentSecurity.toFixed(2)} / ${server.minSecurity}`);
    dbg.separator();
    
    const results = {
        target,
        timestamp: new Date().toISOString(),
        player,
        server,
        benchmarks: []
    };
    
    // ============================================
    // BENCHMARK 1: WEAKEN TIME
    // ============================================
    
    dbg.normal(`${ICONS.LIGHTNING} BENCHMARK 1: Weaken Time`);
    dbg.separator();
    
    const predictedWeakenTime = math.estimateWeakenTime(server, player);
    dbg.normal(`  Predicted time: ${fmt.time(predictedWeakenTime)}`);
    
    const weakenStart = Date.now();
    await ns.weaken(target);
    const weakenEnd = Date.now();
    const actualWeakenTime = weakenEnd - weakenStart;
    
    dbg.normal(`  Actual time: ${fmt.time(actualWeakenTime)}`);
    
    const weakenError = Math.abs(predictedWeakenTime - actualWeakenTime) / actualWeakenTime * 100;
    dbg.normal(`  Error: ${weakenError.toFixed(2)}%`);
    
    results.benchmarks.push({
        operation: "weaken",
        predicted: predictedWeakenTime,
        actual: actualWeakenTime,
        error: weakenError,
        passed: weakenError < 20
    });
    
    dbg.separator();
    
    // ============================================
    // BENCHMARK 2: GROW TIME
    // ============================================
    
    dbg.normal(`${ICONS.CHART} BENCHMARK 2: Grow Time`);
    dbg.separator();
    
    const predictedGrowTime = math.estimateGrowTime(server, player);
    dbg.normal(`  Predicted time: ${fmt.time(predictedGrowTime)}`);
    dbg.normal(`  Expected ratio: ${(predictedGrowTime / actualWeakenTime).toFixed(2)}x weaken`);
    
    const growStart = Date.now();
    await ns.grow(target);
    const growEnd = Date.now();
    const actualGrowTime = growEnd - growStart;
    
    dbg.normal(`  Actual time: ${fmt.time(actualGrowTime)}`);
    dbg.normal(`  Actual ratio: ${(actualGrowTime / actualWeakenTime).toFixed(2)}x weaken`);
    
    const growError = Math.abs(predictedGrowTime - actualGrowTime) / actualGrowTime * 100;
    dbg.normal(`  Error: ${growError.toFixed(2)}%`);
    
    results.benchmarks.push({
        operation: "grow",
        predicted: predictedGrowTime,
        actual: actualGrowTime,
        error: growError,
        ratioToWeaken: actualGrowTime / actualWeakenTime,
        passed: growError < 20
    });
    
    dbg.separator();
    
    // ============================================
    // BENCHMARK 3: HACK TIME
    // ============================================
    
    dbg.normal(`${ICONS.HACK} BENCHMARK 3: Hack Time`);
    dbg.separator();
    
    const predictedHackTime = math.estimateHackTime(server, player);
    dbg.normal(`  Predicted time: ${fmt.time(predictedHackTime)}`);
    dbg.normal(`  Expected ratio: ${(predictedHackTime / actualWeakenTime).toFixed(2)}x weaken`);
    
    const hackStart = Date.now();
    await ns.hack(target);
    const hackEnd = Date.now();
    const actualHackTime = hackEnd - hackStart;
    
    dbg.normal(`  Actual time: ${fmt.time(actualHackTime)}`);
    dbg.normal(`  Actual ratio: ${(actualHackTime / actualWeakenTime).toFixed(2)}x weaken`);
    
    const hackError = Math.abs(predictedHackTime - actualHackTime) / actualHackTime * 100;
    dbg.normal(`  Error: ${hackError.toFixed(2)}%`);
    
    results.benchmarks.push({
        operation: "hack",
        predicted: predictedHackTime,
        actual: actualHackTime,
        error: hackError,
        ratioToWeaken: actualHackTime / actualWeakenTime,
        passed: hackError < 20
    });
    
    dbg.separator();
    
    // ============================================
    // REAL NS API TIMING (Gold Standard)
    // ============================================
    
    dbg.normal(`${ICONS.INFO} ACTUAL GAME TIMING (NS API)`);
    dbg.separator();
    
    const nsWeakenTime = ns.getWeakenTime(target);
    const nsGrowTime = ns.getGrowTime(target);
    const nsHackTime = ns.getHackTime(target);
    
    dbg.normal(`  ns.getWeakenTime(): ${fmt.time(nsWeakenTime)}`);
    dbg.normal(`  ns.getGrowTime(): ${fmt.time(nsGrowTime)}`);
    dbg.normal(`  ns.getHackTime(): ${fmt.time(nsHackTime)}`);
    
    results.goldStandard = {
        weakenTime: nsWeakenTime,
        growTime: nsGrowTime,
        hackTime: nsHackTime,
        ratios: {
            growToWeaken: nsGrowTime / nsWeakenTime,
            hackToWeaken: nsHackTime / nsWeakenTime
        }
    };
    
    dbg.separator();
    
    // Compare our estimates with NS API
    dbg.normal(`${ICONS.CHART} COMPARISON WITH NS API`);
    dbg.separator();
    
    const weakenVsNS = Math.abs(predictedWeakenTime - nsWeakenTime) / nsWeakenTime * 100;
    const growVsNS = Math.abs(predictedGrowTime - nsGrowTime) / nsGrowTime * 100;
    const hackVsNS = Math.abs(predictedHackTime - nsHackTime) / nsHackTime * 100;
    
    dbg.normal(`  Weaken estimate vs NS: ${weakenVsNS.toFixed(2)}% error`);
    dbg.normal(`  Grow estimate vs NS: ${growVsNS.toFixed(2)}% error`);
    dbg.normal(`  Hack estimate vs NS: ${hackVsNS.toFixed(2)}% error`);
    
    results.vsNSAPI = {
        weakenError: weakenVsNS,
        growError: growVsNS,
        hackError: hackVsNS
    };
    
    dbg.separator();
    
    // ============================================
    // SUMMARY
    // ============================================
    
    dbg.normal(`${ICONS.CHART} BENCHMARK SUMMARY`);
    dbg.separator();
    
    const passedBenchmarks = results.benchmarks.filter(b => b.passed).length;
    const totalBenchmarks = results.benchmarks.length;
    
    for (const benchmark of results.benchmarks) {
        const icon = benchmark.passed ? ICONS.SUCCESS : ICONS.ERROR;
        dbg.normal(`  ${icon} ${benchmark.operation.toUpperCase()}: ${benchmark.error.toFixed(2)}% error`);
    }
    
    dbg.separator();
    dbg.normal(`  Passed: ${passedBenchmarks}/${totalBenchmarks}`);
    
    // Export results
    const json = JSON.stringify(results, null, 2);
    await ns.write("/state/timing-benchmark.json", json, "w");
    
    dbg.separator();
    dbg.toastSuccess(`Timing benchmark complete!`);
    dbg.normal(`${ICONS.SUCCESS} Results exported to /state/timing-benchmark.json`);
    
    // Recommendations
    dbg.separator();
    dbg.normal(`${ICONS.INFO} RECOMMENDATIONS`);
    dbg.separator();
    
    if (weakenVsNS < 10 && growVsNS < 10 && hackVsNS < 10) {
        dbg.normal(`  ✅ Timing estimates are excellent (<10% error vs NS API)`);
        dbg.normal(`  ✅ Safe to use for batch planning`);
    } else if (weakenVsNS < 25 && growVsNS < 25 && hackVsNS < 25) {
        dbg.normal(`  ⚠️  Timing estimates are acceptable (10-25% error)`);
        dbg.normal(`  ⚠️  Consider using ns.getHackTime/GrowTime/WeakenTime for precision`);
    } else {
        dbg.normal(`  ❌ Timing estimates need improvement (>25% error)`);
        dbg.normal(`  ❌ MUST use ns.getHackTime/GrowTime/WeakenTime in production`);
    }
    
    dbg.separator();
    dbg.normal(`${ICONS.INFO} NOTE: Using NS timing functions costs 0.05GB RAM each`);
    dbg.normal(`       Total overhead: 0.15GB for all three`);
}
