const https = require('https');
const fs = require('fs');

const token = 'figd_c0xJ06osuTPmw1jymyil5btFX1GOHwPfR4YEjFML';
const fileKey = 'uugYJesdD6KyyT2sSY2rm7';

function inspectLocations() {
  const url = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=287:288`;
  https.get(url, { headers: { 'X-Figma-Token': token } }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const json = JSON.parse(data);
      const frame = json.nodes['287:288'].document;
      console.log('Frame 287:288 (LOCATIONS):', frame.name, frame.absoluteBoundingBox);
      const fx = frame.absoluteBoundingBox.x;
      const fy = frame.absoluteBoundingBox.y;

      function walk(node, depth = 0) {
        if (!node.absoluteBoundingBox) return;
        const box = node.absoluteBoundingBox;
        const rx = box.x - fx;
        const ry = box.y - fy;
        const indent = '  '.repeat(depth);

        console.log(`${indent}[${node.type}] "${node.name}" (${node.id}) -> rx: ${rx.toFixed(1)}, ry: ${ry.toFixed(1)}, w: ${box.width.toFixed(1)}, h: ${box.height.toFixed(1)}`);
        if (node.type === 'TEXT') {
          console.log(`${indent}   Text: "${node.characters.replace(/\n/g, '\\n')}" | font: ${node.style?.fontFamily} ${node.style?.fontWeight} ${node.style?.fontSize}px | color: ${JSON.stringify(node.fills?.[0]?.color)}`);
        }
        if (node.fills && node.fills.length > 0 && node.type !== 'TEXT') {
          console.log(`${indent}   Fills: ${JSON.stringify(node.fills.map(f => ({ type: f.type, color: f.color, imageRef: f.imageRef })))}`);
        }
        if (node.cornerRadius) {
          console.log(`${indent}   CornerRadius: ${node.cornerRadius}`);
        }
        if (node.children) {
          for (const c of node.children) walk(c, depth + 1);
        }
      }

      walk(frame);
    });
  });
}

inspectLocations();

