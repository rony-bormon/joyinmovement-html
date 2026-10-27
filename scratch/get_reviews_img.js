const https = require('https');
const fs = require('fs');

const token = 'figd_c0xJ06osuTPmw1jymyil5btFX1GOHwPfR4YEjFML';
const fileKey = 'uugYJesdD6KyyT2sSY2rm7';

// 220:183 is Group 3 (Reviews)
// 159:33 is JIM-Red 4, 384:2 is Rectangle 115, etc.
const url = `https://api.figma.com/v1/images/${fileKey}?ids=220:183&scale=1&format=png`;

https.get(url, { headers: { 'X-Figma-Token': token } }, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(data);
  });
});

