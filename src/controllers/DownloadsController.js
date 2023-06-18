const connection = require('../database/connection');

module.exports = {   
    async downTexto (request, response) {
        let inicio = request.params.datInicial;
        let final = request.params.datInicial;
        let idOrg = request.params.orgId;

        let year = inicio.getFullYear();
        let month = inicio.getMonth() ;

        const saldo = await connection('usrSaldo')
            .join('servidores', 'usrCartao', 'usrSaldo.usrServ')
            .join('secretarias', 'secId', 'servidores.usrSecretaria')
            .join('orgadmin', 'orgId', 'secretarias.secOrgAdm')
            .where('usrMes',month)
            .where('usrAno',year)
            .where('orgId', idOrg)
            .select(['servidores.usrMatricula', 'servidores.usrNome','usrSaldo.usrVlrUsado',])
       
        return response.json(saldo);  
        
    }          
};
