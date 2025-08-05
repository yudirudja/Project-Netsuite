/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(["N/ui/dialog", "N/runtime", "../config/config.js"], function(dialog, runtime, config) {

    function fieldChanged(context) {
        let rec = context.currentRecord;
        let sublistId = context.sublistId;
        let fieldId = context.fieldId;

        // if (sublistId == "item" && fieldId == "price") {
        //     let get_subsidiary = rec.getText("subsidiary");

        //     let get_price_lvl = rec.getCurrentSublistText({
        //         sublistId: "item",
        //         fieldId: "price",
        //     })
        //     let get_prev_prc_lvl = rec.getCurrentSublistValue({
        //         sublistId: "item",
        //         fieldId: "custcol_me_prev_prc_lvl",
        //     })

        //     if (!get_price_lvl.includes(get_subsidiary)) {
        //         let set_price_lvl = rec.setCurrentSublistText({
        //             sublistId: "item",
        //             fieldId: "price",
        //             text: get_prev_prc_lvl
        //         })
        //     }
            
        // }

    }

    function validateLine(context) {
        let rec = context.currentRecord;
        let sublistId = context.sublistId;
        let fieldId = context.fieldId;

        if (runtime.getCurrentUser().role == config.USER_ROLE.ADMINISTRATOR) {
            return true;
        }

        let get_subsidiary = rec.getText("subsidiary");

            let get_price_lvl = rec.getCurrentSublistText({
                sublistId: "item",
                fieldId: "price",
            })

            let get_prev_prc_lvl = rec.getCurrentSublistValue({
                sublistId: "item",
                fieldId: "custcol_me_prev_prc_lvl",
            })

            if (!get_price_lvl.includes(get_subsidiary) && !get_price_lvl.includes("Custom")) {
                let set_price_lvl = rec.setCurrentSublistText({
                    sublistId: "item",
                    fieldId: "price",
                    text: get_prev_prc_lvl
                })
                let options = {
                    title: 'PRICE_LEVEL_ERROR',
                    message: 'Price Level Tidak sesuai dengan Subsidiary'
                };
                dialog.alert(options)
                return false
            }else{
                let set_prev_prc_lvl = rec.setCurrentSublistValue({
                    sublistId: "item",
                    fieldId: "custcol_me_prev_prc_lvl",
                    value:get_price_lvl
                })

                return true;
            }


    }



    return {
        fieldChanged: fieldChanged,
        validateLine: validateLine,
    }
});
