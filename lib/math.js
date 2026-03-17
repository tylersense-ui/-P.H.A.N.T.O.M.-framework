/**
 * ╔════════════════════════════════════════════════════════════════════╗
 * ║              👻 PHANTOM MATH LIBRARY v0.2.0                       ║
 * ║           "Formulas reverse-engineered, precision first"          ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ Author: Claude (Godlike AI Operator)                              ║
 * ║ Repo: https://github.com/tylersense-ui/-P.H.A.N.T.O.M.-framework  ║
 * ║ RAM Cost: 0.00 GB (Pure math, no NS calls)                        ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ USAGE:                                                             ║
 * ║   import * as math from "/lib/math.js";                           ║
 * ║   const hackPercent = math.calculateHackPercent(server, player);  ║
 * ║                                                                    ║
 * ║ WARNING: These formulas are ESTIMATES without Formulas.exe        ║
 * ║ Use tools/test-formulas.js to validate accuracy in-game           ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ CHANGELOG:                                                         ║
 * ║   v0.2.0 (2026-03-17) - Initial formulas (to be validated)        ║
 * ║     • Hack percent estimation                                     ║
 * ║     • Grow threads calculation                                    ║
 * ║     • Weaken threads calculation                                  ║
 * ║     • Timing estimations                                          ║
 * ║     • Security impact calculations                                ║
 * ╚════════════════════════════════════════════════════════════════════╝
 */

// ============================================
// GAME CONSTANTS (Exact values from source)
// ============================================

export const CONSTANTS = {
    HACK_SECURITY: 0.002,      // Security increase per hack thread
    GROW_SECURITY: 0.004,      // Security increase per grow thread
    WEAKEN_AMOUNT: 0.05,       // Security decrease per weaken thread
    
    // Timing multipliers (relative to weaken)
    WEAKEN_TIME_MULT: 1.0,
    GROW_TIME_MULT: 0.8,
    HACK_TIME_MULT: 0.25,
    
    // Base timing (server-dependent, this is average)
    BASE_WEAKEN_TIME: 15000    // 15 seconds baseline
};

// ============================================
// HACK CALCULATIONS
// ============================================

/**
 * Calculate hack percent (money stolen per thread)
 * Based on: bitburner-src/src/Hacking/formulas/calculateHackPercent.ts
 * 
 * @param {object} server - Server object with currentSecurity, hackReq, maxMoney
 * @param {object} player - Player object with hacking, hackingMult
 * @returns {number} Percent of max money stolen per thread (0.0 to 1.0)
 */
export function calculateHackPercent(server, player) {
    const balanceFactor = 240; // Game constant
    
    // Difficulty multiplier (lower security = easier)
    const difficultyMult = (100 - server.currentSecurity) / 100;
    
    // Skill multiplier
    const skillMult = (player.hacking - (server.hackReq - 1)) / player.hacking;
    
    // Base percent
    const percentMoneyHacked = (difficultyMult * skillMult) / balanceFactor;
    
    // Apply player multipliers (1.0 in BN1 without augmentations)
    const hackMult = player.hackingMult || 1.0;
    
    return Math.max(0, percentMoneyHacked * hackMult);
}

/**
 * Calculate threads needed to hack a specific amount
 * 
 * @param {object} server
 * @param {object} player
 * @param {number} targetMoney - Amount of money to steal
 * @returns {number} Threads needed
 */
export function calculateHackThreads(server, player, targetMoney) {
    const percentPerThread = calculateHackPercent(server, player);
    const moneyPerThread = server.maxMoney * percentPerThread;
    
    if (moneyPerThread <= 0) return Infinity;
    
    return Math.ceil(targetMoney / moneyPerThread);
}

// ============================================
// GROW CALCULATIONS
// ============================================

/**
 * Calculate grow threads needed to grow money from current to target
 * Based on logarithmic growth formula
 * 
 * @param {object} server - Server with serverGrowth, currentSecurity
 * @param {object} player - Player with hacking, hackingMult
 * @param {number} currentMoney - Current server money
 * @param {number} targetMoney - Target money amount
 * @returns {number} Threads needed
 */
export function calculateGrowThreads(server, player, currentMoney, targetMoney) {
    if (currentMoney >= targetMoney) return 0;
    if (currentMoney <= 0) currentMoney = 1; // Avoid division by 0
    
    // Server growth rate (higher = faster growth)
    const serverGrowthRate = server.serverGrowth / 100;
    
    // Base growth per thread (game constant)
    const baseGrowth = 1.03;
    
    // Adjust for server growth and player multipliers
    const hackMult = player.hackingMult || 1.0;
    const adjustedGrowthRate = baseGrowth * (1 + serverGrowthRate) * hackMult;
    
    // Calculate ratio needed
    const ratio = targetMoney / currentMoney;
    
    // Logarithmic formula
    const threadsNeeded = Math.log(ratio) / Math.log(adjustedGrowthRate);
    
    return Math.max(0, Math.ceil(threadsNeeded));
}

/**
 * Estimate money after grow operation
 * Inverse of calculateGrowThreads
 */
export function estimateGrowResult(server, player, currentMoney, threads) {
    const serverGrowthRate = server.serverGrowth / 100;
    const baseGrowth = 1.03;
    const hackMult = player.hackingMult || 1.0;
    const adjustedGrowthRate = baseGrowth * (1 + serverGrowthRate) * hackMult;
    
    return currentMoney * Math.pow(adjustedGrowthRate, threads);
}

// ============================================
// WEAKEN CALCULATIONS
// ============================================

