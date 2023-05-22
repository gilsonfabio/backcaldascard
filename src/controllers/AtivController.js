const connection = require('../database/connection');

module.exports = {   
    async index (request, response) {
        let status = "A";
        const atividades = await connection('atividades')
        .where('atvStatus', status)
        .select('*');
    
        return response.json(atividades);
    },    

    async create(request, response) {
        const {atvDescricao, atvTaxAdm } = request.body;
        let status = "A";
        const [atvId] = await connection('atividades').insert({
            atvDescricao,
            atvTaxAdm,
            atvStatus: status        
        });
           
        return response.json({atvId});
    },

    async searchAtiv (request, response) {
        let id = request.params.idAtv;
        let status = "A";
        const atividade = await connection('atividades')
        .where('atvId', id)
        .where('atvStatus', status)
        .select('*');

        return response.json(atividade);
    },

    async updateAtiv(request, response) {
        let id = request.params.idAtv;         
        
        const { atvDescricao, atvTaxAdm } = request.body;
        let datUpdate = new Date();
        await connection('atividades').where('atvId', id)   
        .update({
            atvDescricao,
            atvTaxAdm,           
        });
           
        return response.status(204).send();
    },
    
    async deleteAtiv(request, response) {
        let id = request.params.idAtv;         
        
        let status = 'E';
        let datUpdate = new Date();
        await connection('atividades').where('atvId', id)   
        .update({
            atvStatus: status           
        });
           
        return response.status(204).send();
    },
};