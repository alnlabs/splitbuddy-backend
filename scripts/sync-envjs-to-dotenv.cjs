const fs = require('fs');
const path = require('path');
const env = require('../env.js');

const lines = Object.entries(env)
  .map(([key, value]) => `${key}="${String(value).replace(/"/g, '\"')}"`)
  .join('\n');

fs.writeFileSync(path.join(__dirname, '../.env'), lines + '\n');
console.log('.env file generated from env.js');
