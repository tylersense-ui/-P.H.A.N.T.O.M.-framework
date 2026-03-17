/**
 * ╔════════════════════════════════════════════════════════════════════╗
 * ║           👻 PHANTOM MATH LIBRARY - PURE v0.3.0                   ║
 * ║        "Zero RAM, approximate formulas, no NS calls"              ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ Author: Claude (Godlike AI Operator)                              ║
 * ║ Repo: https://github.com/tylersense-ui/-P.H.A.N.T.O.M.-framework  ║
 * ║ RAM Cost: 0.00 GB (Pure math, no NS API calls)                    ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ USAGE:                                                             ║
 * ║   import * as mathPure from "/lib/math-pure.js";                  ║
 * ║   const hackPercent = mathPure.hackPercent(server, player);       ║
 * ║                                                                    ║
 * ║ WARNING: These are APPROXIMATIONS without NS API validation       ║
 * ║ Use /tools/benchmark-math.js to measure accuracy                  ║
 * ║ For precision, use /lib/math-ns.js (costs RAM)                    ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ CHANGELOG:                                                         ║
 * ║   v0.3.0 (2026-03-17) - Pure math extraction from v0.2.1          ║
 * ║     • Hack percent estimation (approximate)                       ║
 * ║     • Grow threads calculation (approximate)                      ║
 * ║     • Timing estimations (known to be ~91% error)                 ║
 * ║     • All formulas are reverse-engineered estimates               ║
 * ╚════════════════════════════════════════════════════════════════════╝
 */

import { CONSTANTS, calculateWeakenThreads, getSecurityImpact } from "/lib/math-shared.js";

// ============================================
// HACK FORMULAS (Approximate)
// ============================================

/**
 * APPROXIMATE hack percent calculation
 * WARNING: This is a rough estimate. Real formula requires Formulas.exe
 * 
 * @param {object} server - { currentSecurity, hackReq, maxMoney }
 * @param {object} player - { hacking, hackingMult }
 * @returns {number} Approximate percent stolen per thread (0.0 to 1.0)
 */
export function hackPercent(server, player) {
    const balanceFactor = CONSTANTS.HACK_BALANCE_FACTOR;
    
    // Difficulty multiplier (lower security = easier)
    const difficultyMult = (100 - server.currentSecurity) / 100;
    
    // Skill multiplier
    const skillMult = (player.hacking - (server.hackReq - 1)) / player.hacking;
    
    // Base percent
    const percentMoneyHacked = (difficultyMult * skillMult) / balanceFactor;
    
    // Apply player multipliers
    const hackMult = player.hackingMult || 1.0;
    
    return Math.max(0, percentMoneyHacked * hackMult);
}

/**
 * Calculate threads needed to hack a specific amount
 */
export function hackThreads(server, player, targetMoney) {
    const percentPerThread = hackPercent(server, player);
    const moneyPerThread = server.maxMoney * percentPerThread;
    
    if (moneyPerThread <= 0) return Infinity;
    
    return Math.ceil(targetMoney / moneyPerThread);
}

// ============================================
// GROW FORMULAS (Approximate)
// ============================================

/**
 * APPROXIMATE grow threads calculation
 * WARNING: This uses simplified logarithmic growth. Real formula is more complex.
 * See: ns.growthAnalyze() for precise calculation (costs 1.00GB RAM)
 * 
 * @param {object} server - { serverGrowth, currentSecurity }
 * @param {object} player - { hacking, hackingMult }
 * @param {number} currentMoney - Current server money
 * @param {number} targetMoney - Target money amount
 * @returns {number} Approximate threads needed
 */
