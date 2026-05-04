const fs = require('fs');
const path = require('path');

// Read both flow files
const oldPath = 'mes_70_precision_flows_FIXED_PROD.json';
const newPath = 'NODERED_FLOWS_MES_API_FIXED.json';

console.log('Reading flows files...');
const oldFlows = JSON.parse(fs.readFileSync(oldPath, 'utf8'));
const newFlows = JSON.parse(fs.readFileSync(newPath, 'utf8'));

console.log(`  Old flows: ${oldFlows.length} nodes`);
console.log(`  New flows: ${newFlows.length} nodes`);

// Merge: all old flows + new flows (excluding tab duplicates)
let merged = [...oldFlows];

// Add new tab if needed
const hasNewTab = merged.some(n => n.id === 'tab_main_api');
if (!hasNewTab) {
  console.log('  Adding Summary Endpoints tab...');
  for (const node of newFlows) {
    if (node.type === 'tab') {
      merged.push(node);
      break;
    }
  }
}

// Add all new nodes except tabs
let addedCount = 0;
for (const node of newFlows) {
  if (node.type !== 'tab') {
    merged.push(node);
    addedCount++;
  }
}

console.log(`  Added: ${addedCount} new nodes`);
console.log(`  Total: ${merged.length} nodes in merged file`);

// Write merged file
console.log('Saving merged flows...');
fs.writeFileSync(oldPath, JSON.stringify(merged, null, 2));

console.log('✓ Successfully merged!');
console.log('\nNext steps:');
console.log('  1. Import mes_70_precision_flows_FIXED_PROD.json into Node-RED');
console.log('  2. Click Deploy');
console.log('  3. Test: curl http://localhost:1880/api/overview');
