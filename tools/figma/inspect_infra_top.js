const https = require('https');

const token = 'figd_c0xJ06osuTPmw1jymyil5btFX1GOHwPfR4YEjFML';
const fileKey = 'uugYJesdD6KyyT2sSY2rm7';

https.get(`https://api.figma.com/v1/files/${fileKey}/nodes?ids=171:486`, { headers: { 'X-Figma-Token': token } }, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const frame = json.nodes['171:486'].document;
    const fx = frame.absoluteBoundingBox.x;
    const fy = frame.absoluteBoundingBox.y;

    function walk(node) {
      if (!node.absoluteBoundingBox) return;
      const box = node.absoluteBoundingBox;
      const rx = box.x - fx;
      const ry = box.y - fy;

      if (ry >= 100 && ry <= 2750) {
        console.log(`[${node.type}] "${node.name}" (${node.id}) -> rx: ${rx.toFixed(1)}, ry: ${ry.toFixed(1)}, w: ${box.width.toFixed(1)}, h: ${box.height.toFixed(1)}`);
        if (node.type === 'TEXT') {
          console.log(`   Text: "${node.characters.replace(/\n/g, '\\n')}" | font: ${node.style?.fontFamily} ${node.style?.fontWeight} ${node.style?.fontSize}px | color: ${JSON.stringify(node.fills?.[0]?.color)}`);
        }
        if (node.cornerRadius) console.log(`   Radius: ${node.cornerRadius}`);
      }
      if (node.children) {
        for (const c of node.children) walk(c);
      }
    }
    walk(frame);
  });
});

