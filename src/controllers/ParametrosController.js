const crypto = require('crypto');
const { addListener } = require('../database/connection');
const connection = require('../database/connection');

module.exports = {   
    async index (request, response) {
        let id = 1;
        const params = await connection('parametros')
        .where('parId', id)
        .select('parSeqCartao');
    
        console.log(params);
        
        var sequencia = parseInt(params[0].parSeqCartao) - 1; 
        await connection('parametros').where('parId', id)   
        .update({
            parSeqCartao: sequencia,                       
        });

        return response.json(params);
    },  
    
    async updParam(request, response) {
        let id = request.params.idPar;         
        
        const { parSeqCartao } = request.body;
        console.log(parSeqCartao);

        let datUpdate = new Date();
        await connection('parametros').where('parId', id)   
        .update({
            parSeqCartao,                       
        });
           
        return response.status(204).send();
    },
};
