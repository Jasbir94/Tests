const fs = require('fs');
const pdf = require('pdf-parse');

async function parse() {
  const dataBuffer = fs.readFileSync('public/demo/CS22025.pdf');
  
  // Custom render function to keep track of page numbers
  let currentPage = 1;
  const pageTexts = {};
  
  function render_page(pageData) {
    let render_options = { normalizeWhitespace: true, disableCombineTextItems: false };
    return pageData.getTextContent(render_options).then(function(textContent) {
        let text = '';
        for (let item of textContent.items) {
            text += item.str + ' ';
        }
        pageTexts[currentPage] = text;
        currentPage++;
        return text;
    });
  }

  const options = { pagerender: render_page };
  await pdf(dataBuffer, options);

  const questionMap = {};
  // Looking for "Q.1 ", "Q.2 ", "Q.13", etc.
  for (let q = 1; q <= 65; q++) {
    const qPattern1 = `Q.${q}`;
    const qPattern2 = `Q. ${q}`;
    
    // Find the first page containing this question
    for (let p = 1; p <= Object.keys(pageTexts).length; p++) {
      const txt = pageTexts[p];
      if (txt.includes(qPattern1) || txt.includes(qPattern2)) {
        questionMap[q] = p;
        break; // found it, move to next question
      }
    }
  }

  // Print as a valid JS object string for copy-pasting
  console.log("const DEMO_PAGE_MAP = {");
  for (let q = 1; q <= 65; q++) {
    if (questionMap[q]) {
      console.log(`  ${q}: ${questionMap[q]},`);
    }
  }
  console.log("};");
}

parse().catch(console.error);
