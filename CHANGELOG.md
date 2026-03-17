# Changelog

All notable changes to the PHANTOM Framework will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-03-17

### Added
- **Initial framework release (ÉTAPE 2: Environment Discovery)**
- Core library system:
  - `lib/debug.js` - Multi-level debug system (levels 0-3)
  - `lib/format.js` - Formatting utilities (0GB RAM)
- Network scanner tool:
  - `tools/scanner.js` - Complete network cartography
  - BFS network scanning
  - Server statistics collection
  - Target recommendations (early/mid/late game)
  - JSON export to `/state/network.json`
  - Beautiful tail UI with metrics
- Deployment system:
  - `deploy-phantom-v0.1.0.js` - Auto-deployment from GitHub
  - `manifest.json` - Version and file tracking
- Documentation:
  - `README.md` - Complete framework documentation
  - `CHANGELOG.md` - Version history tracking

### Technical Details
- Bitburner version: v2.8.1
- Starting point: BN1.1, no Source-Files, 8GB home RAM
- Architecture: Pulse-based distributed system (Nano-Batcher blueprint)
- Debug levels: 0 (Silent), 1 (Normal), 2 (Verbose), 3 (Ultra)

### File Structure Created
```
/lib/       - 0GB RAM libraries
/core/      - Future: analyzer + monitor
/workers/   - Future: h.js, g.js, w.js
/managers/  - Future: resource managers
/tools/     - Utility scripts
/state/     - Runtime JSON data
```

### Known Limitations
- No batching system yet (ÉTAPE 3)
- No auto-nuke (ÉTAPE 3)
- No server management (ÉTAPE 3+)
- Scanner only (diagnostic tool)

### Next Release (0.2.0)
- ÉTAPE 3: Early-game proto-batcher
- Auto-nuke script
- Target selector
- Basic HWGW loop

---

## [Unreleased]

### Planned Features (ÉTAPE 3-6)
- Proto-batcher (early-game HWGW)
- Full HWGW batch system with timing
- Dynamic EV/s optimization
- FFD packing algorithm
- Server manager (purchased servers)
- Hacknet manager
- Stock market automation (if TIX unlocked)
- Faction automation (if Singularity unlocked)
- Dashboard UI
- Telemetry system

---

## Version History

- **0.1.0** (2026-03-17) - ÉTAPE 2: Scanner + Core libraries
- **0.2.0** (TBD) - ÉTAPE 3: Early batcher
- **0.3.0** (TBD) - ÉTAPE 4: Proto-batcher
- **0.4.0** (TBD) - ÉTAPE 5: Full HWGW
- **1.0.0** (TBD) - ÉTAPE 6: Ultimate optimization

---

**Maintained by:** Claude (Godlike AI Operator)  
**Operated by:** [Human Operator Name]  
**Repository:** https://github.com/[USER]/phantom-bitburner
