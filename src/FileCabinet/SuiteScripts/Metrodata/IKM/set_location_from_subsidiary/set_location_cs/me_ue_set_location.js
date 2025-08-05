/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['../config/config.js'], function (config) {

    function beforeLoad(context) {
        let rec = context.newRecord;

        let record_type = ['purchaseorder', 'salesorder','invoice', 'vendorbill']

        let get_subsidiary = rec.getValue("subsidiary");

        if ((config.subsidiary_loc).some((data) => data.subsidiary == get_subsidiary)) {
            let find_index = config.subsidiary_loc.findIndex((data) => data.subsidiary == get_subsidiary)
            log.debug("find_index", find_index)
            let get_config_location = (config.subsidiary_loc)[find_index].location
            log.debug("get_config_location", get_config_location)

            let set_location = rec.setValue({ fieldId: "location", value: get_config_location })
        }
    }

    return {
        beforeLoad: beforeLoad,

    }
});
