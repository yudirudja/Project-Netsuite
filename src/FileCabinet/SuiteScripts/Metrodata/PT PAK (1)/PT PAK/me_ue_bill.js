/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/search', './library/moment.min.js'], function (record, search, moment) {

    function searchLatestDateBill(data) {

        var result = [];

        var countDuplicate = 0;

        var itemSearchObj = search.create({
            type: "vendorbill",
            filters:
                [
                    ["type", "anyof", "VendBill"],
                    "AND",
                    ["item.internalid", "anyof", data]
                ],
            columns:
                [
                    search.createColumn({
                        name: "trandate",
                        sort: search.Sort.DESC,
                        label: "Date"
                    }),
                    search.createColumn({ name: "item", label: "Item" }),
                    search.createColumn({name: "fxrate", label: "Item Rate"}),
                    search.createColumn({
                        name: "internalid",
                        sort: search.Sort.DESC,
                        label: "Internal ID"
                    }),
                    search.createColumn({ name: "currency", label: "Currency" }),
                    search.createColumn({
                        name: "type",
                        join: "item",
                        label: "Type"
                     }),
                ]
        }).run().getRange({
            start: 0,
            end: 1000,
        });

        for (let i = 0; i < itemSearchObj.length; i++) {
            var internalId = itemSearchObj[i].getValue(itemSearchObj[i].columns[3]);
            var idItem = itemSearchObj[i].getValue(itemSearchObj[i].columns[1]);
            var itemRate = itemSearchObj[i].getValue(itemSearchObj[i].columns[2]);
            var date = itemSearchObj[i].getValue(itemSearchObj[i].columns[0]);
            var currency = itemSearchObj[i].getText(itemSearchObj[i].columns[4]);
            var typeItem = itemSearchObj[i].getValue(itemSearchObj[i].columns[5]);

            for (let x = 0; x < result.length; x++) {
                if (result[x].id_item == idItem && result[x].currency == currency) {
                    countDuplicate++;
                }
            }
            if (countDuplicate < 1) {
                result.push({
                    internal_id_bill: internalId,
                    id_item: idItem,
                    item_rate: itemRate,
                    date: date,
                    currency: currency,
                    type_item: typeItem,
                });
            }
            countDuplicate = 0;


        }

        return result;

    }

    function afterSubmit(context) {
        try {

            var dataItem = [];

            var currentRecord = context.newRecord;

            var getId = currentRecord.id;

            var getPoDateCreated = currentRecord.getValue({
                fieldId: 'createddate'
            });
            var trandateBill = currentRecord.getValue({
                fieldId: 'trandate'
            });

            var getCurrency = currentRecord.getValue({
                fieldId: 'currency',
            });

            var getApprovalStatus = currentRecord.getValue({
                fieldId: 'approvalstatus',
            });

            log.debug("approvalstatus", getApprovalStatus);
            log.debug("currency", getCurrency);

            var getSublistCount = currentRecord.getLineCount({
                sublistId: 'item',
            });

            for (let i = 0; i < getSublistCount; i++) {
                var getItemId = currentRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i,
                });

                dataItem.push(getItemId);
            }

            log.debug(dataItem);

            // var prId = [];

            // for (let i = 0; i < getSublistCount; i++) {
            //     var getPrId = currentRecord.getSublistValue({
            //         sublistId: 'item',
            //         fieldId: 'linkedorder',
            //         line: i,
            //     });
            //     prId.push(getPrId);

            // }
            // log.debug("prId", prId);

            // for (let x = 0; x < prId.length; x++) {
            //     var loadRecord = record.load({
            //         type: record.Type.PURCHASE_REQUISITION,
            //         id: prId[x],
            //     });

            //     var prSublistLineCount = loadRecord.getLineCount({
            //         sublistId: 'item',
            //     });

            //     for (let i = 0; i < prSublistLineCount; i++) {
            //         var getPoId = loadRecord.getSublistValue({
            //             sublistId: 'item',
            //             fieldId: 'linkedorder',
            //             line: i,
            //         })
            //         log.debug("compare po id", getId + "___" + getPoId);
            //         if (getPoId == getId) {
            //             var setDateCreated = loadRecord.setSublistValue({
            //                 sublistId: 'item',
            //                 fieldId: 'custcol_me_date_created_po',
            //                 line: i,
            //                 value: getPoDateCreated,
            //             });
            //         }

            //     }
            //     var saveCustPayment = loadRecord.save();
            // }

            var searchBill = searchLatestDateBill(dataItem);

            log.debug("searchBillResult", searchBill);

            for (let i = 0; i < searchBill.length; i++) {
                if (searchBill[i].type_item == "InvtPart" && (searchBill[i].currency).includes("Rupiah") && getApprovalStatus == 2) {
                    log.debug("check idr estimate rate", searchBill[i].item_rate);
                    var getInventoryItem = record.submitFields({
                        type: record.Type.INVENTORY_ITEM,
                        id: Number(searchBill[i].id_item),
                        values: {
                            custitem_me_last_purchase_price_idr: Number(searchBill[i].item_rate),
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        }
                    });
                    
                }
                if (searchBill[i].type_item == "InvtPart" && (searchBill[i].currency).includes("Hong Kong Dollar") && getApprovalStatus == 2) {
                    var getInventoryItem = record.submitFields({
                        type: record.Type.INVENTORY_ITEM,
                        id: Number(searchBill[i].id_item),
                        values: {
                            custitem_me_last_purchase_price_hkd: Number(searchBill[i].item_rate),
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        }
                    });
                    
                }
                if (searchBill[i].type_item == "InvtPart" && (searchBill[i].currency).includes("Singapore Dollar") && getApprovalStatus == 2) {
                    var getInventoryItem = record.submitFields({
                        type: record.Type.INVENTORY_ITEM,
                        id: Number(searchBill[i].id_item),
                        values: {
                            custitem_me_last_purchase_price_sgd: Number(searchBill[i].item_rate),
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        }
                    });
                    
                }
                if (searchBill[i].type_item == "InvtPart" && (searchBill[i].currency).includes("US Dollar") && getApprovalStatus == 2) {
                    var getInventoryItem = record.submitFields({
                        type: record.Type.INVENTORY_ITEM,
                        id: Number(searchBill[i].id_item),
                        values: {
                            custitem_me_last_purchase_price_usd: Number(searchBill[i].item_rate),
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        }
                    });
                    
                }
                if (searchBill[i].type_item == "NonInvtPart" && (searchBill[i].currency).includes("Rupiah") && getApprovalStatus == 2) {
                    var getInventoryItem = record.submitFields({
                        type: record.Type.NON_INVENTORY_ITEM,
                        id: Number(searchBill[i].id_item),
                        values: {
                            custitem_me_last_purchase_price_idr: Number(searchBill[i].item_rate),
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        }
                    });
                    
                }
                if (searchBill[i].type_item == "NonInvtPart" && (searchBill[i].currency).includes("Hong Kong Dollar") && getApprovalStatus == 2) {
                    var getInventoryItem = record.submitFields({
                        type: record.Type.NON_INVENTORY_ITEM,
                        id: Number(searchBill[i].id_item),
                        values: {
                            custitem_me_last_purchase_price_hkd: Number(searchBill[i].item_rate),
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        }
                    });
                    
                }
                if (searchBill[i].type_item == "NonInvtPart" && (searchBill[i].currency).includes("Singapore Dollar") && getApprovalStatus == 2) {
                    var getInventoryItem = record.submitFields({
                        type: record.Type.NON_INVENTORY_ITEM,
                        id: Number(searchBill[i].id_item),
                        values: {
                            custitem_me_last_purchase_price_sgd: Number(searchBill[i].item_rate),
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        }
                    });
                    
                }
                if (searchBill[i].type_item == "NonInvtPart" && (searchBill[i].currency).includes("US Dollar") && getApprovalStatus == 2) {
                    var getInventoryItem = record.submitFields({
                        type: record.Type.NON_INVENTORY_ITEM,
                        id: Number(searchBill[i].id_item),
                        values: {
                            custitem_me_last_purchase_price_usd: Number(searchBill[i].item_rate),
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        }
                    });
                }
            }


        } catch (error) {
            log.debug("error", error);
        }
    }

    return {
        afterSubmit: afterSubmit
    }
});
