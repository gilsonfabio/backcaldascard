const connection = require('../database/connection');

module.exports = {   
    async index (request, response) {
        const taxas = await connection('txaadmin').select('*');
    
        return response.json(taxas);
    },    

    async create(request, response) {
        const { txaPlano, txaConvenio, txaAno, txaMes, txaDescricao, txaPerc } = request.body;
 
        const [txaId] = await connection('txaadmin').insert({
            txaPlano,
            txaConvenio, 
            txaAno, 
            txaMes, 
            txaDescricao, 
            txaPerc       
        });
           
        return response.json({txaId});
    },

    async searchTxaAdm (request, response) {
        let id = request.params.idTxa;

        const taxa = await connection('txaadmin')
        .where('txaId', id)
        .select('*');

        return response.json(taxa);
    },    
};