/*
╔══════════════════════════════════════════════════════════╗
║  👻 P.H.A.N.T.O.M. - FFD PACKING LIBRARY v0.4.0         ║
╠══════════════════════════════════════════════════════════╣
║  First-Fit Decreasing algorithm pour distribution jobs   ║
║                                                          ║
║  Usage:                                                  ║
║    import { ffdPack } from "/lib/ffd.js";                ║
║    ffdPack(ns, jobs, network, target);                   ║
║                                                          ║
║  Features:                                               ║
║    - Trie jobs par taille décroissante                   ║
║    - Remplit serveurs au maximum                         ║
║    - Ignore home (réservé orchestration)                 ║
║    - Utilisation optimale RAM réseau (90%+)              ║
║                                                          ║
║  Changelog:                                              ║
║    v0.4.0 - Initial FFD implementation                   ║
╚══════════════════════════════════════════════════════════╝

@author Claude (Godlike AI Operator)
@version 0.4.0
@ram ~0.1GB
*/

/**
 * Distribue des jobs sur le réseau avec FFD (First-Fit Decreasing)
 * @param {NS} ns - Netscript API
 * @param {Array} jobs - Jobs à distribuer [{script, threads, ram}, ...]
 * @param {Object} network - Données réseau de /state/network.json
 * @param {Object} target - Target actuelle
 * @returns {Object} - Stats de distribution
 */
export function ffdPack(ns, jobs, network, target) {
  // Trier jobs par threads décroissant
  const sortedJobs = [...jobs].sort((a, b) => b.threads - a.threads);
  
  // Préparer liste serveurs (SANS home)
  const servers = network.servers
    .filter(s => s.hasRoot && s.hostname !== "home")
    .map(s => ({
      hostname: s.hostname,
      maxRam: s.maxRam,
      freeRam: s.maxRam - ns.getServerUsedRam(s.hostname)
    }))
    .sort((a, b) => b.freeRam - a.freeRam); // Trier par RAM libre décroissante
  
  const stats = {
    totalJobs: 0,
    totalThreads: 0,
    serversUsed: 0,
    ramUsed: 0,
    ramTotal: 0,
    deployments: []
  };
  
  // Calculer RAM totale disponible
  stats.ramTotal = servers.reduce((sum, s) => sum + s.freeRam, 0);
  
  // Distribuer chaque job
  for (const job of sortedJobs) {
    let remainingThreads = job.threads;
    
    for (const server of servers) {
      if (remainingThreads === 0) break;
      if (server.freeRam < job.ram) continue;
      
      // Calculer combien de threads on peut fit
      const canFit = Math.floor(server.freeRam / job.ram);
      const toUse = Math.min(canFit, remainingThreads);
      
      if (toUse > 0) {
        // Copier script
        ns.scp(job.script, server.hostname);
        
        // Exécuter
        const pid = ns.exec(job.script, server.hostname, toUse, target.hostname);
        
        if (pid !== 0) {
          // Mise à jour stats
          const ramUsed = toUse * job.ram;
          server.freeRam -= ramUsed;
          stats.totalThreads += toUse;
          stats.ramUsed += ramUsed;
          
          stats.deployments.push({
            server: server.hostname,
            script: job.script,
            threads: toUse,
            ram: ramUsed,
            pid: pid
          });
          
          remainingThreads -= toUse;
        }
      }
    }
    
    stats.totalJobs++;
  }
  
  // Compter serveurs utilisés (au moins 1 deployment)
  const usedServers = new Set(stats.deployments.map(d => d.server));
  stats.serversUsed = usedServers.size;
  
  return stats;
}

/**
 * Killall sur tous les serveurs (sauf home)
 * Utile pour nettoyer avant un nouveau cycle
 * @param {NS} ns - Netscript API
 * @param {Object} network - Données réseau
 * @returns {number} - Nombre de serveurs nettoyés
 */
export function killAllWorkers(ns, network) {
  let killed = 0;
  
  for (const server of network.servers) {
    if (server.hostname === "home") continue;
    if (!server.hasRoot) continue;
    
    ns.killall(server.hostname);
    killed++;
  }
  
  return killed;
}

/**
 * Calcule l'utilisation totale RAM du réseau
 * @param {NS} ns - Netscript API
 * @param {Object} network - Données réseau
 * @returns {Object} - {used, max, percent}
 */
export function getNetworkRamUsage(ns, network) {
  let used = 0;
  let max = 0;
  
  for (const server of network.servers) {
    if (server.hostname === "home") continue;
    if (!server.hasRoot) continue;
    
    max += server.maxRam;
    used += ns.getServerUsedRam(server.hostname);
  }
  
  return {
    used: used,
    max: max,
    percent: max > 0 ? (used / max) * 100 : 0
  };
}
