/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record'], function (record) {

    function beforeSubmit(context) {

        var rec = context.newRecord;
        var getFormId = rec.getValue({
            fieldId: "customform",
        });

        var getLineItemCount = rec.getLineCount('item');
        log.debug("getLineItemCount", getLineItemCount);

        if (getFormId == '184') {
            for (let i = 0; i < getLineItemCount; i++) {

                var getBinItem = rec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'binitem',
                    line: i,
                })

                if (getBinItem == true) {



                    var getQuatityPcsActualPlanned = rec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_qty_pcs_planned',
                        line: i
                    });
                    var getQuatityCtActualPlanned = rec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_qty_ct_planned',
                        line: i
                    });
                    var getRate = rec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate',
                        line: i
                    });
                    var setQuatityPcsActual = rec.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'itemquantity',
                        value: getQuatityPcsActualPlanned,
                        line: i
                    });
                    var setQuatityCtActual = rec.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        value: Number(getQuatityCtActualPlanned),
                        line: i
                    });
                    log.debug("quantity", getQuatityCtActualPlanned);
                    // var setAmount = rec.setSublistValue({
                    //     sublistId: 'item',
                    //     fieldId: 'custcol_me_amount',
                    //     value: Number(getQuatityCtActualPlanned) * Number(getRate),
                    //     line: i
                    // });
                }
            }
        }
    }

    return {
        beforeSubmit: beforeSubmit,
    }
});
