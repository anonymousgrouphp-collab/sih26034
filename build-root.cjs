const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('[NyayaDrishti Root Build] Initiating build for canonical frontend in ui-combined...');
const uiCombinedDir = path.join(__dirname, 'ui-combined');
const distSource = path.join(uiCombinedDir, 'dist');
const distRoot = path.join(__dirname, 'dist');

try {
  if (!fs.existsSync(path.join(uiCombinedDir, 'node_modules'))) {
    console.log('[NyayaDrishti Root Build] Installing dependencies in ui-combined...');
    execSync('npm install', { cwd: uiCombinedDir, stdio: 'inherit' });
  }
  
  execSync('npm run build', { cwd: uiCombinedDir, stdio: 'inherit' });
  
  if (fs.existsSync(distRoot)) {
    fs.rmSync(distRoot, { recursive: true, force: true });
  }
  fs.cpSync(distSource, distRoot, { recursive: true });
  console.log('[NyayaDrishti Root Build] Successfully built and populated dist/.');
} catch (error) {
  console.error('[NyayaDrishti Root Build] Error during build:', error);
  process.exit(1);
}
