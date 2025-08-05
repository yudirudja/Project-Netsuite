/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(["N/record"], function (record) {

    function beforeSubmit(context) {
        let rec = context.newRecord;

        let get_po = rec.getValue("custbody_me_related_po_bill");

        if (get_po) {



            let load_po = record.load({
                type: record.Type.PURCHASE_ORDER,
                id: get_po,
            });

            let get_line_po = load_po.getLineCount("item");
            let getPoItemArr = []

            for (let i = 0; i < get_line_po; i++) {
                let get_item = load_po.getSublistValue({
                    sublistId: "item",
                    fieldId: "item",
                    line: i
                });

                let get_rate_before_disc = load_po.getSublistValue({
                    sublistId: "item",
                    fieldId: "custcolme_unitprice_bfr_purchase_disc",
                    line: i
                })

                let get_disc_percent = load_po.getSublistValue({
                    sublistId: "item",
                    fieldId: "custcol_me_discount_percentage",
                    line: i
                })

                let get_disc_amount = load_po.getSublistValue({
                    sublistId: "item",
                    fieldId: "custcol_me_discount_amount_purchase",
                    line: i
                })
                let get_rate_after_disc = load_po.getSublistValue({
                    sublistId: "item",
                    fieldId: "rate",
                    line: i
                })

                getPoItemArr.push({
                    item: get_item,
                    rate_before_disc: get_rate_before_disc,
                    disc_percent: get_disc_percent,
                    disc_amount: get_disc_amount,
                    get_rate_after_disc: get_rate_after_disc,
                });

                log.debug("getPoItemArr", getPoItemArr)

            }

            let get_bill_line = rec.getLineCount("item")

            for (let i = 0; i < get_bill_line; i++) {


                let get_item = rec.getSublistValue({
                    sublistId: "item",
                    fieldId: "item",
                    line: i
                });

                log.debug("get_item", get_item)
                let get_duplicate_item = getPoItemArr.filter((data) => data.item == get_item)
                log.debug("get_duplicate_item", get_duplicate_item)
                if (get_duplicate_item.length > 0) {
                    let get_rate_before_disc = rec.setSublistValue({
                        sublistId: "item",
                        fieldId: "custcolme_unitprice_bfr_purchase_disc",
                        line: i,
                        value: get_duplicate_item[0].rate_before_disc
                    })

                    let get_disc_percent = rec.setSublistValue({
                        sublistId: "item",
                        fieldId: "custcol_me_discount_percentage",
                        line: i,
                        value: get_duplicate_item[0].disc_percent
                    })

                    let get_disc_amount = rec.setSublistValue({
                        sublistId: "item",
                        fieldId: "custcol_me_discount_amount_purchase",
                        line: i,
                        value: get_duplicate_item[0].disc_amount
                    })

                    let get_rate_after_disc = rec.setSublistValue({
                        sublistId: "item",
                        fieldId: "rate",
                        line: i,
                        value: get_duplicate_item[0].get_rate_after_disc
                    })

                }

            }
        }
    }

    return {
        beforeSubmit: beforeSubmit,
    }
});
