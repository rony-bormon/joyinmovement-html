const https = require('https');
const fs = require('fs');

const token = 'figd_c0xJ06osuTPmw1jymyil5btFX1GOHwPfR4YEjFML';
const fileKey = 'uugYJesdD6KyyT2sSY2rm7';

// Get the image fill URL for 0182f9b4f7853d05be006ce0a85478cab1b65e79
https.get(`https://api.figma.com/v1/files/${fileKey}/images`, { headers: { 'X-Figma-Token': token } }, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const json = JSON.parse(data);
    const meta = json.meta && json.meta.images;
    if (meta) {
      console.log('Script logo URL:', meta['0182f9b4f7853d05be006ce0a85478cab1b65e79']);
    } else {
      console.log(json);
    }
  });
});

