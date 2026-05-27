const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  // Use TSC from node_modules to check the syntax
  console.log('Running tsc...');
  execSync('./node_modules/.bin/tsc --noEmit', { stdio: 'pipe' });
  console.log('TSC passed!');
} catch (e) {
  console.log('TSC Error:');
  console.log(e.stdout ? e.stdout.toString() : e.message);
}
