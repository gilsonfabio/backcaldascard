const connection = require('../database/connection');

module.exports = {   
    async index (request, response) {
        const taxas = await connection('taxMensal').select('*');
    
        return response.json(taxas);
    },    

    async create(request, response) {
        const {txaMenAtvId, txaMenMes, txaMenAno, txaMenIndice} = request.body;
        let status = "A";

        const [txaMenId] = await connection('taxMensal').insert({
            txaMenAtvId, 
            txaMenMes, 
            txaMenAno, 
            txaMenIndice, 
            txaMenStatus: status,
        });
           
        return response.json({txaMenId});
    },

    async searchTaxa(request, response) {
        let txmes = request.query.mes;
        let txano = request.query.ano;

        const taxa = await connection('taxMensal')
        .where('txaMenMes', txmes)
        .where('txaMenAno', txano)
        .join('atividades', 'atvId', 'taxMensal.txaMenAtvId')
        .select([
            'taxMensal.txaMenId',
            'taxMensal.txaMenAtvId',
            'taxMensal.txaMenMes',
            'taxMensal.txaMenAno',
            'taxMensal.txaMenIndice',
            'atividades.atvDescricao'
        ]);

        return response.json(taxa);
    },

    async busTxaMensal(request, response) {
        let idTxa = request.params.txaMenId;

        const taxa = await connection('taxMensal')
        .where('txaMenId', idTxa)
        .join('atividades', 'atvId', 'taxMensal.txaMenAtvId')
        .select([
            'taxMensal.txaMenId',
            'taxMensal.txaMenAtvId',
            'taxMensal.txaMenMes',
            'taxMensal.txaMenAno',
            'taxMensal.txaMenIndice',
            'taxMensal.txaMenStatus',
            'atividades.atvDescricao'
        ])
        .first();

        return response.json(taxa);
    },

    async updTxaMensal(request, response) {
        try {
            const txaId = request.params.txaMenId;
            const {txaMenAtvId, txaMenMes, txaMenAno, txaMenIndice, txaMenStatus, atvDescricao } = request.body;    

            const upd = await connection('taxMensal')
                .where('txaMenId', txaId)
                .update({
                    txaMenAtvId,
                    txaMenMes,
                    txaMenAno,
                    txaMenIndice,
                    txaMenStatus
                });

            return response.status(200).json({
                msn: 'Taxas alteradas com sucesso!'
            });

        } catch (error) {

            console.error(error);

            return response.status(500).json({
                erro: 'Erro ao alterar taxas'
            });
        }
    },

    async geraTaxa(request, response) {
        try {
            const txmes = request.body.mes;
            const txano = request.body.ano;

            // Busca todas as atividades
            const atividades = await connection('atividades')
                .select('*');

            // Percorre cada atividade
            for (const ativ of atividades) {

                const id = ativ.atvId;
                const taxa = ativ.atvTaxAdm;
                const status = 'A';

                // Verifica se já existe taxa para essa atividade/mês/ano
                const existe = await connection('taxMensal')
                    .where('txaMenMes', txmes)
                    .where('txaMenAno', txano)
                    .where('txaMenAtvId', id)
                    .first();

                if (existe) {

                    // Atualiza a taxa existente
                    await connection('taxMensal')
                        .where('txaMenId', existe.txaMenId)
                        .update({
                            txaMenIndice: taxa,
                        });

                } else {

                    // Cria nova taxa
                    await connection('taxMensal')
                        .insert({
                            txaMenAtvId: id,
                            txaMenMes: txmes,
                            txaMenAno: txano,
                            txaMenIndice: taxa,
                            txaMenStatus: status,
                        });

                }
            }

            return response.status(200).json({
                msn: 'Taxas geradas com sucesso!'
            });

        } catch (error) {

            console.error(error);

            return response.status(500).json({
                erro: 'Erro ao gerar taxas'
            });
        }
    },
};