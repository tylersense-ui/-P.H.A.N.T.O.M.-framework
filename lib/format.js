/**
 * ╔════════════════════════════════════════════════════════════════════╗
 * ║                 👻 PHANTOM FORMAT LIBRARY v0.1.0                  ║
 * ║              "Beautiful numbers, beautiful decisions"             ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ Author: Claude (Godlike AI Operator)                              ║
 * ║ Repo: https://github.com/[USER]/phantom-bitburner                 ║
 * ║ RAM Cost: 0.00 GB (Pure functions, no NS API calls)               ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ USAGE:                                                             ║
 * ║   import * as fmt from "/lib/format.js";                          ║
 * ║   fmt.money(1234567); // "$1.23M"                                 ║
 * ║   fmt.ram(2048); // "2.00TB"                                      ║
 * ║   fmt.percent(0.75); // "75.0%"                                   ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ CHANGELOG:                                                         ║
 * ║   v0.1.0 (2026-03-17) - Initial release                           ║
 * ║     • Money, RAM, time, percent formatters                        ║
 * ║     • Table builder                                               ║
 * ║     • Progress bar generator                                      ║
 * ╚════════════════════════════════════════════════════════════════════╝
 */

/**
 * Format money with K/M/B/T suffix
 * @param {number} value
 * @returns {string}
 */
export function money(value) {
    if (value === 0) return "$0";
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
export function ram(gb) {
    if (gb === 0) return "0GB";
    if (gb < 1024) return `${gb.toFixed(2)}GB`;
    return `${(gb / 1024).toFixed(2)}TB`;
}

/**
 * Format time (ms to human readable)
 * @param {number} ms
 * @returns {string}
 */
export function time(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
}

/**
 * Format percentage
 * @param {number} value - 0.0 to 1.0
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string}
 */
export function percent(value, decimals = 1) {
    return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format number with thousands separators
 * @param {number} value
 * @returns {string}
 */
export function number(value) {
    return value.toLocaleString('en-US');
}

/**
 * Pad string to fixed width
 * @param {string} str
 * @param {number} width
 * @param {string} align - 'left', 'right', 'center'
 * @returns {string}
 */
export function pad(str, width, align = 'left') {
    str = String(str);
    if (str.length >= width) return str.slice(0, width);
    
    const padding = width - str.length;
    
    if (align === 'right') {
        return ' '.repeat(padding) + str;
    } else if (align === 'center') {
        const leftPad = Math.floor(padding / 2);
        const rightPad = padding - leftPad;
        return ' '.repeat(leftPad) + str + ' '.repeat(rightPad);
    } else {
        return str + ' '.repeat(padding);
    }
}

/**
 * Build a table row
 * @param {Array<string>} cells
 * @param {Array<number>} widths
 * @param {Array<string>} aligns
 * @returns {string}
 */
export function tableRow(cells, widths, aligns = []) {
    return cells.map((cell, i) => {
        const width = widths[i] || 10;
        const align = aligns[i] || 'left';
        return pad(cell, width, align);
    }).join(' │ ');
}

/**
 * Build table separator
 * @param {Array<number>} widths
 * @returns {string}
 */
export function tableSeparator(widths) {
    return widths.map(w => '─'.repeat(w)).join('─┼─');
}

/**
 * Build progress bar
 * @param {number} current
 * @param {number} max
 * @param {number} width - Bar width in characters (default: 20)
 * @returns {string}
 */
export function progressBar(current, max, width = 20) {
    if (max === 0) return '░'.repeat(width);
    
    const ratio = Math.min(current / max, 1);
    const filled = Math.floor(ratio * width);
    const empty = width - filled;
    
    return '█'.repeat(filled) + '░'.repeat(empty);
}

/**
 * Build security level indicator
 * @param {number} current
 * @param {number} min
 * @returns {string} Color-coded security display
 */
export function security(current, min) {
    const diff = current - min;
    if (diff < 1) return `🟢 ${current.toFixed(2)}`;
    if (diff < 5) return `🟡 ${current.toFixed(2)}`;
    return `🔴 ${current.toFixed(2)}`;
}

/**
 * Build money availability indicator
 * @param {number} current
 * @param {number} max
 * @returns {string}
 */
export function moneyStatus(current, max) {
    const ratio = current / max;
    if (ratio >= 0.99) return `🟢 ${percent(ratio)}`;
    if (ratio >= 0.75) return `🟡 ${percent(ratio)}`;
    return `🔴 ${percent(ratio)}`;
}

/**
 * Format server tier based on hack requirement
 * @param {number} hackReq
 * @returns {string}
 */
export function tier(hackReq) {
    if (hackReq <= 50) return "⭐ Easy";
    if (hackReq <= 200) return "⭐⭐ Medium";
    if (hackReq <= 500) return "⭐⭐⭐ Hard";
    if (hackReq <= 1000) return "⭐⭐⭐⭐ Elite";
    return "⭐⭐⭐⭐⭐ End-Game";
}

/**
 * Build box border
 * @param {string} title
 * @param {number} width
 * @returns {object} {top, middle, bottom}
 */
export function box(title, width = 60) {
    const titlePadded = ` ${title} `;
    const titleLen = titlePadded.length;
    const leftPad = Math.floor((width - titleLen) / 2);
    const rightPad = width - titleLen - leftPad;
    
    return {
        top: `╔${'═'.repeat(leftPad)}${titlePadded}${'═'.repeat(rightPad)}╗`,
        middle: `║${' '.repeat(width)}║`,
        bottom: `╚${'═'.repeat(width)}╝`
    };
}
