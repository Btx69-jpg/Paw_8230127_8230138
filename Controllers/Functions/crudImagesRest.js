const multer = require('multer');
const fs = require('fs');

function deleteImage(image) {
    console.log("Apagar Imagem");
    fs.unlink(image, (err) => {
        if (err) {
            console.error('Erro ao apagar a imagem:', err);
            return;
        }
        console.log('Antiga Imagem apagada com sucesso!');
    })
}

async function saveImage(req, res) {
    return new Promise((resolve, reject) => {
        const storageLogo = multer.diskStorage({
            destination: function (req, file, cb) {
                const path = "public/images/Restaurants/" + req.body.name + "/";
                
                try {
                    fs.mkdirSync(path, { recursive: true });
                    console.log('Pasta criada com sucesso!');
                } catch (err) {
                    console.error('Erro ao criar a pasta:', err);
                }
                cb(null, path);
            },
            filename: function (req, file, cb) {
                cb(null, file.originalname);
            }
        });
          
        const uploadLogo = multer({ storage: storageLogo }).single('perfilPhoto');
        
        // Executa o middleware do multer e aguarda sua finalização
        uploadLogo(req, res, function(err) {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    }); 
}

async function updateImage(req, res, restaurant) {
    return new Promise((resolve, reject) => {
        const storageupdatLogo = multer.diskStorage({
            destination: function (req, file, cb) {
                let path = "public/images/Restaurants/" + restaurant.name + "/";
                let newPath = "";
                
                if(restaurant.name !== req.body.name) {
                    newPath = "public/images/Restaurants/" + req.body.name;
                    updatePackage(path, newPath);
                } else {
                    newPath = path;
                }
                
                cb(null, newPath);
            },
            filename: function (req, file, cb) {
                cb(null, `${file.originalname}`)
            }
        })
          
        const uploadupdatLogo = multer({ storage: storageupdatLogo }).single('perfilPhoto');
    
        uploadupdatLogo(req, res, function (err) {
            if (err) {
              return reject(err);
            }

            resolve();
        });
    })
}

module.exports = {
    deleteImage,
    saveImage,
    updateImage
}