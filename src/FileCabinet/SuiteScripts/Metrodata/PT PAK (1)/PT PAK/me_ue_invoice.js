/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record'], function (record) {


    function afterSubmit(context) {

        var currentRecord = context.newRecord;

        var sublistCount = currentRecord.getLineCount({
            sublistId: 'links'
        })

        for (let i = 0; i < sublistCount; i++) {
            log.debug("currentRecord.getSublistValue({ sublistId: 'links', fieldId: 'type', line: i }", currentRecord.getSublistValue({ sublistId: 'links', fieldId: 'type', line: i }));
            // if (currentRecord.getSublistValue({ sublistId: 'links', fieldId: 'type', line: i }) == "Payment") {
                var getIdSublist = currentRecord.getSublistValue({
                    sublistId: 'links',
                    fieldId: 'id',
                    line: i
                });
                var getCustPayment = record.load({
                    type: record.Type.CUSTOMER_PAYMENT,
                    id: getIdSublist,
                });
                var saveCustPayment = getCustPayment.save();
            // }
        }

    }

    return {
        afterSubmit: afterSubmit
    }
});
