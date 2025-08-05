/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record'], function (record) {


    function beforeSubmit(context) {

        var currentRecord = context.newRecord;

        var getPkpNonPkp = currentRecord.getValue({
            fieldId:'custbody_me_invoice_pkp_non_pkp',
        })

        var sublistCount = currentRecord.getLineCount({
            sublistId: 'apply'
        })

        for (let i = 0; i < sublistCount; i++) {
            var isApplied = currentRecord.getSublistValue({
                sublistId: 'apply',
                fieldId: 'apply',
                line: i
            });
            log.debug("isApplied", isApplied);
            if (isApplied == true) {
                var getIdSublist = currentRecord.getSublistValue({
                    sublistId: 'apply',
                    fieldId: 'internalid',
                    line: i
                });
                log.debug("getIdSublist", getIdSublist);
                var getInvoice = record.load({
                    type: record.Type.INVOICE,
                    id: getIdSublist,
                });
                var setPkpNonPkp = getInvoice.setValue({
                    fieldId: 'custbody_me_invoice_pkp_non_pkp',
                    value: Number(getPkpNonPkp),
                });
                var saveInvoice = getInvoice.save();
                // var getInventoryItem = record.submitFields({
                //     type: record.Type.INVOICE,
                //     id: getIdSublist,
                //     values: {
                //         custbody_me_invoice_pkp_non_pkp: Number(getPkpNonPkp),
                //     },
                //     options: {
                //         enableSourcing: false,
                //         ignoreMandatoryFields: true
                //     }
                // });
            }
            // }
        }

    }

    function afterSubmit(context) {
        try {
            var currentRecord = context.newRecord;
    
            var loadCurrent = record.load({
                type: record.Type.CUSTOMER_PAYMENT,
                id: currentRecord.id,
            });
            var saveCurrent = loadCurrent.save();
            
        } catch (error) {
            
        }
    }

    return {
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    }
});
