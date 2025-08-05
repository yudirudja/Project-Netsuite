/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define([], function() {

    function beforeSubmit(context) {
        var rec = context.newRecord;

        var itemLineCount = rec.getLineCount('item');
        
        for (let i = 0; i < itemLineCount; i++) {
            var getQty = rec.getSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                line: i
            });

            var setQty = rec.setSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_tolerance_qty',
                value: Number(getQty) * 0.05,
                line: i
            })
            
        }
    }

    return {
        beforeSubmit: beforeSubmit,
    }
});
