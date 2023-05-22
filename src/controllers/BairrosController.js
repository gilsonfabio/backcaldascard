const connection = require('../database/connection');

module.exports = {   
    async index (request, response) {
        const bairros = await connection('bairros')
        .orderBy('baiDescricao')
        .select('*');
    
        return response.json(bairros);
    },    

    async create(request, response) {
        const { baiDescricao } = request.body;
 
        const [baiId] = await connection('bairros').insert({
            baiDescricao
        });
           
        return response.json({baiId});
    },

    async searchBairro (request, response) {
        let id = request.params.idBai;

        const bairro = await connection('bairros')
        .where('baiId', id)
        .select('*');

        return response.json(bairro);
    },    

    async updBairro(request, response) {
        let id = request.params.idBai;         
        const { baiDescricao } = request.body;
        
        await connection('bairros').where('baiId', id)   
        .update({
            baiDescricao                  
        });
           
        return response.status(204).send();
    },
};