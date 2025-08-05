/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define([], function() {

    function sublistChanged(context) {

        var rec = context.currentRecord;
        var sublistId = context.sublistId;
        var fieldId = context.fieldId;

        var isNewItem = false;

        if (sublistId == 'item') {
            
            var getLine = rec.getLineCount('item');

            for (let i = 0; i < getLine; i++) {
                var isNewItem = rec.getSublistValue({
                    sublistId: sublistId,
                    fieldId: 'custcol_me_is_new_item',
                    line: i
                })

                if (isNewItem) {
                    isNewItem = true;
                    break;
                }
                
            }

            if (isNewItem) {
                var setItemFlag = rec.setValue('custbody_me_item_flag', 1)
            }else{
                var setItemFlag = rec.setValue('custbody_me_item_flag', 2)

            }
        }
        
    }

    return {
        sublistChanged: sublistChanged
    }
});
