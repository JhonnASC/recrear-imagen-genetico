const Jimp = require('jimp');

// Tamaño de la imagen
const ancho = 100;
const alto = 100;



// Cargar la imagen objetivo
Jimp.read('objetivo.png')
  .then((targetImage) => {
    targetImage.resize(ancho, alto);
    const imagenRedimensionada = targetImage.resize(ancho, alto);

  // Guardar la imagen redimensionada en un archivo PNG
   imagenRedimensionada.writeAsync('imagen_objetivo.png');
    const targetPixels = targetImage.bitmap.data;
 

  });

// Crear una nueva imagen de 100x100 píxeles con fondo blanco
new Jimp(ancho, alto, '#FFFFFF', (err, imagen) => {
  if (err) throw err;

  // Guardar la imagen
  imagen.write('imagen_final', (err) => {
    if (err) throw err;

    console.log('asd');
  });
});






let diferencias = 0;

for (let x = 0; x < imagen.bitmap.width; x++) {
  for (let y = 0; y < imagen1.bitmap.height; y++) {
    const color1 = imagen1.getPixelColor(x, y);
    const color2 = imagen2.getPixelColor(x, y);

    if (color1 !== color2) {
      diferencias++;
    }
  }
}

console.log(`Número de píxeles diferentes: ${diferencias}`);


// crossover -- José, Jocsan
// mutacion  --- José, Jocsan
// grafica   -- Jhonn



// web   -- Jhonn, Jocsan


