const https = require('https');
const fs = require('fs');

const url = "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/ed9f2096-d242-4e00-83f4-43953fea6f0e";

https.get(url, res => {
  const file = fs.createWriteStream('tools/figma/logo_159_33.png');
  res.pipe(file);
  file.on('finish', () => console.log('Saved tools/figma/logo_159_33.png'));
});

