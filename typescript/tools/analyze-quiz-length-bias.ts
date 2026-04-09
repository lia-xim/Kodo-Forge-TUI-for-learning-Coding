import * as fs from 'fs';
import * as path from 'path';

const tsDir = "c:/Users/matth/Documents/Learning/typescript";
const dirs = fs.readdirSync(tsDir).filter(req => req.match(/^(?:[0-4][0-9])-/));

console.log("Analyzing Quiz Length Bias...");

let totalMC = 0;
let longestIsCorrect = 0;

for (const dir of dirs) {
  const file = path.join(tsDir, dir, 'quiz-data.ts');
  if (!fs.existsSync(file)) continue;

  const content = fs.readFileSync(file, 'utf8');
  
  // We want to find multiple choice options arrays and their correct indexes.
  // This simplistic regex will extract options array block and the correct index.
  const regex = /options:\s*\[([\s\S]*?)\]\s*,\s*correct:\s*(\d)/g;
  
  let match;
  while ((match = regex.exec(content)) !== null) {
      const optionsStr = match[1];
      const correctIdx = parseInt(match[2], 10);
      
      // parse options loosely
      const options = [...optionsStr.matchAll(/[\`\"\']([\s\S]*?)[\`\"\']/g)].map(m => m[1]);
      
      if (options.length === 4) {
          totalMC++;
          const lengths = options.map(o => o.length);
          const correctLength = lengths[correctIdx];
          const sorted = [...lengths].sort((a,b) => b-a);
          
          if (correctLength === sorted[0] && sorted[0] > sorted[1] + 10) {
              longestIsCorrect++;
          }
      }
  }
}

const percentage = (longestIsCorrect / totalMC) * 100;
console.log(`\nResults: ${longestIsCorrect} times out of ${totalMC} queries (${percentage.toFixed(2)}%), the correct answer is significantly longer than the others.`);
if(percentage > 50) {
  console.log("Significant Length Bias detected!");
} else {
  console.log("Length Bias is within acceptable bounds.");
}
