const fs = require('fs');

const content = fs.readFileSync('scratch/CS22025.content.txt', 'utf8');
const lines = content.split('\n');

const map = {};
let currentPage = 1;

for (let line of lines) {
  const pageMatch = line.match(/----------------Page \((\d+)\) Break----------------/);
  if (pageMatch) {
    currentPage = parseInt(pageMatch[1]) + 1; // It breaks AFTER the page, so next line is page+1?
    // Wait, pdf2json format is: content of page 0, then Page (0) Break.
    // So if we see Page (0) Break, we just finished page 1.
    currentPage = parseInt(pageMatch[1]) + 2; 
  }
  
  // Actually let's just use a simple regex on the whole content block
}

const pages = content.split(/----------------Page \(\d+\) Break----------------/);
const finalMap = {};

pages.forEach((pageText, index) => {
  const pageNum = index + 1;
  const matches = [...pageText.matchAll(/Q\.\s*(\d+)/g)];
  matches.forEach(m => {
    const q = parseInt(m[1]);
    if (!finalMap[q]) {
      finalMap[q] = pageNum;
    }
  });
});

console.log("const DEMO_PAGE_MAP = {");
for(let i=1; i<=65; i++) {
  console.log(`  ${i}: ${finalMap[i] || finalMap[i-1] || 1},`);
}
console.log("};");
