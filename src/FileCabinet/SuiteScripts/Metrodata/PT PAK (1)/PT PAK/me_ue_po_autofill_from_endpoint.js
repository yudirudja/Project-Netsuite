/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record'], function(record) {

    function beforeSubmit(context) {
        var rec = context.newRecord;
        var getFormId = rec.getValue({
            fieldId: "customform",
        });

        if (getFormId == '101') {
            var getLineItemCount = rec.getLineCount('item');

            for (let i = 0; i < getLineItemCount; i++) {

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
                    fieldId: 'custcol_me_qty_pcs_actual',
                    value: getQuatityPcsActualPlanned,
                    line: i
                });
                var setQuatityCtActual = rec.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    value: getQuatityCtActualPlanned,
                    line: i
                });
                var setAmount = rec.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_me_amount',
                    value: Number(getQuatityCtActualPlanned) * Number(getRate),
                    line: i
                });
            }
        }
    }

    return {
        beforeSubmit: beforeSubmit,
    }
});
