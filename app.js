const express = require('express');
const fileUpload = require('express-fileupload');
const Jimp = require('jimp');
const path = require('path');
const { read, intToRGBA,cssColorToHex } = require('jimp');
const app = express();
const port = 3000;
const imagePath1 = 'public/imagen_objetivo.png';  //imagen del usuario
const imagePath = 'public/imagen_final.png';     //base de la imagen, imagen blanca para escribir
const generaciones = 5;
const tasaMutacion = 0.2; // 20% de los genes se mutarán
app.use(fileUpload());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/process-image', (req, res) => {
  if (!req.files || !req.files.image) {
    return res.status(400).send('No se encontró ninguna imagen.');
  }

  const image = req.files.image;

  Jimp.read(image.data)
    .then((targetImage) => {
      targetImage.writeAsync(path.join(__dirname, 'public/imagen_objetivo.png'));

      const targetPixels = targetImage.bitmap.data;

      new Jimp(targetImage.getWidth(), targetImage.getHeight(), '#FFFFFF', (err, imagenFinal) => {
        if (err) throw err;

        imagenFinal.write(path.join(__dirname, 'public/imagen_final.png'), (err) => {
          if (err) throw err;

          console.log('Imagen final creada correctamente.');



          function findCommonElements(image1, comparador, width, height) {
            const puntosNegros = [];
          
          
            for (let y = 0; y < height; y++) {
              for (let x = 0; x < width; x++) {
                const pixel1 = intToRGBA(image1.getPixelColor(x, y));
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
          
          async function crearImagen(imagePath, coordenadas) {
            const image = await read(imagePath);
            const black = cssColorToHex('#000000');
          
            //console.log(coordenadas)
          
            coordenadas.forEach(coord => {
              const { x, y } = coord;
              image.setPixelColor(black, x, y);
            });
          
            const outputImagePath = 'public/imagenFinalFinal.png';
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
          
            for (let i = 0; i < height; i++) {
              for (let i = 0; i < width; i++) {
                array.push({ x: generarNumeroAleatorio(1, width), y: generarNumeroAleatorio(1, height) });
              }
            }
          
            return array
          }
          
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
           * @param {*} arrayObjetivo 
           * @param {*} padre 
           * @param {*} madre 
           * @param {*} hijo 
           * @returns 
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
          
          function crossover(padre, madre, width, numHijos, puntosNegros) {
            let nuevosHijos = [];
          
            for (let n = 0; n < numHijos; n++) {
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
            console.log("entre");
            //=================================================================================================================
            //CREAMOS LA VARIABLE PARA ALMACENAR LOS PUNTOS X y Y de la imagen del usuario
            const puntosNegros = []                      // array de la imagen del usuario
            console.log(imagePath1)
            const image1 = await read(imagePath1);  // imagen del usuario
            const width = image1.getWidth();             // ancho
            const height = image1.getHeight();           // alto
          
            console.log("entre");
          
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              const pixel1 = intToRGBA(image1.getPixelColor(x, y));
              const nivelGris = (pixel1.r + pixel1.g + pixel1.b) / 3; // Promedio de los rgb
          
              
              if (nivelGris <= 30) { // Si el nivel de gris es menor o igual a 30 / si cada codigo es 10 max
                puntosNegros.push({ x, y });
              }
            }
          }
          console.log(puntosNegros)
            //================================================================================================================
            let comun = findCommonElements(image1, puntosNegros, width, height)  // almacena cuantos elementos tienen en comun
            let gen = 1
            let puntosNegrosFinal = [] // array para la creacion de la imagen
          
            //padre = [{x: 3, y: 3}]  este es el formato
            //madre = [{x: 4, y: 6}]
            let padre = crearArray(width, height)
            let madre = crearArray(width, height)
            let hijo = crossover(padre, madre, width, 10, puntosNegros) // 10, numero de hijos que se crean
          
            while (gen <= 20){   // realizamos el ciclo para intentar recrear la imagen de manera genetica
          
              // si ya tienen los mismos elementos en comun, sale
              if(comun === findCommonElements(image1, puntosNegrosFinal, width, height)){
                console.log("Mismos elementos en comun")
                break;
          
              }   
              puntosNegrosFinal = agregaPuntosNegros(puntosNegros, padre);
          
              padre = best(puntosNegros, padre, madre, hijo);
          
              hijo = crossover(padre, madre, width, 10, puntosNegros)
              hijo = mutacion(puntosNegros, hijo, width, height);
              madre = mutacion(puntosNegros, madre, width, height);
          
              console.log(findCommonElements(image1, puntosNegrosFinal, width, height)) // imprime las similitudes que tenga la imagen del usuario y la imagen final
              console.log(gen)
              gen++ //generacion
            }
            console.log(findCommonElements(image1, puntosNegros, width, height))
            console.log(findCommonElements(image1, puntosNegrosFinal, width, height))
            crearImagen(imagePath, puntosNegrosFinal)
          
            return
          }
          
          runGeneticAlgorithm()
       


        });

          res.sendFile(path.join(__dirname, 'result.html'));



      });
    })
    .catch((err) => {
      console.error('Error al cargar la imagen objetivo:', err);
      res.status(500).send('Error al cargar la imagen objetivo.');
    });
});



app.listen(port, () => {
  console.log(`La aplicación está en funcionamiento en http://localhost:${port}`);
});