/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(["N/runtime", "N/record", "N/url"], function (runtime, record, url) {

    function allItemIsInvoiced(rec) {

        let get_line = rec.getLineCount("item");

        for (let i = 0; i < get_line; i++) {
            let get_invoiced_qty = rec.getSublistValue({
                sublistId: "item",
                fieldId: "quantitybilled",
                line: i
            });
            let get_qty = rec.getSublistValue({
                sublistId: "item",
                fieldId: "quantity",
                line: i
            });

            if (get_invoiced_qty != get_qty) {
                return false
            }
        }
        return true
    }

    function beforeLoad(context) {
        // log.debug("Remaining governance Total Before Load : " + runtime.getCurrentScript().getRemainingUsage());
        var newRec = context.newRecord

        // var user_role = runtime.getCurrentUser().role;

        if (context.type == context.UserEventType.VIEW) {

            let check_all_item_is_invoiced = allItemIsInvoiced(newRec);

            if (!check_all_item_is_invoiced) {


                var record_id = newRec.id
                var record_type = newRec.type

                var param = {
                    record_id: record_id,
                    record_type: record_type,
                    // delegator: getDelegator,
                }
                log.debug("param", param)
                var paramJson = JSON.stringify(param)
                context.form.addButton({
                    id: 'custpage_button_delegate',
                    label: "Create Invoice Multi IF",
                    functionName: "onButtonClick(" + paramJson + ")"
                })
                try {
                    log.debug('client script fileid')
                    context.form.clientScriptModulePath = 'SuiteScripts/Metrodata/multi_if_to_inv_from_1_so/me_cs_create_inv_from_so_mult_if_button.js'
                } catch (error) {
                    log.debug("error client script modulepath", error)
                    console.log("error client script modulepath " + error)
                }
                log.debug("Remaining governance Total Before Load After Load : " + runtime.getCurrentScript().getRemainingUsage());
            }
        }

    }


    return {
        beforeLoad: beforeLoad,

    }
});
