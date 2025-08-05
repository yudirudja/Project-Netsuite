/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
 define(['N/search', 'N/ui/serverWidget', 'N/log', 'N/task', 'N/redirect', 'N/url', 'N/format', 'N/record', "N/runtime", 'N/currentRecord', 'N/error'], function (search, serverWidget, log, task, redirect, url, format, record, runtime, currentRecord, error) {

    function beforeSubmit(context) {
        var currentRecord = context.newRecord;

        // if (context.request.method === 'DELETE') {
            var getClearing1 = currentRecord.getValue('custbody_me_child_settle_clearing_tran');
            var getClearing2 = currentRecord.getValue('custbody_me_child_settle_clearing_tra2');
            var getBillCredit = currentRecord.getValue('custbody_me_bill_credit_settlement');

            var deleteClearing1 = record.delete({
                type: 'customtransaction_me_clearing_vp_1',
                id: getClearing1,
               }); 
            var deleteClearing2 = record.delete({
                type: 'customtransaction_me_clearing_vp_1',
                id: getClearing2,
               }); 
            var deleteBillCredit = record.delete({
                type: 'vendorcredit',
                id: getBillCredit,
               }); 
        // }
        
    }


    return {
        beforeSubmit: beforeSubmit,
    }
});
