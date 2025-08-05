/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record', '../config/config.js'], function (record, config) {


    function beforeSubmit(context) {
        let rec_old = context.oldRecord;
        let rec = context.newRecord;

        if (context.type == 'create') {
            let throw_error_message = new Array();

            let get_created_from = rec.getValue('createdfrom');
            let get_qty_built_1 = rec.getValue("custbody42");
            let get_qty_built_2 = rec.getValue("custbody41");
            let get_qty_built_3 = rec.getValue("custbody43");
            let get_qty_built_4 = rec.getValue("custbody44");
            let get_qty_built_5 = rec.getValue("custbody45");
            let get_qty_built_6 = rec.getValue("custbody46");

            let load_wo = record.load({
                type: record.Type.WORK_ORDER,
                id: get_created_from,
            });

            let get_wo_form = load_wo.getValue("customform");

            if (!(config.get("use_in_woc_script")).includes(get_wo_form)) {

                return;
            }

            log.debug("is_used", (config.get("use_in_woc_script")).includes(get_wo_form))

            let get_qty_1_wo = load_wo.getValue('custbody4')
            let get_qty_1_wo_built = load_wo.getValue('custbody42')
            let calculate_qty_1 = load_wo.setValue('custbody42', Number(get_qty_1_wo_built) + Number(get_qty_built_1))
            let calculate_qty_1_remaining = load_wo.setValue('custbody30', Number(get_qty_1_wo) - (Number(get_qty_1_wo_built) + Number(get_qty_built_1)))
            get_qty_1_wo < (Number(get_qty_1_wo_built) + Number(get_qty_built_1)) ? throw_error_message.push("Shoes Quantity Built 1 Cannot be Bigger than Shoes Quantity 1") : ""

            let get_qty_2_wo = load_wo.getValue('custbody6')
            let get_qty_2_wo_built = load_wo.getValue('custbody41')
            let calculate_qty_2 = load_wo.setValue('custbody41', Number(get_qty_2_wo_built) + Number(get_qty_built_2))
            let calculate_qty_2_remaining = load_wo.setValue('custbody32', Number(get_qty_2_wo) - (Number(get_qty_2_wo_built) + Number(get_qty_built_2)))
            get_qty_2_wo < (Number(get_qty_2_wo_built) + Number(get_qty_built_2)) ? throw_error_message.push("Shoes Quantity Built 2 Cannot be Bigger than Shoes Quantity 2") : ""

            let get_qty_3_wo = load_wo.getValue('custbody8')
            let get_qty_3_wo_built = load_wo.getValue('custbody43')
            let calculate_qty_3 = load_wo.setValue('custbody43', Number(get_qty_3_wo_built) + Number(get_qty_built_3))
            let calculate_qty_3_remaining = load_wo.setValue('custbody34', Number(get_qty_3_wo) - (Number(get_qty_3_wo_built) + Number(get_qty_built_3)))
            get_qty_3_wo < (Number(get_qty_3_wo_built) + Number(get_qty_built_3)) ? throw_error_message.push("Shoes Quantity Built 3 Cannot be Bigger than Shoes Quantity 3") : ""

            let get_qty_4_wo = load_wo.getValue('custbody10')
            let get_qty_4_wo_built = load_wo.getValue('custbody44')
            let calculate_qty_4 = load_wo.setValue('custbody44', Number(get_qty_4_wo_built) + Number(get_qty_built_4))
            let calculate_qty_4_remaining = load_wo.setValue('custbody36', Number(get_qty_4_wo) - (Number(get_qty_4_wo_built) + Number(get_qty_built_4)))
            get_qty_4_wo < (Number(get_qty_4_wo_built) + Number(get_qty_built_4)) ? throw_error_message.push("Shoes Quantity Built 4 Cannot be Bigger than Shoes Quantity 4") : ""

            let get_qty_5_wo = load_wo.getValue('custbody12')
            let get_qty_5_wo_built = load_wo.getValue('custbody45')
            let calculate_qty_5 = load_wo.setValue('custbody45', Number(get_qty_5_wo_built) + Number(get_qty_built_5))
            let calculate_qty_5_remaining = load_wo.setValue('custbody38', Number(get_qty_5_wo) - (Number(get_qty_5_wo_built) + Number(get_qty_built_5)))
            get_qty_5_wo < (Number(get_qty_5_wo_built) + Number(get_qty_built_5)) ? throw_error_message.push("Shoes Quantity Built 5 Cannot be Bigger than Shoes Quantity 5") : ""

            let get_qty_6_wo = load_wo.getValue('custbody14')
            let get_qty_6_wo_built = load_wo.getValue('custbody46')
            let calculate_qty_6 = load_wo.setValue('custbody46', Number(get_qty_6_wo_built) + Number(get_qty_built_6))
            let calculate_qty_6_remaining = load_wo.setValue('custbody40', Number(get_qty_6_wo) - (Number(get_qty_6_wo_built) + Number(get_qty_built_6)))
            get_qty_6_wo < (Number(get_qty_6_wo_built) + Number(get_qty_built_6)) ? throw_error_message.push("Shoes Quantity Built 6 Cannot be Bigger than Shoes Quantity 6") : ""

            if (throw_error_message.length > 0) {
                throw throw_error_message
            }

            load_wo.save()
        }
        if (context.type == 'edit') {
            let throw_error_message = new Array();

            let get_created_from = rec.getValue('createdfrom');
            let get_qty_built_1 = rec.getValue("custbody42");
            let get_qty_built_1_old = rec_old.getValue("custbody42");
            let get_qty_built_2 = rec.getValue("custbody41");
            let get_qty_built_2_old = rec_old.getValue("custbody41");
            let get_qty_built_3 = rec.getValue("custbody43");
            let get_qty_built_3_old = rec_old.getValue("custbody43");
            let get_qty_built_4 = rec.getValue("custbody44");
            let get_qty_built_4_old = rec_old.getValue("custbody44");
            let get_qty_built_5 = rec.getValue("custbody45");
            let get_qty_built_5_old = rec_old.getValue("custbody45");
            let get_qty_built_6 = rec.getValue("custbody46");
            let get_qty_built_6_old = rec_old.getValue("custbody46");

            let load_wo = record.load({
                type: record.Type.WORK_ORDER,
                id: get_created_from,
            });

            let get_wo_form = load_wo.getValue("customform");
            if (!(config.get("use_in_woc_script")).includes(get_wo_form)) {
                return;
            }
            log.debug("is_used", (config.get("use_in_woc_script")).includes(get_wo_form))
            let get_qty_1_wo = load_wo.getValue('custbody4')
            let get_qty_1_wo_built = load_wo.getValue('custbody42')
            let calculate_qty_1 = load_wo.setValue('custbody42', Number(get_qty_1_wo_built) - Number(get_qty_built_1_old) + Number(get_qty_built_1))
            let calculate_qty_1_remaining = load_wo.setValue('custbody30', Number(get_qty_1_wo) - (Number(get_qty_1_wo_built) - Number(get_qty_built_1_old) + Number(get_qty_built_1)))
            get_qty_1_wo < (Number(get_qty_1_wo_built) - Number(get_qty_built_1_old) + Number(get_qty_built_1)) ? throw_error_message.push("Shoes Quantity Built 1 Cannot be Bigger than Shoes Quantity 1") : ""

            let get_qty_2_wo = load_wo.getValue('custbody6')
            let get_qty_2_wo_built = load_wo.getValue('custbody41')
            let calculate_qty_2 = load_wo.setValue('custbody41', Number(get_qty_2_wo_built) - Number(get_qty_built_2_old) + Number(get_qty_built_2))
            let calculate_qty_2_remaining = load_wo.setValue('custbody32', Number(get_qty_2_wo) - (Number(get_qty_2_wo_built) - Number(get_qty_built_2_old) + Number(get_qty_built_2)))
            get_qty_2_wo < (Number(get_qty_2_wo_built) - Number(get_qty_built_2_old) + Number(get_qty_built_2)) ? throw_error_message.push("Shoes Quantity Built 2 Cannot be Bigger than Shoes Quantity 2") : ""

            let get_qty_3_wo = load_wo.getValue('custbody8')
            let get_qty_3_wo_built = load_wo.getValue('custbody43')
            let calculate_qty_3 = load_wo.setValue('custbody43', Number(get_qty_3_wo_built) - Number(get_qty_built_3_old) + Number(get_qty_built_3))
            let calculate_qty_3_remaining = load_wo.setValue('custbody34', Number(get_qty_3_wo) - (Number(get_qty_3_wo_built) - Number(get_qty_built_3_old) + Number(get_qty_built_3)))
            get_qty_3_wo < (Number(get_qty_3_wo_built) - Number(get_qty_built_3_old) + Number(get_qty_built_3)) ? throw_error_message.push("Shoes Quantity Built 3 Cannot be Bigger than Shoes Quantity 3") : ""

            let get_qty_4_wo = load_wo.getValue('custbody10')
            let get_qty_4_wo_built = load_wo.getValue('custbody44')
            let calculate_qty_4 = load_wo.setValue('custbody44', Number(get_qty_4_wo_built) - Number(get_qty_built_4_old) + Number(get_qty_built_4))
            let calculate_qty_4_remaining = load_wo.setValue('custbody36', Number(get_qty_4_wo) - (Number(get_qty_4_wo_built) - Number(get_qty_built_4_old) + Number(get_qty_built_4)))
            get_qty_4_wo < (Number(get_qty_4_wo_built) - Number(get_qty_built_4_old) + Number(get_qty_built_4)) ? throw_error_message.push("Shoes Quantity Built 4 Cannot be Bigger than Shoes Quantity 4") : ""

            let get_qty_5_wo = load_wo.getValue('custbody12')
            let get_qty_5_wo_built = load_wo.getValue('custbody45')
            let calculate_qty_5 = load_wo.setValue('custbody45', Number(get_qty_5_wo_built) - Number(get_qty_built_5_old) + Number(get_qty_built_5))
            let calculate_qty_5_remaining = load_wo.setValue('custbody38', Number(get_qty_5_wo) - (Number(get_qty_5_wo_built) - Number(get_qty_built_5_old) + Number(get_qty_built_5)))
            get_qty_5_wo < (Number(get_qty_5_wo_built) - Number(get_qty_built_5_old) + Number(get_qty_built_5)) ? throw_error_message.push("Shoes Quantity Built 5 Cannot be Bigger than Shoes Quantity 5") : ""

            let get_qty_6_wo = load_wo.getValue('custbody14')
            let get_qty_6_wo_built = load_wo.getValue('custbody46')
            let calculate_qty_6 = load_wo.setValue('custbody46', Number(get_qty_6_wo_built) - Number(get_qty_built_6_old) + Number(get_qty_built_6))
            let calculate_qty_6_remaining = load_wo.setValue('custbody40', Number(get_qty_6_wo) - (Number(get_qty_6_wo_built) - Number(get_qty_built_6_old) + Number(get_qty_built_6)))
            get_qty_6_wo < (Number(get_qty_6_wo_built) - Number(get_qty_built_6_old) + Number(get_qty_built_6)) ? throw_error_message.push("Shoes Quantity Built 6 Cannot be Bigger than Shoes Quantity 6") : ""

            if (throw_error_message.length > 0) {
                throw throw_error_message
            }

            load_wo.save()
        }
        if (context.type == 'delete') {

            let get_created_from = rec.getValue('createdfrom');
            let get_qty_built_1 = rec.getValue("custbody42");
            let get_qty_built_1_old = rec_old.getValue("custbody42");
            let get_qty_built_2 = rec.getValue("custbody41");
            let get_qty_built_2_old = rec_old.getValue("custbody41");
            let get_qty_built_3 = rec.getValue("custbody43");
            let get_qty_built_3_old = rec_old.getValue("custbody43");
            let get_qty_built_4 = rec.getValue("custbody44");
            let get_qty_built_4_old = rec_old.getValue("custbody44");
            let get_qty_built_5 = rec.getValue("custbody45");
            let get_qty_built_5_old = rec_old.getValue("custbody45");
            let get_qty_built_6 = rec.getValue("custbody46");
            let get_qty_built_6_old = rec_old.getValue("custbody46");

            let load_wo = record.load({
                type: record.Type.WORK_ORDER,
                id: get_created_from,
            });

            let get_wo_form = load_wo.getValue("customform");
            if (!(config.get("use_in_woc_script")).includes(get_wo_form)) {
                return;
            }
            log.debug("is_used", (config.get("use_in_woc_script")).includes(get_wo_form))

            let get_qty_1_wo = load_wo.getValue('custbody4')
            let get_qty_1_wo_built = load_wo.getValue('custbody42')
            let calculate_qty_1 = load_wo.setValue('custbody42', Number(get_qty_1_wo_built) - Number(get_qty_built_1_old))
            let calculate_qty_1_remaining = load_wo.setValue('custbody30', Number(get_qty_1_wo) - (Number(get_qty_1_wo_built) - Number(get_qty_built_1_old)))
            0 > (Number(get_qty_1_wo) - (Number(get_qty_1_wo_built) - Number(get_qty_built_1_old))) ? throw_error_message.push("Shoes Quantity Built 1 Cannot be less than Zero") : ""

            let get_qty_2_wo = load_wo.getValue('custbody6')
            let get_qty_2_wo_built = load_wo.getValue('custbody41')
            let calculate_qty_2 = load_wo.setValue('custbody41', Number(get_qty_2_wo_built) - Number(get_qty_built_2_old))
            let calculate_qty_2_remaining = load_wo.setValue('custbody32', Number(get_qty_2_wo) - (Number(get_qty_2_wo_built) - Number(get_qty_built_2_old)))
            0 > (Number(get_qty_2_wo) - (Number(get_qty_2_wo_built) - Number(get_qty_built_2_old))) ? throw_error_message.push("Shoes Quantity Built 2 Cannot be less than Zero") : ""

            let get_qty_3_wo = load_wo.getValue('custbody8')
            let get_qty_3_wo_built = load_wo.getValue('custbody43')
            let calculate_qty_3 = load_wo.setValue('custbody43', Number(get_qty_3_wo_built) - Number(get_qty_built_3_old))
            let calculate_qty_3_remaining = load_wo.setValue('custbody34', Number(get_qty_3_wo) - (Number(get_qty_3_wo_built) - Number(get_qty_built_3_old)))
            0 > (Number(get_qty_3_wo) - (Number(get_qty_3_wo_built) - Number(get_qty_built_3_old))) ? throw_error_message.push("Shoes Quantity Built 3 Cannot be less than Zero") : ""

            let get_qty_4_wo = load_wo.getValue('custbody10')
            let get_qty_4_wo_built = load_wo.getValue('custbody44')
            let calculate_qty_4 = load_wo.setValue('custbody44', Number(get_qty_4_wo_built) - Number(get_qty_built_4_old))
            let calculate_qty_4_remaining = load_wo.setValue('custbody36', Number(get_qty_4_wo) - (Number(get_qty_4_wo_built) - Number(get_qty_built_4_old)))
            0 > (Number(get_qty_4_wo) - (Number(get_qty_4_wo_built) - Number(get_qty_built_4_old))) ? throw_error_message.push("Shoes Quantity Built 4 Cannot be less than Zero") : ""

            let get_qty_5_wo = load_wo.getValue('custbody12')
            let get_qty_5_wo_built = load_wo.getValue('custbody45')
            let calculate_qty_5 = load_wo.setValue('custbody45', Number(get_qty_5_wo_built) - Number(get_qty_built_5_old))
            let calculate_qty_5_remaining = load_wo.setValue('custbody38', Number(get_qty_5_wo) - (Number(get_qty_5_wo_built) - Number(get_qty_built_5_old)))
            0 > (Number(get_qty_5_wo) - (Number(get_qty_5_wo_built) - Number(get_qty_built_5_old))) ? throw_error_message.push("Shoes Quantity Built 5 Cannot be less than Zero") : ""

            let get_qty_6_wo = load_wo.getValue('custbody14')
            let get_qty_6_wo_built = load_wo.getValue('custbody46')
            let calculate_qty_6 = load_wo.setValue('custbody46', Number(get_qty_6_wo_built) - Number(get_qty_built_6_old))
            let calculate_qty_6_remaining = load_wo.setValue('custbody40', Number(get_qty_6_wo) - (Number(get_qty_6_wo_built) - Number(get_qty_built_6_old)))
            0 > (Number(get_qty_6_wo) - (Number(get_qty_6_wo_built) - Number(get_qty_built_6_old))) ? throw_error_message.push("Shoes Quantity Built 6 Cannot be less than Zero") : ""

            load_wo.save()
        }
    }

    return {
        beforeSubmit: beforeSubmit,
    }
});
