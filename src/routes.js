const express = require('express');
const routes = express.Router();

const UsersController = require('./controllers/UsersController');
const AdminController = require('./controllers/AdminController');
const SecretController = require('./controllers/SecretController');
const AtivController = require('./controllers/AtivController');
const ConveniosController = require('./controllers/ConveniosController');
const PlaPagtoController = require('./controllers/PlaPagtoController');
const TxaAdminController = require('./controllers/TxaAdminController');
const ComprasController = require('./controllers/ComprasController');
const OrgaosController = require('./controllers/OrgaosController');
const PdfsController = require('./controllers/PdfsController');
const FiliacaoController = require('./controllers/FiliacaoController');
const MailController = require('./controllers/MailController');
const ParametrosController = require('./controllers/ParametrosController');
const CargosController = require('./controllers/CargosController');
const ParcelasController = require('./controllers/ParcelasController');
const DownloadsController = require('./controllers/DownloadsController');
const BairrosController = require('./controllers/BairrosController');
const TiposController = require('./controllers/TiposController');
const { Router } = require('express');

routes.get('/', (request, response) => {
    response.json({
        message: 'Bem-vindo ao servidor Sindicaldas!',
    });
});
routes.get('/users', UsersController.index);
routes.get('/signIn/:email/:password', UsersController.signIn);
routes.post('/newuser', UsersController.create);
routes.get('/searchUser/:idUsr', UsersController.searchUser);
routes.put('/updPassword/:emailUsuario', UsersController.updPassword);
routes.get('/verUsuario/:email', UsersController.searchEmail);
routes.get('/findUser/:cartao', UsersController.findUser);
routes.get('/busServ/:cartao/:password', UsersController.busServ);
routes.get('/loginUsr/:cartao/:password', UsersController.loginUsr);
routes.get('/verifUser/:cartao', UsersController.verifUser);
routes.put('/altservidor/:idSrv', UsersController.updServidor);
routes.get('/classUser/:search', UsersController.classUser);
routes.get('/cmpLibera/:cartao', UsersController.liberaUsr);
routes.put('/deletaUsr/:idSrv', UsersController.delUser);

routes.get('api/admin', AdminController.index);
routes.get('/loginAdm/:email/:password', AdminController.signIn);
routes.post('/newadmin', AdminController.create);
routes.get('/searchAdmin/:idAdm', AdminController.searchAdmin);
routes.put('/updPassAdmin/:emailUsuario', AdminController.updPassAdmin);
routes.put('/altadmin/:idAdm', AdminController.updAdmin);

routes.get('/secretarias', SecretController.index);
routes.post('/newsecretaria', SecretController.create);
routes.get('/searchSec/:idSec', SecretController.searchSec);
routes.put('/altsecretaria/:idSec', SecretController.updateSec);
routes.put('/delsecretaria/:idSec', SecretController.deleteSec);

routes.get('/orgaos', OrgaosController.index);
routes.post('/neworgadmin', OrgaosController.create);
routes.put('/altorgao/:idOrg', OrgaosController.updateOrg);
routes.get('/searchOrg/:idOrg', OrgaosController.searchOrg);
routes.put('/delorgadmin/:idOrg', OrgaosController.deleteOrg);

routes.get('/atividades', AtivController.index);
routes.get('/searchAtiv/:idAtv', AtivController.searchAtiv);
routes.post('/newatividade', AtivController.create);
routes.put('/altatividade/:idAtv', AtivController.updateAtiv);
routes.put('/delAtividade/:idAtv', AtivController.deleteAtiv);

routes.get('/convenios', ConveniosController.index);                                                     
routes.get('/searchConv/:idCnv', ConveniosController.searchConv);
routes.post('/newconvenio', ConveniosController.create);
routes.put('/altconvenio/:idCnv', ConveniosController.updateConv);
routes.put('/delconvenio/:idCnv', ConveniosController.deleteConv);
routes.get('/loginCnv/:email/:password', ConveniosController.signIn);
routes.put('/updPassCnv/:emailUsuario', ConveniosController.updPassCnv);
routes.put('/updSnhCnvCanc/:emailUsuario', ConveniosController.updSnhCnvCanc);
routes.get('/classCnv/:search', ConveniosController.classCnv);
routes.get('/signInCnc/:email/:password', ConveniosController.signInCnc);

routes.get('/loginSrv/:email/:password', UsersController.loginSrv);

routes.get('/plapagto', PlaPagtoController.index);
routes.post('/newplapagto', PlaPagtoController.create);
routes.get('/altplapagto/:idPgt', PlaPagtoController.searchPlaPagto);

routes.get('/taxAdmin', TxaAdminController.index);
routes.post('/newtaxadmin', TxaAdminController.create);
routes.put('/alttaxadmin/:idTxa', TxaAdminController.searchTxaAdm);

