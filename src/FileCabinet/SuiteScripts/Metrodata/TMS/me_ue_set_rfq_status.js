/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define([], function() {

    function beforeLoad(context) {
        
    }

    function beforeSubmit(context) {
        var rec = context.newRecord;

        log.debug('ini before submit')

        var getLineItemCount = rec.getLineCount('item');
        var countIsRfqed = 0
        for (let i = 0; i < getLineItemCount; i++) {
            var getRfqId = rec.setSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_rfq_number',
                line: i,
            });

            if (getRfqId) {
                countIsRfqed++;
            }
        }

        if (countIsRfqed == getLineItemCount) {
            var statusRfq = rec.setText('custbody_me_status_all_rfq', 'Complete');
        }else{
            var statusRfq = rec.setText('custbody_me_status_all_rfq', 'Pending');
        }
    }

    function afterSubmit(context) {
        
    }

    return {
        // beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        // afterSubmit: afterSubmit
    }
});
