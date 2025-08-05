/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record'], function (record) {

    function afterSubmit(context) {

        try {
            let rec = context.newRecord;

            let load_so = record.load({
                type: "salesorder",
                id: rec.id
            })

            let get_genearted_interco = load_so.getValue("intercotransaction");

            if (get_genearted_interco) {
                let load_generated_interco_po = record.load({
                    type: "purchaseorder",
                    id: get_genearted_interco,
                });

                let po_line_arr = [];

                let get_po_line = load_generated_interco_po.getLineCount('item');

                for (let i = 0; i < get_po_line; i++) {

                    let get_po_line_id = load_generated_interco_po.getSublistValue({
                        sublistId: "item",
                        fieldId: "custcol_me_line_id_po",
                        line: i,
                    })

                    let inv_detail_arr = [];

                    let inv_detail = load_generated_interco_po.getSublistSubrecord({
                        sublistId: "item",
                        fieldId: "inventorydetail",
                        line: i
                    });

                    let inv_detail_line = inv_detail.getLineCount("inventoryassignment")

                    for (let j = 0; j < inv_detail_line; j++) {
                        let get_lot_number = inv_detail.getSublistValue({
                            sublistId: "inventoryassignment",
                            fieldId: "receiptinventorynumber",
                            line: j,
                        });
                        let get_lot_qty = inv_detail.getSublistValue({
                            sublistId: "inventoryassignment",
                            fieldId: "quantity",
                            line: j,
                        });
                        let get_lot_qty_available = inv_detail.getSublistValue({
                            sublistId: "inventoryassignment",
                            fieldId: "quantityavailable",
                            line: j,
                        });

                        inv_detail_arr.push({
                            lot_number: get_lot_number,
                            qty: get_lot_qty,
                            qty_available: get_lot_qty_available,
                        });
                    }

                    po_line_arr.push({
                        po_line_id: get_po_line_id,
                        inv_detail: inv_detail_arr,
                    });
                }
                log.debug("po_line_arr", po_line_arr)

                let get_so_line = load_so.getLineCount("item");

                for (let i = 0; i < get_so_line; i++) {

                    let set_po_line_id = load_so.setSublistValue({
                        sublistId: "item",
                        fieldId: "custcol_me_line_id_po",
                        line: i,
                        value: po_line_arr[i].po_line_id
                    })

                    let inv_detail = load_so.getSublistSubrecord({
                        sublistId: "item",
                        fieldId: "inventorydetail",
                        line: i,
                    });

                    let inv_detail_line = inv_detail.getLineCount("inventoryassignment")

                    for (let j = 0; j < po_line_arr[i].inv_detail.length; j++) {
                        // let get_lot_number = inv_detail.getSublistText({
                        //     sublistId: "inventoryassignment",
                        //     fieldId: "issueinventorynumber",
                        //     line: j,
                        // });
                        // log.debug("get_lot_number", get_lot_number)
                        let set_lot_number = inv_detail.setSublistText({
                            sublistId: "inventoryassignment",
                            fieldId: "issueinventorynumber",
                            line: j,
                            text: po_line_arr[i].inv_detail[j].lot_number
                        });
                        // let set_lot_qty_available = inv_detail.setSublistValue({
                        //     sublistId: "inventoryassignment",
                        //     fieldId: "quantityavailable",
                        //     line: j,
                        //     value: po_line_arr[i].inv_detail[j].qty_available
                        // });
                        let set_lot_qty = inv_detail.setSublistValue({
                            sublistId: "inventoryassignment",
                            fieldId: "quantity",
                            line: j,
                            value: po_line_arr[i].inv_detail[j].qty
                        });
                    }
                }
            }
            load_so.save()
        } catch (error) {
            log.error('Error', error)
        }

    }

    return {
        afterSubmit: afterSubmit
    }
});
