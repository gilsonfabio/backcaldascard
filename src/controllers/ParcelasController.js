const connection = require('../database/connection');

module.exports = {   
    async parcelas (request, response) {
        var usrTipo = request.params.tipUser;

        const parc = await connection('parcelas')
        .where('parTipServ',usrTipo)
        .select('*');
        
        return response.json(parc);
    }, 
    
    async parCompra (request, response) {
        let id = request.params.idCmp;
        let status = 'A';
        
        const parc = await connection('cmpParcelas')
        .where('parIdCompra',id)
        .where('parStaParcela', status)
        .select('*');
        
        return response.json(parc);
    }, 
};