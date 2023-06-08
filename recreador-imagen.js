///////////////////////////////////////////////////
//              VARIABLES GLOBALES               //
///////////////////////////////////////////////////

//Variables para trabajar las imagenes
const Jimp = require('jimp');
const imagePath1 = 'public/calavera.jpeg';       //imagen del usuario
const imagePath = 'public/imagen_final.png';     //base de la imagen, imagen blanca para escribir

//Variables para el Algoritmo Genético
const maxGeneraciones = 50; //cantidad de generaciones
const tasaMutacion = 0.4;    //20% de los genes se mutarán
const tasaCombinacion = 0.4;  //cantidad de combinados
const tasaSeleccion = 0.1;  //cantidad de hijos que pasan a la otra generacion

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
 * @returns true en caso de que las coordenadas existan y false lo contrario
 */
function verificarCoordenadas(coordenadas, x, y) {
  return coordenadas.some(coordenada => coordenada.x === x && coordenada.y === y);
}

/**
 * Funcion que genera números aleatorios con intervalos específicos, los dos intervalos incluidos
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
 * @returns el array creado con su alto y ancho
 */
function crearArray(width, height){
  let array = [];
  for (let i = 0; i < height; i++) {
    for (let i = 0; i < width; i++) {
      array.push({ x: generarNumeroAleatorio(1, width), y: generarNumeroAleatorio(1, height) });
    }
  }
  //[ {x,y}, {x,y}, {x,y}, {x,y}, ... ]
  return array;
}

/**
 * Cuenta la cantidad de coordenadas iguales que tiene el individuo en comparacion con el arrayObjetivo
 * @param {array} arrayObjetivo array en donde buscaremos
 * @param {[{x, y}, ...]} individuo coordenada del punto a comparar
 * @returns cantidad de similitudes
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
 * @param {[{x, y}, ...]} padre coordenadas del padre
 * @param {[{x, y}, ...]} madre coordenadas de la madre
 * @param {[{x, y}, ...]} hijo coordenadas del hijo
 * @returns el mejor de los comparados para guardarlo como nuevo padre
 */
function best(arrayObjetivo, padre, madre, hijo) {
  let similitudesPadre = contarSimilitudes(arrayObjetivo, padre);
  let similitudesMadre = contarSimilitudes(arrayObjetivo, madre);
  let similitudesHijo = contarSimilitudes(arrayObjetivo, hijo);

  if (similitudesPadre >=similitudesMadre && similitudesPadre >= similitudesHijo) {
    console.log("Padre")
    return padre;
  } else if (similitudesMadre >= similitudesPadre && similitudesMadre >= similitudesHijo) {
    console.log("madre")
    return madre;
  } else {
    console.log("hijo")
    return hijo;
  }
}

/**
 * Crea la generacion inicial de hijos a base de los padres generados aleatoriamente
 * @param {[{x, y}, ...]} padre arreglo de coordenadas del padre
 * @param {[{x, y}, ...]} madre arreglo de coordenadas de la madre
 * @param {number} width ancho de la imagen, para que no exceda el x del padre y madre
 * @param {number} numHijos cantidad de hijos por generación
 * @returns el mejor de los comparados para guardarlo como nuevo padre
 */
function crearGeneracion(padre, madre, width, numHijos,) {

  let nuevosHijos = [];

  for (let n = 0; n < numHijos ; n++) {
    let nuevoHijo = [];

    for (let i = 0; i < width; i++) {
      let aleatorio = Math.round(Math.random()); //redondea al entero mas cercano, un numero que se genera ente 0 y 1

      if (aleatorio === 1) {
        nuevoHijo.push({ x: padre[i].x, y: padre[i].y });
      } else {
        nuevoHijo.push({ x: madre[i].x, y: madre[i].y });
      }
    }
    nuevosHijos.push(nuevoHijo);
  }
  return nuevosHijos;
}

/**
 * Combina el padre y la madre enviados, aleatoriamente segun el numero generado se agarra un "x" y una "y", o sea {x, y}
 * del padre o de la madre
 * @param {[{x, y}, ...]} padre arreglo de coordenadas del padre
 * @param {[{x, y}, ...]} madre arreglo de coordenadas de la madre
 * @returns el nuevo array(hijo) a base de los padres
 */
