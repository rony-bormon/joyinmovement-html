const https = require('https');
const fs = require('fs');

const url = "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/e5452f70-f0b1-46b5-9ae0-80d5215b2d5a";

https.get(url, (res) => {
  const file = fs.createWriteStream('tools/figma/figma_reviews.png');
  res.pipe(file);
  file.on('finish', () => {
    console.log('Saved tools/figma/figma_reviews.png');
  });
});

