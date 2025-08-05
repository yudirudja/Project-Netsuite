/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/search', 'N/record'], function (search, record) {

    function fulfillmentSearch(params, context) {
        var result = [];
        var filter = [
            ["type", "anyof", "ItemShip"],
            "AND",
            ["createdfrom", "anyof", params],
            "AND",
            ["shipping", "is", "F"],
            "AND",
            ["taxline", "is", "F"],
            "AND",
            ["cogs", "is", "F"]
        ]

        if (context.type == 'edit') {
            filter.push("AND", ["internalid", "noneof", context.newRecord.id])
        }
        var itemfulfillmentSearchObj = search.create({
            type: "itemfulfillment",
            filters: filter,
            columns:
                [
                    search.createColumn({ name: "custcol_me_line_id_custom", summary: "GROUP", label: "ME - Line ID Custom" }),
                    search.createColumn({ name: "quantity", summary: "SUM", label: "Quantity" }),
                ]
        }).run().getRange({
            start: 0,
            end: 1000,
        });

        for (let i = 0; i < itemfulfillmentSearchObj.length; i++) {
            var getLineIdCust = itemfulfillmentSearchObj[i].getValue(itemfulfillmentSearchObj[i].columns[0]);
            var quantity = itemfulfillmentSearchObj[i].getValue(itemfulfillmentSearchObj[i].columns[1]);

            result.push({
                line_id: getLineIdCust,
                quantity: quantity,
            })
        }
        log.debug("result", result)
        return result
    }

    function totalItemDo(fulfillmentData, rec) {
        var doItemLineCount = rec.getLineCount('item');
        var arrDoTotQty = [];

        var currentQty = 0;
        for (let i = 0; i < doItemLineCount; i++) {
            var getLineIdCustDo = rec.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_line_id_custom',
                line: i,
            });
            var getQuantityDo = rec.getSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                line: i,
            });

            var getDuplicateLineidCustDo = fulfillmentData.filter((data) => data.line_id == getLineIdCustDo);

            currentQty = Number(getQuantityDo) - Number(getDuplicateLineidCustDo.length > 0 ? getDuplicateLineidCustDo[0].quantity : 0);

            arrDoTotQty.push({
                line_id: getLineIdCustDo,
                quantity: currentQty
            })

            currentQty = 0;

        }
        return arrDoTotQty;
    }

    function isUnderFivePercentThreshold(totalItemDoArr, getCreatedFrom, rec) {
        var loadSo = record.load({
            type: record.Type.SALES_ORDER,
            id: getCreatedFrom,
        });

        var soItemLineCount = loadSo.getLineCount('item');
        var overThresholdArr = []
        for (let i = 0; i < soItemLineCount; i++) {
            var getLineIdCustSo = loadSo.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_line_id_custom',
                line: i,
            });
            var getQuantitySo = loadSo.getSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                line: i,
            });
            var getQtyThresholdToleranceSo = loadSo.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_me_tolerance_qty',
                line: i,
            });
            var getItem = loadSo.getSublistText({
                sublistId: 'item',
                fieldId: 'item',
                line: i,
            });
            var maxQty = Number(getQuantitySo) + Number(getQtyThresholdToleranceSo)

            var getDuplicateLineId = totalItemDoArr.filter((data) => data.line_id == getLineIdCustSo);

            var sisa_available_qty = maxQty - (getDuplicateLineId.length > 0 ? getDuplicateLineId[0].quantity : 0);

            let get_line_by_cust_id = rec.findSublistLineWithValue({
                sublistId: 'item',
                fieldId: 'custcol_me_line_id_custom',
                value: getDuplicateLineId[0].line_id
            });

            let set_item_qty = rec.setSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                line: get_line_by_cust_id,
                value: sisa_available_qty,
            });




            log.debug('getDuplicateLineId[0].quantity', (getDuplicateLineId.length > 0 ? getDuplicateLineId[0].quantity : 0))
            log.debug('maxQty', maxQty)
        }
    }

    function beforeLoad(context) {

        var rec = context.newRecord;

        var getCreatedFrom = rec.getValue('createdfrom');
        var getCreatedFromText = rec.getText('createdfrom');
        log.debug('overThresholdArr', "")
        if (context.type != 'delete') {
            var loadSo = record.load({
                type: record.Type.SALES_ORDER,
                id: getCreatedFrom,
            });

            try {
                var getLineQtyThreshold = loadSo.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_me_tolerance_qty',
                    line: 0
                })

                if (getCreatedFromText.includes('Sales Order') && getLineQtyThreshold) {
                    var getFulfillment = fulfillmentSearch(getCreatedFrom, context);

                    // var getTotalAmtItemDo = totalItemDo(getFulfillment, rec);

                    var isUnderThresholdFivePercent = isUnderFivePercentThreshold(getFulfillment, getCreatedFrom, rec);

                }
            } catch (error) {
                log.debug('error', error)
            }
        }
    }

    return {
        beforeLoad: beforeLoad,
    }
});
