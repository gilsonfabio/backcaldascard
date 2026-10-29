const crypto = require('crypto');
const connection = require('../database/connection');
const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = {   
    async index (request, response) {
        let status = "A";
        const convenios = await connection('convenios')
        .where('cnvStatus', status)
        .select('*');
    
        return response.json(convenios);
    },   

    async totConv(request, response) {
        try {
            const [{ total }] = await connection('convenios')
                .count('* as total');

            return response.json({
                totalConvenios: total
            });
        } catch (error) {
            return response.status(500).json({
                error: 'Erro ao buscar total de convênios'
            });
        }
    },
    
    async classCnv (request, response) {
        let nome = request.params.search;
        const convenios = await connection('convenios')
        .where('cnvNomFantasia','>', nome)       
        .orderBy('cnvNomFantasia') 
        .select(['*']);
        
        return response.json(convenios);
    }, 

    /*
    async signInCnv(request, response) {
        let emailCnv = request.params.email;
        let senha = request.params.password;

        var encodedVal = crypto.createHash('md5').update(senha).digest('hex');
        const conv = await connection('convenios')
            .where('cnvEmail', emailCnv)
            .where('cnvPassword', encodedVal)            
            .select('cnvId', 'cnvNomFantasia')
            .first();
          
        if (!conv) {
            return response.status(400).json({ error: 'Não encontrou convênio com este ID'});
        } 

        //console.log(conv.cnvNomFantasia);

        return response.json(conv);
    },
    */

    // Dentro do seu controller:
    async signInCnv(request, response) {
        try {
            const emailCnv = request.body.email;
            const senha = request.body.password;

            if (!emailCnv || !senha) {
                return response.status(400).json({
                    error: 'Informe o e-mail e a senha.'
                });
            }

            // Busca o convênio pelo e-mail.
            const conv = await connection('convenios')
                .where('cnvEmail', emailCnv)
                .select(
                    'cnvId',
                    'cnvNomFantasia',
                    'cnvPassword',
                    'cnvAtuPass'
                )
                .first();

            if (!conv) {
                return response.status(401).json({
                    error: 'E-mail ou senha inválidos.'
                });
            }

            let senhaValida = false;

            // PRIMEIRO LOGIN: senha legada em MD5.
            if (conv.cnvAtuPass === null) {
                const senhaMD5 = crypto
                    .createHash('md5')
                    .update(senha)
                    .digest('hex');

                // Compara o MD5 com a senha armazenada.
                if (senhaMD5 === conv.cnvPassword) {
                    senhaValida = true;

                    // Gera o novo hash bcrypt com custo 12.
                    const novoHash = await bcrypt.hash(senha, 12);

                    // Atualiza somente se a conta ainda não foi migrada.
                    const atualizados = await connection('convenios')
                        .where('cnvId', conv.cnvId)
                        .whereNull('cnvAtuPass')
                        .update({
                            cnvPassword: novoHash,
                            cnvAtuPass: connection.fn.now()
                        });

                    if (atualizados === 0) {
                        // Outra requisição pode ter migrado a senha
                        // simultaneamente. Confere o hash atualizado.
                        const convAtualizado = await connection('convenios')
                            .where('cnvId', conv.cnvId)
                            .select('cnvPassword', 'cnvAtuPass')
                            .first();

                        if (
                            !convAtualizado ||
                            convAtualizado.cnvAtuPass === null ||
                            !(await bcrypt.compare(
                                senha,
                                convAtualizado.cnvPassword
                            ))
                        ) {
                            return response.status(401).json({
                                error: 'E-mail ou senha inválidos.'
                            });
                        }
                    }
                }
            } else {
                // PRÓXIMOS LOGINS: validação exclusivamente com bcrypt.
                senhaValida = await bcrypt.compare(
                    senha,
                    conv.cnvPassword
                );
            }

            if (!senhaValida) {
                return response.status(401).json({
                    error: 'E-mail ou senha inválidos.'
                });
            }

            // Retorna apenas os dados necessários ao frontend.
            return response.json({
                cnvId: conv.cnvId,
                cnvNomFantasia: conv.cnvNomFantasia
            });

        } catch (error) {
            console.error('Erro no login do convênio:', error);

            return response.status(500).json({
                error: 'Erro interno ao realizar o login.'
            });
        }
    },

    //..........................................................................................................................

    async signIn(request, response) {
        try {
            const { email, password } = request.body;

            // Validação básica
            if (!email || !password) {
                return response.status(400).json({
                    success: false,
                    message: "Email e senha são obrigatórios."
                });
            }

            console.log("Email:", email);

            // Busca usuário
            const cnv = await connection("convenios")
                .where("cnvEmail", email)
                .select(
                    "cnvId",
                    "cnvNomFantasia",
                    "cnvEmail",
                    "cnvPassword",
                    "cnvAtuPass"
                )
                .first();

            // Usuário não encontrado
            if (!cnv) {
                return response.status(401).json({
                    success: false,
                    message: "Usuário não encontrado."
                });
            }

            // Primeiro login / migração de senha
            if (!cnv.cnvAtuPass) {
                const senhaCriptografada = await bcrypt.hash(password, saltRounds);

                await connection("convenios")
                    .where("cnvId", cnv.cnvId)
                    .update({
                        cnvPassword: senhaCriptografada,
                        cnvAtuPass: new Date(),
                    });

                return response.status(200).json({
                    success: true,
                    forceRelogin: true,
                    message: "Senha atualizada. Faça login novamente."
                });
            }

            // Verifica senha
            const senhaValida = await bcrypt.compare(
                password,
                cnv.cnvPassword
            );

            if (!senhaValida) {
                return response.status(403).json({
                    success: false,
                    message: "Senha inválida."
                });
            }

            // Dados do usuário
            const usuario = {
                cnvId: cnv.cnvId,
                cnvNomFantasia: cnv.cnvNomFantasia,
                cnvEmail: cnv.cnvEmail,
            };

            return response.status(200).json({
                success: true,
                user: usuario
            });
        } catch (error) {
            console.error("Erro no login:", error);
            return response.status(500).json({
                success: false,
                message: "Erro interno do servidor."
            });
        }
    },

    //............................................................................................................................

    async signInCnc(request, response) {
        let emailCnv = request.params.email;
        let senha = request.params.password;

        var encodedVal = crypto.createHash('md5').update(senha).digest('hex');
        const conv = await connection('convenios')
            .where('cnvEmail', emailCnv)
            .where('cnvCanPassword', encodedVal)
            .select('cnvId', 'cnvNomFantasia')
            .first();
          
        if (!conv) {
            return response.status(400).json({ error: 'Não encontrou convênio com este ID'});
        } 

        return response.json(conv);
    },    

    //async signAlt(request, response) {
    //    let email = request.params.email;
    //    let senha = request.params.password;
    //
    //    var encodedVal = crypto.createHash('md5').update(senha).digest('hex');
    //    const conv = await connection('convenios')
    //        .where('cnvId', email)
    //        .where('cnvSenha', encodedVal)
    //        .select('cnvId', 'cnvNomFantasia')
    //        .first();
    //      
    //    if (!conv) {
    //        return response.status(400).json({ error: 'Não encontrou convênio com este ID'});
    //    } 
    //
    //    return response.json(conv);
    //},

    async create(request, response) {
        const { cnvRazSocial, 
            cnvNomFantasia,
            cnvCpfCnpj,            
            cnvEmail,
            cnvTelefone,
            cnvContato,
            cnvAtividade,
            cnvPassword,
            cnvCanPassword,  
            cnvEndereco,
            cnvBairro,
            cnvCidade,
            cnvEstado,
            cnvCep } = request.body;
        
        let status = "A";
  
        var snhConvenio = crypto.createHash('md5').update(cnvPassword).digest('hex');
        var snhCancelamento = crypto.createHash('md5').update(cnvCanPassword).digest('hex');
            
        const [cnvId] = await connection('convenios').insert({
            cnvRazSocial, 
            cnvNomFantasia,
            cnvCpfCnpj,            
            cnvEmail,
            cnvTelefone,
            cnvContato,
            cnvAtividade,
            cnvPassword: snhConvenio,
            cnvCanPassword: snhCancelamento,
            cnvEndereco,
            cnvBairro,
            cnvCidade,
            cnvEstado,
            cnvCep,
            cnvStatus: status           
        });
           
        return response.json({cnvId});
    },

    async searchConv (request, response) {
        let id = request.params.idCnv;
        let status = "A";

        //console.log('Search Convenio: ', id);

        const convenio = await connection('convenios')
        .where('cnvId', id)
        .where('cnvStatus', status)
        .select('*');

        //console.log(convenio);

        return response.json(convenio);
    },   
    
    async maxParcelas (request, response) {
        let id = request.params.cnvId;
        let status = "A";

        //console.log('Search Convenio: ', id);

        const convenio = await connection('convenios')
        .where('cnvId', id)
        .where('cnvStatus', status)
        .select('cnvQtdParc');

        //console.log(convenio);

        return response.json(convenio);
    },   
    
    async updateConv(request, response) {
        let id = request.params.idCnv;         
        
        const { cnvRazSocial, 
            cnvNomFantasia,
            cnvCpfCnpj,            
            cnvEmail,
            cnvTelefone,
            cnvContato,
            cnvAtividade,
            cnvEndereco,
            cnvBairro,
            cnvCidade,
            cnvEstado,
            cnvCep,
            cnvPassword,
            cnvCanPassword,
            cnvQtdParc } = request.body;

        var snhConvenio = crypto.createHash('md5').update(cnvPassword).digest('hex');
        var snhCancelamento = crypto.createHash('md5').update(cnvCanPassword).digest('hex');

        let datUpdate = new Date();
        await connection('convenios').where('cnvId', id)   
        .update({
            cnvRazSocial, 
            cnvNomFantasia,
            cnvCpfCnpj,            
            cnvEmail,
            cnvTelefone,
            cnvContato,
            cnvAtividade,
            cnvEndereco,
            cnvBairro,
            cnvCidade,
            cnvEstado,
            cnvCep,
            cnvPassword: snhConvenio,
            cnvCanPassword: snhCancelamento,
            cnvQtdParc          
        });
           
        return response.status(204).send();
    },
    
    async deleteConv(request, response) {
        let id = request.params.idCnv;         
        
        let status = 'E';
        let datUpdate = new Date();
        await connection('convenios').where('cnvId', id)   
        .update({
            cnvStatus: status           
        });
           
        return response.status(204).send();
    },

    async updPassCnv(request, response) {
        let email = request.params.emailConvenio;         
        const { newPassword, codSeguranca } = request.body;
        
        let seguranca = '';
        var senha = crypto.createHash('md5').update(newPassword).digest('hex');

        await connection('convenios')
        .where('cnvEmail', email)
        .where('usrSeguranca', codSeguranca)   
        .update({
            cnvPassword: senha,
            cnvCodSeguranca: seguranca,           
        });
           
        return response.status(204).send();
    },

    async updSnhCnvCanc(request, response) {
        let email = request.params.emailConvenio;         
        const { newPassword, codSeguranca } = request.body;
        
        let seguranca = '';
        var senha = crypto.createHash('md5').update(newPassword).digest('hex');

        await connection('convenios')
        .where('cnvEmail', email)
        .where('usrSeguranca', codSeguranca)   
        .update({
            cnvCanPassword: senha,
            cnvCodSeguranca: seguranca,           
        });
           
        return response.status(204).send();
    },

    async busConv (request, response) {
        let id = request.params.cnpjCnv;
        let status = "A";

        //console.log('Search Convenio: ', id);

        const convenio = await connection('convenios')
        .where('cnvCpfCnpj', id)
        .where('cnvStatus', status)
        .select('*');

        //console.log(convenio);

        return response.json(convenio);
    },
    
};