/**
 * ╔════════════════════════════════════════════════════════════════════╗
 * ║              👻 PHANTOM NETWORK SCANNER v0.1.0                    ║
 * ║           "Map the shadows, reveal the targets"                   ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ Author: Claude (Godlike AI Operator)                              ║
 * ║ Repo: https://github.com/[USER]/phantom-bitburner                 ║
 * ║ RAM Cost: ~3.00 GB                                                 ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ USAGE:                                                             ║
 * ║   run scanner.js [--debug 0-3]                                    ║
 * ║                                                                    ║
 * ║ OUTPUT:                                                            ║
 * ║   • Beautiful tail window with network cartography                ║
 * ║   • JSON export to /state/network.json                            ║
 * ║   • Recommended targets (early/mid/late)                          ║
 * ║   • Rootable servers list                                         ║
 * ║   • RAM allocation analysis                                       ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ CHANGELOG:                                                         ║
 * ║   v0.1.0 (2026-03-17) - Initial release                           ║
 * ║     • Full network BFS scan                                       ║
 * ║     • Server stats collection                                     ║
 * ║     • Target recommendations                                      ║
 * ║     • JSON export                                                 ║
 * ║     • Beautiful tail UI                                           ║
 * ╚════════════════════════════════════════════════════════════════════╝
 */

import { Debug, ICONS } from "/lib/debug.js";
import * as fmt from "/lib/format.js";

/** @param {NS} ns */
export async function main(ns) {
    // Parse debug level from args
    const debugLevel = ns.args.includes("--debug") 
        ? parseInt(ns.args[ns.args.indexOf("--debug") + 1] || "1")
        : 1;
    
    const dbg = new Debug(ns, debugLevel);
    
    // Setup tail window
    ns.disableLog("ALL");
    ns.tail();
    ns.resizeTail(800, 600);
    
    dbg.clear();
    dbg.header("👻 PHANTOM NETWORK SCANNER v0.1.0");
    dbg.toastInfo("Network scan started...");
    
    // Start timer
    dbg.startTimer("scan");
    
    // Collect player stats
    const player = ns.getPlayer();
    const playerStats = {
        hacking: player.skills.hacking,
        money: ns.getServerMoneyAvailable("home"),
        hackingMult: player.mults.hacking || 1.0
    };
    
    dbg.normal(`${ICONS.GHOST} Player Stats:`);
    dbg.normal(`  Hacking Level: ${playerStats.hacking}`);
    dbg.money("  Money", playerStats.money);
    dbg.separator();
    
    // Scan network (BFS)
    dbg.normal(`${ICONS.SCAN} Scanning network...`);
    const servers = scanNetwork(ns);
    
    dbg.toastSuccess(`Found ${servers.length} servers`);
    dbg.normal(`${ICONS.NETWORK} Total servers discovered: ${servers.length}`);
    dbg.separator();
    
    // Analyze each server
    dbg.normal(`${ICONS.CHART} Analyzing servers...`);
    const analyzed = analyzeServers(ns, servers, playerStats);
    
    // Calculate network metrics
    const metrics = calculateNetworkMetrics(analyzed);
    
    // Display results
    displayNetworkSummary(dbg, metrics, playerStats);
    displayRootableServers(dbg, analyzed, playerStats);
    displayTargetRecommendations(dbg, analyzed, playerStats);
    displayTopServers(dbg, analyzed);
    
    // Export to JSON
    const exportData = {
        timestamp: new Date().toISOString(),
        player: playerStats,
        network: metrics,
        servers: analyzed
    };
    
    await exportToJSON(ns, exportData);
    
    // Finish
    const elapsed = dbg.endTimer("scan");
    dbg.separator();
    dbg.toastSuccess(`Scan complete in ${fmt.time(elapsed)}`);
    dbg.normal(`${ICONS.SUCCESS} JSON exported to /state/network.json`);
}

/**
 * Scan network using BFS
 * @param {NS} ns
 * @returns {Array<string>} List of all server hostnames
 */
function scanNetwork(ns) {
    const servers = ["home"];
    
    for (let i = 0; i < servers.length; i++) {
        const host = servers[i];
        const neighbors = ns.scan(host);
        
        for (const neighbor of neighbors) {
            if (!servers.includes(neighbor)) {
                servers.push(neighbor);
            }
        }
    }
    
    return servers;
}

/**
 * Analyze all servers and collect stats
 * @param {NS} ns
 * @param {Array<string>} servers
 * @param {object} playerStats
 * @returns {Array<object>}
 */
