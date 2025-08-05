/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record'], function (record) {

    // function beforeLoad(context) {

    // }

    function beforeSubmit(context) {

        var oldRec = context.oldRecord;
        var rec = context.newRecord;

        if (context.type != 'delete') {

            var getCreatedFrom = rec.getValue('createdfrom');

            var loadInvoice = record.load({
                type: 'invoice',
                id: getCreatedFrom,
            });

            var getItemCount = loadInvoice.getLineCount('item');

            var invoiceLineItem = []

            for (let i = 0; i < getItemCount; i++) {
                var getItem = loadInvoice.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i,
                });
                var getQuantity = loadInvoice.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: i,
                });
                var getQuantityCanceled = loadInvoice.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_me_canceled_amount_inv',
                    line: i,
                });

                invoiceLineItem.push({
                    item: getItem,
                    quantity: getQuantity,
                    quantity_canceled: (!getQuantityCanceled?0:getQuantityCanceled),
                    line: i,
                });
            }

            log.debug('invoiceLineItem', invoiceLineItem)


            var getOldCmLine = oldRec.getLineCount('item');
            var OldCmArr = []

            for (let i = 0; i < getOldCmLine; i++) {
                var getItemRec = rec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i,
                });
                var getQuantityRec = rec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: i,
                });
                OldCmArr.push({
                    item: getItemRec,
                    quantity: Number((!getQuantityRec?0:getQuantityRec)),
                    line: i,
                });
            }


            var getItemLine = loadInvoice.getLineCount('item');

            var getItemCmLine = rec.getLineCount('item');

            var isFullyFulfilled = false;
            var count = 0;

            for (let i = 0; i < getItemCmLine; i++) {
                var getItemRec = rec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i,
                });
                var getQuantityRec = rec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: i,
                });

                var numberQuantityRec = Number(getQuantityRec)

                var getEquivalent = invoiceLineItem.filter((data) => data.item == getItemRec)

                log.debug('getQuantityRec', getQuantityRec)
                log.debug('getEquivalent', getEquivalent)
                
                if (getEquivalent.length > 0) {
                    log.debug('IF THERE IS DUPLICATE', "YES")
                    // if (numberQuantityRec == getEquivalent[0].quantity && !(numberQuantityRec < getEquivalent[0].quantity)) {
                    var setQuantityCanceled = loadInvoice.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_me_canceled_amount_inv',
                        line: getEquivalent[0].line,
                        value: numberQuantityRec +  Number(getEquivalent[0].quantity_canceled)
                    });
                    // count++;
                    // }
                }


            }

            
            for (let i = 0; i < getItemCount; i++) {
                var getItem = loadInvoice.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i,
                });
                var getQuantity = loadInvoice.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: i,
                });
                var getQuantityCanceled = loadInvoice.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_me_canceled_amount_inv',
                    line: i,
                });

                log.debug('getQuantityCanceled', getQuantityCanceled)
                log.debug('getQuantity', getQuantity)
                
                if (getQuantityCanceled == getQuantity) {
                    count++;
                }
                
            }
            
            log.debug('count', count)
            


            if (count == getItemLine) {
                isFullyFulfilled = true
            }
            log.debug('isFullyFulfilled', isFullyFulfilled)

            if (isFullyFulfilled) {

                var getfakturPajak = loadInvoice.getText('custbody_me_nomor_faktur_pajak_sales');
                var setfakturPajak = loadInvoice.setText('custbody_me_nomor_faktur_pajak_sales', getfakturPajak + ' - Canceled');

                var getEnofa = loadInvoice.getValue('custbody_me_nomor_enofa');
                var setEnofaRec = record.submitFields({
                    type: 'customrecord_me_enofa_faktur_pajak',
                    id: getEnofa,
                    values: {
                        'custbody_me_status_faktur_pajak': '',
                        'custrecord_me_invoice_document_number': '',
                        'custrecord_me_status_enofa_number': 1,
                    }
                });

                var setEnofa = loadInvoice.setValue('custbody_me_nomor_enofa', '');
                var setObjekPajak = loadInvoice.setValue('custbody_me_kode_obyek_pajak', '');

                
            }
            loadInvoice.save();
        }

    }

    // function afterSubmit(context) {

    // }

    return {
        // beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
    }
});
