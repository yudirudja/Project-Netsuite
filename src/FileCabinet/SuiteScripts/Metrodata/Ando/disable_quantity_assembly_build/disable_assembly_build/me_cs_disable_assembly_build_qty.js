/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define([], function () {

    function pageInit(context) {
        let rec = context.currentRecord;
        let sublistId = context.sublistId;
        let fieldId = context.fieldId;

        let get_created_from = rec.getValue("createdfrom")

        let get_line = rec.getLineCount("component");

        if (get_created_from != null || get_created_from != "" || !get_created_from) {
            for (let i = 0; i < get_line; i++) {
                let get_qty_field = rec.getSublistField({
                    sublistId: 'component',
                    fieldId: 'quantity',
                    line: i
                });
                get_qty_field.isDisabled = true;
    
            }
            
        }

    }



    return {
        pageInit: pageInit,
    }
});
