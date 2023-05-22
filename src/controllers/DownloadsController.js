const connection = require('../database/connection');
const fs = require('fs');
const sendmail = require('../database/sendmail')({silent: true})

module.exports = {   
    async downTexto (request, response) {
        let inicio = request.params.datInicial;
        let final = request.params.datInicial;
        let idOrg = request.params.orgId;

        console.log(inicio);
        console.log(final);
        console.log(idOrg);

        const compras = await connection('cmpParcelas')
            .where('parVctParcela','>=', inicio)
            .where('parVctParcela','<=', final)
            .where('orgId', idOrg)
            .join('compras', 'cmpId', 'cmpParcelas.parIdCompra')
            .join('servidores', 'usrId', 'compras.cmpServidor')
            .join('convenios', 'cnvId', 'compras.cmpConvenio')
            .join('secretarias', 'secId', 'servidores.usrSecretaria')
            .join('orgadmin', 'orgId', 'secretarias.secOrgAdm')
            .select(['cmpParcelas.*', 'compras.cmpEmissao', 'compras.cmpServidor', 'compras.cmpConvenio', 'servidores.usrMatricula', 'servidores.usrNome', 'convenios.cnvNomFantasia','secretarias.secOrgAdm', 'orgadmin.orgId']);
        
        var nome_arquivo = 'arquivo.txt'
        console.log(nome_arquivo);
        var separacao = ';' 
        for (compra of compras) {
            console.log(`${compra['parIdCompra']}`)
            const data = `${compra['usrMatricula']}` + ';' + `${compra['usrNome']}`  + ';' + `${compra['parVlrParcela']}` + ';'
            fs.appendFileSync(nome_arquivo, data + '\n', (err) => {
                if (err) throw err;
                console.log('O arquivo foi criado!');
            })
        }        

        pathToAttachment = `arquivo.txt`;
        attachment = fs.readFileSync(pathToAttachment).toString('utf8')
          
        const emailUsuario = 'gilsonfabio@gmail.com';
        const nomeUsuario = 'Gilson Fábio';
        const link = '';
        const emailEnvio = 'gilsonfabio@innvento.com.br';
               
        const apiKey = process.env.SENDGRID_API_KEY;
        const sgMail = require('@sendgrid/mail')

        sgMail.setApiKey(apiKey)
        const msg = {
            to: emailUsuario,
            from: `${emailEnvio}`,
            subject: 'Email para Recuperação de senha',
            text: `Email de recuperação de senha servidor ${nomeUsuario}`,
            attachments: [
                {
                  content: attachment,
                  filename: "arquivo.txt",
                  type: "text/plain",
                  disposition: "attachment"
                }
            ],
            html: `<p>Olá, ${nomeUsuario}, </br></p><p>Você solicitou o arquivo de movimentação mensal.</p></br>`, 
        }
        sgMail
          .send(msg)
          .then(() => {
            console.log('Email sent')
          })
        .catch((error) => {
            console.error(error)
        })     
        
        //return response.json(user);  
        
    }          
};
