/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define([], function () {

    function saveRecord(context) {
        let rec = context.currentRecord;
        let sublistId = context.sublistId;
        let fieldId = context.fieldId;

        let get_line_count = rec.getLineCount("item");
        let exeeded_qty_arr = [];
        log.debug("get_line_count", get_line_count)

        for (let i = 0; i < get_line_count; i++) {
            // rec.selectLine("item", i)
            let get_checked = rec.getSublistValue({
                sublistId: "item",
                fieldId: "binitem",
                line: i
            });
            let get_item = rec.getSublistValue({
                sublistId: "item",
                fieldId: "itemname",
                line: i
            });
            log.debug("getitem", get_item)
            let get_onhand = rec.getSublistValue({
                sublistId: "item",
                fieldId: "onhand",
                line: i
            });
            let get_quantity = rec.getSublistValue({
                sublistId: "item",
                fieldId: "quantity",
                line: i
            });

            log.debug("exceeded", { item: get_item, line: i })
            if (Number(get_quantity) > Number(get_onhand) && (get_checked == true || get_checked == "true" || get_checked == "T")) {
                exeeded_qty_arr.push({
                    item: get_item,
                    line: i
                });
            }
        }
        log.debug("exeeded_qty_arr",exeeded_qty_arr)

        if (exeeded_qty_arr.length > 0) {
            let error_message = `Quantity on item \n`
            for (let i = 0; i < exeeded_qty_arr.length; i++) {
                error_message += `${exeeded_qty_arr[i].item} line ${exeeded_qty_arr[i].line}\n `

            }
            error_message += `has exceeded available on hand`;
            alert(error_message);
            return false;
        }

        return true

    }



    return {
        saveRecord: saveRecord,
    }
});
