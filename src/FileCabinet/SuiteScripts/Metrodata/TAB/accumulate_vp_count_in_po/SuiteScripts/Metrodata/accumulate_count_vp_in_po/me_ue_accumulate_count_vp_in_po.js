/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(["N/record"], function (record) {


    function beforeSubmit(context) {
        let rec = context.newRecord;

        if (context.type == 'create') {



            let get_po = rec.getValue("purchaseorder");

            let load_po = record.load({
                type: record.Type.PURCHASE_ORDER,
                id: get_po,
            });

            let get_accumulate_count_vp = load_po.getValue("custbody_me_count_vp_po")
            let set_accumulate_count_vp = load_po.setValue("custbody_me_count_vp_po", Number(get_accumulate_count_vp) + 1)
            load_po.save()
        }
    }


    return {
        beforeSubmit: beforeSubmit,
    }
});
