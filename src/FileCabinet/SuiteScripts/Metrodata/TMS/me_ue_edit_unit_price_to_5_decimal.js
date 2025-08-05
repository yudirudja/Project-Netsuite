/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define([], function() {


    function beforeSubmit(context) {
        var rec = context.newRecord;

        var getLineItem = rec.getLineCount('item')

        for (let i = 0; i < getLineItem; i++) {
            var getRate = rec.getSublistValue({
                sublistId: 'item',
                fieldId: 'rate',
                line: i
            });
            var getRate = rec.setSublistValue({
                sublistId: 'item',
                fieldId: 'rate',
                line: i,
                value: Number(getRate).toFixed(5),
            });
            
        }
    }


    return {
        beforeSubmit: beforeSubmit,
    }
});
