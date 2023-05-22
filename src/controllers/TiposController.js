const connection = require('../database/connection');

module.exports = {   
    async index (request, response) {
        let status = 'A';
        const tipos = await connection('tipcontratos')
        .select('*');
    
        return response.json(tipos);
    },    

    async create(request, response) {
        const {tipDescricao, tipParcelas } = request.body;
        const [idTip] = await connection('tipcontratos').insert({
            tipDescricao, 
            tipParcelas   
        });
           
        return response.json({idTip});
    },

    async updateTip(request, response) {
        let id = request.params.tipId;         
        
        const { tipDescricao, tipParcelas } = request.body;
         await connection('tipcontratos').where('idTip', id)   
        .update({
            tipDescricao,
            tipParcelas         
        });
           
        return response.status(204).send();
    },
    
};