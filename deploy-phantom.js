/*
╔══════════════════════════════════════════════════════════╗
║  👻 P.H.A.N.T.O.M. - GITHUB DEPLOYER v0.4.0             ║
╠══════════════════════════════════════════════════════════╣
║  Déploie le framework depuis GitHub                      ║
║                                                          ║
║  Usage: run deploy-phantom.js                            ║
║                                                          ║
║  Configuration:                                          ║
║    - Modifier GITHUB_USER et GITHUB_REPO ci-dessous      ║
║                                                          ║
║  Features:                                               ║
║    - Wget direct (pas de fichiers temporaires)           ║
║    - Directories auto-créées par wget                    ║
║    - Validation après téléchargement                     ║
║    - Rapport complet                                     ║
║                                                          ║
║  Changelog:                                              ║
║    v0.4.0 - Fix mv error, remove mkdir, direct wget     ║
║    v0.3.0 - Initial deployer                             ║
╚══════════════════════════════════════════════════════════╝

@author Claude (Godlike AI Operator)
@version 0.4.0
@ram ~2.5GB
*/

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.tail();
  
  // ═══════════════════════════════════════════════
  // CONFIGURATION (À MODIFIER)
  // ═══════════════════════════════════════════════
  const GITHUB_USER = "VOTRE_USERNAME";  // ← CHANGER ICI
  const GITHUB_REPO = "VOTRE_REPO";      // ← CHANGER ICI
  const BRANCH = "main";
  
  const BASE_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${BRANCH}`;
  
  ns.print("╔═══════════════════════════════════╗");
  ns.print("║  👻 PHANTOM DEPLOYER v0.4.0      ║");
  ns.print("╚═══════════════════════════════════╝");
  ns.print("");
  ns.print(`GitHub: ${GITHUB_USER}/${GITHUB_REPO}`);
  ns.print(`Branch: ${BRANCH}`);
  ns.print("");
  
  // ═══════════════════════════════════════════════
  // LISTE DES FICHIERS v0.4.0
  // ═══════════════════════════════════════════════
  const files = [
    // Core system
    "/boot.js",
    "/core/autonuke.js",
    "/core/monitor.js",
    
    // Batchers
    "/batchers/micro.js",
    
    // Libraries
    "/lib/debug.js",
    "/lib/format.js",
    "/lib/math-shared.js",
    "/lib/math-pure.js",
    "/lib/math-ns.js",
    "/lib/ffd.js",
    
    // Workers
    "/workers/h.js",
    "/workers/g.js",
    "/workers/w.js",
    
    // Tools
    "/tools/scanner.js",
    "/tools/test-formulas.js",
    "/tools/benchmark-math.js"
  ];
  
  // ═══════════════════════════════════════════════
  // TÉLÉCHARGEMENT
  // ═══════════════════════════════════════════════
  ns.print("📥 Downloading files from GitHub...");
  ns.print("");
  
  let success = 0;
  let failed = 0;
  const failedFiles = [];
  
  for (const file of files) {
    const url = BASE_URL + file;
    const localPath = file;
    
    ns.print(`  Downloading ${file}...`);
    
    try {
      const result = await ns.wget(url, localPath);
      
      if (result) {
        success++;
        ns.print(`    ✅ OK`);
      } else {
        failed++;
        failedFiles.push(file);
        ns.print(`    ❌ FAILED`);
      }
    } catch (e) {
      failed++;
      failedFiles.push(file);
      ns.print(`    ❌ ERROR: ${e}`);
    }
    
    await ns.sleep(100); // Petit délai entre downloads
  }
  
  ns.print("");
  
  // ═══════════════════════════════════════════════
  // CRÉATION STATE DIRECTORY
  // ═══════════════════════════════════════════════
  ns.print("📁 Creating state directory...");
  
  try {
    // Créer un fichier vide dans /state/ pour forcer la création du répertoire
    await ns.write("/state/.gitkeep", "", "w");
    ns.print("  ✅ /state/ directory ready");
  } catch (e) {
    ns.print(`  ⚠️  Warning: ${e}`);
  }
  
  ns.print("");
  
  // ═══════════════════════════════════════════════
  // VALIDATION
  // ═══════════════════════════════════════════════
  ns.print("🔍 Validating deployment...");
  
  const critical = [
    "/boot.js",
    "/core/autonuke.js",
    "/core/monitor.js",
    "/batchers/micro.js",
    "/lib/ffd.js",
    "/workers/h.js",
    "/workers/g.js",
    "/workers/w.js",
    "/tools/scanner.js"
  ];
  
  let missingCritical = 0;
  for (const file of critical) {
    if (!ns.fileExists(file)) {
      ns.print(`  ❌ CRITICAL MISSING: ${file}`);
      missingCritical++;
    }
  }
  
  if (missingCritical === 0) {
    ns.print("  ✅ All critical files present");
  }
  
  ns.print("");
  
  // ═══════════════════════════════════════════════
  // RAPPORT FINAL
  // ═══════════════════════════════════════════════
  ns.print("╔═══════════════════════════════════╗");
  ns.print("║  📊 DEPLOYMENT REPORT            ║");
  ns.print("╚═══════════════════════════════════╝");
  ns.print("");
  ns.print(`Total files: ${files.length}`);
  ns.print(`✅ Success: ${success}`);
  ns.print(`❌ Failed: ${failed}`);
  ns.print("");
  
  if (failed > 0) {
    ns.print("Failed files:");
    for (const file of failedFiles) {
      ns.print(`  - ${file}`);
    }
    ns.print("");
  }
  
  if (missingCritical > 0) {
    ns.print("╔═══════════════════════════════════╗");
    ns.print("║  ❌ DEPLOYMENT INCOMPLETE        ║");
    ns.print("╚═══════════════════════════════════╝");
    ns.print("");
    ns.print("Missing critical files! Cannot start.");
    ns.print("Check GitHub repo and retry.");
    ns.toast("❌ Deployment incomplete!", "error", 5000);
    return;
  }
  
  ns.print("╔═══════════════════════════════════╗");
  ns.print("║  ✅ DEPLOYMENT COMPLETE!         ║");
  ns.print("╚═══════════════════════════════════╝");
  ns.print("");
  ns.print("Next steps:");
  ns.print("  1. Run: run boot.js");
  ns.print("  2. Tail logs: tail monitor.js");
  ns.print("");
  
  ns.toast("✅ PHANTOM deployed successfully!", "success", 5000);
}
