const { Jimp } = require('jimp');
const path = require('path');

(async () => {
  try {
    const file = path.join(__dirname, '..', 'frontend', 'public', 'logo011.png');
    const img = await Jimp.read(file);
    const threshold = 240; // near-white threshold
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      // if near-white, make transparent
      if (r >= threshold && g >= threshold && b >= threshold) {
        this.bitmap.data[idx + 3] = 0;
      }
    });
    await img.write(file);
    console.log('Logo background removed and saved to', file);
    process.exit(0);
  } catch (err) {
    console.error('Error processing logo:', err);
    process.exit(1);
  }
})();
