/**
 * ╔════════════════════════════════════════════════════════════════════╗
 * ║           👻 PHANTOM FORMULA VALIDATOR v0.2.0                     ║
 * ║              "Measure twice, code once"                           ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ Author: Claude (Godlike AI Operator)                              ║
 * ║ RAM Cost: ~2.50 GB                                                 ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ USAGE:                                                             ║
 * ║   run tools/test-formulas.js [target]                             ║
 * ║   run tools/test-formulas.js n00dles                              ║
 * ║                                                                    ║
 * ║ WHAT IT DOES:                                                      ║
 * ║   • Tests hack formula accuracy (predicted vs actual)             ║
 * ║   • Tests grow formula accuracy                                   ║
 * ║   • Tests weaken formula (always exact)                           ║
 * ║   • Exports results to /state/formula-validation.json             ║
 * ║                                                                    ║
 * ║ IMPORTANT: Run on a prepped server (min security, max money)      ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ CHANGELOG:                                                         ║
 * ║   v0.2.0 (2026-03-17) - Initial test suite                        ║
 * ╚════════════════════════════════════════════════════════════════════╝
 */

import { Debug, ICONS } from "/lib/debug.js";
import * as fmt from "/lib/format.js";
import * as math from "/lib/math.js";

/** @param {NS} ns */
export async function main(ns) {
    const dbg = new Debug(ns, 2); // Verbose mode
    
    ns.disableLog("ALL");
    ns.tail();
    ns.resizeTail(900, 700);
    
    dbg.clear();
    dbg.header("👻 PHANTOM FORMULA VALIDATION v0.2.0");
    
    const target = ns.args[0] || "n00dles";
    
    dbg.normal(`${ICONS.TARGET} Target: ${target}`);
    dbg.separator();
    
    // Check root access
    if (!ns.hasRootAccess(target)) {
        dbg.toastError(`No root access to ${target}`);
        return;
    }
    
    // Collect initial server state
    const initialState = {
        money: ns.getServerMoneyAvailable(target),
        maxMoney: ns.getServerMaxMoney(target),
        security: ns.getServerSecurityLevel(target),
        minSecurity: ns.getServerMinSecurityLevel(target),
        hackReq: ns.getServerRequiredHackingLevel(target),
        serverGrowth: ns.getServerGrowth(target)
    };
    
    const player = {
        hacking: ns.getPlayer().skills.hacking,
        hackingMult: ns.getPlayer().mults.hacking || 1.0
    };
    
    dbg.normal(`${ICONS.GHOST} Player Hacking: ${player.hacking}`);
    dbg.normal(`${ICONS.SERVER} Server State:`);
    dbg.money("  Money", initialState.money);
    dbg.normal(`  Security: ${initialState.security.toFixed(2)} / ${initialState.minSecurity}`);
    dbg.separator();
    
    const results = {
        target,
        timestamp: new Date().toISOString(),
        player,
        initialState,
        tests: []
    };
    
    // ============================================
    // TEST 1: HACK FORMULA
    // ============================================
    
    dbg.normal(`${ICONS.HACK} TEST 1: Hack Formula Validation`);
    dbg.separator();
    
    const server = {
        currentSecurity: initialState.security,
        hackReq: initialState.hackReq,
        maxMoney: initialState.maxMoney
    };
    
    // Predict hack result
    const predictedPercent = math.calculateHackPercent(server, player);
    const predictedMoney = initialState.maxMoney * predictedPercent;
    
    dbg.verbose(`  Predicted percent per thread: ${fmt.percent(predictedPercent)}`);
    dbg.money("  Predicted money stolen (1 thread)", predictedMoney);
    
    // Execute actual hack
    const moneyBefore = ns.getServerMoneyAvailable(target);
    const hackResult = await ns.hack(target);
    const moneyAfter = ns.getServerMoneyAvailable(target);
    const actualStolen = moneyBefore - moneyAfter;
    
    dbg.money("  Actual money stolen", actualStolen);
    
    const hackError = actualStolen > 0 
        ? Math.abs(predictedMoney - actualStolen) / actualStolen * 100
        : 0;
    
    dbg.normal(`  Error: ${hackError.toFixed(2)}%`);
    
    results.tests.push({
        test: "hack",
        predicted: predictedMoney,
        actual: actualStolen,
        error: hackError,
        threads: 1,
        passed: hackError < 20 // 20% error margin acceptable
    });
    
    dbg.separator();
    
    // ============================================
    // TEST 2: GROW FORMULA
    // ============================================
    
    dbg.normal(`${ICONS.CHART} TEST 2: Grow Formula Validation`);
    dbg.separator();
    
    const currentMoney = ns.getServerMoneyAvailable(target);
    const targetMoney = initialState.maxMoney;
    
    // Only test if money is not already max
    if (currentMoney < targetMoney * 0.99) {
        const predictedGrowThreads = math.calculateGrowThreads(
            server,
            player,
            currentMoney,
            targetMoney
        );
        
        dbg.normal(`  Current money: ${fmt.money(currentMoney)}`);
        dbg.normal(`  Target money: ${fmt.money(targetMoney)}`);
        dbg.normal(`  Predicted threads needed: ${predictedGrowThreads}`);
        
        // Execute grow with predicted threads
        const moneyBeforeGrow = ns.getServerMoneyAvailable(target);
        
        // We'll test with 10 threads to see the formula accuracy
        const testThreads = Math.min(10, predictedGrowThreads);
        const predictedResult = math.estimateGrowResult(server, player, moneyBeforeGrow, testThreads);
        
        dbg.money("  Predicted result (10 threads)", predictedResult);
        
        await ns.grow(target, { threads: testThreads });
        
        const moneyAfterGrow = ns.getServerMoneyAvailable(target);
        
        dbg.money("  Actual result", moneyAfterGrow);
        
        const growError = Math.abs(predictedResult - moneyAfterGrow) / moneyAfterGrow * 100;
        
        dbg.normal(`  Error: ${growError.toFixed(2)}%`);
        
        results.tests.push({
            test: "grow",
            predicted: predictedResult,
            actual: moneyAfterGrow,
            error: growError,
            threads: testThreads,
            passed: growError < 30 // 30% error margin for grow
        });
    } else {
        dbg.normal(`  Skipped: Server already at max money`);
        results.tests.push({
            test: "grow",
            skipped: true,
            reason: "Server at max money"
        });
    }
    
    dbg.separator();
    
    // ============================================
    // TEST 3: WEAKEN FORMULA
    // ============================================
    
    dbg.normal(`${ICONS.LIGHTNING} TEST 3: Weaken Formula Validation`);
    dbg.separator();
    
    const securityBefore = ns.getServerSecurityLevel(target);
    
    const predictedWeakenThreads = math.calculateWeakenThreads(1.0); // 1.0 security reduction
    const predictedReduction = 1.0;
    
    dbg.normal(`  Security before: ${securityBefore.toFixed(2)}`);
    dbg.normal(`  Predicted threads for -1.0 security: ${predictedWeakenThreads}`);
    
    // Check available RAM on home
    const homeRAM = ns.getServerMaxRam("home") - ns.getServerUsedRam("home");
    const weakenRAMCost = 1.75; // RAM cost per weaken thread
    const maxThreads = Math.floor(homeRAM / weakenRAMCost);
    
    // Use fewer threads if not enough RAM
    const actualThreads = Math.min(predictedWeakenThreads, maxThreads, 5); // Cap at 5 for testing
    
    if (actualThreads < predictedWeakenThreads) {
        dbg.normal(`  ⚠️  Not enough RAM for ${predictedWeakenThreads} threads`);
        dbg.normal(`  Using ${actualThreads} threads instead`);
    }
    
    // Execute weaken
    await ns.weaken(target, { threads: actualThreads });
    
    const securityAfter = ns.getServerSecurityLevel(target);
    const actualReduction = securityBefore - securityAfter;
    const expectedReduction = actualThreads * 0.05; // 0.05 per thread
    
    dbg.normal(`  Security after: ${securityAfter.toFixed(2)}`);
    dbg.normal(`  Actual reduction: ${actualReduction.toFixed(4)}`);
    dbg.normal(`  Expected reduction (${actualThreads} threads): ${expectedReduction.toFixed(4)}`);
    
    const weakenError = Math.abs(expectedReduction - actualReduction) / expectedReduction * 100;
    
    dbg.normal(`  Error: ${weakenError.toFixed(2)}%`);
    
    results.tests.push({
        test: "weaken",
        predicted: expectedReduction,
        actual: actualReduction,
        error: weakenError,
        threads: actualThreads,
        passed: weakenError < 5 // Weaken should be very precise
    });
    
    dbg.separator();
    
    // ============================================
    // SUMMARY & EXPORT
    // ============================================
    
    dbg.normal(`${ICONS.CHART} TEST SUMMARY`);
    dbg.separator();
    
    const passedTests = results.tests.filter(t => !t.skipped && t.passed).length;
    const totalTests = results.tests.filter(t => !t.skipped).length;
    
    for (const test of results.tests) {
        if (test.skipped) {
            dbg.normal(`  ${ICONS.WARNING} ${test.test.toUpperCase()}: SKIPPED (${test.reason})`);
        } else {
            const icon = test.passed ? ICONS.SUCCESS : ICONS.ERROR;
            dbg.normal(`  ${icon} ${test.test.toUpperCase()}: ${test.error.toFixed(2)}% error`);
        }
    }
    
    dbg.separator();
    dbg.normal(`  Passed: ${passedTests}/${totalTests}`);
    
    // Export results
    const json = JSON.stringify(results, null, 2);
    await ns.write("/state/formula-validation.json", json, "w");
    
    dbg.separator();
    dbg.toastSuccess(`Formula validation complete!`);
    dbg.normal(`${ICONS.SUCCESS} Results exported to /state/formula-validation.json`);
    
    // Recommendations
    dbg.separator();
    dbg.normal(`${ICONS.INFO} RECOMMENDATIONS`);
    dbg.separator();
    
    const hackTest = results.tests.find(t => t.test === "hack");
    if (hackTest && !hackTest.passed) {
        dbg.normal(`  ⚠️  Hack formula needs adjustment (${hackTest.error.toFixed(1)}% error)`);
    } else if (hackTest) {
        dbg.normal(`  ✅ Hack formula is acceptable`);
    }
    
    const growTest = results.tests.find(t => t.test === "grow");
    if (growTest && !growTest.skipped && !growTest.passed) {
        dbg.normal(`  ⚠️  Grow formula needs adjustment (${growTest.error.toFixed(1)}% error)`);
    } else if (growTest && !growTest.skipped) {
        dbg.normal(`  ✅ Grow formula is acceptable`);
    }
    
    const weakenTest = results.tests.find(t => t.test === "weaken");
    if (weakenTest && !weakenTest.passed) {
        dbg.normal(`  ⚠️  Weaken formula needs adjustment (${weakenTest.error.toFixed(1)}% error)`);
    } else if (weakenTest) {
        dbg.normal(`  ✅ Weaken formula is precise`);
    }
}
