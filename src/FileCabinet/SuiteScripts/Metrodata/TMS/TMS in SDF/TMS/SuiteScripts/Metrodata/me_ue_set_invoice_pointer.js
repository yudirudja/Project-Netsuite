/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record'], function(record) {

    function beforeSubmit(context) {
        var recOld = context.oldRecord;
        var recNew = context.newRecord;

        var getNomorInvoice = recOld.getValue('custrecord_me_invoice_document_number');
        var getNomorInvoiceNew = recNew.getValue('custrecord_me_invoice_document_number');

      try {
        if (getNomorInvoiceNew == '') {
            var setEnofaRec = record.submitFields({
                type: 'invoice',
                id: getNomorInvoice,
                values: {
                    'custbody_me_nomor_enofa': null,
                }
            });
        }
      } catch (error) {
        
      }
    }

    return {
        beforeSubmit: beforeSubmit,
    }
});
