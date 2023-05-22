const moment = require('moment');
const connection = require('../database/connection');
require('dotenv/config');

const nodemailer = require("nodemailer");

module.exports = {   
    async index (request, response) {
        let datSearch = moment('2022-01-15').format('YYYY-MM-DD');
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
        .limit(20)
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

    async create(request, response) {
        const { cmpEmissao, cmpHorEmissao, cmpConvenio, cmpQtdParcela, cmpVlrCompra, cmpServidor, cmpCodSeguranca, cmpStatus } = request.body;
         
        let servidor = request.body.cmpServidor;
        let convenio = request.body.cmpConvenio;
        const emiCompra = request.body.cmpEmissao;
        const qtdParc = request.body.cmpQtdParcela;
        const vlrCompra = request.body.cmpVlrCompra;
        
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

        //console.log(datProcess);
        //console.log('Ano:', year);
        //console.log('Mes:', month);
        //console.log('Dia:', day);

        //console.log('passou na compra')

        const horProcess = moment().format('hh:mm:ss');        
        const idCompra = cmpId;    
        
        let vlrResto = cmpVlrCompra % cmpQtdParcela;
        let vlrParcela = ((cmpVlrCompra - vlrResto) / cmpQtdParcela);
        
        //console.log(cmpVlrCompra);
        //console.log(vlrResto);
        //console.log(vlrParcela);

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

            //console.log('passou na parcela') 

            const cnv = await connection('convenios')
            .where('cnvId',convenio)
            .join('atividades', 'atvId', 'convenios.cnvAtividade')
            .select(['cnvId','atividades.atvTaxAdm']);
            
            let taxa = parseInt(cnv[0].atvTaxAdm)
            
            let perSist = 25;
            let auxParcela = vlrProcess;
            let auxTaxa = ((auxParcela * taxa) / 100);
            let auxLiquido = auxParcela - auxTaxa; 
            let auxSistema = ((auxTaxa * perSist) / 100);

            //console.log('mes totalizador de vendas convenio:', mesParc);

            const atuCnv = await connection('totVdaCnv')
            .where('tcnvId',convenio)
            .where('tcnvMes',mesParc)
            .where('tcnvAno',anoParc)
            .select('tcnvVlrTotal');

            if(!atuCnv) {
                const [totaliza] = await connection('totVdaCnv').insert({
                    tcnvId: convenio,
                    tcnvAno: anoParc,
                    tcnvMes: mesParc,
                    tcnvVlrTotal: auxParcela,
                    tcnvVlrTaxa: auxTaxa,
                    tcnvVlrLiquido: auxLiquido,
                    tcnvVlrSistema: auxSistema,                
                });
            }else {
                const updConv = await connection('totVdaCnv')
                .where('tcnvId',convenio)
                .where('tcnvMes',mesParc)
                .where('tcnvAno',anoParc)
                .increment({tcnvVlrTotal: auxParcela})
                .increment({tcnvVlrTaxa: auxTaxa})
                .increment({tcnvVlrLiquido: auxLiquido})
                .increment({tcnvVlrSistema: auxSistema});
            };          

            //console.log('totalizou convenio')

            const usr = await connection('servidores')
            .where('usrId',servidor)
            .select('usrCartao', 'usrEmail', 'usrNome');

            let nroCartao = usr[0].usrCartao;            
            //console.log('Cartão:',nroCartao);
            //console.log('mes:',mesParc);
            //console.log('ano:',anoParc);

            const updServ = await connection('usrSaldo')
            .where('usrServ',nroCartao)
            .where('usrMes',mesParc)
            .where('usrAno',anoParc)
            .increment({usrVlrUsado: vlrParcela})
            .decrement({usrVlrDisponivel: vlrParcela});        

            //console.log('atualizou saldo servidor')
        }

        const conv = await connection('convenios')
        .where('cnvId', cmpConvenio)
        .select('cnvEmail', 'cnvNomFantasia')
        .first();

        if (!conv) {
            return response.status(400).json({ error: 'Não encontrou usuario com este email'});
        } 

        let emailConv = conv.cnvEmail;

        const serv = await connection('servidores')
        .where('usrId', cmpServidor)
        .select('usrEmail', 'usrNome')
        .first();
        
        const emailUsuario = serv.usrEmail;
        const nomServidor = serv.usrNome;

        let admEmail = process.env.EMAIL_USER;
        let hostEmail = process.env.EMAIL_HOST;
        let portEmail =  process.env.EMAIL_PORT;

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: true,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
            tls: {
              rejectUnauthorized: false,
            },
        });

        const mailSent = await transporter.sendMail({
            text: `Confirmação de Compra`,
            subject: "E-mail de confirmação de compra no cartão CaldasCard",
            from: process.env.EMAIL_FROM,
            to: emailUsuario,
            cc: emailConv,
            html: `
            <html>
            <body>
                <center><h1>Olá ,${nomServidor}<h1></center>
                <center><p>Você efetuou uma compra com o seu cartão CALDASCARD</p></center></b></b>
                <center><p>Dados da Compra</p></center></b></b>
                <center><h3>Codigo da Compra:${idCompra}</h3></center></b></b></b>
                <center><h3>Emissão Compra:${emiCompra}</h3></center></b></b></b>
                <center><h3>Qtde de Parcelas:${qtdParc}</h3></center></b></b></b>
                <center><h3>Valor da Compra:${vlrCompra}</h3></center></b></b></b>
                <center><img src="public/logo-barra.png" alt="CaldasCard" align="center" width="300px" height="120" /></center>
            </body>
          </html> 
            `,
        });
        //console.log(mailSent);

        console.log('enviou email da compra')
                        
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
        let status = 'A';

        const compras = await connection('cmpParcelas')
        .where('parVctParcela', datSearch)
        .where('parStaParcela', status)
        .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
        .join('servidores', 'usrId', 'compras.cmpServidor')
        .orderBy('parVctParcela')
        .select(['cmpParcelas.*', 'compras.cmpEmissao', 'compras.cmpServidor', 'compras.cmpConvenio', 'compras.cmpQtdParcela', 'servidores.usrNome']);

        return response.json(compras);

    },

    async cmpOrgVenc (request, response) {
        let datSearch = request.params.datVencto;
        let idOrg = request.params.orgao;
        let status = 'A';
        const compras = await connection('cmpParcelas')
        .where('parVctParcela', datSearch)
        .where('parStaParcela', status)
        .where('orgId', idOrg)
        .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
        .join('servidores', 'usrId', 'compras.cmpServidor')
        .join('secretarias', 'secId', 'servidores.usrSecretaria')
        .join('orgadmin', 'orgId', 'secretarias.secOrgAdm')
        .orderBy('parVctParcela')
        .select(['cmpParcelas.*', 'compras.cmpEmissao', 'compras.cmpServidor', 'compras.cmpConvenio', 'compras.cmpQtdParcela', 'servidores.usrNome', 'secretarias.secDescricao', 'orgadmin.orgId', 'orgadmin.orgDescricao']);

        return response.json(compras);

    },

    async totCompras (request, response) {
        let datSearch = request.params.datVencto;
        let status = 'A';
        const total = await connection('cmpParcelas')
        .where('parVctParcela', datSearch)
        .where('parStaParcela', status)
        .sum({totCmp : 'parVlrParcela'});

        return response.json(total);

    },   

    async totCmpOrgao (request, response) {
        let datSearch = request.params.datVencto;
        let idOrg = request.params.orgao;
        let status = 'A';
        
        const total = await connection('cmpParcelas')
        .where('parVctParcela', datSearch)
        .where('parStaParcela', status)
        .where('orgId', idOrg)
        .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
        .join('servidores', 'usrId', 'compras.cmpServidor')
        .join('secretarias', 'secId', 'servidores.usrSecretaria')
        .join('orgadmin', 'orgId', 'secretarias.secOrgAdm')
        .sum({totCmp : 'parVlrParcela'});

        return response.json(total);

    },   

    async cncCompra(request, response) {
         
        let id = request.params.idCmp;
        const { cmpIdCanc } = request.body;
         
        let administrador = request.body.cmpIdCanc;
        let datCanc = new Date; 
        let status = 'C';      
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

        return response.json({cncCompra});
    },
    
};