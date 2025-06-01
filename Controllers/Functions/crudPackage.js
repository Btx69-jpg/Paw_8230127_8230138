const fs = require('fs');

function createPackage(path) {
    try {
        fs.mkdirSync(path, { recursive: true });
    } catch (err) {
        console.error('Erro ao renomear a pasta:', err);
    }
}

async function updatePackage(oldFile, newFile) {
    try {
        fs.renameSync(oldFile, newFile);
    } catch (err) {
        console.error('Erro ao renomear a pasta:', err);
    }
}

function deletePackage(path) {
    try {
        fs.rmSync(path, { recursive: true, force: true });
    } catch (err) {
        console.error('Erro ao apagar a pasta:', err);
    }
}

module.exports = {
    createPackage,
    updatePackage,
    deletePackage
};