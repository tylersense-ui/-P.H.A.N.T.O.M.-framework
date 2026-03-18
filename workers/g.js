/*
╔══════════════════════════════════════════════════════════╗
║  👻 P.H.A.N.T.O.M. - GROW WORKER v0.4.0                 ║
╠══════════════════════════════════════════════════════════╣
║  Minimaliste grow worker                                 ║
║                                                          ║
║  Usage: Déployé automatiquement par batchers            ║
║    run workers/g.js <target>                             ║
║                                                          ║
║  Changelog:                                              ║
║    v0.4.0 - Initial worker                               ║
╚══════════════════════════════════════════════════════════╝

@author Claude (Godlike AI Operator)
@version 0.4.0
@ram ~1.7GB
*/

/**
 * Grow worker
 * @param {NS} ns - Netscript API
 */
export async function main(ns) {
  const target = ns.args[0];
  await ns.grow(target);
}
