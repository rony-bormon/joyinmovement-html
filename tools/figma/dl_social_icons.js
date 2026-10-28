const https = require('https');
const fs = require('fs');

const icons = {
  'social_1.png': 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/1bede047-e962-4558-9dd4-76c56d27d936',
  'social_2.png': 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/c5a47a5c-d818-4499-8fa8-b52c007c58fc',
  'social_3.png': 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/2e7f4eaf-f569-413f-a394-c8d912e3e4f6'
};

for (const [filename, url] of Object.entries(icons)) {
  https.get(url, res => {
    const s = fs.createWriteStream(`tools/figma/${filename}`);
    res.pipe(s);
    s.on('finish', () => console.log('Saved ' + filename));
  });
}

