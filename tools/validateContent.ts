import { validateAllContent } from '../src/content/validate';

console.info('🔍 Validating Everbloom content schemas & referential integrity...');

const report = validateAllContent();

if (report.success) {
  console.info('✅ Content validation passed with zero errors!');
  process.exit(0);
} else {
  console.error('❌ Content validation failed:');
  report.errors.forEach((err) => console.error(`  - ${err}`));
  process.exit(1);
}
