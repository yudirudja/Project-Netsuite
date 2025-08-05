/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define([], function() {


    function beforeSubmit(context) {
        var rec = context.newRecord;

        var itemLineCount = rec.getLineCount('item');
        
        for (let i = 0; i < itemLineCount; i++) {
            var getUnitPrice = rec.getSublistValue({
                sublistId: 'item',
                fieldId: 'rate',
                line: i,
            });

            var setUnietPrice = rec.setSublistValue({
                sublistId: 'item',
                fieldId: 'rate',
                line: i,
                value: Number(getUnitPrice),
            })
            
        }
    }

    return {
        beforeSubmit: beforeSubmit,
    }
});
