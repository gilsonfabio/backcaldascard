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

    async totOrgao(request, response) {
        
        let vctParcela = request.body.datInicio;
        let datProcess = new Date(request.body.datInicio);
        let year = datProcess.getFullYear();
        let month = datProcess.getMonth() + 1;
        let day = datProcess.getDate();
        let dayVct = 15;    
         
        //console.log(vctParcela);
        //console.log(datProcess);

        let status = 'A';
        let vet = 1;
        while(vet <= 21) {
            let vlrVenda = parseInt('0.00');

            const vendas = await connection('cmpParcelas')
            .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
            .join('servidores', 'usrId', 'compras.cmpServidor')
            .join('secretarias', 'secId', 'servidores.usrSecretaria')
            .join('orgadmin', 'orgId', 'secretarias.secOrgAdm')
            .where('parVctParcela', vctParcela)
            .where('parStaParcela', status)
            .where('orgId', vet)        
            .orderBy('parVctParcela')
            .sum({totCmp : 'parVlrParcela'});

            if (vendas) {
                let result = vendas[0].totCmp;
                vlrVenda = result;
                //console.log(vet)
                //console.log(year)
                //console.log(month)
                //console.log(vlrVenda)
            }else {
                vlrVenda = parseInt('0.00').toFixed(2)    
            }   

            const orgao = await connection('totVdaOrg')
            .where('idTotOrg', vet)
            .delete();

            const [total] = await connection('totVdaOrg').insert({
                idTotOrg: vet,
                orgTotAno: year,
                orgTotMes: month,
                orgTotVlrVenda: vlrVenda       
            });

            vet ++;
        }

        const compras = await connection('totVdaOrg')
        .join('orgadmin', 'orgId', 'totVdaOrg.idTotOrg')
        .where('orgTotAno', year)
        .where('orgTotMes', month)
        .select(['totVdaOrg.*', 'orgadmin.orgDescricao']);
    
        return response.json(compras);

    }

};