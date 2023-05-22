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
        var id = request.params.idCmp;

        const parc = await connection('cmpParcelas')
        .where('parIdCompra',id)
        .select('*');
        
        return response.json(parc);
    }, 
};