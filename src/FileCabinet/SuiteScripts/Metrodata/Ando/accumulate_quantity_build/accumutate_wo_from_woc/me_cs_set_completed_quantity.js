/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define([], function () {

    function fieldChanged(context) {
        let rec = context.currentRecord;
        let fieldId = context.fieldId;
        let sublistId = context.sublistId;

        if (fieldId == "custbody42" || fieldId == "custbody41" || fieldId == "custbody43" || fieldId == "custbody44" || fieldId == "custbody45" || fieldId == "custbody46") {

            let get_qty_built_1 = rec.getValue("custbody42");
            let get_qty_built_2 = rec.getValue("custbody41");
            let get_qty_built_3 = rec.getValue("custbody43");
            let get_qty_built_4 = rec.getValue("custbody44");
            let get_qty_built_5 = rec.getValue("custbody45");
            let get_qty_built_6 = rec.getValue("custbody46");

            let set_completed_quantity = rec.setValue("completedquantity", (Number(get_qty_built_1) + Number(get_qty_built_2) + Number(get_qty_built_3) + Number(get_qty_built_4) + Number(get_qty_built_5) + Number(get_qty_built_6)))
        }
    }

    return {
        fieldChanged: fieldChanged,
    }
});
