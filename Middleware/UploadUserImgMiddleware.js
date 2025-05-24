const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storageUpdatefPerfilPhoto = multer.diskStorage({
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
    
const uploadUpdatePhoto = multer({ storage: storageUpdatefPerfilPhoto })

module.exports = uploadUpdatePhoto