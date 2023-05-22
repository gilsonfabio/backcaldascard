const connection = require('../database/connection');

module.exports = {   
    async index (request, response) {
        let status = 'A';
        const orgaos = await connection('orgadmin')
        .where('orgStatus', status)
        .select('*');
    
        return response.json(orgaos);
    },    

    async create(request, response) {
        const { orgDescricao } = request.body;
        let status = 'A';
        const [orgId] = await connection('orgadmin').insert({
            orgDescricao,
            orgStatus: status        
        });
           
        return response.json({orgId});
    },

    async searchOrg (request, response) {
        let id = request.params.idOrg;
        let status = 'A';
        const orgao = await connection('orgadmin')
        .where('orgId', id)
        .select('*');

        return response.json(orgao);
    },    

    async updateOrg(request, response) {
        let id = request.params.idOrg;         
        
        const { orgDescricao } = request.body;
        let datUpdate = new Date();
        await connection('orgadmin').where('orgId', id)   
        .update({
            orgDescricao,           
        });
           
        return response.status(204).send();
    },
    
    async deleteOrg(request, response) {
        let id = request.params.idOrg;         
        
        let status = 'E';
        let datUpdate = new Date();
        await connection('orgadmin').where('orgId', id)   
        .update({
            orgStatus: status           
        });
           
        return response.status(204).send();
    },
};