/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
 define(['N/record', 'N/search', './library/moment.min.js'], function(record, search, moment) {


    function beforeSubmit(context) {
        var currentRecord = context.newRecord;

        var getCustomerField = currentRecord.getValue({
            fieldId: 'custbody_me_trx_arisan_customer'
        })

        var countSublistline = currentRecord.getLineCount({
            sublistId: 'line'
        })
        
        for (let i = 0; i < countSublistline; i++) {
            var setCustomerSublist = currentRecord.setSublistValue({
                sublistId: 'line',
                fieldId: 'entity',
                value: getCustomerField,
                line: i,
            })
        }
    }


    return {
        beforeSubmit: beforeSubmit,

    }
});
