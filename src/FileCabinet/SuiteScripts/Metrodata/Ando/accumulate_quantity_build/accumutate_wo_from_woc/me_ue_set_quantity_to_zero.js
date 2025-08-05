/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['../config/config.js', "N/runtime"], function (config, runtime) {

    function beforeLoad(context) {
        let rec = context.newRecord;

        log.debug(`config.get("use_in_woc_script")`,config.get("use_in_woc_script"))
        let get_form = rec.getValue("customform")
        log.debug("runtime.envType",runtime.envType)
        if (!(config.get("use_in_woc_script")).includes(get_form)) {
            return;
        }
        if (context.type = "create") {
            let set_qty_built_1 = rec.setValue("custbody42", 0);    
            let set_qty_built_2 = rec.setValue("custbody41", 0);
            let set_qty_built_3 = rec.setValue("custbody43", 0);
            let set_qty_built_4 = rec.setValue("custbody44", 0);
            let set_qty_built_5 = rec.setValue("custbody45", 0);
            let set_qty_built_6 = rec.setValue("custbody46", 0);

        }
    }


    return {
        beforeLoad: beforeLoad,

    }
});
