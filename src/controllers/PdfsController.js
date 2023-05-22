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
        let status = 'A';
        //console.log(inicio);
        //console.log(final);

        const datNow = moment().format('DD-MM-YYYY');
        const horNow = moment().format('hh:mm:ss');  
                
        const vctcompras = await connection('cmpParcelas')
            .where('parVctParcela','>=', inicio)
            .where('parVctParcela','<=', final)
            .where('parStaParcela', status)
            .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
            .join('servidores', 'usrId', 'compras.cmpServidor')
            .join('convenios', 'cnvId', 'compras.cmpConvenio')
            .select(['cmpParcelas.*', 'compras.cmpEmissao', 'compras.cmpServidor', 'compras.cmpConvenio', 'servidores.usrNome', 'servidores.usrMatricula', 'convenios.cnvNomFantasia']);

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

    async pdfVctCmpCnv (request, response) {
        let inicio = request.params.datInicial;
        let final = request.params.datFinal;
        let convenio = request.params.cnvId;
        let status = 'A';

        let datIni = inicio.split('/').reverse().join('-');
        let datFin = final.split('/').reverse().join('-');
        
        //console.log(inicio);
        //console.log(final);
        //.log(convenio);

        const datNow = moment().format('DD-MM-YYYY');
        const horNow = moment().format('hh:mm:ss');  
                
        const vctcompras = await connection('cmpParcelas')
            .where('parVctParcela','>=', datIni)
            .where('parVctParcela','<=', datFin)
            .where('parStaParcela', status)
            .where('convenios.cnvId', convenio)
            .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
            .join('servidores', 'usrId', 'compras.cmpServidor')
            .join('convenios', 'cnvId', 'compras.cmpConvenio')
            .select(['cmpParcelas.*', 'compras.cmpId', 'compras.cmpQtdParcela', 'compras.cmpEmissao', 'compras.cmpServidor', 'compras.cmpConvenio', 'compras.cmpVlrCompra', 'servidores.usrNome', 'convenios.cnvNomFantasia']);

            console.log(vctcompras)

        return response.json(vctcompras);
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

    async pdfVctOrgao (request, response) {
        //let datSearch = moment('2022-01-15').format('YYYY-MM-DD');
        //const votHora = moment().format('hh:mm:ss');
        
        let inicio = request.params.dataInicial;
        let final = request.params.dataFinal;
        let idOrg = request.params.orgId;
        let status = 'A';
        //console.log(inicio);
        //console.log(final);
        //console.log(idOrg);

        const datNow = moment().format('DD-MM-YYYY');
        const horNow = moment().format('hh:mm:ss');  
                
        const vctcompras = await connection('cmpParcelas')
            .where('parVctParcela','>=', inicio)
            .where('parVctParcela','<=', final)
            .where('parStaParcela', status)
            .where('orgId', idOrg)
            .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
            .join('servidores', 'usrId', 'compras.cmpServidor')
            .join('convenios', 'cnvId', 'compras.cmpConvenio')
            .join('secretarias', 'secId', 'servidores.usrSecretaria')
            .join('orgadmin', 'orgId', 'secretarias.secOrgAdm')
            .select(['cmpParcelas.*', 'compras.cmpEmissao', 'compras.cmpServidor', 'compras.cmpConvenio', 'servidores.usrNome', 'convenios.cnvNomFantasia','secretarias.secOrgAdm', 'orgadmin.orgId']);
             
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
    
    async pdfCmpEmis (request, response) {
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
            const result1 = await connection('compras')
                .where('cmpEmissao','>=', inicio)
                .where('cmpEmissao','<=', final)
                .where('cmpStatus', status)
                .join('servidores', 'usrId', 'compras.cmpServidor')
                .join('convenios', 'cnvId', 'compras.cmpConvenio')
                .select(['compras.*', 'servidores.usrCpf', 'servidores.usrNome', 'servidores.usrMatricula', 'convenios.cnvCpfCnpj', 'convenios.cnvNomFantasia']);
            //console.log(result1)
            return response.json(result1)
        }else {
            if (cnpjCnv === '0' && cpfSrv != '0') {
                const result2 = await connection('compras')
                    .where('cmpEmissao','>=', inicio)
                    .where('cmpEmissao','<=', final)
                    .where('cmpStatus', status)
                    .where('servidores.usrCpf', cpfSrv)
                    .join('servidores', 'usrId', 'compras.cmpServidor')
                    .join('convenios', 'cnvId', 'compras.cmpConvenio')
                    .select(['compras.*', 'servidores.usrCpf', 'servidores.usrNome', 'servidores.usrMatricula', 'convenios.cnvCpfCnpj', 'convenios.cnvNomFantasia']);
                return response.json(result2)    
            }else{
                if (cnpjCnv != '0' && cpfSrv === '0') {
                    const result3 = await connection('compras')
                        .where('cmpEmissao','>=', inicio)
                        .where('cmpEmissao','<=', final)
                        .where('cmpStatus', status)
                        .where('convenios.cnvCpfCnpj', cnpjCnv)                    
                        .join('servidores', 'usrId', 'compras.cmpServidor')
                        .join('convenios', 'cnvId', 'compras.cmpConvenio')
                        .select(['compras.*', 'servidores.usrCpf', 'servidores.usrNome', 'servidores.usrMatricula', 'convenios.cnvCpfCnpj', 'convenios.cnvNomFantasia']);
                    return response.json(result3)
                }else {
                    const result4 = await connection('compras')
                        .where('cmpEmissao','>=', inicio)
                        .where('cmpEmissao','<=', final)
                        .where('cmpStatus', status)
                        .where('convenios.cnvCpfCnpj', cnpjCnv)  
                        .where('servidores.usrCpf', cpfSrv)                  
                        .join('servidores', 'usrId', 'compras.cmpServidor')
                        .join('convenios', 'cnvId', 'compras.cmpConvenio')
                        .select(['compras.*', 'servidores.usrCpf', 'servidores.usrNome', 'servidores.usrMatricula', 'convenios.cnvCpfCnpj', 'convenios.cnvNomFantasia']);
                    return response.json(result4) 
                }
            }
        }     
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
                    .where('servidores.usrCpf', cpfSrv)
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
                        .where('servidores.usrCpf', cpfSrv)                 
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
                    .where('servidores.usrCpf', cpfSrv)
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
                        .where('servidores.usrCpf', cpfSrv)                 
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
                    .where('servidores.usrCpf', cpfSrv)
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
                        .where('servidores.usrCpf', cpfSrv)                 
                        .join('compras', 'cmpId', 'cmpParcelas.parIdCompra') 
                        .join('servidores', 'usrId', 'compras.cmpServidor')
                        .join('convenios', 'cnvId', 'compras.cmpConvenio')
                        .sum({totCmp : 'parVlrParcela'});
                    return response.json(result4) 
                }
            }
        }     
    },
    
    async pdfExtAdm (request, response) {
        let inicio = request.params.dataInicial;

        let datProcess = new Date(inicio);
        let year = datProcess.getFullYear();
        let month = datProcess.getMonth() + 1;
        
        //console.log(year);
        //console.log(month);

        const totaliza = await connection('totVdaCnv')
        .where('tcnvMes',month)
        .where('tcnvAno',year)
        .join('convenios', 'cnvId', 'totVdaCnv.tcnvId')
        .select(['totVdaCnv.*', 'convenios.cnvCpfCnpj', 'convenios.cnvNomFantasia']);
        
        //console.log(totaliza);

        return response.json(totaliza);
    }, 

};
