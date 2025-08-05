/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(['../config/config.js', 'N/ui/dialog'], function (config, dialog) {
    let previous_loc_value = null;

    function pageInit(context) {
        let rec = context.currentRecord;
        let sublistId = context.sublistId;
        let fieldId = context.fieldId;
        let line = context.line;

        let record_type = ['purchaseorder', 'salesorder','invoice', 'vendorbill']

        let get_location = rec.getValue("location");
        if (record_type.includes(rec.type) && get_location) {
            
            previous_loc_value = get_location;
        }
    }

    function postSourcing(context) {
        let rec = context.currentRecord;
        let sublistId = context.sublistId;
        let fieldId = context.fieldId;
        let line = context.line;

        let record_type = ['cashsale', 'creditmemo', 'vendorcredit', 'returnauthorization', 'vendorreturnauthorization', 'purchaseorder', 'salesorder','invoice', 'vendorbill']

        if (fieldId == "subsidiary") {
            log.debug("rec.type", rec.type)


            let get_subsidiary = rec.getValue("subsidiary")
            if (get_subsidiary && record_type.includes(rec.type)) {
                log.debug("config.subsidiary_loc", config.subsidiary_loc)

                if ((config.subsidiary_loc).some((data) => data.subsidiary == get_subsidiary)) {
                    let find_index = config.subsidiary_loc.findIndex((data) => data.subsidiary == get_subsidiary)
                    log.debug("find_index", find_index)
                    let get_config_location = (config.subsidiary_loc)[find_index].location
                    log.debug("get_config_location", get_config_location)

                    let set_location = rec.setValue({ fieldId: "location", value: get_config_location })
                }
            } else if (get_subsidiary && 'inventoryadjustment' == rec.type) {
                log.debug("config.subsidiary_loc", config.subsidiary_loc)

                if ((config.subsidiary_loc).some((data) => data.subsidiary == get_subsidiary)) {
                    let find_index = config.subsidiary_loc.findIndex((data) => data.subsidiary == get_subsidiary)
                    log.debug("find_index", find_index)
                    let get_config_location = (config.subsidiary_loc)[find_index].location
                    log.debug("get_config_location", get_config_location)

                    rec.selectLine("inventory", 0)
                    let set_location = rec.setCurrentSublistValue({ sublistId: "inventory", fieldId: "location", value: get_config_location })
                }
            }
        }
    }
    function fieldChanged(context) {
        let rec = context.currentRecord;
        let sublistId = context.sublistId;
        let fieldId = context.fieldId;
        let line = context.line;

        let record_type = ['transferorder', 'inventorytransfer']

        if (fieldId == "subsidiary") {
            log.debug("rec.type", rec.type)


            let get_subsidiary = rec.getValue("subsidiary")
            if (get_subsidiary && record_type.includes(rec.type)) {
                log.debug("config.subsidiary_loc", config.subsidiary_loc)

                if ((config.subsidiary_loc).some((data) => data.subsidiary == get_subsidiary)) {
                    let find_index = config.subsidiary_loc.findIndex((data) => data.subsidiary == get_subsidiary)
                    log.debug("find_index", find_index)
                    let get_config_location = (config.subsidiary_loc)[find_index].location
                    log.debug("get_config_location", get_config_location)

                    let set_location = rec.setValue({ fieldId: "location", value: get_config_location })
                }
            }
        }
    }
    function lineInit(context) {
        let rec = context.currentRecord;
        let sublistId = context.sublistId;
        let fieldId = context.fieldId;
        let line = context.line;

        let record_type = ['inventoryadjustment']
        log.debug("rec.type line", rec.type)



        let get_subsidiary = rec.getValue("subsidiary")
        log.debug("get_subsidiary", get_subsidiary)
        if (get_subsidiary && record_type.includes(rec.type)) {
            log.debug("config.subsidiary_loc", config.subsidiary_loc)

            if ((config.subsidiary_loc).some((data) => data.subsidiary == get_subsidiary)) {
                let find_index = config.subsidiary_loc.findIndex((data) => data.subsidiary == get_subsidiary)
                log.debug("find_index", find_index)
                let get_config_location = (config.subsidiary_loc)[find_index].location
                log.debug("get_config_location", get_config_location)

                let set_location = rec.setCurrentSublistValue({ sublistId: "inventory", fieldId: "location", value: get_config_location })
            }
        }

    }

    function validateField(context) {
        let rec = context.currentRecord;
        let sublistId = context.sublistId;
        let fieldId = context.fieldId;
        let line = context.line;

        if (fieldId == 'entity' || fieldId == 'subsidiary') {
            previous_loc_value = null
        }

        if (!sublistId && fieldId == 'location') {
            let get_location = rec.getValue("location");

            if (!get_location && previous_loc_value) {
                dialog.alert({
                    title: 'LOCATION_NULL_VALUE',
                    message: 'Empty Location is Forbidden'
                });
                let set_location = rec.setValue("location", previous_loc_value);
                return false;
            }
            previous_loc_value = get_location;

        }


        if (sublistId == 'inventory' && fieldId == 'location') {

            let get_location = rec.getCurrentSublistValue("inventory", "location");

            let lineIndex = rec.getCurrentSublistIndex({
                sublistId: 'inventory'
            });

            if (!get_location && previous_loc_value && lineIndex == 0) {
                dialog.alert({
                    title: 'LOCATION_NULL_VALUE',
                    message: 'Empty Location is Forbidden'
                });
                return false;
            }
            if (!get_location && Number(lineIndex) > 0) {
                dialog.alert({
                    title: 'LOCATION_NULL_VALUE',
                    message: 'Empty Location is Forbidden'
                });
                return false;
            }
            previous_loc_value = get_location;

        }
        log.debug("previous_loc_value",previous_loc_value)
        
        return true

    }

    return {
        pageInit: pageInit,
        lineInit: lineInit,
        fieldChanged: fieldChanged,
        validateField: validateField,
        postSourcing: postSourcing,
    }
});

