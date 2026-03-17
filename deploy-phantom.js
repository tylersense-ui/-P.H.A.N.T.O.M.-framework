/**
 * ╔════════════════════════════════════════════════════════════════════╗
 * ║           👻 PHANTOM FRAMEWORK - AUTO DEPLOYER v0.1.0             ║
 * ║              "Download the ghost from the cloud"                  ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ Author: Claude (Godlike AI Operator)                              ║
 * ║ Repo: https://github.com/[USER]/phantom-bitburner                 ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ USAGE:                                                             ║
 * ║   1. Edit GITHUB_USER variable below                              ║
 * ║   2. run deploy-phantom-v0.1.0.js                                 ║
 * ║   3. Wait for download completion                                 ║
 * ║   4. Run scanner: run tools/scanner.js                            ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ WHAT IT DOES:                                                      ║
 * ║   • Creates directory structure                                   ║
 * ║   • Downloads all files from GitHub                               ║
 * ║   • Verifies manifest                                             ║
 * ║   • Creates /state/ directory for data                            ║
 * ║   • Reports success/errors                                        ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║ CHANGELOG:                                                         ║
 * ║   v0.1.0 (2026-03-17) - Initial release                           ║
 * ╚════════════════════════════════════════════════════════════════════╝
 */

/** @param {NS} ns */
export async function main(ns) {
    // ==========================================
    // 🔧 CONFIGURATION - EDIT THIS!
    // ==========================================
    const GITHUB_USER = "tylersense-ui"; 
    const REPO_NAME = "-P.H.A.N.T.O.M.-framework";
    const BRANCH = "main";
    
    // ==========================================
    // Do not edit below this line
    // ==========================================
    
    const BASE_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${REPO_NAME}/${BRANCH}`;
    
    ns.disableLog("ALL");
    ns.tail();
    
    ns.print("╔════════════════════════════════════════════════════════════════╗");
    ns.print("║         👻 PHANTOM FRAMEWORK DEPLOYMENT v0.1.0                ║");
    ns.print("╚════════════════════════════════════════════════════════════════╝");
    ns.print("");
    
    // Validate GitHub user
    if (GITHUB_USER === "YOUR_USERNAME_HERE") {
        ns.print("❌ ERROR: You must edit GITHUB_USER in this script!");
        ns.print("   Open deploy-phantom-v0.1.0.js and change line 30");
        ns.tprint("❌ DEPLOYMENT FAILED: GitHub username not configured");
        return;
    }
    
    ns.print(`📡 Deploying from: ${GITHUB_USER}/${REPO_NAME}`);
    ns.print("");
    
    // Step 1: Download manifest
    ns.print("⏳ Step 1/4: Downloading manifest...");
    const manifestURL = `${BASE_URL}/manifest.json`;
    const manifestSuccess = await ns.wget(manifestURL, "manifest.json");
    
    if (!manifestSuccess) {
        ns.print("❌ Failed to download manifest.json");
        ns.print(`   URL: ${manifestURL}`);
        ns.print("   Check GitHub username and repo name!");
        ns.tprint("❌ DEPLOYMENT FAILED");
        return;
    }
    
    ns.print("✅ Manifest downloaded");
    
    // Parse manifest
    const manifestContent = ns.read("manifest.json");
    const manifest = JSON.parse(manifestContent);
    
    ns.print(`   Version: ${manifest.version}`);
    ns.print(`   Files to download: ${manifest.files.length}`);
    ns.print("");
    
    // Step 2: Create directories
    ns.print("⏳ Step 2/4: Creating directories...");
    // Note: Bitburner auto-creates dirs when writing files
    // We just log the structure
    for (const dir of manifest.directories) {
        ns.print(`   📁 ${dir}`);
    }
    ns.print("");
    
    // Step 3: Download files
    ns.print("⏳ Step 3/4: Downloading files...");
    let downloaded = 0;
    let failed = 0;
    
    for (const file of manifest.files) {
        const url = `${BASE_URL}${file.path}`;
        const success = await ns.wget(url, file.path);
        
        if (success) {
            ns.print(`   ✅ ${file.path}`);
            downloaded++;
        } else {
            ns.print(`   ❌ ${file.path} - FAILED`);
            failed++;
        }
        
        await ns.sleep(100); // Small delay to avoid rate limiting
    }
    
    ns.print("");
    ns.print(`   Downloaded: ${downloaded}/${manifest.files.length}`);
    
    if (failed > 0) {
        ns.print(`   ⚠️  Failed: ${failed} files`);
    }
    
    ns.print("");
    
    // Step 4: Create state directory marker
    ns.print("⏳ Step 4/4: Initializing state directory...");
    await ns.write("/state/.gitkeep", "", "w");
    ns.print("   ✅ /state/ directory ready");
    ns.print("");
    
    // Final report
    ns.print("╔════════════════════════════════════════════════════════════════╗");
    if (failed === 0) {
        ns.print("║              ✅ DEPLOYMENT SUCCESSFUL                         ║");
        ns.print("╚════════════════════════════════════════════════════════════════╝");
        ns.print("");
        ns.print("🚀 Next steps:");
        ns.print("   1. run tools/scanner.js --debug 1");
        ns.print("   2. Review /state/network.json");
        ns.print("   3. Report scan results to Claude");
        ns.print("");
        ns.tprint("✅ PHANTOM Framework deployed successfully!");
        ns.toast("✅ PHANTOM deployed!", "success", 5000);
    } else {
        ns.print("║              ⚠️  DEPLOYMENT INCOMPLETE                        ║");
        ns.print("╚════════════════════════════════════════════════════════════════╝");
        ns.print("");
        ns.print(`   ${failed} files failed to download`);
        ns.print("   Check GitHub repository and try again");
        ns.tprint("⚠️  PHANTOM deployment incomplete");
    }
}
