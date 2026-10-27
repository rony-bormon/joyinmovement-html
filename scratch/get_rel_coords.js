const https = require('https');
const fs = require('fs');

const token = 'figd_c0xJ06osuTPmw1jymyil5btFX1GOHwPfR4YEjFML';
const fileKey = 'uugYJesdD6KyyT2sSY2rm7';

function getFrame() {
  const url = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=135:2`;
  const options = {
    headers: { 'X-Figma-Token': token }
  };
  https.get(url, options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const json = JSON.parse(data);
      const frame = json.nodes['135:2'].document;
      console.log('Frame 135:2 size:', frame.absoluteBoundingBox);
      const fx = frame.absoluteBoundingBox.x;
      const fy = frame.absoluteBoundingBox.y;

      function walk(node) {
        if (!node.absoluteBoundingBox) return;
        const box = node.absoluteBoundingBox;
        const rx = box.x - fx;
        const ry = box.y - fy;

        if (ry >= 4000 && ry <= 5500) {
          if (node.name.includes('Meet') || node.name.includes('Rectangle 115') || node.name.includes('REVIEW') || node.name.includes('HEAR') || node.name.includes('Rectangle 6') || node.type === 'GROUP' || node.name.includes('JIM-Red')) {
            console.log(`[${node.type}] "${node.name}" (${node.id}) -> relX: ${rx.toFixed(1)}, relY: ${ry.toFixed(1)}, w: ${box.width.toFixed(1)}, h: ${box.height.toFixed(1)}`);
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

getFrame();

