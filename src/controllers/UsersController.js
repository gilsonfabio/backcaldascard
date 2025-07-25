const { Console } = require('console');
const crypto = require('crypto');
const { addListener } = require('../database/connection');
const connection = require('../database/connection');

const jwt = require('jsonwebtoken');
const {v4:uuidv4} = require ('uuid') ; 

module.exports = {   
    async index (request, response) {
        const users = await connection('servidores')
        .orderBy('usrNome')
        .select('*');
    
        return response.json(users);
    },   
        
    async signInSrv(request, response) {
        let email = request.body.email;
        let senha = request.body.password;

        var encodedVal = crypto.createHash('md5').update(senha).digest('hex');
        const usuario = await connection('servidores')
            .where('usrEmail', email)
            .where('usrPassword', encodedVal)
            .select('usrId', 'usrNome', 'usrEmail', 'usrCartao')
            .first();
          
        if (!usuario) {
            return response.status(400).json({ error: 'Não encontrou usuario com este ID'});
        } 

        let token = jwt.sign({ id: usuario.usrId, name: usuario.usrNome, email: usuario.usrEmail }, process.env.SECRET_JWT, {expiresIn: '1h'});
        let refreshToken = jwt.sign({ id: usuario.usrId, name: usuario.usrNome, email: usuario.usrEmail }, process.env.SECRET_JWT_REFRESH, {expiresIn: '2h'});

        const user = {
            id: usuario.usrId,
            name: usuario.usrNome,
            email: usuario.usrEmail,
            cartao: usuario.usrCartao,
            accessToken: token,
            refreshToken: refreshToken
        }

        return response.json(user);
    },


    /*
    async signInSrv(request, response) {
        let email = request.body.email;
        let senha = request.body.password;

        console.log('Email:', email);
        console.log('Password:', senha);

        const usuario = await connection('servidores')
            .where('usrEmail', email) 
            .select(`usrId`, `usrNome`, `usrEmail`, `usrPassword`)
            .first();
        
        if (!usuario) {            
            return response.status(400).json({ error: 'Não encontrou usuário com este ID'});
        } 

        console.log(user.usrPassword)
        let pass = usuario.usrPassword;
        const match = await bcrypt.compare(senha, pass)

        if(!match) {
            return response.status(403).send({ auth: false, message: 'User invalid!' });
        }

        const user = {
            id: usuario.usrId,
            name: usuario.usrNome,
            email: usuario.usrEmail,
        }

        let token = jwt.sign({ id: user.usrId, name: user.usrNome, email: user.usrEmail, nivel: user.usrNivAcesso }, process.env.SECRET_JWT, {
            expiresIn: '1h'
        });
        let refreshToken = jwt.sign({ id: user.usrId, name: user.usrNome, email: user.usrEmail, nivel: user.usrNivAcesso  }, process.env.SECRET_JWT_REFRESH, {
            expiresIn: '2h'
        });
        console.log(user);
        
        return response.json(user, token, refreshToken);

    },
    */



    async findUser(request, response) {
        var nroCartao = request.params.cartao;
        
        var datProcess = new Date();
        var day = datProcess.getDate();
        var year = datProcess.getFullYear();
        var month = datProcess.getMonth() + 1;

        if (day > 15 ) {
            month++
            if (month === 13 ) {
                month = 1
                year++
            }    
        }

        const user = await connection('usrSaldo')
            .where('usrServ',nroCartao)
            .where('usrMes', month)
            .where('usrAno', year)
            .join('servidores', 'usrCartao', 'usrSaldo.usrServ')
            .join('tipcontratos', 'idTip', 'servidores.usrTipContrato')
            .select(['usrSaldo.*', 'servidores.usrNome', 'servidores.usrMatricula', 'servidores.usrId', 'servidores.usrStatus', 'servidores.usrTipContrato', 'tipcontratos.tipDescricao', 'tipcontratos.tipParcelas']);
         
        if (!user) {
            return response.status(400).json({ error: 'Não encontrou servidor com este ID'});
        } 

        //console.log(user);

        return response.json(user);
    },

    async verifUser(request, response) {
        var nroCartao = request.params.cartao;        
        var datProcess = new Date();
        var year = datProcess.getFullYear();
        var month = datProcess.getMonth() + 1;
        var dia = datProcess.getDate();

        if (dia > 15) {
            month++;
            if (month === 13) {
                month = 1;
                year++;
            }
        }

        //console.log(nroCartao);
        //console.log(month);
        //console.log(year);
        //console.log(dia);
         
        const usuario = await connection('servidores')
            .where('usrCartao',nroCartao)
            .select('usrSalLiquido');
         
        if (!usuario) {
            return response.status(400).json({ error: 'Não encontrou servidor com este ID'});
        } 
          
        var vlrLimite = ((usuario[0].usrSalLiquido * 30) / 100);
        var vlrInicial = 0 ;

        const user = await connection('usrSaldo')
            .where('usrServ',nroCartao)
            .where('usrMes',month)
            .where('usrAno',year)
            .select('usrVlrDisponivel');


        if (!user) {
            var n = 1; 
            while (n <= 48) {
                if (month === 13) { 
                    month = 1
                    year = year + 1
                }  
                
                const [saldo] = await connection('usrSaldo').insert({
                    usrServ: nroCartao,
                    usrMes: month,
                    usrAno: year,
                    usrVlrDisponivel: vlrLimite,
                    usrVlrUsado: vlrInicial,
                });
                n++;  
                month++;
            }      
        }

        var year = datProcess.getFullYear();
        var month = datProcess.getMonth() + 1;
        var dia = datProcess.getDate();

        if (dia > 15) {
            month++;
            if (month === 13) {
                month = 1;
                year++;
            }
        }
        
        if (user.length === 0) {
            var n = 1; 
            while (n <= 48) {
                if (month === 13) { 
                    month = 1
                    year = year + 1
                }  
                
                const [saldo] = await connection('usrSaldo').insert({
                    usrServ: nroCartao,
                    usrMes: month,
                    usrAno: year,
                    usrVlrDisponivel: vlrLimite,
                    usrVlrUsado: vlrInicial,
                });
                n++;  
                month++;
            }      
        }

        return response.status(200).json({ error: 'Servidor encontrado com sucesso!'});
    },

    /*
    async verifUser(request, response) {
        var nroCartao = request.params.cartao;        
        var datProcess = new Date();
        var year = datProcess.getFullYear();
        var month = datProcess.getMonth() + 1;

        console.log(nroCartao);
        console.log(month);
        console.log(year);

        const saldo = await connection('usrSaldo')
            .where('sldServ',nroCartao)
            .where('sldMes', month)
            .where('sldAno', year)
            .select('*');
          
        if (!saldo) {
            const user = await connection('servidores')
            .where('usrCartao',nroCartao)
            .select('usrSalBase');
            
            if (!user) {
                return response.status(400).json({ error: 'Não encontrou servidor com este ID'});
            }
               
            console.log('Salario para Calculo: ', usrSalBase);

            var vlrLimite = ((usrSalBase * 30) / 100);
            var vlrInicial = 0 ;
            var n = 1; 
            while (n <= 25) {
                if (month === 13) { 
                    month = 1
                    year = year + 1
                }    
                 
                const [usuario] = await connection('usrSaldo').insert({
                    sldServ: nroCartao,
                    sldMes: month,
                    sldAno: year,
                    sldVlrDisponivel: vlrLimite,
                    sldVlrUsado: vlrInicial,
                });
                n++;  
                month++;              
            }
        }
        console.log(saldo);
        return response.json(saldo);            
    },
    */
    
    async signIn(request, response) {
        let email = request.params.email;
        let senha = request.params.password;

        var encodedVal = crypto.createHash('md5').update(senha).digest('hex');
        const user = await connection('servidores')
            .where('usrEmail', email)
            .where('usrPassword', encodedVal)
            .select('usrId', 'usrNome', 'usrCartao')
            .first();
          
        if (!user) {
            return response.status(400).json({ error: 'Não encontrou servidor com este ID'});
        } 

        return response.json(user);
    },

    async loginSrv(request, response) {
        let email = request.params.email;
        let senha = request.params.password;

        var encodedVal = crypto.createHash('md5').update(senha).digest('hex');
        const user = await connection('servidores')
            .where('usrEmail', email)
            .where('usrPassword', encodedVal)
            .select('usrId', 'usrNome', 'usrCartao')
            .first();
          
        if (!user) {
            return response.status(400).json({ error: 'Não encontrou servidor com este ID'});
        } 

        return response.json(user);
    },

    async loginUsr(request, response) {
        let id = request.params.cartao;
        let senha = request.params.password;

        //console.log(id);
        //console.log(senha);

        var encodedVal = crypto.createHash('md5').update(senha).digest('hex');
        const user = await connection('servidores')
            .where('usrCartao', id)
            .where('usrPassword', encodedVal)
            .join('tipcontratos', 'idTip', 'servidores.usrTipContrato') 
            .select(['servidores.*','tipcontratos.idTip','tipcontratos.tipDescricao','tipcontratos.tipParcelas'])
            .first();
          
        if (!user) {
            return response.status(400).json({ error: 'Não encontrou servidor com este ID'});
        } 

        //console.log(user);

        return response.json(user);
    },

    async liberaUsr(request, response) {
        let id = request.params.cartao;

        //console.log(id);
        const user = await connection('servidores')
            .where('usrCartao', id)
            .select('*')
            .first();
          
        if (!user) {
            return response.status(400).json({ error: 'Não encontrou servidor com este ID'});
        } 

        //console.log(user);

        return response.json(user);
    },


    async busServ(request, response) {
        let id = request.params.cartao;
        let senha = request.params.password;

        var encodedVal = crypto.createHash('md5').update(senha).digest('hex');
        const user = await connection('servidores')
            .where('usrCartao', id)
            .where('usrPassword', encodedVal)
            .select('usrId', 'usrNome')
            .first();
          
        if (!user) {
            return response.status(400).json({ error: 'Não encontrou servidor com este ID'});
        } 

        return response.json(user);
    },

    async login(request, response) {
        const { email, password } = request.body;
    
        //console.log(email);
        //console.log(password);

        var senha = crypto.createHash('md5').update(password).digest('hex');
        const user = await connection('servidores')
            .where('usrEmail', email)
            .where('usrPassword', senha)
            .select('usrId', 'usrNome')
            .first();
          
        if (!user) {
            return response.status(400).json({ error: 'Não encontrou usuario com este ID'});
        } 

        return response.json(user);
    },

    async create(request, response) {
        const {usrNome, usrEmail, usrCartao, usrCelular, usrCpf, usrMatricula, usrSecretaria, usrNascimento, usrTipCadastro, usrIdentidade, usrOrgEmissor, usrEstCivil, usrEndereco,
               usrBairro, usrCidade, usrEstado, usrCep, usrFonResid, usrTrabalho, usrAdmissao, usrSalLiquido, usrSalBase, usrSalBruto, usrPassword, usrTipContrato, usrFonTrabalho, 
               usrCargo, usrConjuge, usrNasConjuge, usrPai, usrMae} = request.body;
        var datCadastro = new Date();
        var datNascimento = new Date(usrNascimento);
        var datAdmissao = new Date(usrAdmissao);
        var datNasConjuge = new Date(usrNasConjuge);
        var status = 'A'; 
        var senha = crypto.createHash('md5').update(usrPassword).digest('hex');
        const [usrId] = await connection('servidores').insert({
            usrNome,
            usrEmail,
            usrCartao,
            usrCelular,
            usrCpf,
            usrMatricula,
            usrSecretaria,
            usrNascimento: datNascimento,
            usrTipCadastro,
            usrIdentidade,
            usrOrgEmissor,
            usrEstCivil,
            usrEndereco,
            usrBairro,
            usrCidade,
            usrEstado,
            usrCep,
            usrFonResid,
            usrTrabalho,
            usrAdmissao: datAdmissao,
            usrSalLiquido,
            usrSalBase,
            usrSalBruto,
            usrPassword: senha,
            usrTipContrato,
            usrFonTrabalho,
            usrCargo,
            usrConjuge,
            usrNasConjuge: datNasConjuge,
            usrDatCadastro: datCadastro,
            usrPai,
            usrMae,
            usrStatus: status
        });
           
        return response.json({usrId});
    },
     
    async searchUser (request, response) {
        let id = request.params.idUsr;
        const user = await connection('servidores')
        .where('usrId', id)  
        .join('secretarias', 'secId', 'servidores.usrSecretaria') 
        .join('orgadmin', 'orgId', 'secretarias.secOrgAdm') 
        .join('cargos', 'crgId', 'servidores.usrCargo')  
        .join('bairros', 'baiId', 'servidores.usrBairro')  
        .join('tipcontratos', 'idTip', 'servidores.usrTipContrato')  
        .select(['*', 'secretarias.secDescricao', 'orgadmin.orgDescricao', 'cargos.crgDescricao', 'bairros.baiDescricao', 'tipcontratos.tipDescricao']);

        //console.log(user);
        
        return response.json(user);
    },

    async searchEmail (request, response) {
        let emailUsuario = request.params.email;
        const user = await connection('servidores')
            .where('usrEmail', emailUsuario)
            .select('usrNome')
            .first();

        if (!user) {
            return response.status(400).json({ error: 'Não encontrou usuario com este email'});
        } 
        return response.json(user);
    },    

    async updPassword(request, response) {
        let email = request.params.emailUsuario;         
        const { newPassword, codSeguranca } = request.body;
        
        let datUpdate = new Date();
        let seguranca = '';
        var senha = crypto.createHash('md5').update(newPassword).digest('hex');

        await connection('servidores')
        .where('usrEmail', email)
        .where('usrSeguranca', codSeguranca)   
        .update({
            usrPassword: senha,
            usrCodSeguranca: seguranca,           
        });
           
        return response.status(204).send();
    },
      
    async updServidor(request, response) {
        let id = request.params.idSrv;         
        const { usrNome,
            usrEmail,
            usrCartao,
            usrCelular,
            usrCpf,
            usrMatricula,
            usrSecretaria,
            usrNascimento,
            usrTipCadastro,
            usrIdentidade,
            usrOrgEmissor,
            usrEstCivil,
            usrEndereco,
            usrBairro,
            usrCidade,
            usrEstado,
            usrCep,
            usrFonResid,
            usrTrabalho,
            usrAdmissao,
            usrSalLiquido,
            usrSalBase,
            usrSalBruto,
            usrTipContrato,
            usrFonTrabalho,
            usrCargo,
            usrConjuge,
            usrNasConjuge, 
            usrObsBloqueio,
            usrPai,
            usrMae } = request.body;
        
        let datUpdate = new Date();
        //var datNascimento = new Date(usrNascimento);
        //var datAdmissao = new Date(usrAdmissao);
        //var datNasConjuge = new Date(usrNasConjuge);
        //var senha = crypto.createHash('md5').update(usrPassword).digest('hex');
        await connection('servidores').where('usrId', id)   
        .update({
            usrNome,
            usrEmail,
            usrCartao,
            usrCelular,
            usrCpf,
            usrMatricula,
            usrSecretaria,
            usrNascimento,
            usrTipCadastro,
            usrIdentidade,
            usrOrgEmissor,
            usrEstCivil,
            usrEndereco,
            usrBairro,
            usrCidade,
            usrEstado,
            usrCep,
            usrFonResid,
            usrTrabalho,
            usrAdmissao,
            usrSalLiquido,
            usrSalBase,
            usrSalBruto,
            usrTipContrato,
            usrFonTrabalho,
            usrCargo,
            usrConjuge,
            usrNasConjuge,
            usrObsBloqueio,
            usrPai,
            usrMae
        });
           
        return response.status(204).send();
    },

    async updPermissao(request, response) {
        let id = request.params.idSrv;         
        const { usrPassword } = request.body;
        
        let datUpdate = new Date();
        //var datNascimento = new Date(usrNascimento);
        //var datAdmissao = new Date(usrAdmissao);
        //var datNasConjuge = new Date(usrNasConjuge);
        var senha = crypto.createHash('md5').update(usrPassword).digest('hex');
        await connection('servidores').where('usrId', id)   
        .update({
            usrPassword: senha
        });
           
        return response.status(204).send();
    },

    async updLimite(request, response) {
        let id = request.body.idSrv;      
        let usrNome = request.body.usrNome;
        let usrObsBloqueio = request.body.usrObsBloqueio;
        let usrCartao = request.body.usrCartao;
        let usrStatus = request.body.usrStatus;
        let cartao = request.body.usrCartao;
        let slrBruto = request.body.usrSalBruto;
        let slrBase = request.body.usrSalBase;
        let slrLiquido = request.body.usrSalLiquido; 
        let updSld = request.body.altSaldo;        
        
        let datUpdate = new Date();

        await connection('servidores').where('usrCartao', cartao)   
        .update({
            usrStatus,
            usrObsBloqueio,
            usrSalBase: slrBase,
            usrSalBruto: slrBruto,
            usrSalLiquido: slrLiquido
        });
        
        if (updSld === 'S') {
            let datProcess = new Date();
            let year = datProcess.getFullYear();
            let month = datProcess.getMonth();
            let day = datProcess.getDate();

            let vlrLimite = ((slrLiquido * 30) / 100);
            let vlrInicial = 0.00;
            let usuario = '0';

            let vet = 1;
            while(vet <= 25) {

                //console.log('Mes:', month);
                //console.log('Ano:', year);                  

                const busSld = await connection('usrSaldo')
                .where('usrServ',cartao)
                .where('usrMes',month)
                .where('usrAno',year)
                .select('*'); 

                //console.log(busSld);

                if (busSld.length === 0) {
                    usuario = '0';                    
                }else {
                    usuario = busSld[0].usrServ;
                } 

                if (usuario != '0') {
                    let vlrUsado = busSld[0].usrVlrUsado;
                    let novLimite = 0.00;
                    novLimite = vlrLimite - vlrUsado;
                    
                    //console.log('Novo Limite:', novLimite); 

                    const updSaldo = await connection('usrSaldo')
                    .where('usrServ',cartao)
                    .where('usrMes',month)
                    .where('usrAno',year)
                    .update({
                        usrVlrDisponivel: novLimite 
                    });              
                }else {
                    const [saldo] = await connection('usrSaldo').insert({
                        usrServ: cartao,
                        usrMes: month,
                        usrAno: year,
                        usrVlrDisponivel: vlrLimite,
                        usrVlrUsado: vlrInicial,
                    });
                }
                vet = vet + 1;
                month = month + 1;
                if (month === 13) {
                    month = 1
                    year = year + 1  
                }   
            }
        }
                 
        return response.status(204).json({ message: 'Dados Atualizados'});
    },

    async classUser (request, response) {
        let nome = request.params.search;
        const user = await connection('servidores')
        .where('usrNome','>', nome)       
        .orderBy('usrNome') 
        .select(['*']);
        
        return response.json(user);
    },   

    async usrAnterior(request, response) {
        let cpf = request.params.cpfAnt;
        const user = await connection('associados')
            .where('cpf_user', cpf)
            .select('*')
            .first();
          
        if (!user) {
            return response.status(400).json({ error: 'Não encontrou servidor com este ID'});
        } 

        let id = 1;
        const params = await connection('parametros')
        .where('parId', id)
        .select('parSeqCartao');
       
        //console.log(params);
        
        const $arr_alfa = ["1828","9283","2837","8374","3746","7465","4650","6502","5029","0291","2918","9183","1837","8374","3746","7465","4653","6539","5391","3918","9182","1827","8274","2745","7456","4568","5682","6821","8211","2191","1918"];
        var nroCartao = ''; 
        var sequencia = '';  
        
        sequencia = parseInt(params[0].parSeqCartao) - 1;

        //console.log(sequencia);

        let newDate = new Date()
        let $_dia = newDate.getDate();
        let parInicial = '8321';
        let parSecundary = $arr_alfa[$_dia];
      
        nroCartao = parInicial + parSecundary + sequencia;
        
        await connection('parametros').where('parId', id)   
        .update({
            parSeqCartao: sequencia,                       
        });
    
        //console.log(nroCartao);

        var datCadastro = new Date();
        var datNascimento = user.nasc_user;
        var datAdmissao = new Date();
        var datNasConjuge = new Date();
        var status = 'A'; 
        var tipo_user = 'CM';

        var auxbairro = 1;
        var auxcargo = 1;
        var auxsecretaria = 1;

        var senha = crypto.createHash('md5').update(user.senha_user).digest('hex');
        const [usrId] = await connection('servidores').insert({
            usrNome: user.nome_user,
            usrEmail: user.email_user,
            usrCartao: nroCartao,
            usrCelular: user.fone_celular,
            usrCpf: user.cpf_user,
            usrMatricula: user.id_matricula,
            usrSecretaria: auxsecretaria,
            usrNascimento: datNascimento,
            usrTipCadastro: user.tip_cadastro,
            usrIdentidade: user.identidade_user,
            usrOrgEmissor: user.orgemissor_user,
            usrEstCivil: user.estcivil_user,
            usrEndereco: user.logradouro,
            usrBairro: auxbairro,
            usrCidade: user.cidade_resid,
            usrEstado: user.estado_resid,
            usrCep: user.cep,
            usrFonResid: user.fone_resid,
            usrTrabalho: user.locTrabalho,
            usrAdmissao: datAdmissao,
            usrSalLiquido: user.salBase,
            usrSalBase: user.salBase,
            usrSalBruto: user.salario,
            usrPassword: senha,
            usrTipContrato: tipo_user,
            usrFonTrabalho: user.fonTrabalho,
            usrCargo: auxcargo,
            usrConjuge: user.conjuge,
            usrNasConjuge: datNasConjuge,
            usrDatCadastro: datCadastro,
            usrStatus: status,
            usrObsBloqueio: user.obs_bloqueio
        });

        if (user.inf_adicional != '') {
            let usuario = usrId; 
            let idInfor = 1; 
        
            const [usrInf] = await connection('inforserv').insert({
                infUsrId: usuario,
                infId: idInfor,
                infData: datCadastro,
                infDescricao: user.inf_adicional,
            });
        }    

        return response.json(usrId);
    },

    async searchInf (request, response) {
        let id = request.params.idUsr;
        const infor = await connection('inforserv')
        .where('infUsrId', id)        
        .select(['*']);
        
        return response.json(infor);
    },

    async createInf (request, response) {
        const {infUsrId, infDescricao} = request.body;

        let usuario = request.body.infUsrId;
        let idInfor = 0; 
        var datCadastro = new Date();
        const infor = await connection('inforserv')
            .where('infUsrId', usuario)
            .select('*')
            .order('infId', DESC)
            .first();
          
        if (!infor) {
            idInfor = 1;
        }else {
            idInfor += parseInt(infor[0].indId) + 1;
        }

        const [usrInf] = await connection('inforserv').insert({
            infUsrId: usuario,
            infId: idInfor,
            infData: datCadastro,
            infDescricao
        });

        return response.json(usrInf);
    },   
    
    async updInfor(request, response) {
        let id = request.params.idSrv;
        let idInfor = request.params.idInf;

        const {infDescricao} = request.body;
        await connection('inforserv')
        .where('infUsrId', id) 
        .where('infId', idInf)   
        .update({
            infDescricao,                      
        });
           
        return response.status(204).send();
    },

    async srvContratos (request, response) {
        let id = request.params.srvId;

        //console.log('Servidor:',id)

        const user = await connection('servidores')
            .where('usrId', id)
            .join('secretarias', 'secId', 'servidores.usrSecretaria')
            .join('orgadmin', 'orgId', 'secretarias.secOrgAdm')
            .join('cargos', 'crgId', 'servidores.usrCargo') 
            .join('bairros', 'baiId', 'servidores.usrBairro')            
            .select(['servidores.*', 'secretarias.secDescricao', 'orgadmin.orgDescricao', 'cargos.crgDescricao', 'bairros.baiDescricao'])
            //.select('servidores.*')
            .first();

        if (!user) {
            return response.status(400).json({ error: 'Não encontrou usuario com este ID'});
        } 

        //console.log(user);
        return response.json(user);
    }, 

    async mosServ(request, response) {
        let id = request.params.cpfSrv;

        const user = await connection('servidores')
            .where('usrCpf', id)
            .select('usrId', 'usrNome')
            .first();
          
        if (!user) {
            return response.status(400).json({ error: 'Não encontrou servidor com este ID'});
        } 

        return response.json(user);
    },

    async dadServ(request, response) {
        try {
            const id = request.params.carServ;
    
            const today = new Date();
            let year = today.getFullYear();
            let month = today.getMonth() + 1;
            const day = today.getDate();
    
            if (day > 15) {
                month++;
                if (month > 12) {
                    month = 1;
                    year++;
                }
            }
    
            console.log(`Dia: ${day}, Mês: ${month}, Ano: ${year}, ID: ${id}`);
    
            const user = await connection('usrSaldo')
                .where('usrServ', id)
                .where('usrMes', month)
                .where('usrAno', year)
                .join('servidores', 'servidores.usrCartao', '=', 'usrSaldo.usrServ')
                .select([
                    'servidores.usrId', 'servidores.usrNome', 'servidores.usrTipContrato',
                    'servidores.usrStatus', 'servidores.usrCartao', 'servidores.usrMatricula',
                    'usrSaldo.usrServ', 'usrSaldo.usrMes', 'usrSaldo.usrAno', 'usrSaldo.usrVlrDisponivel'
                ]);
    
            if (user.length === 0) {
                return response.status(400).json({ error: 'Não encontrou servidor com este ID' });
            }
    
            return response.json(user);
        } catch (error) {
            console.error('Erro ao buscar dados do servidor:', error);
            return response.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    /*
    async delUser(request, response) {
        let id = request.params.idSrv;

        const compras = await connection('compras')
        .where('cmpConvenio', id)
        .join('servidores', 'usrId', 'compras.cmpServidor')
        .orderBy('cmpId', 'desc')
        .select(['compras.*', 'servidores.usrNome']);

        let excOk = 'S' 
        if (compras.length > 0 ){
            excOk = 'N';
            return response.status(400).json({ error: 'Servidor não pode ser excluido! Favor verificar dados.'});
        }

        if (excOk = 'S') {
            await connection('servidores')
            .where('usrId', id) 
            .delete();
             
            return response.status(204).send();
        }    
    },

    async gerNewCard(request, response) {
        const {usrCartao, novCartao} = request.body;
        let antCartao = usrCartao;

        const serv = await connection('servidores')
        .where('usrCartao', antCartao)
        .update({
            usrCartao: novCartao                      
        });

        return response.status(204).send();
           
    },
    */

    async searchServ(request, response) {
        var nroCartao = request.params.cartao;        
        var datProcess = new Date();
        var year = datProcess.getFullYear();
        var month = datProcess.getMonth() + 1;
        var dia = datProcess.getDate();

        if (dia > 15) {
            month++;
            if (month === 13) {
                month = 1;
                year++;
            }
        }

        console.log(nroCartao);
        console.log(month);
        console.log(year);
        console.log(dia);
         
        const usuario = await connection('servidores')
            .where('usrCartao',nroCartao)
            .select('usrSalLiquido');
         
        if (!usuario) {
            return response.status(400).json({ error: 'Não encontrou servidor com este ID'});
        } 
          
        var vlrLimite = ((usuario[0].usrSalLiquido * 30) / 100);
        var vlrInicial = 0 ;

        const user = await connection('usrSaldo')
            .where('usrServ',nroCartao)
            .where('usrMes',month)
            .where('usrAno',year)
            .select('usrVlrDisponivel');


        if (!user) {
            var n = 1; 
            while (n <= 48) {
                if (month === 13) { 
                    month = 1
                    year = year + 1
                }  
                
                const [saldo] = await connection('usrSaldo').insert({
                    usrServ: nroCartao,
                    usrMes: month,
                    usrAno: year,
                    usrVlrDisponivel: vlrLimite,
                    usrVlrUsado: vlrInicial,
                });
                n++;  
                month++;
            }      
        }

        var year = datProcess.getFullYear();
        var month = datProcess.getMonth() + 1;
        var dia = datProcess.getDate();

        if (dia > 15) {
            month++;
            if (month === 13) {
                month = 1;
                year++;
            }
        }
        
        if (user.length === 0) {
            var n = 1; 
            while (n <= 48) {
                if (month === 13) { 
                    month = 1
                    year = year + 1
                }  
                
                const [saldo] = await connection('usrSaldo').insert({
                    usrServ: nroCartao,
                    usrMes: month,
                    usrAno: year,
                    usrVlrDisponivel: vlrLimite,
                    usrVlrUsado: vlrInicial,
                });
                n++;  
                month++;
            }      
        }

        var yearOrigem = datProcess.getFullYear();
        var monthOrigem = datProcess.getMonth() + 1;
        var diaOrigem = datProcess.getDate();
        if (diaOrigem > 15) {
            monthOrigem++;
            if (monthOrigem === 13) {
                monthOrigem = 1;
                yearOrigem++;
            }
        }

        const dados = await connection('usrSaldo')
        .join('servidores', 'usrCartao', 'usrSaldo.usrServ')
        .where('usrServ',nroCartao)
        .where('usrMes',monthOrigem)
        .where('usrAno',yearOrigem)
        .select([
            'servidores.usrId', 'servidores.usrNome', 'servidores.usrTipContrato',
            'servidores.usrStatus', 'servidores.usrCartao', 'servidores.usrMatricula',
            'usrSaldo.usrServ', 'usrSaldo.usrMes', 'usrSaldo.usrAno', 'usrSaldo.usrVlrDisponivel'
        ]);
        console.log(dados)
        
        return response.json(dados);
    },

    
};

/* .select(['usrSaldo.usrVlrDisponivel', 'usrSaldo.usrMes', 'usrSaldo.usrAno', 'servidores.usrCartao', 'servidores.usrNome','servidores.usrStatus' ]); */