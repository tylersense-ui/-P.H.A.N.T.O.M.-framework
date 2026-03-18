/*
╔══════════════════════════════════════════════════════════╗
║  👻 P.H.A.N.T.O.M. FRAMEWORK - BOOT SEQUENCE v0.4.0    ║
╠══════════════════════════════════════════════════════════╣
║  Démarre tous les daemons du framework                   ║
║                                                          ║
║  Usage: run boot.js                                      ║
║                                                          ║
║  Phases:                                                 ║
║    0. Killall global (cleanup complet)                   ║
║    1. Scanner réseau initial                             ║
║    2. Auto-nuke daemon                                   ║
║    3. Monitor orchestrator                               ║
║                                                          ║
║  Changelog:                                              ║
║    v0.4.0 - Killall global + architecture évolutive      ║
║    v0.3.0 - Initial boot sequence                        ║
╚══════════════════════════════════════════════════════════╝

@author Claude (Godlike AI Operator)
@version 0.4.0
*/

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.tail();
  
  ns.print("╔═══════════════════════════════════╗");
  ns.print("║  👻 P.H.A.N.T.O.M. BOOT v0.4.0   ║");
  ns.print("╚═══════════════════════════════════╝");
  ns.print("");
  
  // ═══════════════════════════════════════════════
  // PHASE 0 : NETTOYAGE GLOBAL (KILLALL)
  // ═══════════════════════════════════════════════
  ns.print("🧹 PHASE 0: Global cleanup...");
  
  // Killall sur home
  ns.print("  ├─ Killing all scripts on home...");
  ns.killall("home");
  await ns.sleep(500);
  
  // Killall sur tout le réseau
  ns.print("  ├─ Scanning network for cleanup...");
  const servers = ["home"];
  for (let i = 0; i < servers.length; i++) {
    const host = servers[i];
    ns.scan(host).forEach(s => {
      if (!servers.includes(s)) servers.push(s);
    });
  }
  
  let cleaned = 0;
  for (const server of servers) {
    if (server === "home") continue; // Déjà fait
    if (ns.hasRootAccess(server)) {
      ns.killall(server);
      cleaned++;
    }
  }
  
  ns.print(`  └─ ✅ Cleaned ${cleaned} servers`);
  ns.toast(`🧹 Cleaned ${cleaned} servers`, "info", 2000);
  ns.print("");
  await ns.sleep(1000);
  
  // ═══════════════════════════════════════════════
  // PHASE 1 : SCAN RÉSEAU INITIAL
  // ═══════════════════════════════════════════════
  ns.print("🌐 PHASE 1: Initial network scan...");
  const scanPid = ns.exec("/tools/scanner.js", "home", 1);
  
  if (scanPid === 0) {
    ns.toast("❌ Failed to start scanner.js", "error");
    ns.print("  └─ ❌ Scanner failed to start!");
    ns.print("     Check if /tools/scanner.js exists");
    return;
  }
  
  ns.print("  └─ ✅ Scanner started (PID: " + scanPid + ")");
  await ns.sleep(3000); // Attendre que le scan se termine
  ns.print("");
  
  // ═══════════════════════════════════════════════
  // PHASE 2 : AUTO-NUKE DAEMON
  // ═══════════════════════════════════════════════
  ns.print("🔓 PHASE 2: Starting auto-nuke daemon...");
  const nukePid = ns.exec("/core/autonuke.js", "home", 1);
  
  if (nukePid === 0) {
    ns.toast("❌ Failed to start autonuke.js", "error");
    ns.print("  └─ ❌ Auto-nuke failed to start!");
    ns.print("     Check if /core/autonuke.js exists");
    return;
  }
  
  ns.print("  └─ ✅ Auto-nuke daemon online (PID: " + nukePid + ")");
  ns.toast("🔓 Auto-nuke daemon online", "success", 3000);
  await ns.sleep(1000);
  ns.print("");
  
  // ═══════════════════════════════════════════════
  // PHASE 3 : MONITOR (Orchestrateur)
  // ═══════════════════════════════════════════════
  ns.print("👻 PHASE 3: Starting monitor (orchestrator)...");
  const monitorPid = ns.exec("/core/monitor.js", "home", 1);
  
  if (monitorPid === 0) {
    ns.toast("❌ Failed to start monitor.js", "error");
    ns.print("  └─ ❌ Monitor failed to start!");
    ns.print("     Check if /core/monitor.js exists");
    return;
  }
  
  ns.print("  └─ ✅ Monitor online (PID: " + monitorPid + ")");
  ns.toast("👻 Monitor orchestrator online", "success", 3000);
  ns.print("");
  
  // ═══════════════════════════════════════════════
  // BOOT SEQUENCE COMPLETE
  // ═══════════════════════════════════════════════
  ns.print("╔═══════════════════════════════════╗");
  ns.print("║  ✅ PHANTOM FRAMEWORK ONLINE!     ║");
  ns.print("╚═══════════════════════════════════╝");
  ns.print("");
  ns.print("📊 Active daemons:");
  ns.print("  ├─ autonuke.js  (PID: " + nukePid + ")");
  ns.print("  └─ monitor.js   (PID: " + monitorPid + ")");
  ns.print("");
  ns.print("💡 Check monitor.js tail for batcher status");
  ns.print("💡 Use 'tail monitor.js' to follow orchestrator");
  
  ns.toast("✅ PHANTOM Framework online!", "success", 5000);
}
