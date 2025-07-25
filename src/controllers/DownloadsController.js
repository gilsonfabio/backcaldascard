const connection = require('../database/connection');

module.exports = {   
    async downTexto (request, response) {
        let inicio = request.params.datInicial;
        let final = request.params.datInicial;
        let srvStatus = request.params.status;
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
            .whereIn('usrId', function() {
                this.where('usrStatus', srvStatus)
                this.select('usrId').from('servidores');
            })
            .select(['servidores.usrMatricula', 'servidores.usrNome', 'servidores.usrStatus', 'usrSaldo.usrVlrUsado',])
       
        return response.json(saldo);  
        
    },
    
    async corSaldo (request, response) {
        //let datSearch = request.params.datVencto;
        let status = 'A';

        const compras = await connection('cmpParcelas')
            .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
            .join('servidores', 'usrId', 'compras.cmpServidor')
            .where('parStaParcela', status)
            .select(['cmpParcelas.*', 'compras.cmpEmissao', 'compras.cmpServidor', 'compras.cmpConvenio', 'compras.cmpQtdParcela', 'servidores.usrNome', 'servidores.usrCartao']);

        return response.json(compras);

    },

    async relFecTxt (request, response) {
        let inicio = request.params.datInicial;
        let final = request.params.datInicial;
        let srvStatus = request.params.status;
        let idOrg = request.params.orgId;

        let dtAtual = new Date(inicio);  
        let year = dtAtual.getFullYear();
        let month = dtAtual.getMonth() + 1;
        let vlrLimite = 0.00;

        console.log(inicio);
        console.log(year);
        console.log(month);
        console.log(idOrg);

        const saldo = await connection('usrSaldo')
            .join('servidores', 'usrCartao', 'usrSaldo.usrServ')
            .join('secretarias', 'secId', 'servidores.usrSecretaria')
            .join('orgadmin', 'orgId', 'secretarias.secOrgAdm')
            .where('usrMes',month)
            .where('usrAno',year)
            .where('orgId', idOrg)
            .where('usrVlrUsado', '>', vlrLimite)
            .whereIn('usrId', function() {
                this.where('usrStatus', srvStatus)
                this.select('usrId').from('servidores');
            })
            .select(['servidores.usrId','servidores.usrMatricula', 'servidores.usrNome', 'servidores.usrStatus','usrSaldo.usrVlrUsado',])
            .orderBy('servidores.usrNome');
       
        //console.log(saldo);
            return response.json(saldo);  
    },

    async relFecham (request, response) {
        let inicio = request.params.datInicial;
        let final = request.params.datInicial;
        let srvStatus = request.params.status;

        let dtAtual = new Date(inicio);  
        let year = dtAtual.getFullYear();
        let month = dtAtual.getMonth() + 1;
        let vlrLimite = 0.00;

        console.log(inicio);
        console.log(year);
        console.log(month);
        
        const saldo = await connection('usrSaldo')
            .join('servidores', 'usrCartao', 'usrSaldo.usrServ')
            .join('secretarias', 'secId', 'servidores.usrSecretaria')
            .join('orgadmin', 'orgId', 'secretarias.secOrgAdm')
            .where('usrMes',month)
            .where('usrAno',year)
            .where('usrVlrUsado', '>', vlrLimite)
            .whereIn('usrId', function() {
                this.where('usrStatus', srvStatus)
                this.select('usrId').from('servidores');
            })
            .select(['servidores.usrId','servidores.usrMatricula', 'servidores.usrNome', 'servidores.usrStatus','usrSaldo.usrVlrUsado',])
            .orderBy('servidores.usrNome');
  
            return response.json(saldo);         
    },
};
