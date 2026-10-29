const crypto = require('crypto');
const connection = require('../database/connection');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const saltRounds = 10;

const {v4:uuidv4} = require ('uuid') ;

module.exports = {   
    async index (request, response) {
        const admins = await connection('administrator').select('*');
    
        return response.json(admins);
    },    

    async signIn(request, response) {
        let email = request.params.email;
        let senha = request.params.password;

        var encodedVal = crypto.createHash('md5').update(senha).digest('hex');
        const admin = await connection('administrator')
            .where('admEmail', email)
            .where('admSenha', encodedVal)
            .select('admId', 'admNome', 'admNivAcesso')
            .first();
          
        if (!admin) {
            return response.status(400).json({ error: 'Não encontrou usuario com este ID'});
        } 

        return response.json(admin);
    },
     
    async signInAdm(request, response) {
        try {
            const email = request.body.email;
            const senha = request.body.password;

            const admin = await connection('administrator')
                .where('admEmail', email)
                .select(
                    'admId',
                    'admNome',
                    'admEmail',
                    'admNivAcesso',
                    'admSenha',
                    'admAtuPass'
                )
                .first();

            if (!admin) {
                return response.status(400).json({
                    error: 'Não encontrou usuário com este e-mail.'
                });
            }

            // Caso 1: senha ainda não foi migrada para bcrypt
            if (admin.admAtuPass === null) {

                // Calcula o MD5 da senha informada
                const senhaMD5 = require('crypto')
                    .createHash('md5')
                    .update(senha)
                    .digest('hex');

                // Confere a senha antiga armazenada
                if (senhaMD5 !== admin.admSenha) {
                    return response.status(403).json({
                        auth: false,
                        message: 'Usuário inválido!'
                    });
                }

                // Senha MD5 validada: migra para bcrypt
                const snhCrypt = await bcrypt.hash(senha, saltRounds);

                await connection('administrator')
                    .where('admId', admin.admId)
                    .update({
                        admSenha: snhCrypt,
                        admAtuPass: new Date()
                    });

                // Solicita novo login após a migração
                return response.json({
                    forceRelogin: true,
                    message: 'Usuário atualizado! Faça login novamente.'
                });

            } else {

                // Caso 2: senha já foi migrada para bcrypt
                const match = await bcrypt.compare(
                    senha,
                    admin.admSenha
                );

                if (!match) {
                    return response.status(403).json({
                        auth: false,
                        message: 'Usuário inválido!'
                    });
                }
            }

            // Credenciais válidas: gera os tokens
            const token = jwt.sign(
                {
                    id: admin.admId,
                    name: admin.admNome,
                    email: admin.admEmail
                },
                process.env.SECRET_JWT,
                {
                    expiresIn: '1h'
                }
            );

            const refreshToken = jwt.sign(
                {
                    id: admin.admId,
                    name: admin.admNome,
                    email: admin.admEmail
                },
                process.env.SECRET_JWT_REFRESH,
                {
                    expiresIn: '2h'
                }
            );

            return response.json({
                id: admin.admId,
                name: admin.admNome,
                email: admin.admEmail,
                accessToken: token,
                refreshToken
            });

        } catch (error) {
            console.error('Erro no login do administrador:', error);

            return response.status(500).json({
                error: 'Erro interno ao realizar login.'
            });
        }
    },
      
    async loginSrv(request, response) {
        let email = request.body.email;
        let senha = request.body.password;

        console.log('Email:', email);
        console.log('Password:', senha);

        const admin = await connection('administrator')
            .where('admEmail', email) 
            .select(`admId`, `admNome`, `admEmail`, `admPassword`)
            .first();
        
        if (!admin) {            
            return response.status(400).json({ error: 'Não encontrou administrador com este ID'});
        } 

        console.log(admin.admPassword)
        let pass = admin.admPassword;
        const match = await bcrypt.compare(senha, pass)

        if(!match) {
            return response.status(403).send({ auth: false, message: 'User invalid!' });
        }

        const adm = {
            id: admin.usrId,
            name: admin.usrNome,
            email: admin.usrEmail,
        }

        let token = jwt.sign({ id: admin.admId, name: admin.admNome, email: admin.admEmail, nivel: admin.admNivAcesso }, process.env.SECRET_JWT, {
            expiresIn: '1h'
        });
        let refreshToken = jwt.sign({ id: admin.admId, name: admin.admNome, email: admin.admEmail, nivel: admin.admNivAcesso }, process.env.SECRET_JWT_REFRESH, {
            expiresIn: '2h'
        });
        console.log(user);
        
        return response.json(adm, token, refreshToken);

    },
    
    async login(request, response) {
        const { email, password } = request.body;

        var senha = crypto.createHash('md5').update(password).digest('hex');
        const admin = await connection('administrator')
            .where('admEmail', email)
            .where('admSenha', senha)
            .select('admId', 'admNome', 'admNivAcesso')
            .first();
          
        if (!admin) {
            return response.status(400).json({ error: 'Não encontrou usuario com este ID'});
        } 

        return response.json(admin);
    },

    async create(request, response) {
        const { admNome, admSenha, admEmail, admNivAcesso } = request.body;
    
        var senha = crypto.createHash('md5').update(admSenha).digest('hex');
        var status = 'A';
        const [admId] = await connection('administrator').insert({
            admNome, 
            admSenha: senha, 
            admEmail,
            admNivAcesso,
            admStatus: status
        });
           
        return response.json({admId});
    },
     
    async searchAdmin (request, response) {
        let id = request.params.idAdm;
        const admin = await connection('administrator')
        .where('admId', id)        
        .select('admId', 'admNome', 'admNivAcesso');
        
        return response.json(admin);
    },

    async updPassAdmin(request, response) {
        let email = request.params.emailUsuario;         
        const { newPassword, codSeguranca } = request.body;
        
        let datUpdate = new Date();
        let seguranca = '';
        var senha = crypto.createHash('md5').update(newPassword).digest('hex');

        await connection('administrator')
        .where('admEmail', email)
        .where('admSeguranca', codSeguranca)   
        .update({
            usrPassword: senha,
            usrCodSeguranca: seguranca,           
        });
           
        return response.status(204).send();
    },

    async updAdmin(request, response) {
        const { idAdm, admNome, admEmail, admNivAcesso } = request.body;        
        await connection('administrator')
        .where('admId', idAdm)   
        .update({
            admNome, 
            admEmail,
            admNivAcesso,        
        });
           
        return response.status(204).send();
    },
};
