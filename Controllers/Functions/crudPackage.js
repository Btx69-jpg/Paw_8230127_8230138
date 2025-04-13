const fs = require('fs');

async function updatePackage(oldFile, newFile) {
    try {
        fs.renameSync(oldFile, newFile);
        console.log('Pasta renomeada com sucesso!');
    } catch (err) {
        console.error('Erro ao renomear a pasta:', err);
    }
}

function deletePackage(path) {
    try {
        fs.rmSync(path, { recursive: true, force: true });
        console.log('Pasta apagada com sucesso!');
    } catch (err) {
        console.error('Erro ao apagar a pasta:', err);
    }
}

module.exports = {
    updatePackage,
    deletePackage
};