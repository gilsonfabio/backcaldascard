const crypto = require('crypto');
const connection = require('../database/connection');

module.exports = {   
    async index (request, response) {
        let status = "A";
        const convenios = await connection('convenios')
        .where('cnvStatus', status)
        .select('*');
    
        return response.json(convenios);
    },   
    
    async classCnv (request, response) {
        let nome = request.params.search;
        const convenios = await connection('convenios')
        .where('cnvNomFantasia','>', nome)       
        .orderBy('cnvNomFantasia') 
        .select(['*']);
        
        return response.json(convenios);
    }, 

    async signIn(request, response) {
        let emailCnv = request.params.email;
        let senha = request.params.password;

        var encodedVal = crypto.createHash('md5').update(senha).digest('hex');
        const conv = await connection('convenios')
            .where('cnvEmail', emailCnv)
            .where('cnvPassword', encodedVal)


            
            .select('cnvId', 'cnvNomFantasia')
            .first();
          
        if (!conv) {
            return response.status(400).json({ error: 'Não encontrou convênio com este ID'});
        } 

        return response.json(conv);
    },

    async signInCnc(request, response) {
        let emailCnv = request.params.email;
        let senha = request.params.password;

        var encodedVal = crypto.createHash('md5').update(senha).digest('hex');
        const conv = await connection('convenios')
            .where('cnvEmail', emailCnv)
            .where('cnvCanPassword', encodedVal)
            .select('cnvId', 'cnvNomFantasia')
            .first();
          
        if (!conv) {
            return response.status(400).json({ error: 'Não encontrou convênio com este ID'});
        } 

        return response.json(conv);
    },    

    //async signAlt(request, response) {
    //    let email = request.params.email;
    //    let senha = request.params.password;
    //
    //    var encodedVal = crypto.createHash('md5').update(senha).digest('hex');
    //    const conv = await connection('convenios')
    //        .where('cnvId', email)
    //        .where('cnvSenha', encodedVal)
    //        .select('cnvId', 'cnvNomFantasia')
    //        .first();
    //      
    //    if (!conv) {
    //        return response.status(400).json({ error: 'Não encontrou convênio com este ID'});
    //    } 
    //
    //    return response.json(conv);
    //},

    async create(request, response) {
        const { cnvRazSocial, 
            cnvNomFantasia,
            cnvCpfCnpj,            
            cnvEmail,
            cnvTelefone,
            cnvContato,
            cnvAtividade,
            cnvPassword,
            cnvCanPassword,  
            cnvEndereco,
            cnvBairro,
            cnvCidade,
            cnvEstado,
            cnvCep } = request.body;
        
        let status = "A";
  
        var snhConvenio = crypto.createHash('md5').update(cnvPassword).digest('hex');
        var snhCancelamento = crypto.createHash('md5').update(cnvCanPassword).digest('hex');
            
        const [cnvId] = await connection('convenios').insert({
            cnvRazSocial, 
            cnvNomFantasia,
            cnvCpfCnpj,            
            cnvEmail,
            cnvTelefone,
            cnvContato,
            cnvAtividade,
            cnvPassword: snhConvenio,
            cnvCanPassword: snhCancelamento,
            cnvEndereco,
            cnvBairro,
            cnvCidade,
            cnvEstado,
            cnvCep,
            cnvStatus: status           
        });
           
        return response.json({cnvId});
    },

    async searchConv (request, response) {
        let id = request.params.idCnv;
        let status = "A";

        //console.log('Search Convenio: ', id);

        const convenio = await connection('convenios')
        .where('cnvId', id)
        .where('cnvStatus', status)
        .select('*');

        //console.log(convenio);

        return response.json(convenio);
    },   
    
    async updateConv(request, response) {
        let id = request.params.idCnv;         
        
        const { cnvRazSocial, 
            cnvNomFantasia,
            cnvCpfCnpj,            
            cnvEmail,
            cnvTelefone,
            cnvContato,
            cnvAtividade,
            cnvEndereco,
            cnvBairro,
            cnvCidade,
            cnvEstado,
            cnvCep,
            cnvPassword,
            cnvCanPassword} = request.body;

        var snhConvenio = crypto.createHash('md5').update(cnvPassword).digest('hex');
        var snhCancelamento = crypto.createHash('md5').update(cnvCanPassword).digest('hex');

        let datUpdate = new Date();
        await connection('convenios').where('cnvId', id)   
        .update({
            cnvRazSocial, 
            cnvNomFantasia,
            cnvCpfCnpj,            
            cnvEmail,
            cnvTelefone,
            cnvContato,
            cnvAtividade,
            cnvEndereco,
            cnvBairro,
            cnvCidade,
            cnvEstado,
            cnvCep,
            cnvPassword: snhConvenio,
            cnvCanPassword: snhCancelamento          
        });
           
        return response.status(204).send();
    },
    
    async deleteConv(request, response) {
        let id = request.params.idCnv;         
        
        let status = 'E';
        let datUpdate = new Date();
        await connection('convenios').where('cnvId', id)   
        .update({
            cnvStatus: status           
        });
           
        return response.status(204).send();
    },

    async updPassCnv(request, response) {
        let email = request.params.emailConvenio;         
        const { newPassword, codSeguranca } = request.body;
        
        let seguranca = '';
        var senha = crypto.createHash('md5').update(newPassword).digest('hex');

        await connection('convenios')
        .where('cnvEmail', email)
        .where('usrSeguranca', codSeguranca)   
        .update({
            cnvPassword: senha,
            cnvCodSeguranca: seguranca,           
        });
           
        return response.status(204).send();
    },

    async updSnhCnvCanc(request, response) {
        let email = request.params.emailConvenio;         
        const { newPassword, codSeguranca } = request.body;
        
        let seguranca = '';
        var senha = crypto.createHash('md5').update(newPassword).digest('hex');

        await connection('convenios')
        .where('cnvEmail', email)
        .where('usrSeguranca', codSeguranca)   
        .update({
            cnvCanPassword: senha,
            cnvCodSeguranca: seguranca,           
        });
           
        return response.status(204).send();
    },
    
};