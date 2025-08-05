/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record'], function (record) {


    function beforeSubmit(context) {
        var rec = context.newRecord;
        // var lineIdx = context.line;

        // if (fieldId == 'custbody_me_delivery_order_number') {

        var getFulfillment = rec.getValue('custbody_me_delivery_order_number');

        log.debug("fulfilment ID", getFulfillment)

        var fulfillmentArr = [];
        var itemFulfillLineArr = []
        var itemFulfillArrNew = []
        for (let i = 0; i < getFulfillment.length; i++) {
            var loadFulfillment = record.load({
                type: 'itemfulfillment',
                id: getFulfillment[i],
                // isDynamic: true,
            });

            var getFulfillLineCount = loadFulfillment.getLineCount('item');

            var totQty = 0;

            for (let j = 0; j < getFulfillLineCount; j++) {

                // loadFulfillment.selectLine({ sublistId: 'item', line: j })
                var getItemCustLineId = loadFulfillment.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_me_line_id_custom',
                    line: j,
                });

                var getQuantity = loadFulfillment.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: j,
                });


                itemFulfillLineArr.push({
                    item_cust_id: getItemCustLineId,
                    quantity: getQuantity,
                });

            }

        }
        log.debug('itemFulfillLineArr', itemFulfillLineArr)



        for (let i = 0; i < itemFulfillLineArr.length; i++) {
            var filterFulfill = itemFulfillLineArr.filter((data) => data.item_cust_id == itemFulfillLineArr[i].item_cust_id)

            log.debug('filterFulfill', filterFulfill)
            log.debug('itemFulfillLineArr[i].item[i].itemfill', itemFulfillLineArr[i].quantity)

            var totalQty = 0;

            for (let j = 0; j < filterFulfill.length; j++) {
                var getQtyFulfill = filterFulfill[j].quantity
                totalQty += getQtyFulfill
            }
            // totalQty += itemFulfillLineArr[i].quantity
            if (!itemFulfillArrNew.some((data) => data.item_cust_id == itemFulfillLineArr[i].item_cust_id)) {
                itemFulfillArrNew.push({
                    item_cust_id: itemFulfillLineArr[i].item_cust_id,
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
                // rec.selectLine('item', i)
                var getItem = rec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i,
                });
                var getCustLineId = rec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_me_line_id_custom',
                    line: i,
                });

                var getUnitPrice = rec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'rate',
                    line: i,
                });
                var getQty = rec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: i,
                });

                var getEquivalent = itemFulfillArrNew.filter((data) => data.item_cust_id == getCustLineId);

                log.debug('getEquivalent', getEquivalent)

                if (getEquivalent.length < 1) {
                    var setQuantity = rec.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: i,
                        value: 0,
                    });

                } else {
                    for (let j = 0; j < getEquivalent.length; j++) {
                        var getQuantity = Number(getEquivalent[j].quantity);

                        totQuantityInv += getQuantity;

                    }


                    var setQuantity = rec.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: i,
                        value: totQuantityInv,
                    });
                    totQuantityInv = 0;

                }

            }
        } else {
            for (let i = 0; i < itemFulfillArrNew.length; i++) {
                // rec.selectNewLine('item')
                var setItem = rec.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i,
                    value: itemFulfillArrNew[i].item
                });

                var setQty = rec.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: i,
                    value: itemFulfillArrNew[i].quantity
                });
                // rec.commitLine('item')
            }
        }
    }

    // }


    return {
        beforeSubmit: beforeSubmit,
    }
});
