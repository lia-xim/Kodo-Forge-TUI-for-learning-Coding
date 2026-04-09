import * as fs from 'fs';
import * as path from 'path';

const tsDir = "c:/Users/matth/Documents/Learning/typescript";
const dirs = fs.readdirSync(tsDir).filter(req => req.match(/^(?:[0-4][0-9])-/));

console.log("Analyzing Pretest Bias...");

for (const dir of dirs) {
  const pretestPath = path.join(tsDir, dir, 'pretest-data.ts');
  if (!fs.existsSync(pretestPath)) continue;

  const content = fs.readFileSync(pretestPath, 'utf8');
  const matches = [...content.matchAll(/correct:\s*(\d)/g)];
  
  if (matches.length === 0) continue;

  const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
  for (const m of matches) {
    const val = parseInt(m[1], 10);
    if (counts[val] !== undefined) {
      counts[val]++;
    }
  }

  const max = Math.max(...Object.values(counts));
  const biasThreshold = Math.ceil(matches.length * 0.6); // 60%

  console.log(`[BIAS] ${dir}: Total=${matches.length} -> 0:${counts[0]}, 1:${counts[1]}, 2:${counts[2]}, 3:${counts[3]}`);
}
