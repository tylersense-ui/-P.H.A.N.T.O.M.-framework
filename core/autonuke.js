/*
╔══════════════════════════════════════════════════════════╗
║  👻 P.H.A.N.T.O.M. - AUTO-NUKE DAEMON v0.4.0            ║
╠══════════════════════════════════════════════════════════╣
║  Scanne et rooter automatiquement tout le réseau         ║
║                                                          ║
║  Usage: run core/autonuke.js                             ║
║                                                          ║
║  Features:                                               ║
║    - BFS network scan (toutes les 60s)                   ║
║    - Tente tous les port openers disponibles             ║
║    - Nuke automatique quand assez de ports               ║
║    - Toast sur chaque nouveau root                       ║
║                                                          ║
║  Changelog:                                              ║
║    v0.4.0 - Architecture évolutive + toasts              ║
║    v0.3.0 - Initial auto-nuke daemon                     ║
╚══════════════════════════════════════════════════════════╝

@author Claude (Godlike AI Operator)
@version 0.4.0
@ram ~2.5GB
*/

/**
 * Auto-nuke daemon
 * Scanne le réseau et rooter tout ce qui est accessible
 * @param {NS} ns - Netscript API
 */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.tail();
  
  // Port openers disponibles
  const portOpeners = [
    { name: "BruteSSH.exe", func: ns.brutessh },
    { name: "FTPCrack.exe", func: ns.ftpcrack },
    { name: "relaySMTP.exe", func: ns.relaysmtp },
    { name: "HTTPWorm.exe", func: ns.httpworm },
    { name: "SQLInject.exe", func: ns.sqlinject }
  ];
  
  let cycleCount = 0;
  let totalRooted = 0;
  
  while (true) {
    cycleCount++;
    ns.clearLog();
    
    ns.print("╔═══════════════════════════════════╗");
    ns.print("║  🔓 AUTO-NUKE DAEMON v0.4.0      ║");
    ns.print("╚═══════════════════════════════════╝");
    ns.print("");
    ns.print(`Cycle #${cycleCount} - ${new Date().toLocaleTimeString()}`);
    ns.print("");
    
    // BFS scan du réseau
    const servers = ["home"];
    for (let i = 0; i < servers.length; i++) {
      const host = servers[i];
      ns.scan(host).forEach(s => {
        if (!servers.includes(s)) servers.push(s);
      });
    }
    
    ns.print(`🌐 Network: ${servers.length} servers discovered`);
    
    // Compter les port openers disponibles
    let availableOpeners = 0;
    for (const opener of portOpeners) {
      if (ns.fileExists(opener.name, "home")) {
        availableOpeners++;
      }
    }
    ns.print(`🔧 Port openers: ${availableOpeners}/5 available`);
    ns.print("");
    
    // Tenter de rooter chaque serveur
    let rootedThisCycle = 0;
    let alreadyRooted = 0;
    let cannotRoot = 0;
    
    for (const server of servers) {
      if (server === "home") continue;
      
      // Déjà rooté ?
      if (ns.hasRootAccess(server)) {
        alreadyRooted++;
        continue;
      }
      
      // Tenter d'ouvrir les ports
      let portsOpened = 0;
      for (const opener of portOpeners) {
        if (ns.fileExists(opener.name, "home")) {
          try {
            opener.func(server);
            portsOpened++;
          } catch (e) {
            // Port déjà ouvert ou erreur
          }
        }
      }
      
      // Vérifier si on peut nuke
      const portsRequired = ns.getServerNumPortsRequired(server);
      if (portsOpened >= portsRequired) {
        try {
          ns.nuke(server);
          rootedThisCycle++;
          totalRooted++;
          
          const hackReq = ns.getServerRequiredHackingLevel(server);
          const maxMoney = ns.getServerMaxMoney(server);
          
          ns.print(`✅ ROOTED: ${server}`);
          ns.print(`   ├─ Hack req: ${hackReq}`);
          ns.print(`   └─ Max $: ${ns.formatNumber(maxMoney)}`);
          
          ns.toast(`🔓 Rooted: ${server} (${ns.formatNumber(maxMoney)})`, "success", 3000);
        } catch (e) {
          cannotRoot++;
        }
      } else {
        cannotRoot++;
      }
    }
    
    ns.print("");
    ns.print("📊 Status:");
    ns.print(`  ├─ Rooted this cycle: ${rootedThisCycle}`);
    ns.print(`  ├─ Already rooted: ${alreadyRooted}`);
    ns.print(`  ├─ Cannot root yet: ${cannotRoot}`);
    ns.print(`  └─ Total rooted: ${totalRooted}`);
    
    // Attendre 60s avant le prochain scan
    await ns.sleep(60000);
  }
}
