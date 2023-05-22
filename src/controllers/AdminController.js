const crypto = require('crypto');
const connection = require('../database/connection');

module.exports = {   
    async index (request, response) {
        const admins = await connection('administrator').select('*');
    
        return response.json(admins);
    },    

    async signIn(request, response) {
        let email = request.params.email;
        let senha = request.params.password;

        var encodedVal = crypto.createHash('md5').update(senha).digest('hex');
        const admin = await connection('administrator')
            .where('admEmail', email)
            .where('admSenha', encodedVal)
            .select('admId', 'admNome', 'admNivAcesso')
            .first();
          
        if (!admin) {
            return response.status(400).json({ error: 'Não encontrou usuario com este ID'});
        } 

        return response.json(admin);
    },

    async login(request, response) {
        const { email, password } = request.body;

        var senha = crypto.createHash('md5').update(password).digest('hex');
        const admin = await connection('administrator')
            .where('admEmail', email)
            .where('admSenha', senha)
            .select('admId', 'admNome', 'admNivAcesso')
            .first();
          
        if (!admin) {
            return response.status(400).json({ error: 'Não encontrou usuario com este ID'});
        } 

        return response.json(admin);
    },

    async create(request, response) {
        const { admNome, admSenha, admEmail, admNivAcesso } = request.body;
    
        var senha = crypto.createHash('md5').update(admSenha).digest('hex');
        var status = 'A';
        const [admId] = await connection('administrator').insert({
            admNome, 
            admSenha: senha, 
            admEmail,
            admNivAcesso,
            admStatus: status
        });
           
        return response.json({admId});
    },
     
    async searchAdmin (request, response) {
        let id = request.params.idAdm;
        const admin = await connection('administrator')
        .where('admId', id)        
        .select('admId', 'admNome', 'admNivAcesso');
        
        return response.json(admin);
    },

    async updPassAdmin(request, response) {
        let email = request.params.emailUsuario;         
        const { newPassword, codSeguranca } = request.body;
        
        let datUpdate = new Date();
        let seguranca = '';
        var senha = crypto.createHash('md5').update(newPassword).digest('hex');

        await connection('administrator')
        .where('admEmail', email)
        .where('admSeguranca', codSeguranca)   
        .update({
            usrPassword: senha,
            usrCodSeguranca: seguranca,           
        });
           
        return response.status(204).send();
    },

    async updAdmin(request, response) {
        const { idAdm, admNome, admEmail, admNivAcesso } = request.body;        
        await connection('administrator')
        .where('admId', idAdm)   
        .update({
            admNome, 
            admEmail,
            admNivAcesso,        
        });
           
        return response.status(204).send();
    },
};
