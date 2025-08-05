/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define([], function() {

    function pageInit(context) {
        var rec = context.newRecord;

        var lmeArr = [];

        var getLineCountLme = rec.getLineCount('recmachcustrecord_me_master_pricing_number_3')

        for (let i = 0; i < getLineCountLme; i++) {
            var bulan_lme = rec.getSublistValue({
                sublistId: 'recmachcustrecord_me_master_pricing_number_3',
                fieldId: 'custrecord_me_lme_bulan',
                line: i
            })

            var harga_lme = rec.getSublistValue({
                sublistId: 'recmachcustrecord_me_master_pricing_number_3',
                fieldId: 'custrecord_me_harga_lme',
                line: i
            })

            lmeArr.push({
                bulan_lme: bulan_lme,
                // bulan_lme_text: bulan_lme_text,
                harga_lme: harga_lme,
            })
        }

        log.debug('LME ARR', lmeArr)
    }

    return {
        pageInit: pageInit,
    }
});

