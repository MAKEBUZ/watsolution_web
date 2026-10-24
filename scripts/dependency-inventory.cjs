/* Package-level CycloneDX inventory from the exact lock, including reviewed overrides.
 * npm sbom currently rejects valid overridden exact transitive requirements.
 * No dependency graph or license completeness is claimed by this inventory. */
const fs = require('node:fs');
const crypto = require('node:crypto');
const lock = JSON.parse(fs.readFileSync(process.argv[2] || 'package-lock.json', 'utf8'));
if (lock.lockfileVersion !== 3 || !lock.packages) throw new Error('An npm v3 lock is required');
const components = Object.entries(lock.packages).filter(([path, value]) => path && !value.link && value.version).map(([path, value]) => {
  const fullName = value.name || path.split('node_modules/').pop();
  const scoped = fullName.startsWith('@');
  const group = scoped ? fullName.split('/')[0] : undefined;
  const name = scoped ? fullName.split('/').slice(1).join('/') : fullName;
  return { type: 'library', 'bom-ref': path, ...(group ? { group } : {}), name, version: value.version,
    purl: `pkg:npm/${group ? encodeURIComponent(group) + '/' : ''}${encodeURIComponent(name)}@${encodeURIComponent(value.version)}`,
    properties: [{ name: 'watsolution:lock-path', value: path }, { name: 'watsolution:development-only', value: String(!!value.dev) }],
  };
});
process.stdout.write(JSON.stringify({ bomFormat: 'CycloneDX', specVersion: '1.6', serialNumber: `urn:uuid:${crypto.randomUUID()}`, version: 1,
  metadata: { timestamp: new Date().toISOString(), component: { type: 'application', name: lock.name || 'WatSolution', version: lock.version || '0.0.0' } }, components,
}, null, 2) + '\n');
