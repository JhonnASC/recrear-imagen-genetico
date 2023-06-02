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
  //console.log(commonElements.length)
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



/**
 * Funcion para verificar si los puntos x y y existen en el array dado
 * @param {*} coordenadas 
 * @param {*} x 
 * @param {*} y 
 * @returns 
 */
function verificarCoordenadas(coordenadas, x, y) {
  return coordenadas.some(coordenada => coordenada.x === x && coordenada.y === y);
}

function generarNumeroAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Crea un array con valores aleatorios para x && y utilizando el ancho y alto de la imagen
 * @param {} width 
 * @param {*} height 
 */
function crearArray(width, height){
  let array = []
  for (let i = 0; i < width; i++) {
    array.push({ x: generarNumeroAleatorio(1, width), y: generarNumeroAleatorio(1, height) });
  }
  return array
}


/**
 * Verifica quien es el mejor entre padre, madre e hijo
 * @param {*} arrayObjetivo 
 * @param {*} padre 
 * @param {*} madre 
 * @param {*} hijo 
 * @returns 
 */
function best(arrayObjetivo,padre,madre,hijo){

  let mejorPadre = 0
  let mejorMadre = 0
  let mejorHijo = 0

  for (let i = 0; i < padre.length; i++) {
    if (verificarCoordenadas(arrayObjetivo, padre[i].x, padre[i].y)) {
      mejorPadre++  
    }
  }
  for (let i = 0; i < madre.length; i++) {
    if (verificarCoordenadas(arrayObjetivo, madre[i].x, madre[i].y)) {
      mejorMadre++  
    }
  }
  for (let i = 0; i < hijo.length; i++) {
    if (verificarCoordenadas(arrayObjetivo, hijo[i].x, hijo[i].y)) {
      mejorHijo++  
    }
  }

  // para obtener quien tuvo mas coincidencias
  if (mejorPadre >= mejorMadre && mejorPadre >= mejorHijo) {      // padre mejor
    return padre;
  } else if (mejorMadre > mejorPadre && mejorMadre > mejorHijo) { // madre mejor
    return madre;
  } else {                                                        // hijo mejor
    return hijo;
  }
}


function crossover(padre, madre, width) {
  let nuevoHijo = [];

  for (let i = 0; i < width; i++) {
    let aleatorio = Math.round(Math.random());

    if (aleatorio === 1) {
      nuevoHijo.push({ x: padre[i].x, y: madre[i].y });
    } else {
      nuevoHijo.push({ x: madre[i].x, y: padre[i].y });
    }
  }

  return nuevoHijo;
}

function mutacion(arrayObjetivo, array, width, height){

  for (let i = 0; i < array.length; i++) {
    if (!verificarCoordenadas(arrayObjetivo, array[0].x, array[0].y)) {// para no modificar valores buenos
      let x = generarNumeroAleatorio(1, width)
      let y = generarNumeroAleatorio(1, height)
    
      array[i].x = x
      array[i].y = y
    }
  }
  return array
}

/**
 * Agrega los valores x y y que estan correctos 
 * @param {*} puntosNegros 
 * @param {*} padre 
 * @returns 
 */
function agregaPuntosNegros(puntosNegros, padre){

  let puntosNegrosFinal = []

  for (let i = 0; i < padre.length; i++) {
    if (verificarCoordenadas(puntosNegros, padre[i].x, padre[i].y)) {
      puntosNegrosFinal.push({ x: padre[i].x, y: padre[i].y });
    }
  }

  return puntosNegrosFinal
}

async function runGeneticAlgorithm() {
  //========================================================================================
  //CREAMOS LA VARIABLE PARA ALMACENAR LOS PUNTOS X y Y de la imagen del usuario
  const puntosNegros = []                      // array de la imagen del usuario
  const image1 = await Jimp.read(imagePath1);  // imagen del usuario
  const width = image1.getWidth();             // ancho
  const height = image1.getHeight();           // alto

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel1 = Jimp.intToRGBA(image1.getPixelColor(x, y));
      if (pixel1.r === 6 && pixel1.g === 6 && pixel1.b === 8) {
        puntosNegros.push({ x, y });          // se agregan los puntos x y y donde van los puntos negros
      }
    }
  }
  //========================================================================================
  let comun = findCommonElements(image1, puntosNegros, width, height)  // almacena cuantos elementos tienen en comun
  let gen = 1
  let puntosNegrosFinal = [] // array para la creacion de la imagen

  //padre = [{x: 3, y: 3}]  este es el formato
  //madre = [{x: 4, y: 6}]
  let padre = crearArray(width, height)
  let madre = crearArray(width, height)
  let hijo = crossover(padre, madre)

  while (gen <= 100){   // realizamos el ciclo para intentar recrear la imagen de manera genetica

    // si ya tienen los mismos elementos en comun, sale
    if(comun === findCommonElements(image1, puntosNegrosFinal, width, height)){
      console.log("Mismos elementos en comun")
      break;

    }   
    puntosNegrosFinal = agregaPuntosNegros(puntosNegros, padre);

    padre = best(puntosNegros, padre, madre, hijo);

    hijo = crossover(padre, madre);
    hijo = mutacion(puntosNegros, hijo, width, height);
    madre = mutacion(puntosNegros, madre, width, height);

    //console.log(puntosNegrosFinal)

    //console.log(findCommonElements(image1, puntosNegrosFinal, width, height)) // imprime las similitudes que tenga la imagen del usuario y la imagen final
    gen++ //generacion
  }

  //crearImagen(imagePath, puntosNegrosFinal)

  return
}

runGeneticAlgorithm();