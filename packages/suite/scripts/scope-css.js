import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cssPath = path.join(__dirname, '../dist/styles.css');

console.log('🔍 Scoping Tailwind variables...');

let css = fs.readFileSync(cssPath, 'utf8');

// Use regex to handle any whitespace variations
const universalSelector = /\*\s*,\s*:after\s*,\s*:before\s*\{/g;
const backdropSelector = /::backdrop\s*\{/g;

let count = 0;

if (universalSelector.test(css)) {
  css = css.replace(
    universalSelector,
    ':where(.gas-style-container, .gas-style-container *), :where(.gas-style-container, .gas-style-container *):after, :where(.gas-style-container, .gas-style-container *):before {'
  );
  count++;
  console.log('✅ Scoped universal selector');
}

if (backdropSelector.test(css)) {
  css = css.replace(backdropSelector, '.gas-style-container::backdrop {');
  count++;
  console.log('✅ Scoped ::backdrop');
}

if (count > 0) {
  fs.writeFileSync(cssPath, css);
  console.log(`✨ Scoped ${count} selectors successfully!`);
} else {
  console.log('⚠️  No selectors found to scope');
}
