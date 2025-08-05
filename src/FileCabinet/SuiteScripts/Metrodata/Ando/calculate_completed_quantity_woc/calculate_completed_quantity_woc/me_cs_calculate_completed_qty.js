/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(["N/record"], function (record) {

    function fieldChanged(context) {
        let rec = context.currentRecord;
        let fieldId = context.fieldId;
        let sublistId = context.sublistId;

        if (fieldId == 'custbody42' || fieldId == 'custbody41' || fieldId == 'custbody43' || fieldId == 'custbody44' || fieldId == 'custbody45' || fieldId == 'custbody46') {
            let get_qty_built1 = rec.getValue("custbody42");
            let get_qty_built2 = rec.getValue("custbody41");
            let get_qty_built3 = rec.getValue("custbody43");
            let get_qty_built4 = rec.getValue("custbody44");
            let get_qty_built5 = rec.getValue("custbody45");
            let get_qty_built6 = rec.getValue("custbody46");

            if (get_qty_built1 && get_qty_built2 && get_qty_built3 && get_qty_built4 && get_qty_built5 && get_qty_built6) {

                let total_qty_build = Number(get_qty_built1) + Number(get_qty_built2) + Number(get_qty_built3) + Number(get_qty_built4) + Number(get_qty_built5) + Number(get_qty_built6)

                let get_create_from = rec.getValue("createdfrom");

                let load_wo = record.load({
                    type: record.Type.WORK_ORDER,
                    id: get_create_from,
                });

                let get_wo_qty = load_wo.getValue("quantity");

                let get_order_qty1 = load_wo.getValue("custbody4");
                let get_order_qty2 = load_wo.getValue("custbody6");
                let get_order_qty3 = load_wo.getValue("custbody8");
                let get_order_qty4 = load_wo.getValue("custbody10");
                let get_order_qty5 = load_wo.getValue("custbody12");
                let get_order_qty6 = load_wo.getValue("custbody14");

                let total_order_qty = Number(get_order_qty1) + Number(get_order_qty2) + Number(get_order_qty3) + Number(get_order_qty4) + Number(get_order_qty5) + Number(get_order_qty6)

                let calculate = total_qty_build * Number(get_wo_qty) / total_order_qty
            }
        }
    }

    return {
        fieldChanged: fieldChanged,
    }
});
