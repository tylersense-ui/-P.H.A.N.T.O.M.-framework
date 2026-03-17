/**
 * ╔════════════════════════════════════════════════════════════════════╗
 * ║       👻 PHANTOM MATH BENCHMARK v0.3.0                            ║
 * ║        "Pure vs NS API vs Reality - Scientific comparison"        ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ Author: Claude (Godlike AI Operator)                              ║
 * ║ RAM Cost: ~3.50 GB (math-ns imports + test operations)            ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ USAGE:                                                             ║
 * ║   run tools/benchmark-math.js [target] [--debug 0-3]              ║
 * ║   run tools/benchmark-math.js n00dles --debug 2                   ║
 * ║                                                                    ║
 * ║ OUTPUTS: /state/math-benchmark.json                               ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ WHAT IT MEASURES:                                                  ║
 * ║   • Hack percent: Pure vs NS API vs Reality                       ║
 * ║   • Grow threads: Pure vs NS API vs Reality                       ║
 * ║   • Timing: Pure vs NS API vs Reality                             ║
 * ║   • RAM costs: Pure (0GB) vs NS API (~0.40GB)                     ║
 * ║   • Precision errors for each method                              ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ CHANGELOG:                                                         ║
 * ║   v0.3.0 (2026-03-17) - Initial benchmark suite                   ║
 * ╚════════════════════════════════════════════════════════════════════╝
 */

import { Debug } from "/lib/debug.js";
import { formatMoney, formatTime, formatPercent, formatNumber } from "/lib/format.js";
import * as mathPure from "/lib/math-pure.js";
import * as mathNS from "/lib/math-ns.js";

const ICONS = {
    GHOST: "👻",
    CHART: "📊",
    TIME: "⏱️",
    MONEY: "💰",
    PERCENT: "📈",
    CHECK: "✅",
    CROSS: "❌",
    WARNING: "⚠️",
    SCIENCE: "🔬"
};

