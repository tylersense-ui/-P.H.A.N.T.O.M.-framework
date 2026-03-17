/**
 * ╔════════════════════════════════════════════════════════════════════╗
 * ║                  👻 PHANTOM DEBUG SYSTEM v0.1.0                   ║
 * ║                 "See the invisible, log the ghost"                ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ Author: Claude (Godlike AI Operator)                              ║
 * ║ Repo: https://github.com/[USER]/phantom-bitburner                 ║
 * ║ RAM Cost: 0.00 GB (Pure class, no NS functions)                   ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ USAGE:                                                             ║
 * ║   import { Debug } from "/lib/debug.js";                          ║
 * ║   const dbg = new Debug(ns, debugLevel);                          ║
 * ║   dbg.log("Message", 2); // Only if debugLevel >= 2               ║
 * ║                                                                    ║
 * ║ DEBUG LEVELS:                                                      ║
 * ║   0 = SILENT  (Toasts succès uniquement)                          ║
 * ║   1 = NORMAL  (Infos importantes - défaut)                        ║
 * ║   2 = VERBOSE (Détails + metrics + timing)                        ║
 * ║   3 = ULTRA   (Debug complet + dump objects)                      ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ CHANGELOG:                                                         ║
 * ║   v0.1.0 (2026-03-17) - Initial release                           ║
 * ║     • Multi-level debug system                                    ║
 * ║     • Toast helpers with icons                                    ║
 * ║     • Timer utilities                                             ║
 * ║     • Money/metric formatters                                     ║
 * ╚════════════════════════════════════════════════════════════════════╝
 */

// Icons collection
export const ICONS = {
    SUCCESS: "✅",
    ERROR: "❌",
    WARNING: "⚠️",
    INFO: "ℹ️",
    MONEY: "💰",
    NETWORK: "🌐",
    LIGHTNING: "⚡",
    LOCK: "🔒",
    TARGET: "🎯",
    ROCKET: "🚀",
    GHOST: "👻",
    CHART: "📊",
    SCAN: "🔍",
    SERVER: "🖥️",
    HACK: "⚔️"
};

/**
 * Debug System Class
 * Provides multi-level logging, toasts, timers, and formatters
 */
export class Debug {
    /**
     * @param {NS} ns - Netscript object
     * @param {number} level - Debug level (0-3)
     */
    constructor(ns, level = 1) {
        this.ns = ns;
        this.level = level;
        this.timers = new Map();
    }

    /**
     * Log message if current debug level >= required level
     * @param {string} message - Message to log
     * @param {number} requiredLevel - Minimum level to display (default: 1)
     */
    log(message, requiredLevel = 1) {
        if (this.level >= requiredLevel) {
            this.ns.print(message);
        }
    }

    /**
     * Shortcut: log only if NORMAL level (1+)
     */
    normal(message) {
        this.log(message, 1);
    }

    /**
     * Shortcut: log only if VERBOSE level (2+)
     */
    verbose(message) {
        this.log(message, 2);
    }

    /**
     * Shortcut: log only if ULTRA level (3)
     */
    ultra(message) {
        this.log(message, 3);
    }

    /**
     * Success toast (always shown, even in SILENT mode)
     * @param {string} message
     * @param {number} duration - Toast duration in ms (default: 5000)
     */
    toastSuccess(message, duration = 5000) {
        this.ns.toast(`${ICONS.SUCCESS} ${message}`, "success", duration);
    }

    /**
     * Error toast (always shown)
     */
    toastError(message, duration = 5000) {
        this.ns.toast(`${ICONS.ERROR} ${message}`, "error", duration);
    }

    /**
     * Warning toast (always shown)
     */
    toastWarning(message, duration = 5000) {
        this.ns.toast(`${ICONS.WARNING} ${message}`, "warning", duration);
    }

    /**
     * Info toast (only if level >= 1)
     */
    toastInfo(message, duration = 3000) {
        if (this.level >= 1) {
            this.ns.toast(`${ICONS.INFO} ${message}`, "info", duration);
        }
    }

    /**
     * Start a named timer
     * @param {string} name - Timer name
     */
    startTimer(name) {
        this.timers.set(name, Date.now());
        this.verbose(`${ICONS.LIGHTNING} Timer [${name}] started`);
    }

    /**
     * End a timer and return elapsed time
     * @param {string} name - Timer name
     * @returns {number} Elapsed time in ms
     */
    endTimer(name) {
        const start = this.timers.get(name);
        if (!start) {
            this.toastWarning(`Timer [${name}] not found`);
            return 0;
        }
        
        const elapsed = Date.now() - start;
        this.timers.delete(name);
        
        const formatted = this.formatTime(elapsed);
        this.verbose(`${ICONS.LIGHTNING} Timer [${name}] finished: ${formatted}`);
        
        return elapsed;
    }

    /**
     * Format money with K/M/B/T suffix
     * @param {number} value
     * @returns {string}
     */
    formatMoney(value) {
        if (value < 1000) return `$${value.toFixed(2)}`;
        if (value < 1e6) return `$${(value / 1e3).toFixed(2)}K`;
        if (value < 1e9) return `$${(value / 1e6).toFixed(2)}M`;
        if (value < 1e12) return `$${(value / 1e9).toFixed(2)}B`;
        return `$${(value / 1e12).toFixed(2)}T`;
    }

    /**
     * Format RAM with GB/TB suffix
     * @param {number} gb
     * @returns {string}
     */
    formatRAM(gb) {
        if (gb < 1024) return `${gb.toFixed(2)}GB`;
        return `${(gb / 1024).toFixed(2)}TB`;
    }

    /**
     * Format time (ms to human readable)
     * @param {number} ms
     * @returns {string}
     */
    formatTime(ms) {
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
        if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
        return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`;
    }

    /**
     * Format percentage
     * @param {number} value - 0.0 to 1.0
     * @returns {string}
     */
    formatPercent(value) {
        return `${(value * 100).toFixed(1)}%`;
    }

    /**
     * Log money metric
     * @param {string} label
     * @param {number} value
     * @param {number} requiredLevel
     */
    money(label, value, requiredLevel = 1) {
        this.log(`${ICONS.MONEY} ${label}: ${this.formatMoney(value)}`, requiredLevel);
    }

    /**
     * Log generic metric
     * @param {string} label
     * @param {any} value
     * @param {number} requiredLevel
     */
    metric(label, value, requiredLevel = 2) {
        this.log(`${ICONS.CHART} ${label}: ${value}`, requiredLevel);
    }

    /**
     * Print ASCII header
     * @param {string} title
     */
    header(title) {
        const line = "═".repeat(60);
        this.log(`╔${line}╗`);
        this.log(`║ ${title.padEnd(58)} ║`);
        this.log(`╚${line}╝`);
    }

    /**
     * Print separator line
     */
    separator() {
        this.log("─".repeat(60));
    }

    /**
     * Clear tail window
     */
    clear() {
        this.ns.clearLog();
    }

    /**
     * Dump object (ULTRA level only)
     * @param {string} label
     * @param {any} obj
     */
    dump(label, obj) {
        if (this.level >= 3) {
            this.log(`${ICONS.INFO} ${label}:`);
            this.log(JSON.stringify(obj, null, 2));
        }
    }
}