export function growThreads(server, player, currentMoney, targetMoney) {
    if (currentMoney >= targetMoney) return 0;
    if (currentMoney <= 0) currentMoney = 1; // Avoid division by 0
    
    // Server growth rate (NOTE: serverGrowth is already a multiplier, e.g., 3000)
    const serverGrowthRate = server.serverGrowth;
    
    // Adjust for player multipliers
    const hackMult = player.hackingMult || 1.0;
    
    // SIMPLIFIED formula (not exact!)
    // Real formula: (money + threads) * growMultiplier^threads = target
    const adjustedGrowthRate = 1 + (serverGrowthRate * hackMult / 100);
    
    // Calculate ratio needed
    const ratio = targetMoney / currentMoney;
    
    // Logarithmic approximation
    const threadsNeeded = Math.log(ratio) / Math.log(adjustedGrowthRate);
    
    return Math.max(0, Math.ceil(threadsNeeded));
}

/**
 * Estimate money after grow operation (inverse of growThreads)
 */
export function growResult(server, player, currentMoney, threads) {
    const serverGrowthRate = server.serverGrowth;
    const hackMult = player.hackingMult || 1.0;
    const adjustedGrowthRate = 1 + (serverGrowthRate * hackMult / 100);
    
    return currentMoney * Math.pow(adjustedGrowthRate, threads);
}

// ============================================
// TIMING FORMULAS (Very Approximate!)
// ============================================

/**
 * VERY APPROXIMATE weaken time estimation
 * WARNING: Benchmark shows ~91% error! Use ns.getWeakenTime() for accuracy.
 * 
 * @param {object} server - { currentSecurity, minSecurity, hackReq }
 * @param {object} player - { hacking }
 * @returns {number} Time in milliseconds (VERY APPROXIMATE)
 */
export function weakenTime(server, player) {
    // Security multiplier (higher security = longer time)
    const securityMult = Math.max(1, server.currentSecurity / server.minSecurity);
    
    // Skill multiplier (higher hacking = faster)
    const skillMult = 1 + (player.hacking / 500);
    
    // Server difficulty multiplier
    const difficultyMult = Math.max(1, server.hackReq / 50);
    
    // Base time (pure guess!)
    const baseTime = 15000; // 15 seconds baseline
    
    return baseTime * securityMult * difficultyMult / skillMult;
}

/**
 * Approximate grow time (80% of weaken time)
 */
export function growTime(server, player) {
    return weakenTime(server, player) * CONSTANTS.GROW_TIME_MULT;
}

/**
 * Approximate hack time (25% of weaken time)
 */
export function hackTime(server, player) {
    return weakenTime(server, player) * CONSTANTS.HACK_TIME_MULT;
}

// ============================================
// BATCH PLANNING
// ============================================

/**
 * Calculate complete WGH batch plan
 * Returns threads needed for each operation
 * 
 * @param {object} server - Full server object
 * @param {object} player - Full player object
 * @param {number} hackPercent - Desired hack percent (0.0 to 1.0)
 * @returns {object} Batch plan with threads
 */
export function calculateWGHBatch(server, player, hackPercentDesired = 0.10) {
    // Calculate hack threads
    const moneyToSteal = server.maxMoney * hackPercentDesired;
    const hackThreadsNeeded = hackThreads(server, player, moneyToSteal);
    
    // Calculate money after hack
    const moneyAfterHack = server.maxMoney - moneyToSteal;
    
    // Calculate grow threads to restore
    const growThreadsNeeded = growThreads(server, player, moneyAfterHack, server.maxMoney);
    
    // Calculate security impact
    const hackSecurity = getSecurityImpact("hack", hackThreadsNeeded);
    const growSecurity = getSecurityImpact("grow", growThreadsNeeded);
    const totalSecurity = hackSecurity + growSecurity;
    
    // Calculate weaken threads
    const weakenThreadsNeeded = calculateWeakenThreads(totalSecurity);
    
    return {
        hack: hackThreadsNeeded,
        grow: growThreadsNeeded,
        weaken: weakenThreadsNeeded,
        totalThreads: hackThreadsNeeded + growThreadsNeeded + weakenThreadsNeeded,
        hackPercent: hackPercentDesired,
        timing: {
            weaken: weakenTime(server, player),
            grow: growTime(server, player),
            hack: hackTime(server, player)
        }
    };
}
