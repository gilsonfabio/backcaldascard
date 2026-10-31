const express = require('express');
const cors = require('cors');
const routes = require('./routes');

require('dotenv/config');

const app = express();

app.use(cors());

app.use(express.json());

app.use(routes);

// Ambiente local: inicia o servidor Express.
// Vercel: exporta a aplicação para execução serverless.
if (!process.env.VERCEL) {
    const port = process.env.PORT || 3333;

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

module.exports = app;
