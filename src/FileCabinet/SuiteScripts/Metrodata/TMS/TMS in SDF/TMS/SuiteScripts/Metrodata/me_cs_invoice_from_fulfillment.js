/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(['N/record'], function (record) {


    // function fieldChanged(context) {

    // }

    function fieldChanged(context) {
        var rec = context.currentRecord;
        var sublistId = context.sublistId;
        var fieldId = context.fieldId;
        // var lineIdx = context.line;

        if (fieldId == 'custbody_me_delivery_order_number') {

            // var lineRemove = rec.getLineCount('item');

            // for (let i = 0; i < lineRemove; i++) { //ini untuk remove semua line sebelum di populate dari item fulfillment
            //     rec.removeLine({
            //         sublistId: 'item',
            //         line: i,
            //         ignoreRecalc: true
            //     });

            // }

            var getFulfillment = rec.getValue('custbody_me_delivery_order_number');

            log.debug("fulfilment ID", getFulfillment)

            var fulfillmentArr = [];
            var itemFulfillLineArr = []
            var itemFulfillArrNew = []
            for (let i = 0; i < getFulfillment.length; i++) {
                var loadFulfillment = record.load({
                    type: 'itemfulfillment',
                    id: getFulfillment[i],
                    isDynamic: true,
                });

                var getFulfillLineCount = loadFulfillment.getLineCount('item');

                var totQty = 0;

                for (let j = 0; j < getFulfillLineCount; j++) {

                    loadFulfillment.selectLine({ sublistId: 'item', line: j })
                    var getItem = loadFulfillment.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: j,
                    });

                    var getQuantity = loadFulfillment.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: j,
                    });

                    // totQty += Number(getQuantity)

                    // var getInvDetail = loadFulfillment.getCurrentSublistSubrecord({
                    //     sublistId: 'item',
                    //     fieldId: 'inventorydetail',
                    //     // line: j,
                    // });


                    // var invDetailArr = []
                    // var invDetailLine = getInvDetail.getLineCount('inventoryassignment');

                    // for (let k = 0; k < invDetailLine; k++) {
                    //     var getInvNumber = getInvDetail.getSublistValue({
                    //         sublistId: 'inventoryassignment',
                    //         fieldId: 'issueinventorynumber',
                    //         line: k,
                    //     });
                    //     log.debug('getInvNumber', getInvNumber)
                    //     var getInvQty = getInvDetail.getSublistValue({
                    //         sublistId: 'inventoryassignment',
                    //         fieldId: 'quantity',
                    //         line: k,
                    //     });
                    //     totQty += Number(getInvQty);
                    //     invDetailArr.push({
                    //         inv_number: getInvNumber,
                    //         inv_qty: Number(getInvQty),
                    //     });
                    // }

                    itemFulfillLineArr.push({
                        item: getItem,
                        quantity: getQuantity,
                        // inv_detail: invDetailArr,
                    });
                    // totQty = 0
                    // invDetailArr = [];
                }
                // fulfillmentArr.push({
                //     fulfillment_id: getFulfillment[i],
                //     item_fulfill_id: itemFulfillLineArr,
                // });
                // itemFulfillLineArr = [];
            }
            log.debug('itemFulfillLineArr', itemFulfillLineArr)



            for (let i = 0; i < itemFulfillLineArr.length; i++) {
                var filterFulfill = itemFulfillLineArr.filter((data) => data.item == itemFulfillLineArr[i].item)

                log.debug('filterFulfill', filterFulfill)
                log.debug('itemFulfillLineArr[i].item[i].itemfill', itemFulfillLineArr[i].quantity)

                var totalQty = 0;

                for (let j = 0; j < filterFulfill.length; j++) {
                    var getQtyFulfill = filterFulfill[j].quantity
                    totalQty += getQtyFulfill
                }
                // totalQty += itemFulfillLineArr[i].quantity
                if (!itemFulfillArrNew.some((data) => data.item == itemFulfillLineArr[i].item)) {
                    itemFulfillArrNew.push({
                        item: itemFulfillLineArr[i].item,
                        quantity: totalQty,
                    })

                }
                totalQty = 0
            }

            log.debug('itemFulfillArrNew', itemFulfillArrNew)

            var getCurrentRecordLine = rec.getLineCount('item');
            var totQuantityInv = 0;

            if (getCurrentRecordLine > 0) {

            for (let i = 0; i < getCurrentRecordLine; i++) {
                rec.selectLine('item', i)
                var getItem = rec.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i,
                });
                // var getInvInventoryDetail = rec.getCurrentSublistSubrecord({
                //     sublistId: 'item',
                //     fieldId: 'inventorydetail',
                //     line: i,
                // });
                var getUnitPrice = rec.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'rate',
                    line: i,
                });
                var getQty = rec.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: i,
                });

                var getEquivalent = itemFulfillArrNew.filter((data) => data.item == getItem);

                log.debug('getEquivalent', getEquivalent)

                if (getEquivalent.length < 1) {
                    var setQuantity = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: i,
                        value: 0,
                    });

                    // var removeInvDetail = rec.removeCurrentSublistSubrecord({
                    //     sublistId: 'item',
                    //     fieldId: 'inventorydetail',
                    //     line: i
                    // });
                } else {
                    for (let j = 0; j < getEquivalent.length; j++) {
                        var getQuantity = Number(getEquivalent[j].quantity);

                        totQuantityInv += getQuantity;

                        // for (let k = 0; k < getEquivalent[j].inv_detail.length; k++) {

                        //     // inventoryNumberArr.push(getEquivalent[j].inv_detail[k].inv_number)

                        //     // var loadInvenvtoryNumber = record.load({
                        //     //     type: 'inventorynumber',
                        //     //     id: getEquivalent[j].inv_detail[k].inv_number
                        //     // });

                        //     // var setNetPrice = loadInvenvtoryNumber.setValue('custitemnumber_me_item_number_net_amount', Number(getUnitPrice) * getEquivalent[j].inv_detail[k].inv_qty);
                        //     // loadInvenvtoryNumber.save();

                        //     // getInvInventoryDetail.selectLine('inventoryassignment', k)

                        //     // var setLotNumberInvDetail = getInvInventoryDetail.setCurrentSublistValue({
                        //     //     sublistId: 'inventoryassignment',
                        //     //     fieldId: 'issueinventorynumber',
                        //     //     line: k,
                        //     //     value: getEquivalent[j].inv_detail[k].inv_number,
                        //     // });
                        //     // var setQuantityInvDetail = getInvInventoryDetail.setCurrentSublistValue({
                        //     //     sublistId: 'inventoryassignment',
                        //     //     fieldId: 'quantity',
                        //     //     line: k,
                        //     //     value: getEquivalent[j].inv_detail[k].inv_qty,
                        //     // });
                        //     // getInvInventoryDetail.commitLine('inventoryassignment')

                        // }
                    }
                    // totQuantityInv += getQty

                    var setQuantity = rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: i,
                        value: totQuantityInv,
                    });
                    totQuantityInv = 0;

                }
                // rec.commitLine('item', i)
            }
            } else {
            for (let i = 0; i < itemFulfillArrNew.length; i++) {
                rec.selectNewLine('item', i)
                var setItem = rec.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i,
                    value: itemFulfillArrNew[i].item
                });
                // var getInvInventoryDetail = rec.getCurrentSublistSubrecord({
                //     sublistId: 'item',
                //     fieldId: 'inventorydetail',
                //     line: i,
                // });
                // var setUnitPrice = rec.setCurrentSublistValue({
                //     sublistId: 'item',
                //     fieldId: 'rate',
                //     line: i,
                // });
                var setQty = rec.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: i,
                    value: itemFulfillArrNew[i].quantity
                });

                // var getEquivalent = itemFulfillLineArr.filter((data) => data.item == getItem);

                // log.debug('getEquivalent', getEquivalent)

                // if (getEquivalent.length < 1) {
                //     var setQuantity = rec.setCurrentSublistValue({
                //         sublistId: 'item',
                //         fieldId: 'quantity',
                //         line: i,
                //         value: 0,
                //     });

                //     // var removeInvDetail = rec.removeCurrentSublistSubrecord({
                //     //     sublistId: 'item',
                //     //     fieldId: 'inventorydetail',
                //     //     line: i
                //     // });
                // } else {
                // for (let j = 0; j < getEquivalent.length; j++) {
                //     var getQuantity = Number(getEquivalent[j].quantity);

                //     totQuantityInv += getQuantity;

                //     // for (let k = 0; k < getEquivalent[j].inv_detail.length; k++) {

                //     //     // inventoryNumberArr.push(getEquivalent[j].inv_detail[k].inv_number)

                //     //     // var loadInvenvtoryNumber = record.load({
                //     //     //     type: 'inventorynumber',
                //     //     //     id: getEquivalent[j].inv_detail[k].inv_number
                //     //     // });

                //     //     // var setNetPrice = loadInvenvtoryNumber.setValue('custitemnumber_me_item_number_net_amount', Number(getUnitPrice) * getEquivalent[j].inv_detail[k].inv_qty);
                //     //     // loadInvenvtoryNumber.save();

                //     //     // getInvInventoryDetail.selectLine('inventoryassignment', k)

                //     //     // var setLotNumberInvDetail = getInvInventoryDetail.setCurrentSublistValue({
                //     //     //     sublistId: 'inventoryassignment',
                //     //     //     fieldId: 'issueinventorynumber',
                //     //     //     line: k,
                //     //     //     value: getEquivalent[j].inv_detail[k].inv_number,
                //     //     // });
                //     //     // var setQuantityInvDetail = getInvInventoryDetail.setCurrentSublistValue({
                //     //     //     sublistId: 'inventoryassignment',
                //     //     //     fieldId: 'quantity',
                //     //     //     line: k,
                //     //     //     value: getEquivalent[j].inv_detail[k].inv_qty,
                //     //     // });
                //     //     // getInvInventoryDetail.commitLine('inventoryassignment')

                //     // }
                // }
                // totQuantityInv += getQty

                // var setQuantity = rec.setCurrentSublistValue({
                //     sublistId: 'item',
                //     fieldId: 'quantity',
                //     line: i,
                //     value: totQuantityInv,
                // });
                // totQuantityInv = 0;

                // }
                rec.commitLine('item', i)
            }
            }
        }
    }


    return {
        // pageInit: pageInit,
        // saveRecord: saveRecord,
        // validateField: validateField,
        fieldChanged: fieldChanged,
        // postSourcing: postSourcing,
        // lineInit: lineInit,
        // validateDelete: validateDelete,
        // validateInsert: validateInsert,
        // validateLine: validateLine,
        // sublistChanged: sublistChanged
    }
});