function crossOver(padre, madre) {
  let nuevoHijo = [];
  for (let i = 0; i < padre.length; i++) {
    let aleatorio = Math.round(Math.random()); //redondea al entero mas cercano, un numero que se genera ente 0 y 1
    if (aleatorio === 1) {
      nuevoHijo.push(padre[i]);
    }else{
      nuevoHijo.push(madre[i]);
    }
  }
  return nuevoHijo;
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

/*****************************************************************************************
 * Main del programa.
 *****************************************************************************************/
async function runGeneticAlgorithm() {
  //Medimos el tiempo total
  let inicio = Date.now();

  //=================================================================================================================
  //CREAMOS LA VARIABLE PARA ALMACENAR LOS PUNTOS X y Y de la imagen del usuario
  const puntosNegros = []                      // array de la imagen del usuario
  const image1 = await Jimp.read(imagePath1);  // imagen del usuario
  const width = image1.getWidth();             // ancho
  const height = image1.getHeight();           // alto

  var hijosPorGen = 50;     //cantidad de hijos por generación
  var fitnessPromedio = 0;  
  var mejorFitnessPorGen = [];
  var selection = [];   //hijos que son el porcentaje de seleccion, para dejarlos para la proxima generacion
  var mutation = [];    //hijos que son el porcentaje de mutacion, para mutarlos
  var hijosMutados =[]; //los hijos mutados
  var combination = []; //hijos que son el porcentaje de combination, para combinarlos
  var hijosDeCombinacion = [];  //los hijos combinados

  //Variables de tiempo
  var tiempoTotal = 0;        //tiempo de ejecucion del algoritmo
  var tPromPorGen = 0;        //tiempo promedio entre generaciones

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel1 = Jimp.intToRGBA(image1.getPixelColor(x, y));
      const nivelGris = (pixel1.r + pixel1.g + pixel1.b) / 3; // Promedio de los rgb
      if (nivelGris <= 30) { // Si el nivel de gris es menor o igual a 30 / si cada codigo es 10 max
        puntosNegros.push({ x, y });
      }
    }
  }

  //================================================================================================================
  let comun = findCommonElements(image1, puntosNegros, width, height)  // almacena cuantos elementos tienen en comun
  let gen = 1
  let puntosNegrosFinal = [] // array para la creacion de la imagen

  //Poblacion inicial
  let padre = crearArray(width, height)
  let madre = crearArray(width, height)

  //Formato de la generacion:  [ [{x,y}, {x,y}, {x,y}, {x,y}], [{x,y}, {x,y}, {x,y}, {x,y}], ... ]
  let generacion = crearGeneracion(padre, madre, width, hijosPorGen, puntosNegros);

  //Para calcular el tiempo promedio entre generaciones
  let inicioTPorGeneracion = Date.now();
  
  //Se denotan los porcentajes para seleccion, mutacion y combinacion,
  //no es exacto para caulquier cantidad de hijos por temas de decimales,
  let cantSelec = Math.trunc(hijosPorGen * tasaSeleccion);
  let cantMut = Math.trunc(hijosPorGen * tasaMutacion);
  let cantComb = Math.trunc(hijosPorGen * tasaCombinacion);

  //si hubiese un sobrante se agregaria a la cantidad de seleccioandos
  if ((cantSelec + cantMut + cantComb) < hijosPorGen) {
    cantSelec += hijosPorGen - (cantSelec + cantMut + cantComb);
  }

  //si se documentan, sale mejor
  padre = []
  madre = []

  // realizamos el ciclo para intentar recrear la imagen de manera genetica
  while (gen <= maxGeneraciones){

    // si ya tienen los mismos elementos en comun, sale
    if(comun === findCommonElements(image1, puntosNegrosFinal, width, height)){
      console.log("Mismos elementos en comun")
      break;
    }

    var copiahijosPorGen = hijosPorGen;

    //Para sacar la cantidad de seleccionados
    for (let i = 0; i < cantSelec; i++) {
      //Le quitamos uno por temas de indice, luego se resta el i, para que se limite el intervalo
      //ya que vamos recortando el array generacion
      hijo = generacion[generarNumeroAleatorio(0, (copiahijosPorGen - 1) - i)];
      selection.push(hijo);
      //Le decimos que borre ese hijo de la generacion
      generacion.splice(generacion.indexOf(hijo), 1)
      if (i === (cantSelec - 1)) {  //Valida si estamos en el ultimo ciclo
        //actualizamos la cantidad de hijos en el ultimo ciclo,
        //para usar la cantidad como intervalo en el proximo ciclo
        copiahijosPorGen -= cantSelec;
      }
    }

    //Para sacar la cantidad de los individuos para mutacion
    for (let i = 0; i < cantMut; i++) {
      //Le quitamos uno por temas de indice, luego se resta el i, para que se limite el intervalo
      //ya que vamos recortando el array generacion
      hijo = generacion[generarNumeroAleatorio(0, (copiahijosPorGen - 1) - i)];
      mutation.push(hijo);
      //Le decimos que borre ese hijo de la generacion
      generacion.splice(generacion.indexOf(hijo), 1)
      if (i === (cantMut - 1)) {  //Valida si estamos en el ultimo ciclo
        //actualizamos la cantidad de hijos en el ultimo ciclo,
        //para usar la cantidad como intervalo en el proximo ciclo
        copiahijosPorGen -= cantMut;
      }
    }

    //Para sacar la cantidad de los individuos para combinacion
    for (let i = 0; i < cantComb; i++) {
      //Le quitamos uno por temas de indice, luego se resta el i, para que se limite el intervalo
      //ya que vamos recortando el array generacion
      hijo = generacion[generarNumeroAleatorio(0, (copiahijosPorGen - 1) - i)];
      combination.push(hijo);
      //Le decimos que borre ese hijo de la generacion
      generacion.splice(generacion.indexOf(hijo), 1)
      if (i === (cantComb - 1)) {  //Valida si estamos en el ultimo ciclo
        copiahijosPorGen -= cantComb;
      }
    }
    generacion = []; //se limpia para meter los hijos trabajados luego

    //-----------Vamos a mutar todos los hijos del porcentaje que es para mutacion-----------
    for (let i = 0; i < mutation.length; i++) {
      hijosMutados.push(mutacion(puntosNegros, mutation[i], width, height));
    }

    //-----------Vamos a combinar los hijos del porcentaje que es para combinacion-----------
    while (true) {
      let random1 = generarNumeroAleatorio(0, combination.length - 1);
      let random2 = generarNumeroAleatorio(0, combination.length - 1);
      hijosDeCombinacion.push(crossOver(combination[random1], combination[random2]));
      //Cuando ya halla la misma cantidad de hijos (producto de la combinacion) que
      //los padres(la lista con el porcentaje de hijos para combinar) se termina de combinar
      if (hijosDeCombinacion.length === combination.length) {
        break;
      }
    }

    generacion = [...selection, ...hijosMutados, ...hijosDeCombinacion];

    //Se limpian las listas para la proxima generacion
    selection = [];
    mutation = [];
    hijosMutados = []
    combination = [];
    hijosDeCombinacion = [];

    let mejorFitness = 0
    for (let i = 0; i < generacion.length; i++) {
      fitnessPorHijo = contarSimilitudes(puntosNegros, generacion[i]);
      if (fitnessPorHijo > mejorFitness) {
        mejorFitness = fitnessPorHijo;
        hijo = generacion[i];
      }
    }
    mejorFitnessPorGen.push(mejorFitness);

    padre = best(puntosNegros, padre, madre, hijo)

    madre = hijo
    madre = mutacion(puntosNegros, puntosNegrosFinal, width, height)
    hijo = mutacion(puntosNegros, puntosNegrosFinal, width, height)
    
    console.log(padre)

    puntosNegrosFinal = agregaPuntosNegros(puntosNegros, padre);

    // imprime las similitudes que tenga la imagen del usuario y la imagen final
    console.log("Fitness de la imagen en el proceso: ",findCommonElements(image1, puntosNegrosFinal, width, height))
    console.log("Generacion numero: ", gen)

    //Primero sumamos los tiempos de cada generación
    tPromPorGen += Date.now() - inicioTPorGeneracion;

    //Actualizamos el tiempo de inicio antes de la nueva generacion
    inicioTPorGeneracion = Date.now();

    gen++ //generacion
  }

  console.log("\n=========================================")
  //Sacamos el fitness promedio dividiendo entre la cantidad de generaciones
  fitnessPromedio = fitnessPromedio / maxGeneraciones;
  console.log("El fitness promedio es:", fitnessPromedio)

  //Sacamos el tiempo promedio dividiendo entre la cantidad de generaciones
  tPromPorGen = (tPromPorGen / maxGeneraciones) / 1000; //de milisegundos a segundos

  console.log("Pixeles negros de la imagen objetivo:", findCommonElements(image1, puntosNegros, width, height))
  console.log("Pixeles negros de la imagen final:",findCommonElements(image1, puntosNegrosFinal, width, height))
  crearImagen(imagePath, puntosNegrosFinal)

  //Medimos el tiempo total
  let final = Date.now();
  tiempoTotal = (final - inicio) / 1000; //de milisegundos a segundos

  console.log("El tiempo total es", tiempoTotal, "segundos.");
  console.log("El tiempo promedio por generacion es", tPromPorGen, "segundos.")

  return
}

runGeneticAlgorithm();

