/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define([], function() {

    function pageInit(context) {
        var rec = context.currentRecord;
        var fieldId = context.fieldId;

        var itemField = rec.getCurrentSublistField({
            sublistId: 'inventory',
            fieldId: 'item'
        });

        itemField.isDisabled = true
    }

    function lineInit(context) {
        var rec = context.currentRecord;
        var fieldId = context.fieldId;

        var itemField = rec.getCurrentSublistField({
            sublistId: 'inventory',
            fieldId: 'item'
        });

        itemField.isDisabled = true

    }

    function fieldChanged(context) {
        var rec = context.currentRecord;
        var fieldId = context.fieldId;
        var sublistId = context.sublistId;

        if (fieldId == 'account') {
            var getInventoryLine = rec.getLineCount('inventory') 
            for (let i = getInventoryLine-1; i >= 0; i--) {
                rec.removeLine({
                    sublistId: 'inventory',
                    line: i,
                    // ignoreRecalc: true
                });
            }
        }
        if (fieldId == 'custcol_me_item_inv_adj' && sublistId == 'inventory') {
            var getMeItem = rec.getCurrentSublistValue('inventory','custcol_me_item_inv_adj');
            log.debug('getMeItem',getMeItem)

            var setItem = rec.setCurrentSublistValue('inventory', 'item', getMeItem)
        }
    }


    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        lineInit: lineInit,
    }
});
