/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record'], function (record) {


    function afterSubmit(context) {
        var rec = context.newRecord;

        if (context.type != 'delete') {


            var invId = rec.id;

            var getFulfillment = rec.getValue('custbody_me_delivery_order_number');

            log.debug('invId', invId)
            log.debug('getFulfillment', getFulfillment)

            if (getFulfillment) {
                for (let i = 0; i < getFulfillment.length; i++) {
                    var setInvId = record.submitFields({
                        type: record.Type.ITEM_FULFILLMENT,
                        id: getFulfillment[i],
                        values: {
                            'custbody_me_invoice_ar_number': invId
                        },
                    });
                }
            }

            var loadInv = record.load({
                type: record.Type.INVOICE,
                id: invId,
            });

            var getInvLine = loadInv.getLineCount('item')

            for (let i = getInvLine - 1; i >= 0; i--) {
                var getQuantity = loadInv.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: i
                });

                if (getQuantity == 0) {
                    loadInv.removeLine({
                        sublistId: 'item',
                        line: i,
                        ignoreRecalc: true
                    });
                }
            }
            loadInv.save()
        }


    }


    return {
        afterSubmit: afterSubmit,
    }
});
