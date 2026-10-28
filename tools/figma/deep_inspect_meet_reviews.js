const https = require('https');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const tokenMatch = env.match(/FIGMA_TOKEN=(.+)/);
const token = tokenMatch ? tokenMatch[1].trim() : '';

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'X-Figma-Token': token } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  const data = await fetchJSON('https://api.figma.com/v1/files/uugYJesdD6KyyT2sSY2rm7/nodes?ids=135:2');
  const doc = data.nodes['135:2'].document;

  console.log('=== MEET ELEMENTS (y from 4000 to 4800) ===');
  const meetElements = doc.children.filter(c => c.absoluteBoundingBox && c.absoluteBoundingBox.y >= 4000 && c.absoluteBoundingBox.y < 4800);
  meetElements.sort((a,b) => a.absoluteBoundingBox.y - b.absoluteBoundingBox.y);
  
  meetElements.forEach(c => {
    console.log(`[${c.type}] ${c.name} (${c.id}) | x=${Math.round(c.absoluteBoundingBox.x)}, y=${Math.round(c.absoluteBoundingBox.y)}, w=${Math.round(c.absoluteBoundingBox.width)}, h=${Math.round(c.absoluteBoundingBox.height)}`);
    if (c.characters) console.log(`   Text: "${c.characters.replace(/\n/g, ' ')}" | style:`, c.style);
    if (c.fills && c.fills.length) console.log(`   Fills:`, JSON.stringify(c.fills));
  });

  console.log('\n=== REVIEWS ELEMENTS (y from 4800 to 5400) ===');
  const revElements = doc.children.filter(c => c.absoluteBoundingBox && c.absoluteBoundingBox.y >= 4800 && c.absoluteBoundingBox.y < 5400);
  revElements.forEach(c => {
    console.log(`[${c.type}] ${c.name} (${c.id}) | x=${Math.round(c.absoluteBoundingBox.x)}, y=${Math.round(c.absoluteBoundingBox.y)}, w=${Math.round(c.absoluteBoundingBox.width)}, h=${Math.round(c.absoluteBoundingBox.height)}`);
    if (c.children) {
      c.children.forEach(ch => {
        console.log(`   -> [${ch.type}] ${ch.name} (${ch.id}) | x=${Math.round(ch.absoluteBoundingBox.x)}, y=${Math.round(ch.absoluteBoundingBox.y)}, w=${Math.round(ch.absoluteBoundingBox.width)}, h=${Math.round(ch.absoluteBoundingBox.height)}`);
        if (ch.characters) console.log(`      Text: "${ch.characters.replace(/\n/g, ' ')}" | style:`, ch.style);
        if (ch.fills && ch.fills.length) console.log(`      Fills:`, JSON.stringify(ch.fills));
        if (ch.cornerRadius !== undefined) console.log(`      cornerRadius:`, ch.cornerRadius);
      });
    }
  });
}

run();

