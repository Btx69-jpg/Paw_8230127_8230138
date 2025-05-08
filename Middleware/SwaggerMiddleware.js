const fs = require('fs');
const path = require('path');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const router = express.Router();
const mainSpec = require('../swagger/swagger.json');

const pathsDir = path.join(__dirname, '../swagger/paths');
const mergedPaths = {};

fs.readdirSync(pathsDir).forEach(file => {
    if (file.endsWith('.json')) {
        const doc = require(path.join(pathsDir, file));
        if (doc.paths) {
            Object.assign(mergedPaths, doc.paths);
        }
    }
});

mainSpec.paths = mergedPaths;

router.get('/swagger.json', (req, res) => {
    res.json(mainSpec);
});

const options = {
    swaggerOptions: {
        url: '/api-docs/swagger.json'
    }
};

var userRouter = require("../routes/RestApi/user.js");

router.use('/', swaggerUi.serveFiles(null, options), swaggerUi.setup(null, options));
router.use('/api/v1', userRouter);
module.exports = router;