routes.get('/cargos', CargosController.index);
routes.post('/newcargo', CargosController.create);
routes.put('/altcargo/:idCrg', CargosController.updCargo);
routes.get('/searchCargo/:idCrg', CargosController.searchCargo);
routes.get('/bairros', BairrosController.index);
routes.post('/newbairro', BairrosController.create);
routes.put('/altbairro/:idBai', BairrosController.updBairro);
routes.get('/searchBairro/:idBai', BairrosController.searchBairro);

routes.get('/compras', ComprasController.index);
routes.post('/newcompra', ComprasController.create);
routes.get('/altcompra/:idCmp', ComprasController.searchCompras);
routes.get('/cmpConvenio/:idCnv', ComprasController.cmpConvenio);
routes.get('/cmpServidor/:idSrv', ComprasController.cmpServidor);
routes.get('/dadCompra/:idCmp', ComprasController.dadCompra);
routes.get('/parCompra/:idCmp', ParcelasController.parCompra);
routes.put('/cncCompra/:idCmp', ComprasController.cncCompra);

routes.get('/findCompras/:datVencto', ComprasController.cmpVencto);
routes.get('/totCompras/:datVencto', ComprasController.totCompras);

routes.get('/cmpPeriodo/:datInicio/:datFinal/:convenio/:servidor', PdfsController.cmpPeriodo);
routes.get('/somCompras/:datInicio/:datFinal/:convenio/:servidor', PdfsController.somCompras);
routes.get('/vctPeriodo/:datInicio/:datFinal/:convenio/:servidor', PdfsController.vctPeriodo);
routes.get('/somVctComp/:datInicio/:datFinal/:convenio/:servidor', PdfsController.somVctComp);

routes.get('/findCmpOrgao/:datVencto/:orgao', ComprasController.cmpOrgVenc);
routes.get('/totCmpOrgao/:datVencto/:orgao', ComprasController.totCmpOrgao);
routes.get('/pdfVdaEmissao', PdfsController.pdfVdaEmissao);
routes.get('/pdfVdaVenc/:dataInicial/:dataFinal', PdfsController.pdfVdaVenc);
routes.get('/pdfVctOrgao/:dataInicial/:dataFinal/:orgId', PdfsController.pdfVctOrgao);
routes.get('/filiacao/:usrId', FiliacaoController.filiacao);
routes.post('/newfiliacao', FiliacaoController.create);
routes.get('/searchFiliacao/:idUsr/:idFil', FiliacaoController.searchFiliacao);
routes.put('/altfiliacao/:idUsr/:idFil', FiliacaoController.updFiliacao);

routes.get('/envEmail/:email', MailController.enviaEmail);
routes.get('/recPassword/:email', MailController.recPassword);
routes.get('/recPassCnv/:email', MailController.recPassCnv);

routes.get('/parametros', ParametrosController.index);
routes.put('/altparametros/:idPar', ParametrosController.updParam);
routes.get('/usrAnterior/:cpfAnt', UsersController.usrAnterior);
routes.get('/informacoes/:idUsr', UsersController.searchInf);
routes.get('/newinformacao/', UsersController.createInf);
routes.get('/altinformacao/:idUsr/:idInf', UsersController.updInfor);
routes.get('/pdfSrvContrato/:srvId', UsersController.srvContratos);
routes.get('/parcelas/:tipUser', ParcelasController.parcelas);
routes.get('/pdfCmpEmissao', PdfsController.pdfCmpEmissao);
routes.get('/pdfCmpEmis/:dataInicio/:dataFinal/:cnpjCnv/:cpfSrv', PdfsController.pdfCmpEmis);
routes.get('/pdfVctCompras/:dataInicio/:dataFinal/:cnpjCnv/:cpfSrv', PdfsController.pdfVctCompras);
routes.get('/pdfVctCmpSrv/:datInicial/:datFinal/:srvId', PdfsController.pdfVctCmpSrv);
routes.get('/pdfVctCmpCnv/:datInicial/:datFinal/:cnvId', PdfsController.pdfVctCmpCnv);
routes.get('/pdfEmiCmpCnv/:datInicial/:datFinal/:cnvId', PdfsController.pdfEmiCmpCnv);
routes.get('/pdfEmiCmpSrv:datInicial/:datFinal/:srvId', PdfsController.pdfEmiCmpSrv);

routes.get('/pdfExtAdm/:dataInicial', PdfsController.pdfExtAdm);

routes.get('/downloadTxt/:datInicial/:orgId', DownloadsController.downTexto);

routes.get('/tipos', TiposController.index);
routes.post('/newtipo', TiposController.create);
routes.put('/alttipo/:tipId', TiposController.updateTip);

module.exports = routes;