/**
 * Calculate weaken threads needed to reduce security
 * This is EXACT - directly from game source
 * 
 * @param {number} securityIncrease - Amount of security to reduce
 * @returns {number} Threads needed
 */
export function calculateWeakenThreads(securityIncrease) {
    return Math.ceil(securityIncrease / CONSTANTS.WEAKEN_AMOUNT);
}

/**
 * Calculate security increase from hack/grow operations
 * 
 * @param {string} operation - "hack" or "grow"
 * @param {number} threads - Number of threads
 * @returns {number} Security increase
 */
export function getSecurityImpact(operation, threads) {
    switch(operation) {
        case "hack":
            return threads * CONSTANTS.HACK_SECURITY;
        case "grow":
            return threads * CONSTANTS.GROW_SECURITY;
        case "weaken":
            return -threads * CONSTANTS.WEAKEN_AMOUNT;
        default:
            return 0;
    }
}

// ============================================
// TIMING CALCULATIONS
// ============================================

/**
 * Estimate weaken time for a server
 * Note: This is an approximation without Formulas.exe
 * Use tools/benchmark-timing.js to validate
 * 
 * @param {object} server - Server with currentSecurity, minSecurity, hackReq
 * @param {object} player - Player with hacking
 * @returns {number} Time in milliseconds
 */
export function estimateWeakenTime(server, player) {
    // Security multiplier (higher security = longer time)
    const securityMult = Math.max(1, server.currentSecurity / server.minSecurity);
    
    // Skill multiplier (higher hacking = faster)
    const skillMult = 1 + (player.hacking / 500);
    
    // Server difficulty multiplier
    const difficultyMult = Math.max(1, server.hackReq / 50);
    
    const baseTime = CONSTANTS.BASE_WEAKEN_TIME;
    
    return baseTime * securityMult * difficultyMult / skillMult;
}

/**
 * Estimate grow time (80% of weaken time)
 */
export function estimateGrowTime(server, player) {
    return estimateWeakenTime(server, player) * CONSTANTS.GROW_TIME_MULT;
}

/**
 * Estimate hack time (25% of weaken time)
 */
export function estimateHackTime(server, player) {
    return estimateWeakenTime(server, player) * CONSTANTS.HACK_TIME_MULT;
}

// ============================================
// BATCH PLANNING
// ============================================

/**
 * Calculate complete WGH batch plan
 * Returns threads needed for each operation
 * 
 * @param {object} server
 * @param {object} player
 * @param {number} hackPercent - Desired hack percent (0.0 to 1.0)
 * @returns {object} Batch plan with threads
 */
export function calculateWGHBatch(server, player, hackPercent = 0.10) {
    // Calculate hack threads
    const moneyToSteal = server.maxMoney * hackPercent;
    const hackThreads = calculateHackThreads(server, player, moneyToSteal);
    
    // Calculate money after hack
    const moneyAfterHack = server.maxMoney - moneyToSteal;
    
    // Calculate grow threads to restore
    const growThreads = calculateGrowThreads(server, player, moneyAfterHack, server.maxMoney);
    
    // Calculate security impact
    const hackSecurity = getSecurityImpact("hack", hackThreads);
    const growSecurity = getSecurityImpact("grow", growThreads);
    const totalSecurity = hackSecurity + growSecurity;
    
    // Calculate weaken threads
    const weakenThreads = calculateWeakenThreads(totalSecurity);
    
    // Calculate timing
    const weakenTime = estimateWeakenTime(server, player);
    const growTime = estimateGrowTime(server, player);
    const hackTime = estimateHackTime(server, player);
    
    return {
        hackThreads,
        growThreads,
        weakenThreads,
        totalThreads: hackThreads + growThreads + weakenThreads,
        hackTime,
        growTime,
        weakenTime,
        cycleTime: weakenTime, // Longest operation
        expectedMoney: moneyToSteal,
        securityImpact: totalSecurity
    };
}

// ============================================
// TARGET SELECTION
// ============================================

/**
 * Calculate Expected Value per Second for a target
 * This determines the best target to hack
 * 
 * @param {object} server
 * @param {object} player
 * @param {number} availableRAM - Total RAM available for batching
 * @param {number} hackPercent - Desired hack percent
 * @returns {number} Expected money per second
 */
export function calculateEVperSecond(server, player, availableRAM, hackPercent = 0.10) {
    if (!server.hasRoot || !server.hasValue) return 0;
    if (server.hackReq > player.hacking) return 0;
    
    // Calculate batch
    const batch = calculateWGHBatch(server, player, hackPercent);
    
    // RAM needed (hack=1.7, grow=1.75, weaken=1.75)
    const ramNeeded = (batch.hackThreads * 1.70) + 
                      (batch.growThreads * 1.75) + 
                      (batch.weakenThreads * 1.75);
    
    if (ramNeeded > availableRAM) return 0;
    
    // EV/s = money stolen / cycle time
    const EVperSecond = batch.expectedMoney / (batch.cycleTime / 1000);
    
    return EVperSecond;
}

/**
 * Select best target from network
 * 
 * @param {Array} servers - Array of server objects
 * @param {object} player
 * @param {number} availableRAM
 * @returns {object} { target, expectedEV, batch }
 */
export function selectBestTarget(servers, player, availableRAM) {
    let bestTarget = null;
    let bestEV = 0;
    let bestBatch = null;
    
    for (const server of servers) {
        const ev = calculateEVperSecond(server, player, availableRAM);
        if (ev > bestEV) {
            bestEV = ev;
            bestTarget = server;
            bestBatch = calculateWGHBatch(server, player);
        }
    }
    
    return { 
        target: bestTarget, 
        expectedEV: bestEV,
        batch: bestBatch
    };
}
