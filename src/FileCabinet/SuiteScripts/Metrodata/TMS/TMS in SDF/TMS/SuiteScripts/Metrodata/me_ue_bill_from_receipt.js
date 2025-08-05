/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record'], function (record) {

    function beforeSubmit(context) {
        var rec = context.newRecord
        var getInvLine = rec.getLineCount('item')
        for (let i = getInvLine - 1; i >= 0; i--) {
            var getQuantity = rec.getSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                line: i
            });
            var inventDetail = rec.getSublistSubrecord({
                sublistId: 'item',
                fieldId: 'inventorydetail',
                line: i
              });

              var getLineCountInvDetail = inventDetail.getLineCount('inventoryassignment');

              for (let j = getLineCountInvDetail-1 ; j >= 0 ; j--) {
                if (j == 0 ) {
                    inventDetail.setSublistValue({
                        sublistId: 'inventoryassignment',
                        fieldId: 'quantity',
                        line: j,
                        value: getQuantity
                    });
                }else{
                    inventDetail.removeLine({
                        sublistId: 'inventoryassignment',
                        line: j,
                        ignoreRecalc: true
                    });
                }
                
              }
            


            if (getQuantity == 0) {
                rec.removeLine({
                    sublistId: 'item',
                    line: i,
                    ignoreRecalc: true
                });
            }


        }
    }

    function afterSubmit(context) {
        var rec = context.newRecord;

        if (context.type != 'delete') {


            var invId = rec.id;

            var getFulfillment = rec.getValue('custbody_me_gr_number');

            log.debug('invId', invId)
            log.debug('getFulfillment', getFulfillment)

            for (let i = 0; i < getFulfillment.length; i++) {
                var setInvId = record.submitFields({
                    type: record.Type.ITEM_RECEIPT,
                    id: getFulfillment[i],
                    values: {
                        'custbody_me_invoice_ap_number': invId
                    },
                });
            }

            // var loadInv = record.load({
            //     type: record.Type.VENDOR_BILL,
            //     id: invId,
            // });

            // var getInvLine = loadInv.getLineCount('item')

            // for (let i = getInvLine - 1; i >= 0; i--) {
            //     var getQuantity = loadInv.getSublistValue({
            //         sublistId: 'item',
            //         fieldId: 'quantity',
            //         line: i
            //     });

            //     if (getQuantity == 0) {
            //         loadInv.removeLine({
            //             sublistId: 'item',
            //             line: i,
            //             ignoreRecalc: true
            //         });
            //     }
            // }
            // loadInv.save()
        }


    }


    return {
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit,
    }
});
