/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/search'], function (record, search) {

    function searchItemGr(item_id, prop_source_line) {
        var transactionSearchObj = search.create({
            type: "transaction",
            filters:
                [
                    ["type", "anyof", "ItemRcpt"],
                    "AND",
                    ["internalid", "anyof", item_id],
                    "AND",
                    ["item.generateaccruals", "is", "F"],
                    "AND",
                    ["line", "equalto", prop_source_line]
                ],
            columns:
                [
                    search.createColumn({ name: "account", label: "Account" }),
                    search.createColumn({ name: "linesequencenumber", label: "Line Sequence Number" }),
                    search.createColumn({ name: "mainname", label: "Main Line Name" }),
                    search.createColumn({ name: "line", label: "Line ID" }),
                    search.createColumn({ name: "item", label: "Item" }),
                    search.createColumn({ name: "memo", label: "Item Receipt Line ID" })
                ]
        }).run().getRange({
            start: 0,
            end: 1000,
        });

        //  for (let i = 0; i < transactionSearchObj.length; i++) {
        let line_id = transactionSearchObj[0].getValue(transactionSearchObj[0].columns[5]);
        //  }
        return line_id;
    }

    function beforeSubmit(context) {
        try {
            let rec = context.newRecord;

            let getisSplit = rec.getValue('custrecord_me_checkbox_runue');

            log.debug('getisSplit', getisSplit)

            if (getisSplit == "false" || getisSplit == false) {


                let isSplit = rec.setValue('custrecord_me_checkbox_runue', true);

                // if (isSplit == "true" || isSplit == true) {
                let prop_source_line = rec.getValue('custrecord_propsourceline');

                let get_record_id = rec.getValue('custrecord_propsourceid');

                let get_item_lineId = searchItemGr(get_record_id, prop_source_line);

                let load_item_receipt = record.load({
                    type: 'itemreceipt',
                    id: get_record_id,
                });

                let get_quantity_item = load_item_receipt.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: Number(get_item_lineId) - 1,
                });

                let set_quantity = rec.setValue({
                    fieldId: 'custrecord_propquantity',
                    value: get_quantity_item
                })
            }
            // }


        } catch (error) {
            log.error('Error', error)
        }





    }

    return {
        beforeSubmit: beforeSubmit,
    }
});
