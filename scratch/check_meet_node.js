const https = require('https');
const fs = require('fs');

const token = 'figd_c0xJ06osuTPmw1jymyil5btFX1GOHwPfR4YEjFML';
const fileKey = 'uugYJesdD6KyyT2sSY2rm7';

// 384:2 is Rectangle 115 (Meet background)
// Let's get the parent or surrounding elements
https.get(`https://api.figma.com/v1/files/${fileKey}/nodes?ids=384:2`, { headers: { 'X-Figma-Token': token } }, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log(data.slice(0, 500));
  });
});

