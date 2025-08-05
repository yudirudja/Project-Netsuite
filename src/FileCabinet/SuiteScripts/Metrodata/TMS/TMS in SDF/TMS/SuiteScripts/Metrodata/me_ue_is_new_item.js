/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record'], function(record) {


    function beforeSubmit(context) {
        
        var rec = context.newRecord;

        var getLine = rec.getLineCount('item');

        for (let i = 0; i < getLine; i++) {
            var getItem = rec.getSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: i
            });

            var getItemtype = rec.getSublistValue({
                sublistId: 'item',
                fieldId: 'itemtype',
                line: i
            });
            

            if (getItemtype == 'InvtPart') {
              try {
                
              
                var setIsNewItem = record.submitFields({
                    type: record.Type.INVENTORY_ITEM,
                    id: getItem,
                    values: {
                        'custitem_me_is_new_item': false
                    }
                });
                } catch (error) {
                var setIsNewItem = record.submitFields({
                    type: record.Type.LOT_NUMBERED_INVENTORY_ITEM,
                    id: getItem,
                    values: {
                        'custitem_me_is_new_item': false
                    }
                });
              }
            }
            if (getItemtype == 'NonInvtPart') {
                var setIsNewItem = record.submitFields({
                    type: record.Type.NON_INVENTORY_ITEM,
                    id: getItem,
                    values: {
                        'custitem_me_is_new_item': false
                    }
                });
            }
        }

    }


    return {
        beforeSubmit: beforeSubmit,

    }
});
