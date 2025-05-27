const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storageCreatePhoto = multer.diskStorage({
    destination: function (req, file, cb) {        
        const dest = `public/images/Restaurants/${req.body.nameRest}/Comments`;
        console.log("Destino: ", dest);
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext); 
        cb(null, `${base}-${Date.now()}${ext}`);
    }
}) 

const createPhoto = multer({ storage: storageCreatePhoto })

const storageUpdatePhoto = multer.diskStorage({
    destination: function (req, file, cb) {
        const dest = "public/images/Users/User/";

        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext); 
        cb(null, `${base}-${Date.now()}${ext}`);
    }
})
    
const uploadUpdatePhoto = multer({ storage: storageUpdatePhoto })

module.exports = {
    uploadUpdatePhoto,
    createPhoto
}