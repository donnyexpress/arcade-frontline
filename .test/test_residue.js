const { chromium } = require('playwright');
const fs = require('fs');
const { PNG } = require('pngjs');

(async () => {
  // Analyze the actual blue units image
  const blueBuf = fs.readFileSync('/workspace/art/units_blue_3x4.png');
  const blueImg = PNG.sync.read(blueBuf);
  const redBuf = fs.readFileSync('/workspace/art/units_red_3x4.png');
  const redImg = PNG.sync.read(redBuf);
  const blueBldBuf = fs.readFileSync('/workspace/art/buildings_blue_3x2.png');
  const blueBldImg = PNG.sync.read(blueBldBuf);
  const redBldBuf = fs.readFileSync('/workspace/art/buildings_red_3x2.png');
  const redBldImg = PNG.sync.read(redBldBuf);
  
  function analyzeResidue(img, name) {
    let greenPixels = 0, nearGreen = 0, totalPixels = 0;
    const w = img.width, h = img.height;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const r = img.data[idx];
        const g = img.data[idx+1];
        const b = img.data[idx+2];
        totalPixels++;
        // Check for exact green
        if (r === 0 && g === 255 && b === 0) greenPixels++;
        // Check for near-green (could be residue)
        if (g > 200 && r < 80 && b < 80) nearGreen++;
      }
    }
    console.log(`${name} (${w}x${h}):`);
    console.log(`  Total: ${totalPixels}`);
    console.log(`  Exact #00FF00: ${greenPixels} (${(greenPixels/totalPixels*100).toFixed(1)}%)`);
    console.log(`  Near-green (g>200,r<80,b<80): ${nearGreen} (${(nearGreen/totalPixels*100).toFixed(1)}%)`);
  }
  
  analyzeResidue(blueImg, 'units_blue_3x4');
  analyzeResidue(redImg, 'units_red_3x4');
  analyzeResidue(blueBldImg, 'buildings_blue_3x2');
  analyzeResidue(redBldImg, 'buildings_red_3x2');
})();
