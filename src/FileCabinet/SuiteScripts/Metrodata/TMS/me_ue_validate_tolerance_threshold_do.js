/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/search', 'N/record'], function (search, record) {

    function fulfillmentSearch(params) {
        var result = [];
        var itemfulfillmentSearchObj = search.create({
            type: "itemfulfillment",
            filters:
                [
                    ["type", "anyof", "ItemShip"],
                    "AND",
                    ["createdfrom", "anyof", params],
                    "AND",
                    ["shipping", "is", "F"],
                    "AND",
                    ["taxline", "is", "F"],
                    "AND",
                    ["cogs", "is", "F"]
                ],
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

            currentQty = Number(getQuantityDo) + Number(getDuplicateLineidCustDo.length>0?getDuplicateLineidCustDo[0].quantity:0);

            arrDoTotQty.push({
                line_id: getLineIdCustDo,
                quantity: currentQty
            })

            currentQty = 0;

        }
        return arrDoTotQty;
    }

    function isUnderFivePercentThreshold(totalItemDoArr, getCreatedFrom) {
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

            var isUnderThreshold = maxQty > (getDuplicateLineId[0].quantity);


            log.debug('overThresholdArr',overThresholdArr)
            if (!isUnderThreshold) {

                overThresholdArr.push({
                    item:getItem, 
                    line_id:getLineIdCustSo, 
                    line: i+1
                })

            }

            log.debug('overThresholdArr',overThresholdArr)
        }
        if (overThresholdArr.length>0) {
            var errorMessage = "";

            overThresholdArr.forEach((data)=>{
                errorMessage += "[Item '"+data.item +"', Baris " + data.line + ", Line ID Custom: '" + data.line_id + "']" + ";<br>";
            })

            throw "Quantity Telah Melebihi Toleransi 5% pada " +  errorMessage;
        }
    }

    function beforeSubmit(context) {

        var rec = context.newRecord;

        var getCreatedFrom = rec.getValue('createdfrom');
        var getCreatedFromText = rec.getText('createdfrom');
        log.debug('overThresholdArr',"")
        if (context.type != 'delete') {
            if (getCreatedFromText.includes('Sales Order')) {
                var getFulfillment = fulfillmentSearch(getCreatedFrom);

                var getTotalAmtItemDo = totalItemDo(getFulfillment, rec);

                var isUnderThresholdFivePercent = isUnderFivePercentThreshold(getTotalAmtItemDo, getCreatedFrom);

            }
        }


    }

    return {
        beforeSubmit: beforeSubmit,
    }
});
