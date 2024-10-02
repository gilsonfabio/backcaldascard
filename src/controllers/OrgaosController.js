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

    },

    async corCmpConv(request, response) {
        
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
        while(vet <= 100) {
            let vlrVenda = parseInt('0.00');

            const vendas = await connection('cmpParcelas')
            .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
            .join('servidores', 'usrId', 'compras.cmpServidor')
            .join('secretarias', 'secId', 'servidores.usrSecretaria')
            .join('orgadmin', 'orgId', 'secretarias.secOrgAdm')
            .where('parVctParcela', vctParcela)
            .where('parStaParcela', status)
            .where('secId', vet)        
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

            if (vendas[0].totCmp > 0 ) {
                //console.log('Total de Compras:', vendas[0].totCmp);
                const cnv = await connection('convenios')
                .where('cnvId',id)
                .join('atividades', 'atvId', 'convenios.cnvAtividade')
                .select(['cnvId','atividades.atvTaxAdm']);

                //console.log('Taxa:', cnv[0].atvTaxAdm)
                let taxa = parseInt(cnv[0].atvTaxAdm);

                auxTotCompras = parseFloat(vendas[0].totCmp);
                auxTotTaxa = ((auxTotCompras * taxa) / 100);
                auxTotLiquido = auxTotCompras - auxTotTaxa; 
                auxTotSistema = ((auxTotTaxa * 20) / 100);

                month = month + 1;
                //console.log('Mes:', month);
                //console.log('Ano:', year);
                //console.log('Convenio:', id);
                //console.log('Vlr Total:', auxTotCompras);

                const updConv = await connection('totVdaCnv')
                    .where('tcnvId',id)
                    .where('tcnvMes',month)
                    .where('tcnvAno',year)
                    .update({
                        tcnvVlrTotal: auxTotCompras,
                        tcnvVlrTaxa: auxTotTaxa,
                        tcnvVlrLiquido: auxTotLiquido,
                        tcnvVlrSistema: auxTotSistema
                    });

                if(!updConv) {
                    const [totaliza] = await connection('totVdaCnv').insert({
                        tcnvId: id,
                        tcnvAno: year,
                        tcnvMes: month,
                        tcnvVlrTotal: auxTotCompras,
                        tcnvVlrTaxa: auxTotTaxa,
                        tcnvVlrLiquido: auxTotLiquido,
                        tcnvVlrSistema: auxTotSistema,                
                    });
                }                
            }
            vet ++;
        }

        const totCnv = await connection('totVdaCnv')
        .where('tcnvMes',month)
        .where('tcnvAno',year)
        .select('tcnvVlrTotal', 'tcnvVlrTaxa', 'tcnvVlrLiquido', 'tcnvVlrSistema');

        return response.json(totCnv);

    }

};