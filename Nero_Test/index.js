const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const multer = require('multer');

const routesPath=require('./routes/routes')
const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.json());//no se que haga esta madre


//Archivos temporales
//////////////////////////////////////////////////////////////////////
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({ 
    destination: path.join(__dirname, 'public/uploads'),
    filename: (req, file, cb) => {
        cb(null, Date.now()+ file.originalname.slice(file.originalname.lastIndexOf('.')));
    }
});
 
app.use(multer({
    storage,
    limits: { fileSize: 500000000 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|avi|flv|mov|mp4|png|webp|tiff|svg/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname));
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("El archivo debe ser una imagen válida"));
    },
    onFileUploadError: (err) => {
        if (err instanceof multer.MulterError) {
            console.error('Error al subir el archivo: ' + err.message);
        } else {
            console.error('Error al subir el archivo: ' + err);
        }
        // En lugar de alert, maneja el error de acuerdo a tus necesidades
        // Por ejemplo, podrías enviar un mensaje de error al cliente
    }
}).single('file')); 



///////////////////////////////////////////////////////////////////////////
//Routes 
app.use(routesPath);


app.listen(port, () => {
  console.log('Server on port', port);
});

