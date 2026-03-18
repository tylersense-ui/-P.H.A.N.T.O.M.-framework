/*
╔══════════════════════════════════════════════════════════╗
║  👻 P.H.A.N.T.O.M. - WEAKEN WORKER v0.4.0               ║
╠══════════════════════════════════════════════════════════╣
║  Minimaliste weaken worker                               ║
║                                                          ║
║  Usage: Déployé automatiquement par batchers            ║
║    run workers/w.js <target>                             ║
║                                                          ║
║  Changelog:                                              ║
║    v0.4.0 - Initial worker                               ║
╚══════════════════════════════════════════════════════════╝

@author Claude (Godlike AI Operator)
@version 0.4.0
@ram ~1.7GB
*/

/**
 * Weaken worker
 * @param {NS} ns - Netscript API
 */
export async function main(ns) {
  const target = ns.args[0];
  await ns.weaken(target);
}
