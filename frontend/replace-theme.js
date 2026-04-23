const fs = require('fs');
const path = require('path');

const replacements = [
  // Guilds page & others
  { r: /bg-gray-50 dark:bg-gray-900/g, v: 'bg-slate-950' },
  { r: /bg-white dark:bg-gray-800/g, v: 'bg-slate-900/40' },
  { r: /text-gray-900 dark:text-white/g, v: 'text-white' },
  { r: /text-gray-600 dark:text-gray-400/g, v: 'text-slate-400' },
  { r: /border-gray-200 dark:border-gray-700/g, v: 'border-slate-800/50' },
  { r: /dark:bg-gray-800 dark:text-white/g, v: 'bg-slate-900/40 text-white' },
  { r: /border-gray-300 dark:border-gray-600/g, v: 'border-slate-700/50' },

  // Bounties page
  { r: /bg-\[#050505\]/g, v: 'bg-slate-950' },
  { r: /bg-\[#080808\]/g, v: 'bg-slate-900/30' },
  { r: /bg-\[#0A0A0A\]/g, v: 'bg-slate-900' },

  // Profile / Reputation page
  { r: /bg-slate-50/g, v: 'bg-slate-950 text-white' },
  { r: /bg-white p-6 shadow-md border border-gray-100/g, v: 'bg-slate-900/40 p-6 shadow-md border border-slate-800/50' },
  { r: /text-gray-900/g, v: 'text-white' },
  { r: /text-gray-600/g, v: 'text-slate-400' },
  { r: /text-gray-500/g, v: 'text-slate-500' },
  { r: /bg-gray-100/g, v: 'bg-slate-800/50' },
  { r: /bg-gray-200/g, v: 'bg-slate-800' },
  { r: /border-white/g, v: 'border-slate-800' },
  { r: /text-slate-900/g, v: 'text-white' },
  { r: /text-slate-600/g, v: 'text-slate-400' },
  { r: /text-slate-700/g, v: 'text-slate-300' },
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const {r, v} of replacements) {
        if (content.match(r)) {
          content = content.replace(r, v);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated:', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
