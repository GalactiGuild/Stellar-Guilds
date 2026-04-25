const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      if (content.includes('gold-')) {
        const modifiedContent = content.replace(/gold-/g, 'violet-');
        fs.writeFileSync(fullPath, modifiedContent);
        console.log('Updated:', fullPath);
      }
    }
  }
}

const targetDir = path.join(__dirname, 'src', 'features', 'onboarding');
if (fs.existsSync(targetDir)) {
  processDir(targetDir);
  console.log('Finished updating onboarding to purple/violet');
} else {
  console.log('Directory not found:', targetDir);
}
