const connection = require('../database/connection');
const sendmail = require('../database/sendmail')({silent: true})

module.exports = { 
    async enviaEmail(request, response) {
        const emailUsuario = request.params.email;
        const user = await connection('servidores')
            .where('usrEmail', emailUsuario)
            .select('usrNome', 'usrId')
            .first();
          
        if (!user) {
            return response.status(400).json({ error: 'Não encontrou usuario com este ID'});
        } 

        const codUsuario = user.usrId;
        const nomeUsuario = user.usrNome;

        console.log(nomeUsuario);

        const link = '';
        const emailEnvio = 'administrator@innvento.com.br';

        const apiKey = "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";
        const sgMail = require('@sendgrid/mail');

        sgMail.setApiKey(apiKey)
        const msg = {
            to: emailUsuario,
            from: `${emailEnvio}`,
            subject: 'Email Venda Recuperado',
            text: `Email de recuperação de venda do servidor ${nomeUsuario}`,            
            html: `<p>Olá, ${nomeUsuario}, </br></p><p>Você solicitou um email de recuperação de senha.</p></br> <p>Favor clicar no link abaixo para redefinir sua senha.</p></br>
                    <p><a href="https://sindicaldas.com.br/AltPassword/${emailUsuario}/${codUsuario}">Link de Recuperação de Senha</a></p>`,
        }
        sgMail
          .send(msg)
          .then(() => {
            console.log('Email sent')
          })
        .catch((error) => {
            console.error(error)
        })     
        
        return response.json(user);  
        
    },   

    /*
    attachments: [
                {
                  content: attachment,
                  filename: "arquivo.txt",
                  type: "text/plain",
                  disposition: "attachment"
                }
            ],
    */        

    async recPassword(request, response) {
        const emailUsuario = request.params.email;
        const user = await connection('servidores')
            .where('usrEmail', emailUsuario)
            .select('usrNome', 'usrId')
            .first();
          
        if (!user) {
            return response.status(400).json({ error: 'Não encontrou usuario com este ID'});
        } 

        const codUsuario = user.usrId;
        const nomeUsuario = user.usrNome;
         
        const arr_alfa = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","U","V","W","X","Y","Z","!","@","$","%","&","*"];
        var data = new Date();
        let $_dia = data.getDate();
        let $_mes = data.getMonth() + 1;
        let $_ano = data.getYear();
        let $_hor = data.getHours();
        let $_min = data.getMinutes();
        let $_seg = data.getSeconds();
        let $pri_letra = arr_alfa[$_dia];
        let $seg_letra = arr_alfa[$_hor];
        let $ano_alfa = $_ano;
        let $min_alfa = $_min;
        let $seg_alfa = $_seg;
        let seguranca = $pri_letra + $seg_letra + $ano_alfa + $min_alfa + $seg_alfa;
         
        console.log(nomeUsuario);
        console.log(seguranca);
        
        const updServ = await connection('servidores')
        .where('usrId', codUsuario) 
        .update({
            usrCodSeguranca: seguranca,                      
        });

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
            html: `<p>Olá, ${nomeUsuario}, </br></p><p>Você solicitou um código de segurança: ${seguranca} para recuperação de senha.</p></br> <p>Favor clicar no link abaixo para redefinir sua senha.</p></br>
                    <p><a href="https://sindicaldas.com.br/AltPassword/${emailUsuario}/${codUsuario}">Link de Recuperação de Senha</a></p>`,
        }
        sgMail
          .send(msg)
          .then(() => {
            console.log('Email sent')
          })
        .catch((error) => {
            console.error(error)
        })     
        
        return response.json(user);  
        
    } ,
    async recPassCnv(request, response) {
        const emailUsuario = request.params.email;
        const conv = await connection('convenios')
            .where('cnvEmail', emailUsuario)
            .select('cnvNomFantasia', 'cnvId')
            .first();
          
        if (!conv) {
            return response.status(400).json({ error: 'Não encontrou convênio com este ID'});
        } 

        const codConvenio = conv.cnvId;
        const nomeFantasia = conv.cnvNomFantasia;
         
        const arr_alfa = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","U","V","W","X","Y","Z","!","@","$","%","&","*"];
        var data = new Date();
        let $_dia = data.getDate();
        let $_mes = data.getMonth() + 1;
        let $_ano = data.getYear();
        let $_hor = data.getHours();
        let $_min = data.getMinutes();
        let $_seg = data.getSeconds();
        let $pri_letra = arr_alfa[$_dia];
        let $seg_letra = arr_alfa[$_hor];
        let $ano_alfa = $_ano;
        let $min_alfa = $_min;
        let $seg_alfa = $_seg;
        let seguranca = $pri_letra + $seg_letra + $ano_alfa + $min_alfa + $seg_alfa;
         
        console.log(nomeFantasia);
        console.log(seguranca);
        
        const updConv = await connection('convenios')
        .where('cnvId', codConvenio) 
        .update({
            cnvCodSeguranca: seguranca,                      
        });

        const link = '';
        const emailEnvio = 'gilsonfabio@innvento.com.br';
          
        const apiKey = process.env.SENDGRID_API_KEY;
        const sgMail = require('@sendgrid/mail')

        sgMail.setApiKey(apiKey)
        const msg = {
            to: emailUsuario,
            from: `${emailEnvio}`,
            subject: 'Email para Recuperação de senha',
            text: `Email de recuperação de senha servidor ${nomeFantasia}`,            
            html: `<p>Olá, ${nomeFantasia}, </br></p><p>Você solicitou um código de segurança: ${seguranca} para recuperação de senha.</p></br> <p>Favor clicar no link abaixo para redefinir sua senha.</p></br>
                    <p><a href="https://sindicaldas.com.br/AltPassword/${emailUsuario}/${codConvenio}">Link de Recuperação de Senha</a></p>`,
        }
        sgMail
          .send(msg)
          .then(() => {
            console.log('Email sent')
          })
        .catch((error) => {
            console.error(error)
        })     
        
        return response.json(conv);  
        
    },
    
    async recPassAdmin(request, response) {
        const emailUsuario = request.params.email;
        const admin = await connection('administrator')
            .where('admEmail', emailUsuario)
            .select('admNome', 'admId')
            .first();
          
        if (!admin) {
            return response.status(400).json({ error: 'Não encontrou administrador com este ID'});
        } 

        const codUsuario = admin.admId;
        const nomeUsuario = admin.admNome;
         
        const arr_alfa = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","U","V","W","X","Y","Z","!","@","$","%","&","*"];
        var data = new Date();
        let $_dia = data.getDate();
        let $_mes = data.getMonth() + 1;
        let $_ano = data.getYear();
        let $_hor = data.getHours();
        let $_min = data.getMinutes();
        let $_seg = data.getSeconds();
        let $pri_letra = arr_alfa[$_dia];
        let $seg_letra = arr_alfa[$_hor];
        let $ano_alfa = $_ano;
        let $min_alfa = $_min;
        let $seg_alfa = $_seg;
        let seguranca = $pri_letra + $seg_letra + $ano_alfa + $min_alfa + $seg_alfa;
         
        console.log(nomeUsuario);
        console.log(seguranca);
        
        const updAdm = await connection('administrator')
        .where('admId', codUsuario) 
        .update({
            admCodSeguranca: seguranca,                      
        });

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
            html: `<p>Olá, ${nomeUsuario}, </br></p><p>Você solicitou um código de segurança: ${seguranca} para recuperação de senha.</p></br> <p>Favor clicar no link abaixo para redefinir sua senha.</p></br>
                    <p><a href="https://sindicaldas.com.br/AltPassword/${emailUsuario}/${codUsuario}">Link de Recuperação de Senha</a></p>`,
        }
        sgMail
          .send(msg)
          .then(() => {
            console.log('Email sent')
          })
        .catch((error) => {
            console.error(error)
        })     
        
        return response.json(admin);  
        
    } ,
}