/** @param {NS} ns */
export async function main(ns) {
    const dbg = new Debug(ns);
    dbg.header("PHANTOM MATH BENCHMARK", "0.3.0");
    
    const target = ns.args[0] || "n00dles";
    
    if (!ns.serverExists(target)) {
        dbg.error(`Server '${target}' not found`);
        return;
    }
    
    dbg.normal(`${ICONS.SCIENCE} Target: ${target}`);
    dbg.separator();
    
    // ============================================
    // COLLECT BASELINE DATA
    // ============================================
    
    const player = {
        hacking: ns.getHackingLevel(),
        hackingMult: 1.0 // BN1 no augments
    };
    
    const server = {
        hostname: target,
        currentSecurity: ns.getServerSecurityLevel(target),
        minSecurity: ns.getServerMinSecurityLevel(target),
        hackReq: ns.getServerRequiredHackingLevel(target),
        maxMoney: ns.getServerMaxMoney(target),
        currentMoney: ns.getServerMoneyAvailable(target),
        serverGrowth: ns.getServerGrowth(target)
    };
    
    dbg.normal(`${ICONS.GHOST} Player Hacking: ${player.hacking}`);
    dbg.normal(`${ICONS.CHART} Server State:`);
    dbg.money("  Money", server.currentMoney);
    dbg.normal(`  Max Money: ${formatMoney(server.maxMoney)}`);
    dbg.normal(`  Security: ${server.currentSecurity.toFixed(2)} / ${server.minSecurity}`);
    dbg.normal(`  Growth Rate: ${server.serverGrowth}`);
    dbg.separator();
    
    const results = {
        target,
        timestamp: new Date().toISOString(),
        player,
        server,
        benchmarks: []
    };
    
    // ============================================
    // TEST 1: HACK PERCENT COMPARISON
    // ============================================
    
    dbg.normal(`${ICONS.PERCENT} TEST 1: Hack Percent Accuracy`);
    dbg.separator();
    
    const hackPercentPure = mathPure.hackPercent(server, player);
    const hackPercentNS = mathNS.hackPercent(ns, target);
    
    dbg.normal(`  Pure Math: ${formatPercent(hackPercentPure)}`);
    dbg.normal(`  NS API:    ${formatPercent(hackPercentNS)}`);
    
    // Execute actual hack to measure reality
    const moneyBefore = ns.getServerMoneyAvailable(target);
    const hackResult = await ns.hack(target);
    const moneyAfter = ns.getServerMoneyAvailable(target);
    const actualStolen = moneyBefore - moneyAfter;
    const actualPercent = actualStolen / server.maxMoney;
    
    dbg.money("  Actual stolen", actualStolen);
    dbg.normal(`  Actual percent: ${formatPercent(actualPercent)}`);
    
    const pureError = Math.abs(hackPercentPure - actualPercent) / actualPercent * 100;
    const nsError = Math.abs(hackPercentNS - actualPercent) / actualPercent * 100;
    
    dbg.normal(`  Pure error: ${pureError.toFixed(2)}%`);
    dbg.normal(`  NS error: ${nsError.toFixed(2)}%`);
    
    results.benchmarks.push({
        test: "hack_percent",
        pure: hackPercentPure,
        ns: hackPercentNS,
        actual: actualPercent,
        pureError,
        nsError,
        winner: nsError < pureError ? "NS API" : "Pure Math"
    });
    
    dbg.separator();
    
    // ============================================
    // TEST 2: GROW THREADS COMPARISON
    // ============================================
    
    dbg.normal(`${ICONS.CHART} TEST 2: Grow Threads Accuracy`);
    dbg.separator();
    
    const currentMoney = ns.getServerMoneyAvailable(target);
    const targetMoney = server.maxMoney;
    const growthMultiplier = targetMoney / Math.max(1, currentMoney);
    
    const growThreadsPure = mathPure.growThreads(server, player, currentMoney, targetMoney);
    const growThreadsNS = mathNS.growThreads(ns, target, growthMultiplier);
    
    dbg.normal(`  Current: ${formatMoney(currentMoney)}`);
    dbg.normal(`  Target: ${formatMoney(targetMoney)}`);
    dbg.normal(`  Multiplier needed: ${growthMultiplier.toFixed(2)}x`);
    dbg.separator();
    dbg.normal(`  Pure Math threads: ${growThreadsPure}`);
    dbg.normal(`  NS API threads: ${growThreadsNS}`);
    
    // Test with smaller number of threads (10) to measure accuracy
    const testThreads = Math.min(10, growThreadsNS);
    const predictedResultPure = mathPure.growResult(server, player, currentMoney, testThreads);
    
    dbg.normal(`  Testing with ${testThreads} threads...`);
    dbg.money("  Pure predicted result", predictedResultPure);
    
    await ns.grow(target, { threads: testThreads });
    const actualMoneyAfterGrow = ns.getServerMoneyAvailable(target);
    
    dbg.money("  Actual result", actualMoneyAfterGrow);
    
    const growPureError = Math.abs(predictedResultPure - actualMoneyAfterGrow) / actualMoneyAfterGrow * 100;
    
    dbg.normal(`  Pure error: ${growPureError.toFixed(2)}%`);
    
    results.benchmarks.push({
        test: "grow_threads",
        pure: growThreadsPure,
        ns: growThreadsNS,
        testThreads,
        predictedResult: predictedResultPure,
        actualResult: actualMoneyAfterGrow,
        pureError: growPureError
    });
    
    dbg.separator();
    
    // ============================================
    // TEST 3: TIMING COMPARISON
    // ============================================
    
    dbg.normal(`${ICONS.TIME} TEST 3: Timing Accuracy`);
    dbg.separator();
    
    const timingTests = [
        { op: "weaken", pureFn: mathPure.weakenTime, nsFn: mathNS.weakenTime, actualFn: ns.weaken },
        { op: "grow", pureFn: mathPure.growTime, nsFn: mathNS.growTime, actualFn: ns.grow },
        { op: "hack", pureFn: mathPure.hackTime, nsFn: mathNS.hackTime, actualFn: ns.hack }
    ];
    
    for (const test of timingTests) {
        dbg.normal(`  ${test.op.toUpperCase()}:`);
        
        const purePredicted = test.pureFn(server, player);
        const nsPredicted = test.nsFn(ns, target);
        
        dbg.normal(`    Pure: ${formatTime(purePredicted)}`);
        dbg.normal(`    NS API: ${formatTime(nsPredicted)}`);
        
        // Measure actual time
        const startTime = Date.now();
        await test.actualFn(target);
        const actualTime = Date.now() - startTime;
        
        dbg.normal(`    Actual: ${formatTime(actualTime)}`);
        
        const pureError = Math.abs(purePredicted - actualTime) / actualTime * 100;
        const nsError = Math.abs(nsPredicted - actualTime) / actualTime * 100;
        
        dbg.normal(`    Pure error: ${pureError.toFixed(2)}%`);
        dbg.normal(`    NS error: ${nsError.toFixed(2)}%`);
        
        results.benchmarks.push({
            test: `${test.op}_time`,
            pure: purePredicted,
            ns: nsPredicted,
            actual: actualTime,
            pureError,
            nsError,
            winner: nsError < pureError ? "NS API" : "Pure Math"
        });
        
        dbg.separator();
    }
    
    // ============================================
    // RAM COST ANALYSIS
    // ============================================
    
    dbg.normal(`${ICONS.CHART} RAM COST ANALYSIS`);
    dbg.separator();
    
    const ramCosts = {
        "math-pure.js": 0.00, // Pure math, no NS calls
        "math-ns.js": 0.40,   // Estimate based on API costs
        "this_benchmark": ns.getScriptRam(ns.getScriptName())
    };
    
    for (const [script, cost] of Object.entries(ramCosts)) {
        dbg.normal(`  ${script}: ${cost.toFixed(2)} GB`);
    }
    
    results.ramCosts = ramCosts;
    
    dbg.separator();
    
    // ============================================
    // SUMMARY & EXPORT
    // ============================================
    
    dbg.normal(`${ICONS.SCIENCE} BENCHMARK SUMMARY`);
    dbg.separator();
    
    let pureWins = 0;
    let nsWins = 0;
    
    for (const benchmark of results.benchmarks) {
        if (benchmark.winner === "Pure Math") pureWins++;
        if (benchmark.winner === "NS API") nsWins++;
    }
    
    dbg.normal(`  Pure Math wins: ${pureWins}`);
    dbg.normal(`  NS API wins: ${nsWins}`);
    dbg.normal(`  NS API precision advantage: ${nsWins > pureWins ? "✅ CONFIRMED" : "❓ INCONCLUSIVE"}`);
    
    // Export results
    const exportPath = "/state/math-benchmark.json";
    await ns.write(exportPath, JSON.stringify(results, null, 2), "w");
    
    dbg.separator();
    dbg.toastSuccess("Math benchmark complete");
    dbg.normal(`${ICONS.CHECK} Results exported to ${exportPath}`);
}