function analyzeServers(ns, servers, playerStats) {
    const analyzed = [];
    
    for (const hostname of servers) {
        const server = {
            hostname: hostname,
            hasRoot: ns.hasRootAccess(hostname),
            hackReq: ns.getServerRequiredHackingLevel(hostname),
            portsReq: ns.getServerNumPortsRequired(hostname),
            maxRAM: ns.getServerMaxRam(hostname),
            usedRAM: ns.getServerUsedRam(hostname),
            maxMoney: ns.getServerMaxMoney(hostname),
            currentMoney: ns.getServerMoneyAvailable(hostname),
            minSecurity: ns.getServerMinSecurityLevel(hostname),
            currentSecurity: ns.getServerSecurityLevel(hostname),
            serverGrowth: ns.getServerGrowth(hostname)
        };
        
        // Calculate derived metrics
        server.availableRAM = server.maxRAM - server.usedRAM;
        server.moneyPercent = server.maxMoney > 0 ? server.currentMoney / server.maxMoney : 0;
        server.securityDiff = server.currentSecurity - server.minSecurity;
        server.canHack = playerStats.hacking >= server.hackReq;
        server.hasValue = server.maxMoney > 0;
        
        // Calculate potential (money per RAM)
        server.potential = server.maxRAM > 0 && server.maxMoney > 0
            ? server.maxMoney / server.maxRAM
            : 0;
        
        // Tier classification
        if (server.hackReq <= 50) server.tier = "Easy";
        else if (server.hackReq <= 200) server.tier = "Medium";
        else if (server.hackReq <= 500) server.tier = "Hard";
        else if (server.hackReq <= 1000) server.tier = "Elite";
        else server.tier = "End-Game";
        
        analyzed.push(server);
    }
    
    return analyzed;
}

/**
 * Calculate network-wide metrics
 * @param {Array<object>} servers
 * @returns {object}
 */
function calculateNetworkMetrics(servers) {
    const metrics = {
        totalServers: servers.length,
        rooted: 0,
        totalRAM: 0,
        availableRAM: 0,
        totalMaxMoney: 0,
        totalCurrentMoney: 0,
        hackableServers: 0,
        serversWithValue: 0
    };
    
    for (const srv of servers) {
        if (srv.hasRoot) metrics.rooted++;
        if (srv.canHack) metrics.hackableServers++;
        if (srv.hasValue) metrics.serversWithValue++;
        
        metrics.totalRAM += srv.maxRAM;
        metrics.availableRAM += srv.availableRAM;
        metrics.totalMaxMoney += srv.maxMoney;
        metrics.totalCurrentMoney += srv.currentMoney;
    }
    
    return metrics;
}

/**
 * Display network summary
 * @param {Debug} dbg
 * @param {object} metrics
 * @param {object} playerStats
 */
function displayNetworkSummary(dbg, metrics, playerStats) {
    dbg.separator();
    dbg.normal(`${ICONS.NETWORK} NETWORK SUMMARY`);
    dbg.separator();
    
    dbg.normal(`  Total Servers: ${metrics.totalServers}`);
    dbg.normal(`  Rooted: ${metrics.rooted} (${fmt.percent(metrics.rooted / metrics.totalServers)})`);
    dbg.normal(`  Hackable: ${metrics.hackableServers} (lvl ${playerStats.hacking}+)`);
    dbg.normal(`  With Money: ${metrics.serversWithValue}`);
    
    dbg.separator();
    dbg.normal(`  Total RAM: ${fmt.ram(metrics.totalRAM)}`);
    dbg.normal(`  Available: ${fmt.ram(metrics.availableRAM)}`);
    
    dbg.separator();
    dbg.normal(`  Max Money (Network): ${fmt.money(metrics.totalMaxMoney)}`);
    dbg.normal(`  Current Money: ${fmt.money(metrics.totalCurrentMoney)}`);
}

/**
 * Display rootable servers
 * @param {Debug} dbg
 * @param {Array<object>} servers
 * @param {object} playerStats
 */
function displayRootableServers(dbg, servers, playerStats) {
    const rootable = servers.filter(s => 
        !s.hasRoot && 
        s.canHack && 
        s.portsReq === 0 && // Can root with no port openers
        s.hostname !== "home"
    );
    
    if (rootable.length === 0) {
        dbg.separator();
        dbg.normal(`${ICONS.LOCK} No servers rootable without port openers`);
        return;
    }
    
    dbg.separator();
    dbg.normal(`${ICONS.TARGET} ROOTABLE SERVERS (No ports required):`);
    dbg.separator();
    
    // Sort by max money descending
    rootable.sort((a, b) => b.maxMoney - a.maxMoney);
    
    for (const srv of rootable.slice(0, 10)) { // Top 10
        const moneyStr = srv.maxMoney > 0 ? fmt.money(srv.maxMoney) : "No $";
        const ramStr = srv.maxRAM > 0 ? fmt.ram(srv.maxRAM) : "No RAM";
        
        dbg.normal(`  ${ICONS.SERVER} ${srv.hostname.padEnd(20)} │ ${moneyStr.padEnd(12)} │ ${ramStr}`);
    }
    
    if (rootable.length > 10) {
        dbg.normal(`  ... and ${rootable.length - 10} more`);
    }
}

