import { DEFAULT_ASSET_MANIFEST } from '../src/engine/loader/manifest';

console.info('📦 Generating Everbloom asset manifest & computing tier byte budgets...');

const bootBytes = Object.values(DEFAULT_ASSET_MANIFEST.assets)
  .filter((a) => a.tier === 'boot')
  .reduce((sum, a) => sum + a.bytes, 0);

console.info(`  • Boot Tier total: ${bootBytes} bytes (Budget: 380,000 bytes)`);

if (bootBytes > 380000) {
  console.error(`❌ Boot tier asset budget exceeded!`);
  process.exit(1);
} else {
  console.info('✅ Asset manifest within byte budgets!');
  process.exit(0);
}
