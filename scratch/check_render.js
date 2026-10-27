const fs = require('fs');

// Let's check the size of home_render.png
const stats = fs.statSync('home_render.png');
console.log('home_render.png size:', stats.size);

