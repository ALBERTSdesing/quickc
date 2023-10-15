const { Router } = require('express');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const expressFileUpload = require('express-fileupload');

const router = Router();
//////////////////////////////GET///////////////////////////////////////
router.get('/', (req, res) => {
    const indexPath = path.join(__dirname, '..','index.html');
    res.sendFile(indexPath);
  });
  
  router.get('/video', (req, res) => {
    const videoPath = path.join(__dirname, '..','public','videoconverter.html');
    res.sendFile(videoPath);
  });
  
  router.get('/imagen', (req, res) => {
    const imagePath = path.join(__dirname, '..','public','imageconverter.html');
    res.sendFile(imagePath);
  });
  
  router.get('/document', (req, res) => {
    const docPath = path.join(__dirname, '..','public','documentconverter.html');
    res.sendFile(docPath);
  });
  
////////////////////////////POST/////////////////////////////////////////////
//Image 
  router.post('/uploadImage', (req, res) => {
    const { filename } = req.file;//se obtiene el nombre del archivo
    const inputImagePath = path.join(__dirname, '../public/uploads', filename); //ruta archivo entrada
    const selectedFormat = req.body.format; //se obitene el formato solicitado
    const outputFilename = `${filename.split('.')[0]}_converted.${selectedFormat}`;//se nombra el archivo de salida
    const outputImagePath = path.join(__dirname, '../public/uploads', outputFilename); //Ruta archivo de salida

    sharp(inputImagePath)
        .toFormat(selectedFormat)
        .toBuffer((err, buffer) => {
            if (err) {
                console.error(err);
                const errorMessage = 'Error al convertir la imagen';
                res.status(500).json({ error: errorMessage });
                return;
            }

            res.set('Content-Disposition', `attachment; filename=converted.${selectedFormat}`);
            res.send(buffer);

            fs.unlink(inputImagePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error(unlinkErr);
                }
            });
            fs.unlink(outputImagePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error(unlinkErr);
                }
            });
        });
});

router.post('/convertvideo', (req, res) => {
    const video = req.file; // Recibe el archivo de video
    const format = req.body.to; // Recibe la extensión
    
    if (!video) {
      return res.status(400).send('No se ha proporcionado un archivo.');
    } 
  
    // Generar una ruta temporal para el archivo de entrada
    const inputVideoPath = path.join(__dirname, '../public/uploads', video.filename);
  
    // Generar la ruta del archivo de salida
    const outputFilename = `${video.filename.split('.')[0]}_converted.${format}`;
    const outputVideoPath = path.join(__dirname, '../public/uploads', outputFilename);
  
    // Ejecutar la conversión utilizando fluent-ffmpeg
    ffmpeg(inputVideoPath)
      .output(outputVideoPath)
      .on('end', () => {
        // Enviar el archivo convertido al cliente
        res.download(outputVideoPath, `converted.${format}`, (err) => {
          if (err) {
            console.error('Error al descargar el archivo convertido:', err);
          }
  
          // Limpiar los archivos temporales después de la conversión y descarga
          fs.unlink(inputVideoPath, (err) => {
            if (err) {
              console.error('Error al eliminar el archivo de entrada:', err);
            }
          });
  
          fs.unlink(outputVideoPath, (err) => {
            if (err) {
              console.error('Error al eliminar el archivo convertido:', err);
            }
          });
        });
      })
      .on('error', (err) => {
        console.error('Error durante la conversión:', err);
        res.status(500).send('Error durante la conversión.');
      })
      .run();
  });

  module.exports = router; //Es como un return