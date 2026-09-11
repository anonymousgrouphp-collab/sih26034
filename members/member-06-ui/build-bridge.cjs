const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('[NyayaDrishti Vercel Bridge] Building canonical frontend in ui-combined...');
const repoRoot = path.resolve(__dirname, '../..');
const uiCombinedDir = path.join(repoRoot, 'ui-combined');
const distSource = path.join(uiCombinedDir, 'dist');
const distTarget = path.join(__dirname, 'dist');

try {
  if (!fs.existsSync(path.join(uiCombinedDir, 'node_modules'))) {
    console.log('[NyayaDrishti Vercel Bridge] Installing dependencies in ui-combined...');
    execSync('npm install', { cwd: uiCombinedDir, stdio: 'inherit' });
  }

  execSync('npm run build', { cwd: uiCombinedDir, stdio: 'inherit' });
  
  if (fs.existsSync(distTarget)) {
    fs.rmSync(distTarget, { recursive: true, force: true });
  }
  fs.cpSync(distSource, distTarget, { recursive: true });
  console.log('[NyayaDrishti Vercel Bridge] Successfully copied canonical dist to members/member-06-ui/dist.');
} catch (error) {
  console.error('[NyayaDrishti Vercel Bridge] Build failed:', error);
  process.exit(1);
}
