/**
 * ╔════════════════════════════════════════════════════════════════════╗
 * ║           👻 PHANTOM MATH CONSTANTS v0.3.0                        ║
 * ║              "Shared truth, zero cost"                            ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ Author: Claude (Godlike AI Operator)                              ║
 * ║ Repo: https://github.com/tylersense-ui/-P.H.A.N.T.O.M.-framework  ║
 * ║ RAM Cost: 0.00 GB (Pure constants, no NS calls)                   ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ USAGE:                                                             ║
 * ║   import { CONSTANTS } from "/lib/math-shared.js";                ║
 * ║   const securityChange = CONSTANTS.WEAKEN_AMOUNT;                 ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ CHANGELOG:                                                         ║
 * ║   v0.3.0 (2026-03-17) - Extracted from math.js for sharing        ║
 * ║     • Game constants (security, timing ratios)                    ║
 * ║     • Shared across math-pure.js and math-ns.js                   ║
 * ╚════════════════════════════════════════════════════════════════════╝
 */

// ============================================
// GAME CONSTANTS (Exact values from Bitburner source)
// ============================================

/**
 * Official Bitburner game constants
 * Sources:
 * - https://github.com/bitburner-official/bitburner-src
 * - In-game testing and validation
 */
export const CONSTANTS = {
    // Security impact per thread (exact values)
    HACK_SECURITY: 0.002,      // Security increase per hack thread
    GROW_SECURITY: 0.004,      // Security increase per grow thread
    WEAKEN_AMOUNT: 0.05,       // Security decrease per weaken thread
    
    // Timing multipliers (relative to weaken time)
    // These are exact ratios confirmed by the game
    WEAKEN_TIME_MULT: 1.0,     // Weaken takes full time
    GROW_TIME_MULT: 0.8,       // Grow takes 80% of weaken time
    HACK_TIME_MULT: 0.25,      // Hack takes 25% of weaken time (1/4)
    
    // Growth mechanics
    GROW_BASE_MULTIPLIER: 1.03,          // Base growth per thread
    GROW_THREADS_BASELINE: 1,            // Adds $1 per thread before multiplying
    SERVER_BASE_GROWTH_RATE: 1.03,       // Default server growth
    
    // Hacking mechanics
    HACK_BALANCE_FACTOR: 240,            // Balance factor for hack percent calculation
    MIN_HACK_CHANCE: 0.0,                // Minimum hack success chance
    MAX_HACK_CHANCE: 1.0                 // Maximum hack success chance
};

/**
 * Helper: Calculate weaken threads needed to counter security increase
 * @param {number} securityIncrease - Amount of security to remove
 * @returns {number} Threads needed
 */
export function calculateWeakenThreads(securityIncrease) {
    return Math.ceil(securityIncrease / CONSTANTS.WEAKEN_AMOUNT);
}

/**
 * Helper: Calculate security impact of an operation
 * @param {string} operation - "hack", "grow", or "weaken"
 * @param {number} threads - Number of threads
 * @returns {number} Security change (positive = increase, negative = decrease)
 */
export function getSecurityImpact(operation, threads) {
    switch (operation.toLowerCase()) {
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
