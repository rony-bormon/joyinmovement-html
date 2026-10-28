const https = require('https');
const fs = require('fs');

const cards = {
  'card1.png': 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/bea2c25e-abfb-4715-9756-0aa88df5b141',
  'card2.png': 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/fe75d18d-a78a-400e-bac0-24b1893e120e'
};

for (const [filename, url] of Object.entries(cards)) {
  https.get(url, res => {
    const stream = fs.createWriteStream(`tools/figma/${filename}`);
    res.pipe(stream);
    stream.on('finish', () => console.log('Saved tools/figma/' + filename));
  });
}

