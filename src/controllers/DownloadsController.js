const connection = require('../database/connection');

module.exports = {   
    async downTexto (request, response) {
        let inicio = request.params.datInicial;
        let final = request.params.datInicial;
        let idOrg = request.params.orgId;

        let dtAtual = new Date(inicio);  
        let year = dtAtual.getFullYear();
        let month = dtAtual.getMonth() + 1;
        let vlrLimite = 0.00;

        const saldo = await connection('usrSaldo')
            .join('servidores', 'usrCartao', 'usrSaldo.usrServ')
            .join('secretarias', 'secId', 'servidores.usrSecretaria')
            .join('orgadmin', 'orgId', 'secretarias.secOrgAdm')
            .where('usrMes',month)
            .where('usrAno',year)
            .where('orgId', idOrg)
            .where('usrVlrUsado', '>', vlrLimite)
            .select(['servidores.usrMatricula', 'servidores.usrNome','usrSaldo.usrVlrUsado',])
       
        return response.json(saldo);  
        
    }          
};
