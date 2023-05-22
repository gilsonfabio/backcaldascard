const crypto = require('crypto');
const connection = require('../database/connection');

module.exports = {   
    async index (request, response) {
        const users = await connection('filiacao')
        .orderBy('filNascimento')
        .select('*');
    
        return response.json(filiacao);
    },    

    async create(request, response) {
        const {filUsrId, filId, filNome, filNascimento } = request.body;

        const [filho] = await connection('filiacao').insert({
            filUsrId,
            filId,
            filNome,
            filNascimento,            
        });
           
        return response.json({filho});
    },
        
    async filiacao (request, response) {
        let id = request.params.usrId;
        const filhos = await connection('filiacao')
        .where('filUsrId', id)       
        .select(['*']);
        
        return response.json(filhos);
    },

    async searchFiliacao (request, response) {
        let usuario = request.params.idUsr;
        let filiacao = request.params.idFil;

        //console.log(usuario);
        //console.log(filiacao);        

        const filho = await connection('filiacao')
        .where('filUsrId', usuario)
        .where('filId', filiacao)       
        .select('*');
        
        //console.log(filho);

        return response.json(filho);
    },

    async updFiliacao(request, response) {
        let usuario = request.params.idUsr;
        let filiacao = request.params.idFil;
        const { filNome,
            filNascimento} = request.body;
        
        await connection('filiacao')
        .where('filUsrId', usuario)
        .where('filId', filiacao)   
        .update({
            filNome,
            filNascimento                          
        });
           
        return response.status(204).send();
    },

};
