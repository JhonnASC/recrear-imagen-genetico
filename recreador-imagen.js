const Jimp = require('jimp');

async function compareImages(imagePath1, imagePath2) {
  const image1 = await Jimp.read(imagePath1);
  const image2 = await Jimp.read(imagePath2);

  const width = image1.getWidth();
  const height = image1.getHeight();
  let score = 0;
  const coordenadas = []; // Arreglo para almacenar las coordenadas coincidentes

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
        coordenadas.push({ x, y }); 
      }
    }
  }

  console.log(coordenadas[1]); 
  console.log(score)
  return score; 
}

const coordenadasPuntosNegros = [];

async function getCoordenadasPuntosNegros(imagePath1) {
  const image1 = await Jimp.read(imagePath1);

  const width = image1.getWidth();
  const height = image1.getHeight();


  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel1 = Jimp.intToRGBA(image1.getPixelColor(x, y));


      if (pixel1.r === 6 && pixel1.g === 6 && pixel1.b === 8) {
        coordenadasPuntosNegros.push({ x, y });
      }
    }
  }

  return coordenadasPuntosNegros;
}



async function findCommonElements(imagePath1, arr2) {
  const image1 = await Jimp.read(imagePath1);
  const puntosNegros = [];
  const width = image1.getWidth();
  const height = image1.getHeight();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel1 = Jimp.intToRGBA(image1.getPixelColor(x, y));

      if (pixel1.r === 6 && pixel1.g === 6 && pixel1.b === 8) {
        puntosNegros.push({ x, y });
      }
    }
  }

  const commonElements = puntosNegros.filter(element => {
    return arr2.some(item => item.x === element.x && item.y === element.y);
  });
  console.log(commonElements.length)
  return commonElements.length;
}

const imagePath1 = 'public/imagen_objetivo.png';
const arr2 = [{ x: 2, y: 3 }, { x: 5, y: 6 }, { x: 8, y: 9 }];

findCommonElements(imagePath1, arr2)
  .then(similarityCount => {
    console.log('Cantidad de similitudes encontradas:', similarityCount);
  })
  .catch(error => {
    console.error('', error);
  });

//const imagePath2 = 'public/rojo.jpg';
//compareImages(imagePath1, imagePath2);




async function crearImagen(imagePath, coordenadas) {
  const image = await Jimp.read(imagePath);
  const black = Jimp.cssColorToHex('#000000');

  coordenadas.forEach(coord => {
    const { x, y } = coord;
    image.setPixelColor(black, x, y);
  });

  const outputImagePath = 'output.png';
  await image.writeAsync(outputImagePath);

  console.log(`Se agregaron píxeles negros a la imagen`);
}

const imagePath = 'public/imagen_final.png';
const coordenadas = [{ x: 2, y: 3 }, { x: 5, y: 6 }, { x: 8, y: 9 }];

crearImagen(imagePath, coordenadas)
  .catch(error => {
    console.error('Ocurrió un error:', error);
  });




getCoordenadasPuntosNegros(imagePath1);

//const commonCount = findCommonElements([1,2,3], [1,2,3]);
//console.log(`Cantidad de elementos en común: ${commonCount}`);



