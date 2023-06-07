///////////////////////////////////////////////////
//              VARIABLES GLOBALES               //
///////////////////////////////////////////////////
const Jimp = require('jimp');

const maxGeneraciones = 70; //cantidad de generaciones
const tasaMutacion = 0.2;    //20% de los genes se mutarán
const tasaCombinacion = 0.5;  //cantidad de combinados
const hijosPorGen = 10;     //cantidad de hijos por generación

//const imagePath1 = 'public/dibujolineal.jpg';  //imagen del usuario
const imagePath1 = 'public/calavera.jpeg';  //imagen del usuario
const imagePath = 'public/imagen_final.png';     //base de la imagen, imagen blanca para escribir


///////////////////////////////////////////////////
//     IMPLEMENTACION PARA CARGAR LA IMAGEN      //
///////////////////////////////////////////////////
/**
 * Crea un array con valores aleatorios para x && y utilizando el ancho y alto de la imagen
 * @param {} image1 ruta de la imagen seleccionada
 * @param {array} comparador arreglo que contiene las coordenadas de los puntos a comparar
 * @param {number} width ancho de la imagen
 * @param {number} height altura de la imagen
 * @returns la cantidad de elementos en común que se encontraron
 */
function findCommonElements(image1, comparador, width, height) {
  const puntosNegros = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel1 = Jimp.intToRGBA(image1.getPixelColor(x, y));
      const nivelGris = (pixel1.r + pixel1.g + pixel1.b) / 3; // Promedio de los rgb
      if (nivelGris <= 30) { // Si el nivel de gris es menor o igual a 30 / si cada codigo es 10 max
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

/**
 * Funcion asíncrona que pone los puntos nergos que se tengan en la última generación
 * @param {string} imagePath dirección de la imagen en blanco en donde se podrán los pixeles
 * @param {{ x, y }} coordenadas coordenada(x,y) de cada punto bueno que se encontró
 */
async function crearImagen(imagePath, coordenadas) {
  const image = await Jimp.read(imagePath);
  const black = Jimp.cssColorToHex('#000000');

  //console.log(coordenadas)

  coordenadas.forEach(coord => {
    const { x, y } = coord;
    image.setPixelColor(black, x, y);
  });

  const outputImagePath = 'public/imagenFinalFinal.png';
  await image.writeAsync(outputImagePath);

  console.log(`Se agregaron píxeles negros a la imagen`);
}

///////////////////////////////////////////////////
//    IMPLEMENTACION DEL ALGORITMO GENETICO      //
///////////////////////////////////////////////////
/**
 * Funcion para verificar si los puntos x y y existen en el array dado
 * @param {array} coordenadas array en donde vamos a comprobar
 * @param {number} x coordenada x
 * @param {number} y coordenada y
 * @returns 
 */
function verificarCoordenadas(coordenadas, x, y) {
  return coordenadas.some(coordenada => coordenada.x === x && coordenada.y === y);
}

/**
 * Funcion que genera números aleatorios con intervalos específicos
 * @param {number} min es el mínimo del intervalo donde se generará
 * @param {number} max es el máximo del intervalo donde se generará
 * @returns el número en ese intérvalo
 */
function generarNumeroAleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Crea un array con valores aleatorios para x && y utilizando el ancho y alto de la imagen
 * @param {number} width es el ancho de la imagen
 * @param {number} height es el alto de la imagen
 * @param returns el array creado con su alto y ancho
 */
function crearArray(width, height){
  let array = [];
  for (let i = 0; i < height; i++) {
    for (let i = 0; i < width; i++) {
      array.push({ x: generarNumeroAleatorio(1, width), y: generarNumeroAleatorio(1, height) });
    }
  }
  return array;
}

/**
 * @param {array} arrayObjetivo array en donde buscaremos
 * @param {{x, y}} individuo coordenada del punto a comparar
 * @param returns cantidad de similitudes
 */
function contarSimilitudes(arrayObjetivo, individuo) {
  let similitudes = 0;
  for (let i = 0; i < individuo.length; i++) {
    if (verificarCoordenadas(arrayObjetivo, individuo[i].x, individuo[i].y)) {
      similitudes++;
    }
  }
  return similitudes;
}

/**
 * Verifica quien es el mejor entre padre, madre e hijo
 * @param {aray} arrayObjetivo array en donde buscaremos el mejor
 * @param {{x, y}} padre coordenadas del padre
 * @param {{x, y}} madre coordenadas de la madre
 * @param {{x, y}} hijo coordenadas del hijo
 * @returns el mejor de los comparados para guardarlo como nuevo padre
 */
function best(arrayObjetivo, padre, madre, hijo) {
  const similitudesPadre = contarSimilitudes(arrayObjetivo, padre);
  const similitudesMadre = contarSimilitudes(arrayObjetivo, madre);
  const similitudesHijo = contarSimilitudes(arrayObjetivo, hijo);

  if (similitudesPadre >= similitudesMadre && similitudesPadre >= similitudesHijo) {
    return padre;
  } else if (similitudesMadre >= similitudesPadre && similitudesMadre >= similitudesHijo) {
    return madre;
  } else {
    return hijo;
  }
}

/**
 * Combina un porcentaje de los hijos
 * @param {{x, y}} padre coordenadas del padre
 * @param {{x, y}} madre coordenadas de la madre
 * @param {number} width ancho de la imagen, para que no exceda el x del padre y madre
 * @param {number} numHijos cantidad de hijos por generación
 * @param {array} puntosNegros para sacar el fitness
 * @returns el mejor de los comparados para guardarlo como nuevo padre
 */
function crossover(padre, madre, width, numHijos, puntosNegros) {
  let nuevosHijos = [];

  //for (let n = 0; (n < numHijos) && (n <= numHijos*tasaCombinacion) ; n++) {
    for (let n = 0; n <= numHijos*tasaCombinacion ; n++) {
    let nuevoHijo = [];

    for (let i = 0; i < width; i++) {
      let aleatorio = Math.round(Math.random());

      if (aleatorio === 1) {
        nuevoHijo.push({ x: padre[i].x, y: padre[i].y });
      } else {
        nuevoHijo.push({ x: madre[i].x, y: madre[i].y });
      }
    }
    nuevosHijos.push(nuevoHijo);
  }

  let mejorHijo = nuevosHijos[0];
  let mejorFitness = contarSimilitudes(puntosNegros, mejorHijo);

  for (let i = 1; i < nuevosHijos.length; i++) {
    let fitness = contarSimilitudes(puntosNegros, nuevosHijos[i]);
    if (fitness > mejorFitness) {
      mejorHijo = nuevosHijos[i];
      mejorFitness = fitness;
    }
  }

  return mejorHijo;
}

/**
 * Muta un porcentaje de los hijos
 * @param {array} arrayObjetivo en donde se verifican las coordenadas
 * @param {array} array donde contiene los hijos por generación
 * @param {number} width ancho de la imagen, para que no exceda el numero aleatorio
 * @param {number} height alto de la imagen para que no exceda el numero aleatorio
 * @returns el array con los hijos mutados
 */
function mutacion(arrayObjetivo, array, width, height) {
  for (let i = 0; i < array.length; i++) {
    if (!verificarCoordenadas(arrayObjetivo, array[i].x, array[i].y)) {
      if (Math.random() < tasaMutacion) {
        let x = generarNumeroAleatorio(1, width);
        let y = generarNumeroAleatorio(1, height);
        array[i].x = x;
        array[i].y = y;
      }
    }
  }
  return array;
}

/**
 * Agrega los valores x y y que estan correctos 
 * @param {array} puntosNegros array que contiene los puntos buenos que se van encontrando
 * @param {{x, y}} padre coordenada del mejor padre que se encontro
 * @returns el array con un punto mas para la imagen
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


/**====================================================================
 * Main del programa.
 =====================================================================*/
async function runGeneticAlgorithm() {
  //=================================================================================================================
  //CREAMOS LA VARIABLE PARA ALMACENAR LOS PUNTOS X y Y de la imagen del usuario
  const puntosNegros = []                      // array de la imagen del usuario
  const image1 = await Jimp.read(imagePath1);  // imagen del usuario
  const width = image1.getWidth();             // ancho
  const height = image1.getHeight();           // alto
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel1 = Jimp.intToRGBA(image1.getPixelColor(x, y));
      const nivelGris = (pixel1.r + pixel1.g + pixel1.b) / 3; // Promedio de los rgb

      
      if (nivelGris <= 30) { // Si el nivel de gris es menor o igual a 30 / si cada codigo es 10 max
        puntosNegros.push({ x, y });
      }
    }
  }
  //console.log(puntosNegros)

  //================================================================================================================
  let comun = findCommonElements(image1, puntosNegros, width, height)  // almacena cuantos elementos tienen en comun
  let gen = 1
  let puntosNegrosFinal = [] // array para la creacion de la imagen

  //Poblacion inicial
  let padre = crearArray(width, height)
  let madre = crearArray(width, height)
  let hijo = crossover(padre, madre, width, hijosPorGen, puntosNegros) // 10, numero de hijos que se crean

  while (gen <= maxGeneraciones){   // realizamos el ciclo para intentar recrear la imagen de manera genetica

    // si ya tienen los mismos elementos en comun, sale
    if(comun === findCommonElements(image1, puntosNegrosFinal, width, height)){
      console.log("Mismos elementos en comun")
      break;
    }

    puntosNegrosFinal = agregaPuntosNegros(puntosNegros, padre);

    padre = best(puntosNegros, padre, madre, hijo);

    //hijo = crossover(padre, madre, width, 10, puntosNegros)
    hijo = crossover(padre, madre, width, hijosPorGen, puntosNegros)
    hijo = mutacion(puntosNegros, hijo, width, height);
    madre = mutacion(puntosNegros, madre, width, height);

    //console.log(findCommonElements(image1, puntosNegrosFinal, width, height)) // imprime las similitudes que tenga la imagen del usuario y la imagen final

    gen++ //generacion

  }
  

  //crearImagen(imagePath, puntosNegrosFinal)

  return 
}


function actualizarGrafico() {
  let valor = Math.random() * 10; // Genera un nuevo valor aleatorio

  // Actualizar los datos
  data.labels.push(data.labels.length + 1); // Agregar una nueva etiqueta en el eje x
  data.datasets[0].data.push(valor); // Agregar un nuevo valor en la serie de datos

  // Crear o actualizar el gráfico
  if (window.graficoLineal) {
    window.graficoLineal.update(); // Actualizar el gráfico existente
  } else {
    const ctx = document.getElementById("grafico-lineal").getContext("2d");
    window.graficoLineal = new Chart(ctx, {
      type: "line", // Tipo de gráfico lineal
      data: data,
      options: options
    });
  }
}

runGeneticAlgorithm();


