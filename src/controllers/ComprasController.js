const moment = require('moment');
const connection = require('../database/connection');
require('dotenv/config');

const nodemailer = require("nodemailer");

module.exports = {   
    async index (request, response) {
        let datSearch = moment('2023-06-15').format('YYYY-MM-DD');
        let status = 'A';
        //const votHora = moment().format('hh:mm:ss');

        const compras = await connection('cmpParcelas')
        .where('parVctParcela', datSearch)
        .where('parStaParcela', status)
        .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
        .join('servidores', 'usrId', 'compras.cmpServidor')
        .orderBy('parVctParcela')
        .select(['cmpParcelas.*', 'compras.cmpEmissao', 'compras.cmpServidor', 'compras.cmpConvenio', 'compras.cmpQtdParcela', 'servidores.usrNome']);

        return response.json(compras);
    },   
    
    async cmpConvenio (request, response) {
        let id = request.params.idCnv;
        let status = 'A';
        const compras = await connection('compras')
        .where('cmpConvenio', id)
        .where('cmpStatus', status)
        .join('servidores', 'usrId', 'compras.cmpServidor')
        .orderBy('cmpId', 'desc')
        .limit(20)
        .select(['compras.*', 'servidores.usrNome']);

        return response.json(compras);
    },    

    async cmpServidor (request, response) {
        let id = request.params.idSrv;
        let status = 'A';

        const compras = await connection('compras')
        .where('cmpServidor', id)
        .where('cmpStatus', status)
        .join('servidores', 'usrId', 'compras.cmpServidor')
        .join('convenios', 'cnvId', 'compras.cmpConvenio')
        .limit(50)
        .orderBy('cmpId', 'desc')
        .select(['compras.*', 'servidores.usrNome', 'convenios.cnvNomFantasia']);

        return response.json(compras);
    },  
    
    async dadCompra (request, response) {
        let id = request.params.idCmp;
        let status = 'A';

        const compras = await connection('compras')
        .where('cmpId', id)
        .where('cmpStatus', 'A')
        .join('servidores', 'usrId', 'compras.cmpServidor')
        .join('convenios', 'cnvId', 'compras.cmpConvenio')
        .orderBy('cmpId', 'desc')
        .select(['compras.*', 'servidores.usrNome', 'convenios.cnvNomFantasia']);

        //console.log(compras)
        
        return response.json(compras);
    },  

    async mosCompras(request, response) {
        const { cmpEmissao, cmpHorEmissao, cmpConvenio, cmpQtdParcela, cmpVlrCompra, cmpServidor, cmpCodSeguranca, cmpStatus } = request.body;
         
        const servidor = request.body.cmpServidor;
        const convenio = request.body.cmpConvenio;
        const emiCompra = request.body.cmpEmissao;
        const qtdParc = request.body.cmpQtdParcela;
        const vlrCompra = request.body.cmpVlrCompra;
        let valorCompra = 0.00;
        valorCompra = parseFloat(vlrCompra.toFixed(2));
    
        const compras = await connection('compras')
            .where('cmpServidor', servidor)
            .where('cmpConvenio', convenio)
            .where('cmpEmissao', emiCompra)
            .where('cmpVlrCompra', valorCompra)
            .where('cmpStatus', 'A')
            .select('*');

        if (!compras) {
            return response.status(402).json({ error: 'Não encontrou compras nesse periodo'});
        }   

        console.log('Total de registros...',compras.length);
        return response.json({compras});

    },

    async create(request, response) {
        const { cmpEmissao, cmpHorEmissao, cmpConvenio, cmpQtdParcela, cmpVlrCompra, cmpServidor, cmpCodSeguranca, cmpStatus } = request.body;
         
        const servidor = parseInt(request.body.cmpServidor);
        const convenio = parseInt(request.body.cmpConvenio);
        const emiCompra = request.body.cmpEmissao;
        const qtdParc = request.body.cmpQtdParcela;
        const vlrCompra = request.body.cmpVlrCompra;
        let valorCompra = 0.00;
        valorCompra = parseFloat(vlrCompra.toFixed(2));
    
        const compras = await connection('compras')
            .where('cmpServidor', servidor)
            .where('cmpConvenio', convenio)
            .where('cmpEmissao', emiCompra)
            .where('cmpVlrCompra', valorCompra)
            .where('cmpStatus', 'A')
            .select('*');
        
        //console.log('total de quantidade....', compras.length);

        if (compras.length > 0) {
           return response.status(405).json({ error: 'Compras encontradas nesse periodo'});
        }     

        //if (compras[0].cmpId === undefined) {
            //console.log('Não existe compra!')
            //console.log(servidor);
            //console.log(convenio);
            //console.log(emiCompra);
            //console.log(qtdParc);
            //console.log(valorCompra);

            const [cmpId] = await connection('compras').insert({
                cmpEmissao, 
                cmpHorEmissao, 
                cmpConvenio, 
                cmpQtdParcela, 
                cmpVlrCompra, 
                cmpServidor, 
                cmpCodSeguranca, 
                cmpStatus        
            });

            let datProcess = new Date();
            let year = datProcess.getFullYear();
            let month = datProcess.getMonth();
            let day = datProcess.getDate();
            let dayVct = 15;    

            const horProcess = moment().format('hh:mm:ss');        
            const idCompra = cmpId;    
        
            let vlrParcela = 0.00;
            vlrParcela = parseFloat((cmpVlrCompra).toFixed(2) / cmpQtdParcela);
            let vlrResult = 0.00;
            vlrResult = parseFloat((vlrParcela).toFixed(2) * cmpQtdParcela);
            let vlrResto = 0.00;
            vlrResto = parseFloat((cmpVlrCompra).toFixed(2) - (vlrResult).toFixed(2));

            let staParcela = 'A';
        
            for (let i = 1; i <= cmpQtdParcela; i++) {
                let parcela = i;

                if (parcela === 1 ) {
                    if (day > 15 ) {
                        month = month + 1;
                        if (month === 13) {
                            month = 1;
                            year = year + 1; 
                        }
                    }    
                }else {
                    month = month + 1;
                    if (month === 13) {
                        month = 1;
                        year = year + 1; 
                    }
                }

                let vctParcela = new Date(year,month,dayVct);
            
            //console.log('Vencimento parcela:',vctParcela);

                let anoParc = vctParcela.getFullYear();
                let mesParc = vctParcela.getMonth() + 1;

                let vlrProcess = 0;
                if (i === 1 ) {
                    vlrProcess = vlrParcela + vlrResto; 
                }else {
                    vlrProcess = vlrParcela; 
                }
            
                const [parId] = await connection('cmpParcelas').insert({
                    parIdCompra: idCompra,
                    parNroParcela: parcela,
                    parVctParcela: vctParcela,
                    parVlrCompra: vlrProcess,
                    parVlrParcela: vlrProcess,
                    parStaParcela: staParcela,                
                });

//            console.log('passou na parcela') 

                const cnv = await connection('convenios')
                .where('cnvId',convenio)
                .join('atividades', 'atvId', 'convenios.cnvAtividade')
                .select(['cnvId','atividades.atvTaxAdm']);
            
                let taxa = parseInt(cnv[0].atvTaxAdm)
            
                let perSist = 20;
                let auxParcela = vlrProcess;
                let auxTaxa = ((auxParcela * taxa) / 100);
                let auxLiquido = auxParcela - auxTaxa; 
                let auxSistema = ((auxTaxa * perSist) / 100);

//            console.log('mes totalizador de vendas convenio:', mesParc);


                const updConv = await connection('totVdaCnv')
                    .where('tcnvId',convenio)
                    .where('tcnvMes',mesParc)
                    .where('tcnvAno',anoParc)
                    .increment({tcnvVlrTotal: auxParcela})
                    .increment({tcnvVlrTaxa: auxTaxa})
                    .increment({tcnvVlrLiquido: auxLiquido})
                    .increment({tcnvVlrSistema: auxSistema});

                if(!updConv) {
                    const [totaliza] = await connection('totVdaCnv').insert({
                        tcnvId: convenio,
                        tcnvAno: anoParc,
                        tcnvMes: mesParc,
                        tcnvVlrTotal: auxParcela,
                        tcnvVlrTaxa: auxTaxa,
                        tcnvVlrLiquido: auxLiquido,
                        tcnvVlrSistema: auxSistema,                
                    });
                }

//            console.log('totalizou convenio')

                const usr = await connection('servidores')
                .where('usrId',servidor)
                .select('usrCartao', 'usrEmail', 'usrNome');

                let nroCartao = usr[0].usrCartao;            
//            
//            console.log('Cartão:',nroCartao);
//            console.log('mes:',mesParc);
//            console.log('ano:',anoParc);
//
                const updServ = await connection('usrSaldo')
                .where('usrServ',nroCartao)
                .where('usrMes',mesParc)
                .where('usrAno',anoParc)
                .increment({usrVlrUsado: vlrParcela})
                .decrement({usrVlrDisponivel: vlrParcela});       
                
                if(!updServ) {
                    const usuario = await connection('servidores')
                    .where('usrCartao',nroCartao)
                    .select('usrSalLiquido');
         
                    if (!usuario) {
                        return response.status(400).json({ error: 'Não encontrou servidor com este ID'});
                    } 
          
                    let vlrLimite = ((usuario[0].usrSalLiquido * 30) / 100);

                    const [saldo] = await connection('usrSaldo').insert({
                        usrServ: nroCartao,
                        usrMes: mesParc,
                        usrAno: anoParc,
                        usrVlrDisponivel: vlrLimite,
                        usrVlrUsado: vlrParcela,
                    });
                }
            }

            return response.status(200).send();                        
    }, 
      
    async searchCompras (request, response) {
        let id = request.params.idCmp;
        let status = 'A';

        const compra = await connection('compras')
        .where('cmpId', id)
        .where('cmpStatus', status)
        .select('*');

        return response.json(compra);
    },   
    
    async datatest (request, response) {
        const dtAtual = moment();

        //console.log(dtAtual.date()); // Imprimindo o dia
        //console.log(dtAtual.month()); // Imprimindo o mês
        //console.log(dtAtual.year()); // Imprimindo o ano
        //console.log(dtAtual.hour()); // Imprimindo a hora
        //console.log(dtAtual.minute()); // Imprimindo os minutos
        //console.log(dtAtual.second()); // Imprimindo os segundos

        var year = dtAtual.year();
        var month = dtAtual.month();
        var day = 15;
        
        //dtAtual.add(1, "M");
        //console.log('inicial:', dtAtual);

        for(var i=1; i <= 10; i++) {
            dtAtual.add(1, "M");
            //console.log(i, dtAtual.format('DD/MM/YYYY'));
        }
    },  

    async cmpVencto (request, response) {
        let datSearch = request.params.datVencto;
        let srvStatus = request.params.regStatus;
        let status = 'A';

        const compras = await connection('cmpParcelas')
        .where('parVctParcela', datSearch)
        .where('parStaParcela', status)
        .whereIn('usrId', function() {
            this.where('usrStatus', srvStatus)
            this.select('usrId').from('servidores');
          })
        .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
        .join('servidores', 'usrId', 'compras.cmpServidor')
        .orderBy('parVctParcela')
        .select(['cmpParcelas.*', 'compras.cmpEmissao', 'compras.cmpServidor', 'compras.cmpConvenio', 'compras.cmpQtdParcela', 'servidores.usrNome', 'servidores.usrStatus']);

        return response.json(compras);

    },

    async cmpOrgVenc (request, response) {
        let datSearch = request.params.datVencto;
        let srvStatus = request.params.regStatus;
        let idOrg = request.params.orgao;
        let status = 'A';
        const compras = await connection('cmpParcelas')
        .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
        .join('servidores', 'usrId', 'compras.cmpServidor')
        .join('secretarias', 'secId', 'servidores.usrSecretaria')
        .join('orgadmin', 'orgId', 'secretarias.secOrgAdm')
        .where('parVctParcela', datSearch)
        .where('parStaParcela', status)
        .where('orgId', idOrg)
        .whereIn('usrId', function() {
            this.where('usrStatus', srvStatus)
            this.select('usrId').from('servidores');
          })
        .orderBy('parVctParcela')
        .select(['cmpParcelas.*', 'compras.cmpEmissao', 'compras.cmpServidor', 'compras.cmpConvenio', 'compras.cmpQtdParcela', 'servidores.usrNome', 'servidores.usrStatus', 'secretarias.secDescricao', 'orgadmin.orgId', 'orgadmin.orgDescricao']);

        return response.json(compras);

    },

    async totCompras (request, response) {
        let datSearch = request.params.datVencto;
        let srvStatus = request.params.regStatus;
        let status = 'A';
        const total = await connection('cmpParcelas')
        .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
        .join('servidores', 'usrId', 'compras.cmpServidor')
        .where('parVctParcela', datSearch)
        .where('parStaParcela', status)
        .whereIn('usrId', function() {
            this.where('usrStatus', srvStatus)
            this.select('usrId').from('servidores');
        })
        .sum({totCmp : 'parVlrParcela'});

        return response.json(total);
        
    },   

    async totCmpOrgao (request, response) {
        let datSearch = request.params.datVencto;
        let srvStatus = request.params.regStatus;
        let idOrg = request.params.orgao;
        let status = 'A';
        
        const total = await connection('cmpParcelas')
        .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
        .join('servidores', 'usrId', 'compras.cmpServidor')
        .join('secretarias', 'secId', 'servidores.usrSecretaria')
        .join('orgadmin', 'orgId', 'secretarias.secOrgAdm')
        .where('parVctParcela', datSearch)
        .where('parStaParcela', status)
        .where('orgId', idOrg)
        .whereIn('usrId', function() {
            this.where('usrStatus', srvStatus)
            this.select('usrId').from('servidores');
          })
        .sum({totCmp : 'parVlrParcela'});

        return response.json(total);

    },   

    async cncCompra(request, response) {
         
        let id = request.params.idCmp;
        const { cmpIdCanc } = request.body;
         
        let administrador = request.body.cmpIdCanc;
        let datCanc = new Date; 
        let status = 'C';      

        const compras = await connection('compras')
            .where('cmpId', id)
            .join('servidores', 'usrId', 'compras.cmpServidor')
            .select(['compras.cmpServidor', 'compras.cmpConvenio', 'compras.cmpServidor', 'compras.cmpQtdParcela', 'servidores.usrCartao']);

        let nroCartao = compras[0].usrCartao;
        let qtdParc = compras[0].cmpQtdParcela;

        const cncCompra = await connection('compras')
            .where('cmpId',id)
            .update({
                cmpResCancel: administrador,
                cmpDatCancel: datCanc,
                cmpStatus: status
        });
                
        const cncParcelas = await connection('cmpParcelas')
            .where('parIdCompra',id)
            .update({
                parStaParcela: status,
        })

        let nro = 1;
        const parc = await connection('cmpParcelas')
            .where('parIdCompra',id)
            .where('parNroParcela', nro)
            .select('parVctParcela', 'parVlrParcela')
        
        let datProcess = parc[0].parVctParcela;    
        let year = datProcess.getFullYear();
        let month = datProcess.getMonth() + 1;

        let vlrParcela = parc[0].parVlrParcela;

        while (nro <= qtdParc) { 

            //console.log(nroCartao);
            //console.log(year);
            //console.log(month);
            //console.log(vlrParcela);

            const updServ = await connection('usrSaldo')
                .where('usrServ',nroCartao)
                .where('usrMes',month)
                .where('usrAno',year)
                .decrement({usrVlrUsado: vlrParcela})
                .increment({usrVlrDisponivel: vlrParcela});          

            month++;
            if (month === 13) {
                month = 1;
                year++;
            } 
            nro++;   
        }

        return response.json({cncCompra});
    },

    async busTotCmp(request, response) {
        let id = request.params.idUsr;
        let status = 'A';
        let datProcess = new Date();
        let day = '15';
        let year = datProcess.getFullYear();
        let month = datProcess.getMonth() ;
        let datVencto = new Date(year, month, day);

        const serv = await connection('servidores')
            .where('usrId', id)
            .select('usrCartao', 'usrSalLiquido');

        let nroCartao = serv[0].usrCartao;
        let vlrLimite = ((serv[0].usrSalLiquido * 30) / 100);
        let nro = 1;
        
        console.log('Antes:',nroCartao)
        console.log('Antes',vlrLimite)
        
        while (nro <= 25){

            console.log('inicio...')
            
            const total = await connection('cmpParcelas')
                .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
                .join('servidores', 'usrId', 'compras.cmpServidor')
                .join('secretarias', 'secId', 'servidores.usrSecretaria')
                .join('orgadmin', 'orgId', 'secretarias.secOrgAdm')
                .where('cmpParcelas.parVctParcela', datVencto)
                .where('cmpParcelas.parStaParcela', status)
                .where('compras.cmpServidor', id )
                //.select(['cmpParcelas.parIdCompra','cmpParcelas.parVctParcela', 'cmpParcelas.parVlrParcela', 'compras.cmpServidor'])
                .sum({totCmp: 'parVlrParcela'});

            if (!total ) {
                return response.status(400).json({ error: 'Não encontrou compras nesse periodo'});
            }

            let data = JSON.stringify(total[0].totCmp);

            console.log(data);

            let totCompras = parseFloat(data);
            if (isNaN(totCompras)) {
                totCompras = 0.00
            }
            let vlrDisponivel = vlrLimite - totCompras;
            
            console.log(month);
            console.log(year);
            console.log(totCompras);
            console.log(vlrDisponivel);

            if (totCompras === null ) {
                return response.status(400).json({ error: 'Não encontrou compras nesse periodo II'});
            }

            const updServ = await connection('usrSaldo')
                .where('usrServ',nroCartao)
                .where('usrMes',month)
                .where('usrAno',year)
                .update({
                    usrVlrUsado: totCompras,
                    usrVlrDisponivel: vlrDisponivel
                })
            
            month++;
            if (month === 13) {
                month = 1;
                year++;
            } 
            datVencto = new Date(year, month, day);
            nro++;    
        }        
        return response.status(204).send();
                
    },    

    async corTotCmp(request, response) {
        let vet = 1;
        while (vet <= 50) { 
            let id = vet;
            let status = 'A';
            let datProcess = new Date();
            let day = '15';
            let year = datProcess.getFullYear();
            let month = datProcess.getMonth() ;
            let datVencto = new Date(year, month, day);

            console.log('Convenio:', id )
            console.log('Data:', datVencto)

            let auxTotCompras = 0.00;
            let auxTotTaxa = 0.00;
            let auxTotLiquido = 0.00;
            let auxTotSistema = 0.00;

            const total = await connection('cmpParcelas')
                .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
                .join('servidores', 'usrId', 'compras.cmpServidor')
                .join('secretarias', 'secId', 'servidores.usrSecretaria')
                .join('orgadmin', 'orgId', 'secretarias.secOrgAdm')
                .where('cmpParcelas.parVctParcela', datVencto)
                .where('cmpParcelas.parStaParcela', status)
                .where('compras.cmpConvenio', id )
                .sum({totCmp: 'parVlrParcela'});

            if (!total ) {
                month = month + 1;
                auxTotCompras = 0.00;
                auxTotTaxa = 0.00;
                auxTotLiquido = 0.00;
                auxTotSistema = 0.00;
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

                //const [totaliza] = await connection('totVdaCnv').insert({
                //    tcnvId: id,
                //    tcnvAno: year,
                //    tcnvMes: month,
                //    tcnvVlrTotal: auxTotCompras,
                //    tcnvVlrTaxa: auxTotTaxa,
                //    tcnvVlrLiquido: auxTotLiquido,
                //    tcnvVlrSistema: auxTotSistema,                
                //});

                //const updConv = await connection('totVdaCnv')
                //.where('tcnvId',id)
                //.where('tcnvMes',month)
                //.where('tcnvAno',year)
                //.update({
                //    tcnvVlrTotal: auxTotCompras,
                //    tcnvVlrTaxa: auxTotTaxa,
                //    tcnvVlrLiquido: auxTotLiquido,
                //    tcnvVlrSistema: auxTotSistema
                //});
            
                return response.status(400).json({ error: 'Não encontrou compras nesse periodo'});

            }else {

                if (total[0].totCmp > 0 ) {
                    //console.log('Total de Compras:', total[0].totCmp);
                    const cnv = await connection('convenios')
                    .where('cnvId',id)
                    .join('atividades', 'atvId', 'convenios.cnvAtividade')
                    .select(['cnvId','atividades.atvTaxAdm']);
    
                    //console.log('Taxa:', cnv[0].atvTaxAdm)
                    let taxa = parseInt(cnv[0].atvTaxAdm);

                    auxTotCompras = parseFloat(total[0].totCmp);
                    auxTotTaxa = ((auxTotCompras * taxa) / 100);
                    auxTotLiquido = auxTotCompras - auxTotTaxa; 
                    auxTotSistema = ((auxTotTaxa * 20) / 100);

                    month = month + 1;
                    console.log('Mes:', month);
                    console.log('Ano:', year);
                    console.log('Convenio:', id);
                    console.log('Vlr Total:', auxTotCompras);

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

                    const totCnv = await connection('totVdaCnv')
                    .where('tcnvId',id)
                    .where('tcnvMes',month)
                    .where('tcnvAno',year)
                    .select('tcnvVlrTotal', 'tcnvVlrTaxa', 'tcnvVlrLiquido', 'tcnvVlrSistema');
                }
            }
            vet++;      
        }    
        return response.status(200).json({ error: 'Verificado valores de venda dos convênios'});
    },

    async aceTotCmp(request, response) {
        let status = 'A';
        let datProcess = new Date();
        let day = '15';
        let year = datProcess.getFullYear();
        let month = datProcess.getMonth() ;
        let datVencto = new Date(year, month, day);

        const total = await connection('cmpParcelas')
        .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
        .join('servidores', 'usrId', 'compras.cmpServidor')
        .join('secretarias', 'secId', 'servidores.usrSecretaria')
        .join('orgadmin', 'orgId', 'secretarias.secOrgAdm')
        .join('convenios', 'cnvId', 'compras.cmpConvenio')
        .where('cmpParcelas.parVctParcela', datVencto)
        .where('cmpParcelas.parStaParcela', status)
        .select(['cmpParcelas.parIdCompra','cmpParcelas.parVctParcela', 'cmpParcelas.parVlrParcela', 'compras.cmpServidor', 'compras.cmpConvenio', 'servidores.usrCartao'])
        .orderBy('compras.cmpServidor');

        let id = total[0].cmpServidor;

        const serv = await connection('servidores')
            .where('usrId', id)
            .select('usrCartao', 'usrSalLiquido');

        let nroCartao = serv[0].usrCartao;
        let vlrLimite = ((total[0].usrSalLiquido * 30) / 100);
        let nro = 1;
        
        //console.log('Cartão:',nroCartao)
        
        let data = total[0].parVlrParcela;

        //console.log(data);

        let totCompras = parseFloat(data);
        if (isNaN(totCompras)) {
            totCompras = 0.00
        }
        //let vlrDisponivel = vlrLimite - totCompras;
            
        //console.log(month);
        //console.log(year);
        //console.log(totCompras);
        //console.log(vlrDisponivel);

        if (totCompras === null ) {
            return response.status(400).json({ error: 'Não encontrou compras nesse periodo II'});
        }

        //const updServ = await connection('usrSaldo')
        //    .where('usrServ',nroCartao)
        //    .where('usrMes',month)
        //    .where('usrAno',year)
        //    .decrement({usrVlrUsado: totCompras})
        //    .increment({usrVlrDisponivel: totCompras})
            
            
        return response.status(204).send();
                
    },

    //..........................................................................

    async corCmpServ(request, response) {
        let status = 'A';
        let datProcess = new Date();
        let day = '15';
        let year = datProcess.getFullYear();
        let month = datProcess.getMonth() ;
        let datVencto = new Date(year, month, day);
        console.log('Data selecionada:', datVencto)
        let err = 0;
        let vlrZerado = 0.00;
        month = month + 1;
        let vet = 1;
        while (vet <= 300) { 
            const user = await connection('servidores')
            .where('usrId', vet)
            .select('*');

            if (user.length > 0 ) {
                let nome = user[0].usrNome;
                //console.log('Nome Servidor: ', nome, 'id:', vet);
                //console.log(user)
                let cartao = user[0].usrCartao;
                let vlrLimite = ((user[0].usrSalLiquido * 30) / 100);
                let totCmp = 0.00;

                const total = await connection('cmpParcelas')
                .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
                .join('servidores', 'usrId', 'compras.cmpServidor')
                .join('secretarias', 'secId', 'servidores.usrSecretaria')
                .join('orgadmin', 'orgId', 'secretarias.secOrgAdm')
                .join('convenios', 'cnvId', 'compras.cmpConvenio')
                .where('compras.cmpServidor', vet)
                .where('cmpParcelas.parVctParcela', datVencto)
                .where('cmpParcelas.parStaParcela', status)
                .sum({totCmp: 'parVlrParcela'});

                if (total[0].totCmp === null) {
                    //console.log('Compras não encontrada!')
                    err = err + 1;
                }else {
                    //console.log('Cartão: ', cartao, 'Tot. Compras R$: ',total[0].totCmp );
                    //month = month + 1;
                    let totCmp = total[0].totCmp;
                    let vlrZerado = 0.00;
                    
                    const sldServ = await connection('usrSaldo')
                        .where('usrServ', cartao)
                        .where('usrMes',month)
                        .where('usrAno',year)
                        .select('*');

                    console.log('Saldo Encontrado!', cartao, 'mes:' ,month, 'Ano:', year )

                    if (sldServ.length > 0 ) {
                        const saldo = await connection('usrSaldo')
                        .where('usrServ', cartao)
                        .where('usrMes',month)
                        .where('usrAno',year)
                        .update({
                            usrVlrUsado: vlrZerado,
                            usrVlrDisponivel: vlrLimite
                        });                    
                    }else {
                        const saldo = await connection('usrSaldo')                        
                        .insert({
                            usrServ: cartao,
                            usrMes: month,
                            usrAno: year,
                            usrVlrUsado: vlrZerado,
                            usrVlrDisponivel: vlrLimite
                        }); 
                        console.log('Saldo novo encontrado!', cartao, 'Valor:' ,totCmp)
                    }

                    const updServ = await connection('usrSaldo')
                    .where('usrServ',cartao)
                    .where('usrMes',month)
                    .where('usrAno',year)
                    .increment({usrVlrUsado: totCmp})
                    .decrement({usrVlrDisponivel: totCmp})
                }           
            }        

            vet++;
        }

        return response.status(200).json({ msn: 'Saldo verificado!'});
       
    },

    async verifCompras (request, response) {
        let status = 'A';
        let qtd = 1;

        let vet = 144;
        while(vet < 3600) {
            const compra = await connection('compras')
            .where('cmpId', vet)
            .where('cmpQtdParcela', '>', qtd)
            .where('cmpStatus', status)
            .select('*');
            if (compra.length > 0) {
                let datProcess = new Date();
                let year = datProcess.getFullYear();
                let month = datProcess.getMonth();
                let day = datProcess.getDate();
                let dayVct = 15;    

                let horProcess = moment().format('hh:mm:ss');        
                let idCompra = compra[0].cmpId;    
        
                let vlrParcela = 0.00;
                vlrParcela = parseFloat((compra[0].cmpVlrCompra) / compra[0].cmpQtdParcela);
                let vlrResult = 0.00;
                vlrResult = parseFloat((vlrParcela) * compra[0].cmpQtdParcela);
                let vlrResto = 0.00;
                vlrResto = parseFloat((compra[0].cmpVlrCompra) - (vlrResult).toFixed(2));

                let staParcela = 'A';

                console.log(compra[0].cmpId)
                console.log(compra[0].cmpQtdParcela)
                console.log(vlrParcela)
                console.log(vlrResult)
                console.log(vlrResto)

                let parc = 1;
                while (parc <= compra[0].cmpQtdParcela) {
                    const item = await connection('cmpParcelas')
                    .where('parIdCompra', idCompra)
                    .where('parNroParcela', parc)
                    .select('*');

                    let vctParcela = '';
                    let vlrProcess = 0.00;
                    let staParcela = 'A';

                    if (item.length > 0 ) {
                        console.log('parcela:', parc, item[0].parVctParcela )
                        vctParcela = item[0].parVctParcela;
                        vlrParcela = item[0].parVlrParcela;
                        month = item[0].parVctParcela.getMonth();
                        year = item[0].parVctParcela.getFullYear();
                    }else {
                        month = month + 1;                        
                        if (month === 13 ) {
                            year = year + 1 
                            month = 1
                        }                       
                        day = 15;
                        
                        let vctParcela = new Date(year, month, day);
                        let vlrProcess = vlrParcela;

                        const [parId] = await connection('cmpParcelas').insert({
                            parIdCompra: idCompra,
                            parNroParcela: parc,
                            parVctParcela: vctParcela,
                            parVlrCompra: vlrProcess,
                            parVlrParcela: vlrProcess,
                            parStaParcela: staParcela,                
                        });

                        console.log('Nova Parcela gerada:', parc, 'Vencto:' , vctParcela, 'Valor:', vlrProcess)                        
                    }    
                    parc = parc + 1;
                }
            }else {
                console.log('Compra não encontrada', vet)
            }    
            vet = vet + 1;
        }

        return response.status(200).send();
    },   

    async ultCompras(request, response) {
        const servidor = request.params.id;
        const compras = await connection('cmpParcelas')
            .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
            .join('servidores', 'usrId', 'compras.cmpServidor')
            .join('convenios', 'cnvId', 'compras.cmpConvenio')
            .where('compras.cmpServidor', servidor)
            .where('parStaParcela', 'A')
            .limit(10)
            .orderBy('compras.cmpEmissao', 'desc')
            .select(['cmpParcelas.*', 'servidores.usrId', 'servidores.usrNome', 'compras.cmpEmissao', 'compras.cmpQtdParcela', 'compras.cmpVlrCompra', 'convenios.cnvId', 'convenios.cnvNomFantasia']);

        if (!compras) {
            return response.status(402).json({ error: 'Não encontrou compras nesse periodo'});
        }   

        return response.json(compras);

    },

};