const https = require('https');
const fs = require('fs');

const token = 'figd_c0xJ06osuTPmw1jymyil5btFX1GOHwPfR4YEjFML';
const fileKey = 'uugYJesdD6KyyT2sSY2rm7';

const url = `https://api.figma.com/v1/images/${fileKey}?ids=160:41,160:43,216:64,216:56,226:294&scale=1&format=png`;

https.get(url, { headers: { 'X-Figma-Token': token } }, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log(data);
  });
});

