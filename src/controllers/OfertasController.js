const connection = require('../database/connection');

module.exports = {   
    async index (request, response) {
        const ofertas = await connection('ofertas')
        .orderBy('idOfe')
        .select('*');
    
        return response.json(ofertas);
    },    
   
};
