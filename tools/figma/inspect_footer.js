const https = require('https');

const token = 'figd_c0xJ06osuTPmw1jymyil5btFX1GOHwPfR4YEjFML';
const fileKey = 'uugYJesdD6KyyT2sSY2rm7';

function getFooter() {
  const url = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=135:2`;
  https.get(url, { headers: { 'X-Figma-Token': token } }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const json = JSON.parse(data);
      const frame = json.nodes['135:2'].document;
      const fx = frame.absoluteBoundingBox.x;
      const fy = frame.absoluteBoundingBox.y;

      console.log('--- ALL NODES IN FOOTER AREA (ry >= 7600) ---');
      function walk(node) {
        if (!node.absoluteBoundingBox) return;
        const box = node.absoluteBoundingBox;
        const rx = box.x - fx;
        const ry = box.y - fy;

        if (ry >= 7600) {
          console.log(`[${node.type}] "${node.name}" (${node.id}) -> rx: ${rx.toFixed(1)}, ry: ${ry.toFixed(1)}, w: ${box.width.toFixed(1)}, h: ${box.height.toFixed(1)}`);
          if (node.type === 'TEXT') {
            console.log(`   Text: "${node.characters}" | style:`, node.style);
            console.log(`   Fills:`, JSON.stringify(node.fills));
          }
          if (node.type === 'RECTANGLE' || node.type === 'VECTOR') {
            console.log(`   Fills:`, JSON.stringify(node.fills));
          }
        }
        if (node.children) {
          for (const c of node.children) walk(c);
        }
      }
      walk(frame);
    });
  });
}

getFooter();

