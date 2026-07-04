const { Jimp } = require('jimp');
const fs = require('fs');

async function makeTransparent() {
  const image = await Jimp.read('g:/Soley.ma/public/logo.png');
  
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    
    // If pixel is very close to white, make it transparent
    if (r > 240 && g > 240 && b > 240) {
      this.bitmap.data[idx + 3] = 0; // alpha = 0 (transparent)
    }
  });

  await image.write('g:/Soley.ma/public/logo.png');
  console.log('Done');
}

makeTransparent().catch(console.error);