/**
 * Display target recommendations
 * @param {Debug} dbg
 * @param {Array<object>} servers
 * @param {object} playerStats
 */
function displayTargetRecommendations(dbg, servers, playerStats) {
    dbg.separator();
    dbg.normal(`${ICONS.TARGET} TARGET RECOMMENDATIONS`);
    dbg.separator();
    
    // Filter hackable servers with money
    const targets = servers.filter(s => 
        s.hasRoot && 
        s.hasValue && 
        s.canHack &&
        s.hostname !== "home"
    );
    
    if (targets.length === 0) {
        dbg.normal(`  ${ICONS.WARNING} No hackable targets found`);
        dbg.normal(`  Action: Root servers with 'run tools/autonuke.js'`);
        return;
    }
    
    // Sort by potential (money per RAM)
    targets.sort((a, b) => b.potential - a.potential);
    
    // Early game target (lowest hack req with money)
    const early = targets
        .filter(t => t.hackReq <= 100)
        .sort((a, b) => a.hackReq - b.hackReq)[0];
    
    if (early) {
        dbg.normal(`  ${ICONS.ROCKET} Early Game: ${early.hostname}`);
        dbg.normal(`    Hack Req: ${early.hackReq} │ Max $: ${fmt.money(early.maxMoney)}`);
    }
    
    // Mid game target (best potential in 100-500 range)
    const mid = targets
        .filter(t => t.hackReq > 100 && t.hackReq <= 500)
        .sort((a, b) => b.potential - a.potential)[0];
    
    if (mid) {
        dbg.separator();
        dbg.normal(`  ${ICONS.LIGHTNING} Mid Game: ${mid.hostname}`);
        dbg.normal(`    Hack Req: ${mid.hackReq} │ Max $: ${fmt.money(mid.maxMoney)}`);
    }
    
    // Late game target (best overall potential)
    const late = targets[0]; // Already sorted by potential
    
    if (late && late !== early && late !== mid) {
        dbg.separator();
        dbg.normal(`  ${ICONS.CHART} Late Game: ${late.hostname}`);
        dbg.normal(`    Hack Req: ${late.hackReq} │ Max $: ${fmt.money(late.maxMoney)}`);
    }
}

/**
 * Display top servers by various metrics
 * @param {Debug} dbg
 * @param {Array<object>} servers
 */
function displayTopServers(dbg, servers, count = 5) {
    dbg.separator();
    dbg.normal(`${ICONS.CHART} TOP SERVERS BY METRICS`);
    dbg.separator();
    
    // Top by max money
    const byMoney = [...servers]
        .filter(s => s.hasValue && s.hostname !== "home")
        .sort((a, b) => b.maxMoney - a.maxMoney)
        .slice(0, count);
    
    dbg.normal(`  💰 Richest Servers:`);
    for (const srv of byMoney) {
        const rootIcon = srv.hasRoot ? "🔓" : "🔒";
        dbg.normal(`    ${rootIcon} ${srv.hostname.padEnd(20)} ${fmt.money(srv.maxMoney)}`);
    }
    
    dbg.separator();
    
    // Top by RAM
    const byRAM = [...servers]
        .filter(s => s.maxRAM > 0 && s.hostname !== "home")
        .sort((a, b) => b.maxRAM - a.maxRAM)
        .slice(0, count);
    
    dbg.normal(`  🖥️  Biggest RAM:`);
    for (const srv of byRAM) {
        const rootIcon = srv.hasRoot ? "🔓" : "🔒";
        dbg.normal(`    ${rootIcon} ${srv.hostname.padEnd(20)} ${fmt.ram(srv.maxRAM)}`);
    }
    
    dbg.separator();
    
    // Top by potential (money/RAM ratio)
    const byPotential = [...servers]
        .filter(s => s.potential > 0 && s.hasRoot)
        .sort((a, b) => b.potential - a.potential)
        .slice(0, count);
    
    if (byPotential.length > 0) {
        dbg.normal(`  ⚡ Best Potential ($/RAM):`);
        for (const srv of byPotential) {
            const ratio = fmt.money(srv.potential);
            dbg.normal(`    ✅ ${srv.hostname.padEnd(20)} ${ratio}/GB`);
        }
    }
}

/**
 * Export data to JSON file
 * @param {NS} ns
 * @param {object} data
 */
async function exportToJSON(ns, data) {
    const json = JSON.stringify(data, null, 2);
    await ns.write("/state/network.json", json, "w");
}
