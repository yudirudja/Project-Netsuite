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

    function afterSubmit(context) {
        let current_rec = context.newRecord;

        log.debug("record", current_rec.id)

        let rec = record.load({
            type: record.Type.VENDOR_BILL,
            id: current_rec.id,
            isDynamic: true,
        });

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
                rec.selectLine("item", i);

                let get_item = rec.getCurrentSublistValue({
                    sublistId: "item",
                    fieldId: "item",
                    line: i
                });
                let get_qty = rec.getCurrentSublistValue({
                    sublistId: "item",
                    fieldId: "quantity",
                    line: i
                });
                log.debug("rec.getCurrentSublistValue('item','custcol_me_tx_manual_inpt_flg')", rec.getCurrentSublistValue("item","custcol_me_tx_manual_inpt_flg"))
                if (rec.getCurrentSublistValue("item","custcol_me_tx_manual_inpt_flg") == true || rec.getCurrentSublistValue("item","custcol_me_tx_manual_inpt_flg") == "true" || rec.getCurrentSublistValue("item","custcol_me_tx_manual_inpt_flg") == "T") {

                    log.debug("ini masuk kalau true")

                    log.debug("get_item", get_item)
                    let get_duplicate_item = getPoItemArr.filter((data) => data.item == get_item)
                    log.debug("get_duplicate_item", get_duplicate_item)
                    if (get_duplicate_item.length > 0) {
                        let set_rate_before_disc = rec.setCurrentSublistValue({
                            sublistId: "item",
                            fieldId: "custcolme_unitprice_bfr_purchase_disc",
                            line: i,
                            value: get_duplicate_item[0].rate_before_disc,
                            ignoreFieldChange: true,
                        })

                        let set_disc_percent = rec.setCurrentSublistValue({
                            sublistId: "item",
                            fieldId: "custcol_me_discount_percentage",
                            line: i,
                            value: get_duplicate_item[0].disc_percent,
                            ignoreFieldChange: true,
                        })

                        let set_disc_amount = rec.setCurrentSublistValue({
                            sublistId: "item",
                            fieldId: "custcol_me_discount_amount_purchase",
                            line: i,
                            value: get_duplicate_item[0].disc_amount,
                            ignoreFieldChange: true,
                        })

                        let get_rate_after_disc = rec.setCurrentSublistValue({
                            sublistId: "item",
                            fieldId: "rate",
                            line: i,
                            value: get_duplicate_item[0].get_rate_after_disc,
                            ignoreFieldChange: true,
                        })
                        let get_tax_amount = rec.getCurrentSublistValue({
                            sublistId: "item",
                            fieldId: "tax1amt",
                            line: i,
                        })
                        log.debug("get_tax_amount", get_tax_amount)
                        
                        let set_amount = rec.setCurrentSublistValue({
                            sublistId: "item",
                            fieldId: "amount",
                            line: i,
                            value: Number(get_duplicate_item[0].get_rate_after_disc) * Number(get_qty),
                            ignoreFieldChange: true,
                        })
                        let set_gross_amount = rec.setCurrentSublistValue({
                            sublistId: "item",
                            fieldId: "grossamt",
                            line: i,
                            value: Number(get_duplicate_item[0].get_rate_after_disc) * Number(get_qty) + Number(get_tax_amount),
                            ignoreFieldChange: true,
                        })
                        // rec.setCurrentSublistValue({
                        //     sublistId: "item",
                        //     fieldId: "custcol_me_tx_manual_inpt_flg",
                        //     value: false
                        // })
                        let set_tax_amount = rec.setCurrentSublistValue({
                            sublistId: "item",
                            fieldId: "tax1amt",
                            value: get_tax_amount,
                            line: i,
                        })
                    }
                } else {
                    log.debug("ini masuk kalau false")
                    log.debug("get_item", get_item)
                    let get_duplicate_item = getPoItemArr.filter((data) => data.item == get_item)
                    log.debug("get_duplicate_item", get_duplicate_item)
                    if (get_duplicate_item.length > 0) {
                        let get_rate_before_disc = rec.setCurrentSublistValue({
                            sublistId: "item",
                            fieldId: "custcolme_unitprice_bfr_purchase_disc",
                            line: i,
                            value: get_duplicate_item[0].rate_before_disc
                        })

                        let get_disc_percent = rec.setCurrentSublistValue({
                            sublistId: "item",
                            fieldId: "custcol_me_discount_percentage",
                            line: i,
                            value: get_duplicate_item[0].disc_percent
                        })

                        let get_disc_amount = rec.setCurrentSublistValue({
                            sublistId: "item",
                            fieldId: "custcol_me_discount_amount_purchase",
                            line: i,
                            value: get_duplicate_item[0].disc_amount
                        })

                        let get_rate_after_disc = rec.setCurrentSublistValue({
                            sublistId: "item",
                            fieldId: "rate",
                            line: i,
                            value: get_duplicate_item[0].get_rate_after_disc
                        })
                    }
                }
                rec.commitLine("item", i)

            }
        }
        rec.save()
    }

    return {
        // beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit,
    }
});
