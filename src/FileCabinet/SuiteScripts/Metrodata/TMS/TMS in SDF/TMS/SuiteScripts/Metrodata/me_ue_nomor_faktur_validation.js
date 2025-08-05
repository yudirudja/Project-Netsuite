/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/search', 'N/record'], function (search, record) {

    function afterSubmit(context) {
        var rec = context.newRecord;
        var fakturId = rec.getValue('custbody_me_nomor_faktur_sales');
        if (fakturId) {
            var updateFaktur = record.submitFields({
                type: 'customrecord_me_csrec_no_faktur_sales',
                id: fakturId,
                values: {
                    custrecord_me_csrec_invoice_number: rec.id
                },
                options: {
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                }
            })
        }
    }

    return {
        afterSubmit: afterSubmit
    }
});