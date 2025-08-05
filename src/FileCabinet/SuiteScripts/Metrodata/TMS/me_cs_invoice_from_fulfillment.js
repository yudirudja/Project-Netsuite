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

            var getFulfillment = rec.getValue('custbody_me_delivery_order_number');

            var fulfillmentArr = [];
        for (let i = 0; i < getFulfillment.length; i++) {
            var loadFulfillment = record.load({
                type: 'itemfulfillment',
                id: getFulfillment[i],
                isDynamic: true,
            });

            var getFulfillLineCount = loadFulfillment.getLineCount('item');

            var itemFulfillLineArr = []
            var totQty = 0;

            for (let j = 0; j < getFulfillLineCount; j++) {

                loadFulfillment.selectLine({ sublistId: 'item', line: i })
                var getItem = loadFulfillment.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: j,
                });

                var getInvDetail = loadFulfillment.getCurrentSublistSubrecord({
                    sublistId: 'item',
                    fieldId: 'inventorydetail',
                    // line: j,
                });


                var invDetailArr = []
                var invDetailLine = getInvDetail.getLineCount('inventoryassignment');

                for (let k = 0; k < invDetailLine; k++) {
                    var getInvNumber = getInvDetail.getSublistValue({
                        sublistId: 'inventoryassignment',
                        fieldId: 'issueinventorynumber',
                        line: k,
                    });
                    log.debug('getInvNumber', getInvNumber)
                    var getInvQty = getInvDetail.getSublistValue({
                        sublistId: 'inventoryassignment',
                        fieldId: 'quantity',
                        line: k,
                    });
                    totQty += Number(getInvQty);
                    invDetailArr.push({
                        inv_number: getInvNumber,
                        inv_qty: Number(getInvQty),
                    });
                }

                itemFulfillLineArr.push({
                    item: getItem,
                    quantity: totQty,
                    inv_detail: invDetailArr,
                });
                totQty = 0
                invDetailArr = [];
            }
            // fulfillmentArr.push({
            //     fulfillment_id: getFulfillment[i],
            //     item_fulfill_id: itemFulfillLineArr,
            // });
            // itemFulfillLineArr = [];
        }

        var getCurrentRecordLine = rec.getLineCount('item');
        var totQuantityInv = 0;

        for (let i = 0; i < getCurrentRecordLine; i++) {
            rec.selectLine('item', i)
            var getItem = rec.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                line: i,
            });
            var getInvInventoryDetail = rec.getCurrentSublistSubrecord({
                sublistId: 'item',
                fieldId: 'inventorydetail',
                line: i,
            });
            var getUnitPrice = rec.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'rate',
                line: i,
            });

            var getEquivalent = itemFulfillLineArr.filter((data) => data.item == getItem);

            log.debug('getEquivalent', getEquivalent)

            if (getEquivalent.length < 1) {
                var setQuantity = rec.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: i,
                    value: 0,
                });

                var removeInvDetail = rec.removeCurrentSublistSubrecord({
                    sublistId: 'item',
                    fieldid: 'inventorydetail',
                    line: i
                });
            } else {
                for (let j = 0; j < getEquivalent.length; j++) {
                    var getQuantity = Number(getEquivalent[j].quantity);

                    totQuantityInv += getQuantity;

                    for (let k = 0; k < getEquivalent[j].inv_detail.length; k++) {

                        // inventoryNumberArr.push(getEquivalent[j].inv_detail[k].inv_number)

                        // var loadInvenvtoryNumber = record.load({
                        //     type: 'inventorynumber',
                        //     id: getEquivalent[j].inv_detail[k].inv_number
                        // });

                        // var setNetPrice = loadInvenvtoryNumber.setValue('custitemnumber_me_item_number_net_amount', Number(getUnitPrice) * getEquivalent[j].inv_detail[k].inv_qty);
                        // loadInvenvtoryNumber.save();

                        getInvInventoryDetail.selectLine('inventoryassignment', k)

                        var setLotNumberInvDetail = getInvInventoryDetail.setCurrentSublistValue({
                            sublistId: 'inventoryassignment',
                            fieldId: 'issueinventorynumber',
                            line: k,
                            value: getEquivalent[j].inv_detail[k].inv_number,
                        });
                        var setQuantityInvDetail = getInvInventoryDetail.setCurrentSublistValue({
                            sublistId: 'inventoryassignment',
                            fieldId: 'quantity',
                            line: k,
                            value: getEquivalent[j].inv_detail[k].inv_qty,
                        });
                        getInvInventoryDetail.commitLine('inventoryassignment')

                    }
                }


                var setQuantity = rec.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: i,
                    value: totQuantityInv,
                });
                totQuantityInv = 0;

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
