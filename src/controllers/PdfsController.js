const moment = require('moment');
const connection = require('../database/connection');

module.exports = {   
    async pdfVdaEmissao (request, response) {
        let datSearch = moment('2022-01-15').format('YYYY-MM-DD');
        //const votHora = moment().format('hh:mm:ss');
        
        const datNow = moment().format('DD-MM-YYYY');
        const horNow = moment().format('hh:mm:ss');  
                
        const compras = await connection('compras')
        .join('servidores', 'usrId', 'compras.cmpServidor')
        .select(['compras.*', 'servidores.usrNome']);

        return response.json(compras);
    }, 

    async pdfCmpEmissao (request, response) {
        let datSearch = moment('2022-01-15').format('YYYY-MM-DD');
        //const votHora = moment().format('hh:mm:ss');
        
        const datNow = moment().format('DD-MM-YYYY');
        const horNow = moment().format('hh:mm:ss');  
        
        let status = 'A';
        const compras = await connection('compras')
        .where('cmpStatus', 'status')
        .join('servidores', 'usrId', 'compras.cmpServidor')
        .join('convenios', 'cnvId', 'compras.cmpConvenio')
        .select(['compras.*', 'servidores.usrNome', 'servidores.usrMatricula', 'convenios.cnvId', 'convenios.cnvNomFantasia']);

        return response.json(compras);
    }, 

    async pdfVdaVenc (request, response) {
        //let datSearch = moment('2022-01-15').format('YYYY-MM-DD');
        //const votHora = moment().format('hh:mm:ss');
        
        let inicio = request.params.dataInicial;
        let final = request.params.dataFinal;
        let srvStatus = request.params.status;
        let status = 'A';
        
        //console.log(inicio);
        //console.log(final);
        //console.log(srvStatus);

        const datNow = moment().format('DD-MM-YYYY');
        const horNow = moment().format('hh:mm:ss');  
                
        const vctcompras = await connection('cmpParcelas')
            .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
            .join('servidores', 'usrId', 'compras.cmpServidor')
            .join('convenios', 'cnvId', 'compras.cmpConvenio')
            .where('parVctParcela','>=', inicio)
            .where('parVctParcela','<=', final)
            .where('parStaParcela', status)
            .whereIn('usrId', function() {
                this.where('usrStatus', srvStatus)
                this.select('usrId').from('servidores');
              })
            .select(['cmpParcelas.*', 'compras.cmpEmissao', 'compras.cmpServidor', 'compras.cmpConvenio', 'servidores.usrNome', 'servidores.usrStatus', 'servidores.usrMatricula', 'convenios.cnvNomFantasia']);

        return response.json(vctcompras);
    }, 

    async pdfVctCmpSrv (request, response) {
        let inicio = request.params.datInicial;
        let final = request.params.datFinal;
        let servidor = request.params.srvId;
        let status = 'A';
        
        //console.log(inicio);
        //console.log(final);
        //console.log(servidor); 

        const datNow = moment().format('DD-MM-YYYY');
        const horNow = moment().format('hh:mm:ss');  
                
        const vctcompras = await connection('cmpParcelas')
            .where('parVctParcela','>=', inicio)
            .where('parVctParcela','<=', final)
            .where('parStaParcela', status)
            .where('servidores.usrId', servidor)
            .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
            .join('servidores', 'usrId', 'compras.cmpServidor')
            .join('convenios', 'cnvId', 'compras.cmpConvenio')
            .select(['cmpParcelas.*', 'compras.cmpId', 'compras.cmpQtdParcela', 'compras.cmpEmissao', 'compras.cmpServidor', 'compras.cmpConvenio', 'compras.cmpVlrCompra', 'servidores.usrNome', 'convenios.cnvNomFantasia']);

        return response.json(vctcompras);
    }, 


    async pdfVctCmpCnv(request, response) {
        //console.log('modulo PdfVctCmpCnv')
        try {
            const { datInicial, datFinal, cnvId } = request.params;

            // Aceita diferentes formatos de data enviados pelo frontend.
            const formatos = [
                'YYYY-MM-DD',
                'DD-MM-YYYY',
                'DD/MM/YYYY'
            ];

            const inicio = moment(datInicial, formatos, true);
            const final = moment(datFinal, formatos, true);

            // Validação das datas recebidas.
            if (
                !inicio.isValid() ||
                !final.isValid() ||
                final.isBefore(inicio, 'day')
            ) {
                //console.log('Erro nos dados enviados ao backend:', inicio, final, cnvId);
                return response.status(400).json({
                    erro: 'Período inválido.',
                    mensagem: 'Informe as datas nos formatos DD-MM-YYYY, DD/MM/YYYY ou YYYY-MM-DD.',
                    datInicial,
                    datFinal
                });
            }

            // Converte as datas para o formato aceito pelo MySQL.
            const datIni = inicio.format('YYYY-MM-DD');

            // Primeiro dia após a data final, para incluir todo o último dia.
            const datFin = final.clone().add(1, 'day').format('YYYY-MM-DD');

            const status = 'A';

            //console.log('Parâmetros da consulta:', {
            //    dataInicialRecebida: datInicial,
            //    dataFinalRecebida: datFinal,
            //    datIni,
            //    datFin,
            //    cnvId,
            //    status
            //});

            // Consulta das parcelas por período e convênio.
            const vctcompras = await connection('cmpParcelas')
                .where('cmpParcelas.parVctParcela', '>=', datIni)
                .where('cmpParcelas.parVctParcela', '<', datFin)
                .where('cmpParcelas.parStaParcela', status)
                .where('convenios.cnvId', cnvId)
                .join(
                    'compras',
                    'compras.cmpId',
                    'cmpParcelas.parIdCompra'
                )
                .join(
                    'servidores',
                    'servidores.usrId',
                    'compras.cmpServidor'
                )
                .join(
                    'convenios',
                    'convenios.cnvId',
                    'compras.cmpConvenio'
                )
                .select([
                    'cmpParcelas.*',
                    'compras.cmpId',
                    'compras.cmpQtdParcela',
                    'compras.cmpEmissao',
                    'compras.cmpServidor',
                    'compras.cmpConvenio',
                    'compras.cmpVlrCompra',
                    'servidores.usrNome',
                    'convenios.cnvNomFantasia'
                ])
                .orderBy('cmpParcelas.parVctParcela', 'asc');

            //console.log(
            //    'Quantidade de registros encontrados:',
            //    vctcompras.length
            //);

            return response.json(vctcompras);

        } catch (error) {
            console.error('Erro em pdfVctCmpCnv:', error);

            return response.status(500).json({
                erro: 'Erro ao consultar compras por vencimento.'
            });
        }
    },

    async pdfEmiCmpCnv (request, response) {
        let inicio = request.params.datInicial;
        let final = request.params.datFinal;
        let convenio = request.params.cnvId;
        let status = 'A';
                               
        const datNow = moment().format('DD-MM-YYYY');
        const horNow = moment().format('hh:mm:ss');  

        let datIni = inicio.split('/').reverse().join('-');
        let datFin = final.split('/').reverse().join('-');
       
        //console.log('Inicio', datIni);
        //console.log('Final:', datFin);
        //console.log('Convenio:', convenio);

        const emicompras = await connection('compras')
            .where('cmpEmissao','>=', datIni)
            .where('cmpEmissao','<=', datFin)
            .where('cmpStatus', status)
            .where('cmpConvenio', convenio)
            .join('servidores', 'usrId', 'compras.cmpServidor')
            .join('convenios', 'cnvId', 'compras.cmpConvenio')
            .select(['compras.*', 'servidores.usrNome', 'convenios.cnvNomFantasia']);

        return response.json(emicompras);
    },
    
    async pdfEmiCmpSrv (request, response) {
        let inicio = request.params.datInicial;
        let final = request.params.datFinal;
        let servidor = request.params.srvId;
        let status = 'A';
                               
        const datNow = moment().format('DD-MM-YYYY');
        const horNow = moment().format('hh:mm:ss');  

        let datIni = inicio.split('/').reverse().join('-');
        let datFin = final.split('/').reverse().join('-');
       
        //console.log('Inicio', datIni);
        //console.log('Final:', datFin);
        //console.log('Convenio:', convenio);

        const emicompras = await connection('compras')
            .where('cmpEmissao','>=', datIni)
            .where('cmpEmissao','<=', datFin)
            .where('cmpStatus', status)
            .where('cmpServidor', servidor)
            .join('servidores', 'usrId', 'compras.cmpServidor')
            .join('convenios', 'cnvId', 'compras.cmpConvenio')
            .select(['compras.*', 'servidores.usrNome', 'convenios.cnvNomFantasia']);

        return response.json(emicompras);
    },

    async pdfVctOrgao (request, response) {
        //let datSearch = moment('2022-01-15').format('YYYY-MM-DD');
        //const votHora = moment().format('hh:mm:ss');
        
        let inicio = request.params.dataInicial;
        let final = request.params.dataFinal;
        let idOrg = request.params.orgId;
        let srvStatus = request.params.status;
        let status = 'A';
        
        //console.log(inicio);
        //console.log(final);
        //console.log(idOrg);
        //console.log(srvStatus);

        const datNow = moment().format('DD-MM-YYYY');
        const horNow = moment().format('hh:mm:ss');  
                
        const vctcompras = await connection('cmpParcelas')
        .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
            .join('servidores', 'usrId', 'compras.cmpServidor')
            .join('convenios', 'cnvId', 'compras.cmpConvenio')
            .join('secretarias', 'secId', 'servidores.usrSecretaria')
            .join('orgadmin', 'orgId', 'secretarias.secOrgAdm')
            .where('parVctParcela','>=', inicio)
            .where('parVctParcela','<=', final)
            .where('parStaParcela', status)
            .where('orgId', idOrg)
            .whereIn('usrId', function() {
                this.where('usrStatus', srvStatus)
                this.select('usrId').from('servidores');
              })
            .select(['cmpParcelas.*', 'compras.cmpEmissao', 'compras.cmpServidor', 'compras.cmpConvenio', 'servidores.usrNome', 'servidores.usrStatus', 'convenios.cnvNomFantasia','secretarias.secOrgAdm', 'orgadmin.orgId'])
            .orderBy('servidores.usrNome');
             
        //console.log(vctcompras);
           
        return response.json(vctcompras);
    }, 

    async cmpPeriodo (request, response) {
        let inicio = request.params.datInicio;
        let final = request.params.datFinal;
        let cnpjCnv = request.params.convenio;
        let cpfSrv = request.params.servidor;
        let status = 'A';
        //console.log('inicio:', inicio);
        //console.log('final:', final);
        //console.log('convenio:', cnpjCnv);
        //console.log('servidor:', cpfSrv);

        const datNow = moment().format('DD-MM-YYYY');
        const horNow = moment().format('hh:mm:ss');  
                
        if (cnpjCnv === '0' && cpfSrv === '0') {
            const result1 = await connection('compras')
                .where('cmpEmissao','>=', inicio)
                .where('cmpEmissao','<=', final)
                .where('cmpStatus', status)
                .join('servidores', 'usrId', 'compras.cmpServidor')
                .join('convenios', 'cnvId', 'compras.cmpConvenio')
                .select(['compras.*', 'servidores.usrCpf', 'servidores.usrNome', 'convenios.cnvCpfCnpj', 'convenios.cnvNomFantasia']);
            return response.json(result1);
        }else {
            if (cnpjCnv === '0' && cpfSrv !== '0') {
                const result2 = await connection('compras')
                    .where('cmpEmissao','>=', inicio)
                    .where('cmpEmissao','<=', final)
                    .where('cmpStatus', status)
                    .where('servidores.usrCpf', cpfSrv)
                    .join('servidores', 'usrId', 'compras.cmpServidor')
                    .join('convenios', 'cnvId', 'compras.cmpConvenio')
                    .select(['compras.*', 'servidores.usrCpf', 'servidores.usrNome', 'convenios.cnvCpfCnpj', 'convenios.cnvNomFantasia']);
                return response.json(result2);    
            }else{
                if (cnpjCnv !== '0' && cpfSrv === '0') {
                    const result3 = await connection('compras')
                        .where('cmpEmissao','>=', inicio)
                        .where('cmpEmissao','<=', final)
                        .where('cmpStatus', status)
                        .where('convenios.cnvCpfCnpj', cnpjCnv)                    
                        .join('servidores', 'usrId', 'compras.cmpServidor')
                        .join('convenios', 'cnvId', 'compras.cmpConvenio')
                        .select(['compras.*', 'servidores.usrCpf', 'servidores.usrNome', 'convenios.cnvCpfCnpj', 'convenios.cnvNomFantasia']);
                    return response.json(result3);
                }else {
                    const result4 = await connection('compras')
                        .where('cmpEmissao','>=', inicio)
                        .where('cmpEmissao','<=', final)
                        .where('cmpStatus', status)
                        .where('convenios.cnvCpfCnpj', cnpjCnv)  
                        .where('servidores.usrCpf', cpfSrv)                  
                        .join('servidores', 'usrId', 'compras.cmpServidor')
                        .join('convenios', 'cnvId', 'compras.cmpConvenio')
                        .select(['compras.*', 'servidores.usrCpf', 'servidores.usrNome', 'convenios.cnvCpfCnpj', 'convenios.cnvNomFantasia']);
                    return response.json(result4);     
                }
            }
        }     
    }, 

    async somCompras (request, response) {
        let inicio = request.params.datInicio;
        let final = request.params.datFinal;
        let cnpjCnv = request.params.convenio;
        let cpfSrv = request.params.servidor;
        let status = 'A';

        if (cnpjCnv === '0' && cpfSrv === '0') {
            const result1 = await connection('compras')
                .where('cmpEmissao','>=', inicio)
                .where('cmpEmissao','<=', final)
                .where('cmpStatus', status)
                .join('servidores', 'usrId', 'compras.cmpServidor')
                .join('convenios', 'cnvId', 'compras.cmpConvenio')
                .sum({totCmp : 'cmpVlrCompra'});
            return response.json(result1);
        }else {
            if (cnpjCnv === '0' && cpfSrv !== '0') {
                const result2 = await connection('compras')
                    .where('cmpEmissao','>=', inicio)
                    .where('cmpEmissao','<=', final)
                    .where('cmpStatus', status)
                    .where('servidores.usrCpf', cpfSrv)
                    .join('servidores', 'usrId', 'compras.cmpServidor')
                    .join('convenios', 'cnvId', 'compras.cmpConvenio')
                    .sum({totCmp : 'cmpVlrCompra'});
                return response.json(result2);    
            }else{
                if (cnpjCnv !== '0' && cpfSrv === '0') {
                    const result3 = await connection('compras')
                        .where('cmpEmissao','>=', inicio)
                        .where('cmpEmissao','<=', final)
                        .where('cmpStatus', status)
                        .where('convenios.cnvCpfCnpj', cnpjCnv)                    
                        .join('servidores', 'usrId', 'compras.cmpServidor')
                        .join('convenios', 'cnvId', 'compras.cmpConvenio')
                        .sum({totCmp : 'cmpVlrCompra'});
                    return response.json(result3);
                }else {
                    const result4 = await connection('compras')
                        .where('cmpEmissao','>=', inicio)
                        .where('cmpEmissao','<=', final)
                        .where('cmpStatus', status)
                        .where('convenios.cnvCpfCnpj', cnpjCnv)  
                        .where('servidores.usrCpf', cpfSrv)                  
                        .join('servidores', 'usrId', 'compras.cmpServidor')
                        .join('convenios', 'cnvId', 'compras.cmpConvenio')
                        .sum({totCmp : 'cmpVlrCompra'});
                    return response.json(result4);    
                }
            }
        }     
    },
    
    async pdfCmpEmis(request, response) {
        let inicio = request.params.dataInicio;
        let final = request.params.dataFinal;
        let cnpjCnv = request.params.cnpjCnv;
        let cpfSrv = request.params.cpfSrv;
        let status = 'A';

        let query = connection('compras')
            .where('cmpEmissao','>=', inicio)
            .where('cmpEmissao','<=', final)
            .where('cmpStatus', status)
            .join('servidores', 'usrId', 'compras.cmpServidor')
            .join('convenios', 'cnvId', 'compras.cmpConvenio')
            .select([
                'compras.*',
                'servidores.usrCpf',
                'servidores.usrNome',
                'servidores.usrMatricula',
                'convenios.cnvCpfCnpj',
                'convenios.cnvNomFantasia'
            ]);

        if (cnpjCnv !== '0') {
            query.where('convenios.cnvCpfCnpj', cnpjCnv);
        }

        if (cpfSrv !== '0') {
            query.where('servidores.usrCpf', cpfSrv);
        }

        const compras = await query;

        // 👉 BUSCAR PARCELAS
        const idsCompras = compras.map(c => c.cmpId);

        let parcelas = [];

        if (idsCompras.length > 0) {
            parcelas = await connection('cmpParcelas')
                .whereIn('parIdCompra', idsCompras)
                .select('*');
            }

        return response.json({
            compras,
            parcelas
        });
    },

    async pdfVctCompras (request, response) {
        let inicio = request.params.dataInicio;
        let final = request.params.dataFinal;
        let cnpjCnv = request.params.cnpjCnv;
        let cpfSrv = request.params.cpfSrv;
        let status = 'A';
        //console.log('inicio:', inicio);
        //console.log('final:', final);
        //console.log('convenio:', cnpjCnv);
        //console.log('servidor:', cpfSrv);

        const datNow = moment().format('DD-MM-YYYY');
        const horNow = moment().format('hh:mm:ss');  
                
        if (cnpjCnv === '0' && cpfSrv === '0') {
            const result1 = await connection('cmpParcelas')
                .where('parVctParcela','>=', inicio)
                .where('parVctParcela','<=', final)
                .where('parStaParcela', status)
                .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
                .join('servidores', 'usrId', 'compras.cmpServidor')
                .join('convenios', 'cnvId', 'compras.cmpConvenio')
                .select(['cmpParcelas.*', 'compras.cmpEmissao', 'compras.cmpServidor', 'compras.cmpConvenio', 'servidores.usrCpf', 'servidores.usrNome', 'servidores.usrMatricula', 'convenios.cnvCpfCnpj', 'convenios.cnvNomFantasia']);
            //console.log(result1)
            return response.json(result1)
        }else {
            if (cnpjCnv === '0' && cpfSrv != '0') {
                const result2 = await connection('cmpParcelas')
                    .where('parVctParcela','>=', inicio)
                    .where('parVctParcela','<=', final)
                    .where('parStaParcela', status)
                    .where('servidores.usrMatricula', cpfSrv)
                    .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
                    .join('servidores', 'usrId', 'compras.cmpServidor')
                    .join('convenios', 'cnvId', 'compras.cmpConvenio')
                    .select(['cmpParcelas.*', 'compras.cmpEmissao', 'compras.cmpServidor', 'compras.cmpConvenio', 'servidores.usrCpf', 'servidores.usrNome', 'servidores.usrMatricula', 'convenios.cnvCpfCnpj', 'convenios.cnvNomFantasia']);
                return response.json(result2)    
            }else{
                if (cnpjCnv != '0' && cpfSrv === '0') {
                    const result3 = await connection('cmpParcelas')
                        .where('parVctParcela','>=', inicio)
                        .where('parVctParcela','<=', final)
                        .where('parStaParcela', status)
                        .where('convenios.cnvCpfCnpj', cnpjCnv)         
                        .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')           
                        .join('servidores', 'usrId', 'compras.cmpServidor')
                        .join('convenios', 'cnvId', 'compras.cmpConvenio')
                        .select(['cmpParcelas.*', 'compras.cmpEmissao', 'compras.cmpServidor', 'compras.cmpConvenio', 'servidores.usrCpf', 'servidores.usrNome', 'servidores.usrMatricula', 'convenios.cnvCpfCnpj', 'convenios.cnvNomFantasia']);
                    return response.json(result3)
                }else {
                    const result4 = await connection('cmpParcelas')
                        .where('parVctParcela','>=', inicio)
                        .where('parVctParcela','<=', final)
                        .where('parStaParcela', status)
                        .where('convenios.cnvCpfCnpj', cnpjCnv)  
                        .where('servidores.usrMatricula', cpfSrv)                 
                        .join('compras', 'cmpId', 'cmpParcelas.parIdCompra') 
                        .join('servidores', 'usrId', 'compras.cmpServidor')
                        .join('convenios', 'cnvId', 'compras.cmpConvenio')
                        .select(['cmpParcelas.*', 'compras.cmpEmissao', 'compras.cmpServidor', 'compras.cmpConvenio', 'servidores.usrCpf', 'servidores.usrNome', 'servidores.usrMatricula', 'convenios.cnvCpfCnpj', 'convenios.cnvNomFantasia']);
                    return response.json(result4) 
                }
            }
        }     
    }, 
                    
    async vctPeriodo (request, response) {
        let inicio = request.params.datInicio;
        let final = request.params.datFinal;
        let cnpjCnv = request.params.convenio;
        let cpfSrv = request.params.servidor;
        let status = 'A';
        //console.log('inicio:', inicio);
        //console.log('final:', final);
        //console.log('convenio:', cnpjCnv);
        //console.log('servidor:', cpfSrv);

        const datNow = moment().format('DD-MM-YYYY');
        const horNow = moment().format('hh:mm:ss');  
                
        if (cnpjCnv === '0' && cpfSrv === '0') {
            const result1 = await connection('cmpParcelas')
                .where('parVctParcela','>=', inicio)
                .where('parVctParcela','<=', final)
                .where('parStaParcela', status)
                .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
                .join('servidores', 'usrId', 'compras.cmpServidor')
                .join('convenios', 'cnvId', 'compras.cmpConvenio')
                .select(['cmpParcelas.*', 'compras.cmpEmissao', 'compras.cmpServidor', 'compras.cmpConvenio', 'servidores.usrCpf', 'servidores.usrNome', 'convenios.cnvCpfCnpj', 'convenios.cnvNomFantasia']);
            //console.log(result1)
            return response.json(result1)
        }else {
            if (cnpjCnv === '0' && cpfSrv != '0') {
                const result2 = await connection('cmpParcelas')
                    .where('parVctParcela','>=', inicio)
                    .where('parVctParcela','<=', final)
                    .where('parStaParcela', status)
                    .where('servidores.usrMatricula', cpfSrv)
                    .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
                    .join('servidores', 'usrId', 'compras.cmpServidor')
                    .join('convenios', 'cnvId', 'compras.cmpConvenio')
                    .select(['cmpParcelas.*', 'compras.cmpEmissao', 'compras.cmpServidor', 'compras.cmpConvenio', 'servidores.usrCpf', 'servidores.usrNome', 'convenios.cnvCpfCnpj', 'convenios.cnvNomFantasia']);
                return response.json(result2)    
            }else{
                if (cnpjCnv != '0' && cpfSrv === '0') {
                    const result3 = await connection('cmpParcelas')
                        .where('parVctParcela','>=', inicio)
                        .where('parVctParcela','<=', final)
                        .where('parStaParcela', status)
                        .where('convenios.cnvCpfCnpj', cnpjCnv)         
                        .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')           
                        .join('servidores', 'usrId', 'compras.cmpServidor')
                        .join('convenios', 'cnvId', 'compras.cmpConvenio')
                        .select(['cmpParcelas.*', 'compras.cmpEmissao', 'compras.cmpServidor', 'compras.cmpConvenio', 'servidores.usrCpf', 'servidores.usrNome', 'convenios.cnvCpfCnpj', 'convenios.cnvNomFantasia']);
                    return response.json(result3)
                }else {
                    const result4 = await connection('cmpParcelas')
                        .where('parVctParcela','>=', inicio)
                        .where('parVctParcela','<=', final)
                        .where('parStaParcela', status)
                        .where('convenios.cnvCpfCnpj', cnpjCnv)  
                        .where('servidores.usrMatricula', cpfSrv)                 
                        .join('compras', 'cmpId', 'cmpParcelas.parIdCompra') 
                        .join('servidores', 'usrId', 'compras.cmpServidor')
                        .join('convenios', 'cnvId', 'compras.cmpConvenio')
                        .select(['cmpParcelas.*', 'compras.cmpEmissao', 'compras.cmpServidor', 'compras.cmpConvenio', 'servidores.usrCpf', 'servidores.usrNome', 'convenios.cnvCpfCnpj', 'convenios.cnvNomFantasia']);
                    return response.json(result4) 
                }
            }
        }     
    }, 
    
    async somVctComp (request, response) {
        let inicio = request.params.datInicio;
        let final = request.params.datFinal;
        let cnpjCnv = request.params.convenio;
        let cpfSrv = request.params.servidor;
        let status = 'A';
        //console.log('inicio:', inicio);
        //console.log('final:', final);
        //console.log('convenio:', cnpjCnv);
        //console.log('servidor:', cpfSrv);

        const datNow = moment().format('DD-MM-YYYY');
        const horNow = moment().format('hh:mm:ss');  
                
        if (cnpjCnv === '0' && cpfSrv === '0') {
            const result1 = await connection('cmpParcelas')
                .where('parVctParcela','>=', inicio)
                .where('parVctParcela','<=', final)
                .where('parStaParcela', status)
                .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
                .join('servidores', 'usrId', 'compras.cmpServidor')
                .join('convenios', 'cnvId', 'compras.cmpConvenio')
                .sum({totCmp : 'parVlrParcela'});
            //console.log(result1)
            return response.json(result1)
        }else {
            if (cnpjCnv === '0' && cpfSrv != '0') {
                const result2 = await connection('cmpParcelas')
                    .where('parVctParcela','>=', inicio)
                    .where('parVctParcela','<=', final)
                    .where('parStaParcela', status)
                    .where('servidores.usrMatricula', cpfSrv)
                    .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
                    .join('servidores', 'usrId', 'compras.cmpServidor')
                    .join('convenios', 'cnvId', 'compras.cmpConvenio')
                    .sum({totCmp : 'parVlrParcela'});
                return response.json(result2)    
            }else{
                if (cnpjCnv != '0' && cpfSrv === '0') {
                    const result3 = await connection('cmpParcelas')
                        .where('parVctParcela','>=', inicio)
                        .where('parVctParcela','<=', final)
                        .where('parStaParcela', status)
                        .where('convenios.cnvCpfCnpj', cnpjCnv)         
                        .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')           
                        .join('servidores', 'usrId', 'compras.cmpServidor')
                        .join('convenios', 'cnvId', 'compras.cmpConvenio')
                        .sum({totCmp : 'parVlrParcela'});
                    return response.json(result3)
                }else {
                    const result4 = await connection('cmpParcelas')
                        .where('parVctParcela','>=', inicio)
                        .where('parVctParcela','<=', final)
                        .where('parStaParcela', status)
                        .where('convenios.cnvCpfCnpj', cnpjCnv)  
                        .where('servidores.usrMatricula', cpfSrv)                 
                        .join('compras', 'cmpId', 'cmpParcelas.parIdCompra') 
                        .join('servidores', 'usrId', 'compras.cmpServidor')
                        .join('convenios', 'cnvId', 'compras.cmpConvenio')
                        .sum({totCmp : 'parVlrParcela'});
                    return response.json(result4) 
                }
            }
        }     
    },
    
    /*
    async pdfExtAdm (request, response) {
        let inicio = request.params.datVencto;

        let [year, month] = inicio.split("-");
        month = Number(month);
        year = Number(year);

        const totaliza = await connection('totVdaCnv')
            .where('tcnvMes', month)
            .where('tcnvAno', year)
            .join('convenios', 'cnvId', 'totVdaCnv.tcnvId')
            .select(['totVdaCnv.*', 'convenios.cnvCpfCnpj', 'convenios.cnvNomFantasia']);

        return response.json(totaliza);
    },
    */

    async pdfExtAdm(request, response) {
        try {
            const { datVencto } = request.params;

            if (!datVencto) {
                return response.status(400).json({
                    error: 'Data não informada.'
                });
            }

            const [year, month] = datVencto.split('-').map(Number);

            if (!year || !month) {
                return response.status(400).json({
                    error: 'Formato de data inválido. Use AAAA-MM.'
                });
            }

            const totaliza = await connection('totVdaCnv as tvc')
                .join('convenios as c', 'c.cnvId', 'tvc.tcnvId')
                .join('atividades as a', 'a.atvId', 'c.cnvAtividade')
                .leftJoin('taxMensal as tm', function () {
                    this.on('tm.txaMenAtvId', '=', 'a.atvId')
                        .andOn('tm.txaMenMes', '=', connection.raw('?', [month]))
                        .andOn('tm.txaMenAno', '=', connection.raw('?', [year]));
                })
                .where('tvc.tcnvMes', month)
                .where('tvc.tcnvAno', year)
                .select([
                    'tvc.*',
                    'c.cnvCpfCnpj',
                    'c.cnvNomFantasia',
                    'a.atvId',
                    'tm.txaMenIndice'
                ]);

            return response.status(200).json(totaliza);

        } catch (error) {
            console.error(error);

            return response.status(500).json({
                error: 'Erro ao gerar relatório.',
                details: error.message
            });
        }
    },
    
    async totConvenios (request, response) {
        let inicio = request.params.datInicial;
        let datProcess = new Date(inicio);
        let day = '15';
        let year = datProcess.getFullYear();
        let month = datProcess.getMonth() + 1;
        let datVencto = new Date(year, month, day);
        
        //console.log('Dia:',day);
        //console.log('Mes:',month);
        //console.log('Ano:',year);
        //console.log('Data Vencimento:',datVencto);    

        //let cnt = 1;
        //while(cnt <= 25) {
            let status = 'A';
            let i = 1 
            while(i < 24) {

                //console.log('Convenio:', i);

                const cnv = await connection('convenios')
                .join('atividades', 'atvId', 'convenios.cnvAtividade')
                .where('cnvId',i)
                .select(['convenios.cnvId','atividades.atvTaxAdm', 'atividades.atvId']);
            
                if (cnv) {
                    //console.log(cnv);

                    let taxa = parseInt(cnv[0].atvTaxAdm)

                    //........ Buscar taxa administrativa mensal .........................................

                    let idAtv = cnv[0].atvId;

                    const txa = await connection('taxMensal')
                    .where('taxMenAtvId',idAtv)
                    .where('taxMenMes', month)
                    .where('taxMenAno', year)
                    .join('atividades', 'atvId', 'taxMensal.taxMenAtvId')
                    .select(['taxMenId', 'taxMenIndice', 'atividades.atvTaxAdm']);

                    if (txa) {
                        let taxa = parseInt(txa[0].taxMenIndice);
                    }

                    if (cnv) {                                
                        const total = await connection('cmpParcelas')
                        .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
                        .join('convenios', 'cnvId', 'compras.cmpConvenio')
                        .where('cmpParcelas.parVctParcela', datVencto)
                        .where('cmpParcelas.parStaParcela', status)
                        .where('compras.cmpConvenio', i )
                        .sum({totCmp: 'parVlrParcela'});

                        //console.log(total[0].totCmp);

                        let data = JSON.stringify(total[0].totCmp);
                        let totCompras = parseFloat(data);
                        if (isNaN(totCompras)) {
                            totCompras = 0.00
                        }
                        
                        let perSist = 0;
                        let auxParcela = 0.00;
                        let auxTaxa = 0.00;
                        let auxLiquido = 0.00; 
                        let auxSistema = 0.00;

                        if (totCompras > 0) {

                            if (taxa > 0) {
                                perSist = 25;
                                auxParcela = totCompras;
                                auxTaxa = ((auxParcela * taxa) / 100);
                                auxLiquido = auxParcela - auxTaxa; 
                                auxSistema = ((auxTaxa * perSist) / 100);
                            }else {
                                perSist = 0;
                                auxTaxa = 0;
                                auxParcela = totCompras;
                                auxLiquido = totCompras; 
                                auxSistema = 0.00;
                            }   

                            year = datVencto.getFullYear();
                            month = datVencto.getMonth() + 1;
                            
                            //console.log('Mes:',month);
                            //console.log('Ano:',year);
                            //console.log('Convênio:',i);
                            //console.log('Total Venda:',auxParcela);
                            //console.log('Taxa:',auxTaxa);
                            //console.log('Tot. Liquido:', auxLiquido);
                            //console.log('Tot. Sistema:', auxSistema);

                            const [totaliza] = await connection('totVdaCnv').insert({
                                tcnvId: i,
                                tcnvAno: year,
                                tcnvMes: month,
                                tcnvVlrTotal: auxParcela,
                                tcnvVlrTaxa: auxTaxa,
                                tcnvVlrLiquido: auxLiquido,
                                tcnvVlrSistema: auxSistema,                
                            });
                        }
                    }    
                }
                i++
            //}
            //month++;
            //if (month === 13) {
            //    year++
            //    month = 1
            //}
            
            //datVencto = new Date(year, month, day);
            //cnt++;
            //console.log('Data Vencimento:', datVencto);
        }    

       return response.status(200).json({ error: 'Totalizador processado com sucesso!'});
    },                    

    async pdfExtOrgao(request, response) {
        
        let vctParcela = request.params.dataInicial;
        let datProcess = new Date(request.params.dataInicial);
        let year = datProcess.getFullYear();
        let month = datProcess.getMonth() + 1;
        let day = datProcess.getDate();
        let dayVct = 15;    
         
        let status = 'A';
        const compras = await connection('totVdaOrg')
        .join('orgadmin', 'orgId', 'totVdaOrg.idTotOrg')
        .where('orgTotAno', year)
        .where('orgTotMes', month)
        .select(['totVdaOrg.*', 'orgadmin.orgDescricao']);
    
        return response.json(compras);
    },



};
