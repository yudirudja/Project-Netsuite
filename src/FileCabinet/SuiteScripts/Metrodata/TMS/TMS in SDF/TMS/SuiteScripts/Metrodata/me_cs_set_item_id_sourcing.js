/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/record', 'N/search'], function(record, search) {

    function fieldChanged(context) {
        var currentRecord = context.currentRecord;
        var sublistName = context.sublistId;
        var fieldName = context.fieldId;

        if (sublistName === 'item' && fieldName === 'item') {
            var itemId = currentRecord.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item'
            });

            if (itemId) {
                var itemLookup = search.lookupFields({
                    type: search.Type.ITEM,
                    id: itemId,
                    columns: ['custitem_me_item_id']
                });

                var customFieldValue = itemLookup.custitem_me_item_id;

                currentRecord.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_me_item_id',
                    value: customFieldValue
                });
            }
        }
    }

    return {
        fieldChanged: fieldChanged
    };
});
