/*
╔══════════════════════════════════════════════════════════╗
║  👻 P.H.A.N.T.O.M. - HACK WORKER v0.4.0                 ║
╠══════════════════════════════════════════════════════════╣
║  Minimaliste hack worker                                 ║
║                                                          ║
║  Usage: Déployé automatiquement par batchers            ║
║    run workers/h.js <target>                             ║
║                                                          ║
║  Changelog:                                              ║
║    v0.4.0 - Initial worker                               ║
╚══════════════════════════════════════════════════════════╝

@author Claude (Godlike AI Operator)
@version 0.4.0
@ram ~1.7GB
*/

/**
 * Hack worker
 * @param {NS} ns - Netscript API
 */
export async function main(ns) {
  const target = ns.args[0];
  await ns.hack(target);
}
