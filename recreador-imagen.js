const Jimp = require('jimp');

async function compareImages(imagePath1, imagePath2) {
   console.log("asdios")
    const image1 = await Jimp.read(imagePath1);
    const image2 = await Jimp.read(imagePath2);

    const width = image1.getWidth();
    const height = image1.getHeight();

    let score = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel1 = Jimp.intToRGBA(image1.getPixelColor(x, y));
        const pixel2 = Jimp.intToRGBA(image2.getPixelColor(x, y));

        if (
          pixel1.r === pixel2.r &&
          pixel1.g === pixel2.g &&
          pixel1.b === pixel2.b &&
          pixel1.a === pixel2.a
        ) {
          score++;
        }
      }
    }
    console.log(score)
    return score;
  }


const imagePath1 = 'public/imagen_objetivo.png';
const imagePath2 = 'public/imagen_final.png';
console.log(compareImages(imagePath1, imagePath2))