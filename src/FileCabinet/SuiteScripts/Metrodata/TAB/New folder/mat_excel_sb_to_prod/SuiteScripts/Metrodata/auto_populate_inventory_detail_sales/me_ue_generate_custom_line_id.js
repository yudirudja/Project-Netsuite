/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record'], function (record) {


    function afterSubmit(context) {
        try {
            let rec = context.newRecord;

            let load_po = record.load({
                type: "purchaseorder",
                id: rec.id
            })

            let get_line_count = load_po.getLineCount("item");

            for (let i = 0; i < get_line_count; i++) {
                let set_line = load_po.setSublistValue({
                    sublistId: "item",
                    fieldId: "custcol_me_line_id_po",
                    line: i,
                    value: `${rec.id}_${i}`,
                })
            }
            load_po.save();
        } catch (error) {
            log.error("error", error)
        }

    }


    return {
        afterSubmit: afterSubmit,
    }
});
