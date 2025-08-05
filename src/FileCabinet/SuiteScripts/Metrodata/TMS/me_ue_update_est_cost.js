/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
 define([], function() {


    function beforeSubmit(context) {
        var rec = context.newRecord;

        let get_adj_cat = rec.getValue('custbody_me_adjustment_category')
        let get_type_item = rec.getValue('custbody_me_type_item')

        if ( get_adj_cat == 1 && get_type_item == 1) {

            let get_line_count = rec.getLineCount('inventory');

            for (let i = 0; i < get_line_count; i++) {

                let set_unit_cost = rec.setSublistValue({
                    sublistId: 'inventory',
                    fieldId: 'avgunitcost',
                    line: i,
                    value: 0
                })
                
            }
            
        }

    }


    return {
        beforeSubmit: beforeSubmit,
    }
});
