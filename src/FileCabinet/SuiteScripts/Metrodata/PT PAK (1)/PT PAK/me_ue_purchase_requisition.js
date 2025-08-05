/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/search', './METRODATA/library/moment.min.js'], function (record, search, moment) {

    function searchPr(data) {

        var data = [];

        var purchaserequisitionSearchObj = search.create({
            type: "purchaserequisition",
            filters:
                [
                    ["type", "anyof", "PurchReq"],
                    "AND",
                    ["internalid", "anyof", data],
                    "AND",
                    ["purchaseorder", "noneof", "@NONE@"]
                ],
            columns:
                [
                    search.createColumn({ name: "custcolme_sgd_estimated_amount", label: "ME - SGD Estimated Amount" }),
                    search.createColumn({ name: "custcolme_sgd_estimated_rate", label: "ME - SGD Estimated Rate " }),
                    search.createColumn({ name: "custcol_me_usd_estimated_amount", label: "ME - USD Estimated Amount" }),
                    search.createColumn({ name: "custcol_me_usd_estimated_rate", label: "ME - USD Estimated Rate " }),
                    search.createColumn({ name: "custcolme_hkd_estimated_amount", label: "ME - HKD Estimated Amount" }),
                    search.createColumn({ name: "custcolme_hkd_estimated_rate", label: "ME - HKD Estimated Rate " }),
                    search.createColumn({
                        name: "datecreated",
                        sort: search.Sort.DESC,
                        label: "Date Created"
                    }),
                    search.createColumn({ name: "purchaseorder", label: "Purchase Order" }),
                    search.createColumn({
                        name: "statusref",
                        join: "purchaseOrder",
                        label: "Status"
                    })
                ]
        });

        var startRow = 0;

        do {
            var search = purchaserequisitionSearchObj.run().getRange({
                start: startRow,
                end: startRow + 1000,
            })

            for (let i = 0; i < search.length; i++) {
                var dateCreated = search[i].getValue(search[i].columns[6]);
                var poId = search[i].getValue(search[i].columns[7]);
                var poText = search[i].getText(search[i].columns[7]);
                var poStatus = search[i].getValue(search[i].columns[8]);
                var sgdEstimatedAmountSearch = search[i].getValue(search[i].columns[0]);
                var sgdEstimatedRateSearch = search[i].getValue(search[i].columns[1]);
                var usdEstimatedAmountSearch = search[i].getValue(search[i].columns[2]);
                var usdEstimatedRateSearch = search[i].getValue(search[i].columns[3]);
                var hkdEstimatedAmountSearch = search[i].getValue(search[i].columns[4]);
                var hkdEstimatedRateSearch = search[i].getValue(search[i].columns[5]);

                data.push({
                    date_created: dateCreated,
                    po_id: poId,
                    po_text: poText,
                    po_status: poStatus,
                    sgd_estimated_amount: sgdEstimatedAmountSearch,
                    sgd_estimated_rate: sgdEstimatedRateSearch,
                    usd_estimated_amount: usdEstimatedAmountSearch,
                    usd_estimated_rate: usdEstimatedRateSearch,
                    hkd_estimated_amount: hkdEstimatedAmountSearch,
                    hkd_estimated_rate: hkdEstimatedRateSearch,
                });

            }

            startRow += 1000
        } while (search.length == 1000);
        return data;
    }

    function afterSubmit(context) {
        try {
            var currentRecord = context.newRecord;

            var dataPr = [];
            var idPoArray = []

            var sublistItemCount = currentRecord.getLineCount({
                sublistId: 'item',
            });

            for (let i = 0; i < sublistItemCount; i++) {
                log.debug("currentRecord.getSublistValue({ sublistId: 'links', fieldId: 'type', line: i }", currentRecord.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i }));
                var getIdItemSublist = currentRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i,
                });
                var usdEstimatedAmount = currentRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_me_usd_estimated_amount',
                    line: i,
                });
                var usdEstimatedRate = currentRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_me_usd_estimated_rate',
                    line: i,
                });
                var hkdEstimatedAmount = currentRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcolme_hkd_estimated_amount',
                    line: i,
                });
                var hkdEstimatedRate = currentRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcolme_hkd_estimated_rate',
                    line: i,
                });
                var sgdEstimatedAmount = currentRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcolme_sgd_estimated_amount',
                    line: i,
                });
                var sgdEstimatedRate = currentRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcolme_sgd_estimated_rate',
                    line: i,
                });
                var getIdPoSublist = currentRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'linkedorder',
                    line: i,
                });
                var idrEstimatedRate = currentRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'origrate',
                    line: i,
                });
                var poStatus = currentRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'linkedorderstatus',
                    line: i,
                });
                var isInventoryItem = currentRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'itemtype',
                    line: i,
                });

                var now = moment(new Date()).zone('+07:00').format('DD-MM-YYYY HH:mm:ss');

                // var idItem = getIdPoSublist.split("_")[1];
                // if (poStatus != "Pending Supervisor Approval") {
                    dataPr.push({
                        idItem: getIdItemSublist,
                        idPo: getIdPoSublist,
                        date_created: now,
                        // sgd_estimated_amount: sgdEstimatedAmount === "undefined" ? 0 : sgdEstimatedAmount,
                        sgd_estimated_rate: sgdEstimatedRate === "undefined" ? 0 : sgdEstimatedAmount,
                        // usd_estimated_amount: usdEstimatedAmount === "undefined" ? 0 : usdEstimatedAmount,
                        usd_estimated_rate: usdEstimatedRate === "undefined" ? 0 : usdEstimatedRate,
                        // hkd_estimated_amount: hkdEstimatedAmount === "undefined" ? 0 : hkdEstimatedAmount,
                        hkd_estimated_rate: hkdEstimatedRate === "undefined" ? 0 : hkdEstimatedRate,
                        idr_estimated_rate: idrEstimatedRate === "undefined" ? 0 : idrEstimatedRate,
                        is_inventory_item: isInventoryItem,
                    });
                // }
            }
            // log.debug("test", dataPr[0]);

            if (dataPr.length > 0) {
                dataPr.sort((a, b) => moment(b.date_created) - moment(a.date_created));
            }

            var countDuplicateItem = 0;

            var dataPrNoDuplicate = dataPr;

            for (let i = 0; i < dataPrNoDuplicate.length; i++) {
                for (let x = i + 1; x < dataPrNoDuplicate.length; x++) {
                    if (dataPrNoDuplicate[i].idItem == dataPrNoDuplicate[x].idItem) {
                        dataPrNoDuplicate.splice(i, 1);
                    }
                }
            }

            if (dataPr.length > 1) {
                for (let x = 0; x < dataPrNoDuplicate.length; x++) {
                    for (let i = 1; i < dataPr.length; i++) {

                        if (dataPr[i].idItem == dataPrNoDuplicate[x].idItem && dataPr[i].sgd_estimated_rate != 0 && dataPrNoDuplicate[x].sgd_estimated_rate == 0) {
                            dataPrNoDuplicate[x].sgd_estimated_rate = dataPr[i].sgd_estimated_rate;
                        }
                        if (dataPr[i].idItem == dataPrNoDuplicate[x].idItem && dataPr[i].usd_estimated_rate != 0 && dataPr[x].usd_estimated_rate == 0) {
                            dataPrNoDuplicate[x].usd_estimated_rate = dataPr[i].usd_estimated_rate;
                        }
                        if (dataPr[i].idItem == dataPrNoDuplicate[x].idItem && dataPr[i].hkd_estimated_rate != 0 && dataPr[x].hkd_estimated_rate == 0) {
                            dataPrNoDuplicate[x].hkd_estimated_rate = dataPr[i].hkd_estimated_rate;
                        }
                    }
                }
            }

            // for (let i = 0; i < sublistLinksCount; i++) {
            //     var getIdItemSublist = currentRecord.getSublistValue({
            //         sublistId: 'links',
            //         fieldId: 'id',
            //         line: i
            //     });
            //     var getTypeSublist = currentRecord.getSublistValue({
            //         sublistId: 'links',
            //         fieldId: 'type',
            //         line: i
            //     });
            //     if (getTypeSublist == "Purchase Order") {
            //         idPoArray.push(getTypeSublist);
            //     }
            // }

            // var getPrData = searchPr(dataPr); //i use this cause there are no specific currency if get value directly from currentRecord

            if (dataPr.length > 0) {
                for (let i = 0; i < dataPrNoDuplicate.length; i++) {
                    if (dataPrNoDuplicate[i].is_inventory_item == "InvtPart") {
                        var getInventoryItem = record.submitFields({
                            type: record.Type.INVENTORY_ITEM,
                            id: dataPrNoDuplicate[i].idItem,
                            values: {
                                custitem_me_last_purchase_price_usd: dataPrNoDuplicate[i].usd_estimated_rate,
                                custitem_me_last_purchase_price_sgd: dataPrNoDuplicate[i].sgd_estimated_rate,
                                custitem_me_last_purchase_price_hkd: dataPrNoDuplicate[i].hkd_estimated_rate,
                                custitem_me_last_purchase_price_idr: dataPrNoDuplicate[i].idr_estimated_rate,
                                custitem_me_last_updated_price: dataPrNoDuplicate[i].date_created,
                            },
                            options: {
                                enableSourcing: false,
                                ignoreMandatoryFields: true
                            }
                        });
                        
                    }

                    if (dataPrNoDuplicate[i].is_inventory_item == "NonInvtPart") {
                        var getNonInventoryItem = record.submitFields({
                            type: record.Type.NON_INVENTORY_ITEM,
                            id: dataPrNoDuplicate[i].idItem,
                            values: {
                                custitem_me_last_purchase_price_usd: dataPrNoDuplicate[i].usd_estimated_rate,
                                custitem_me_last_purchase_price_sgd: dataPrNoDuplicate[i].sgd_estimated_rate,
                                custitem_me_last_purchase_price_hkd: dataPrNoDuplicate[i].hkd_estimated_rate,
                                custitem_me_last_purchase_price_idr: dataPrNoDuplicate[i].idr_estimated_rate,
                                custitem_me_last_updated_price: dataPrNoDuplicate[i].date_created,
                            },
                            options: {
                                enableSourcing: false,
                                ignoreMandatoryFields: true
                            }
                        });
                        
                    }
                }
            }
            // if (dataPr.length == 0) {
            //     var getInventoryItem = record.submitFields({
            //         type: record.Type.INVENTORY_ITEM,
            //         id: dataPr[0].idItem,
            //         values: {
            //             custitem_me_last_purchase_price_usd: "",
            //             custitem_me_last_purchase_price_sgd: "",
            //             custitem_me_last_purchase_price_hkd: "",
            //             custitem_me_last_purchase_price_idr: "",
            //             custitem_me_last_updated_price: "",
            //         },
            //         options: {
            //             enableSourcing: false,
            //             ignoreMandatoryFields: true
            //         }
            //     });
            // }

            // }

        } catch (error) {
            log.debug("error", error);
        }

    }

    return {
        beforeSubmit: afterSubmit
    }
});
