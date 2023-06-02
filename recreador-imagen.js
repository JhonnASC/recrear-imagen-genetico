const Jimp = require('jimp');

const generaciones = 10;

//48672 es el numero de similitudes que estamos teniendo
const imagePath1 = 'public/imagen_objetivo.png';  //imagen del usuario
const arr2 = [{ x: 2, y: 3 }, { x: 5, y: 6 }, { x: 8, y: 9 }];

const imagePath = 'public/imagen_final.png';     //base de la imagen, imagen blanca para escribir
const coordenadas = [{ x: 2, y: 3 }, { x: 5, y: 6 }, { x: 8, y: 9 }];

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

async function getCoordenadasPuntosNegros(imagePath1) {
  const image1 = await Jimp.read(imagePath1);

  const width = image1.getWidth();
  const height = image1.getHeight();


  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel1 = Jimp.intToRGBA(image1.getPixelColor(x, y));


      if (pixel1.r === 6 && pixel1.g === 6 && pixel1.b === 8) {
        XandY_PuntosNegros.push({ x, y });
      }
    }
  }

  return XandY_PuntosNegros;
}

function findCommonElements(image1, comparador,width,height) {
  const puntosNegros = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel1 = Jimp.intToRGBA(image1.getPixelColor(x, y));

      if (pixel1.r === 6 && pixel1.g === 6 && pixel1.b === 8) {
        puntosNegros.push({ x, y });
      }
    }
  }

  const commonElements = puntosNegros.filter(element => {
    return comparador.some(item => item.x === element.x && item.y === element.y);
  });
  console.log(commonElements.length)
  return commonElements.length;
}

async function crearImagen(imagePath, coordenadas) {
  const image = await Jimp.read(imagePath);
  const black = Jimp.cssColorToHex('#000000');

  //console.log(coordenadas)

  coordenadas.forEach(coord => {
    const { x, y } = coord;
    image.setPixelColor(black, x, y);
  });

  const outputImagePath = 'public/imagenFinal.png';
  await image.writeAsync(outputImagePath);

  console.log(`Se agregaron píxeles negros a la imagen`);
}

//findCommonElements(imagePath1, arr2)
//  .then(similarityCount => {
//    console.log('Cantidad de similitudes encontradas:', similarityCount);
//  })
//  .catch(error => {
//    console.error('', error);
//});


function compararArrays(array1, array2) {
  if (array1.length !== array2.length) {
    return false;
  }

  //for (let i = 0; i < array1.length; i++) {
 //   if (array1[i].x !== array2[i].x || array1[i].y !== array2[i].y) {
   //   return false;
  //  }
 // }

  return true;
}

function verificarCoordenadas(coordenadas, x, y) {
  return coordenadas.some(coordenada => coordenada.x === x && coordenada.y === y);
}

function generarNumeroAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


function agregaXandY(arrayObjetivo, arrayFinal, padre){

  // significa que x y y van en esa posicion para la imagen
  if (verificarCoordenadas(arrayObjetivo, padre[0].x, padre[0].y)) {
    //console.log(`Las coordenadas (${padre[0].x}, ${padre[0].y}) están en el array.`);
    arrayFinal.push(padre[0]);  
  }
  return arrayFinal

}


/**
 * Funcion para crear un array del tamaño del array de la imagen objetivo
 * @param {*} array 
 * @param {*} width 
 * @param {*} height 
 * @returns 
 */
function generarArray(array, width, height){

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {

      //x = generarNumeroAleatorio(1, width),
      //y = generarNumeroAleatorio(1, height)
      
      
      array.push({ x, y });

    }
  }
  
  return array
}

function mutacion(arrayObjetivo, arrayComparador, width, height){
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Los valores son iguales, entonces no los modificamos
      if ( arrayObjetivo[x].x === arrayComparador[x].x 
        && arrayObjetivo[y].y === arrayComparador[y].y) {
        break; 
      }
      x = generarNumeroAleatorio(1, width)
      y = generarNumeroAleatorio(1, height)

      arrayComparador[x].x = 500
      arrayComparador[y].y = 500

    }
  }

  return arrayComparador
}

async function runGeneticAlgorithm() {
  //-------------------------------------------------------------------------------------
  //CREAMOS LA VARIABLE PARA ALMACENAR LOS PUNTOS X y Y de la imagen del usuario
  const puntosNegros = []                      // array de la imagen del usuario
  const image1 = await Jimp.read(imagePath1);  // imagen del usuario
  const width = image1.getWidth();             // ancho
  const height = image1.getHeight();           // alto

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel1 = Jimp.intToRGBA(image1.getPixelColor(x, y));
      if (pixel1.r === 6 && pixel1.g === 6 && pixel1.b === 8) {
        puntosNegros.push({ x, y });
      }
    }
  }


  //-------------------------------------------------------------------------------------
  
  let i = 1
  let puntosNegrosFinal = [] //array para la creacion de la imagen
  let padre = []
  // array para utilizarlo para crear la imagen
  //padre = [{x: 3, y: 3}]
  //madre = [{x: 4, y: 6}]

  // realizamos el ciclo para intentar recrear la imagen de manera genetica
  while (i <= 5000){

    //if(compararArrays(puntosNegros, puntosNegrosFinal)){   // si es true, sale, ya que son iguales
    //  console.log("Fueron iguales")  
    //  return
    //}

    // Se crean x y y aleatorios
    padre = [{x: generarNumeroAleatorio(1, width), y: generarNumeroAleatorio(1, height)}]
    madre = [{x: generarNumeroAleatorio(1, width), y: generarNumeroAleatorio(1, height)}]

    //console.log(padre[0])

    puntosNegrosFinal = agregaXandY(puntosNegros, puntosNegrosFinal, padre)
    //puntosNegrosFinal.push(padre[0]);
    //console.log(puntosNegrosFinal[0])
    //puntosNegrosFinal = mutacion(puntosNegros, puntosNegrosFinal, width, height)

    findCommonElements(image1, puntosNegrosFinal, width, height) // imprime las similitudes que tenga la imagen del usuario y la imagen final
    i++
  }

  //console.log(puntosNegrosFinal)

  //crearImagen(imagePath, puntosNegrosFinal)
  //  .catch(error => {
  //    console.error('Ocurrió un error:', error);
  //});

  return
}

runGeneticAlgorithm();