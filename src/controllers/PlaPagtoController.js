const connection = require('../database/connection');

module.exports = {   
    async index (request, response) {
        const plapagtos = await connection('plapagtos').select('*');
    
        return response.json(plapagtos);
    },    

    async create(request, response) {
        const { pgtQtdParc, pgtDescricao } = request.body;
 
        const [pgtId] = await connection('plapagtos').insert({
            pgtQtdParc,
            pgtDescricao        
        });
           
        return response.json({pgtId});
    },

    async searchPlaPagto (request, response) {
        let id = request.params.idSec;

        const plapagto = await connection('plapagtos')
        .where('pgtId', id)
        .select('*');

        return response.json(plapagto);
    },    
};