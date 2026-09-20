const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'node_modules', '@jimp', 'core', 'tsconfig.json');
try {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log('Removed', file);
  }
} catch (err) {
  console.error('Failed to remove', file, err.message);
  process.exit(1);
}
