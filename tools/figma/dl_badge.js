const https = require('https');
const fs = require('fs');

const token = 'figd_c0xJ06osuTPmw1jymyil5btFX1GOHwPfR4YEjFML';
const fileKey = 'uugYJesdD6KyyT2sSY2rm7';

// 384:14 is Layer_1 (JOY IN MOVEMENT badge)
const url = `https://api.figma.com/v1/images/${fileKey}?ids=384:14&scale=2&format=png`;

https.get(url, { headers: { 'X-Figma-Token': token } }, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const json = JSON.parse(data);
    const imgUrl = json.images['384:14'];
    console.log('Badge URL:', imgUrl);
    https.get(imgUrl, imgRes => {
      const file = fs.createWriteStream('assets/footer_badge_logo.png');
      imgRes.pipe(file);
      file.on('finish', () => console.log('Successfully updated assets/footer_badge_logo.png'));
    });
  });
});

