const connection = require('../database/connection');

module.exports = {   
    async index (request, response) {
        let status = 'A';
        const secretarias = await connection('secretarias')
        .where('secStatus', status)
        .select('*');
    
        return response.json(secretarias);
    },    

    async create(request, response) {
        const { secCodigo, secDescricao, secOrgAdm } = request.body;
        let status = 'A';
        const [secId] = await connection('secretarias').insert({
            secCodigo,
            secDescricao, 
            secOrgAdm,   
            secStatus: status    
        });
           
        return response.json({secId});
    },

    async searchSec (request, response) {
        let id = request.params.idSec;
        let status = 'A';
        const secretaria = await connection('secretarias')
        .where('secId', id)
        .where('secStatus', status)
        .select('*');

        return response.json(secretaria);
    },    

    async updateSec(request, response) {
        let id = request.params.idSec;         
        
        const { secCodigo, secDescricao, secOrgAdm } = request.body;
        let datUpdate = new Date();
        await connection('secretarias').where('secId', id)   
        .update({
            secCodigo,
            secDescricao,
            secOrgAdm           
        });
           
        return response.status(204).send();
    },
    
    async deleteSec(request, response) {
        let id = request.params.idSec;         
        
        let status = 'E';
        let datUpdate = new Date();
        await connection('secretarias').where('secId', id)   
        .update({
            secStatus: status           
        });
           
        return response.status(204).send();
    },
};