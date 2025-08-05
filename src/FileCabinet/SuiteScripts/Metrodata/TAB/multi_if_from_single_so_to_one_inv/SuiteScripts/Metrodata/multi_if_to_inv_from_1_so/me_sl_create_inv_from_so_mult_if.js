/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(['N/record', 'N/search', 'N/query', 'N/render', 'N/file', 'N/query', 'N/runtime', "N/redirect"], function (record, search, query, render, file, query, runtime, redirect) {

    function getFulfillment(so_id) {

        let result = [];

        let itemfulfillmentSearchObj = search.create({
            type: "itemfulfillment",
            settings: [{ "name": "consolidationtype", "value": "ACCTTYPE" }],
            filters:
                [
                    ["type", "anyof", "ItemShip"],
                    "AND",
                    ["mainline", "is", "F"],
                    "AND",
                    ["createdfrom", "anyof", so_id],
                    "AND",
                    ["shipping", "is", "F"],
                    "AND",
                    ["taxline", "is", "F"],
                    "AND",
                    ["accounttype", "anyof", "COGS"],
                    "AND",
                    ["custbody_me_isinvoiced", "is", "F"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "item",
                        summary: "GROUP",
                        label: "Item"
                    }),
                    search.createColumn({
                        name: "quantity",
                        summary: "SUM",
                        label: "Quantity"
                    }),
                    search.createColumn({
                        name: "internalid",
                        summary: "GROUP",
                        label: "Internal ID"
                    })
                ]
        });

        let start = 0;

        do {
            var toResult = itemfulfillmentSearchObj.run().getRange({
                start: start,
                end: start + 1000,
            });

            for (let i = 0; i < toResult.length; i++) {
                let item = toResult[i].getValue(toResult[i].columns[0]);
                let quantity = toResult[i].getValue(toResult[i].columns[1]);
                let id_fulfillment = toResult[i].getValue(toResult[i].columns[2]);

                result.push({
                    item: item,
                    quantity: quantity,
                    id_fulfillment: id_fulfillment,
                });
            }
            start += 1000

        } while (toResult.length === 1000);

        return result;
    }

    function onRequest(context) {
        try {

            let is_show_logo = true;

            let jsonData = JSON.parse(context.request.parameters.custscript_me_param_crt_inv);
            log.debug("jsonData", jsonData)

            let get_fulfillment = getFulfillment(jsonData.record_id)

            let create_inv = record.transform({
                fromType: record.Type.SALES_ORDER,
                fromId: jsonData.record_id,
                toType: record.Type.INVOICE,
                isDynamic: true,
            });

            for (let i = 0; i < get_fulfillment.length; i++) {
                let get_line = create_inv.findSublistLineWithValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: get_fulfillment[i].item,
                });

                create_inv.selectLine('item', get_line)
                let set_qty = create_inv.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    // value: 13
                    value: get_fulfillment[i].quantity
                })
                create_inv.commitLine("item")

            }
            let save = create_inv.save()

            redirect.toRecord({
                type: record.Type.INVOICE,
                id: save,
            });

        } catch (error) {
            throw error
            // if (error.includes("RCRD_HAS_BEEN_CHANGED")) {
            //      throw "Mohon untuk menunggu proses printout yang sebelumnya selesai sebelum mencetak printout selanjutnya."
            // }else{
            //     throw "Mohon untuk menunggu proses printout yang sebelumnya selesai sebelum mencetak printout selanjutnya."
            // }
        }
    }

    return {
        onRequest: onRequest
    }
});
