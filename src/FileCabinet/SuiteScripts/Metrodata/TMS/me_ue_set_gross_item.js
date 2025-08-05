/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/search'], function (record, search) {

    function searchBilledReceipt(params) {
        var vendorbillSearchObj = search.create({
            type: "vendorbill",
            filters:
                [
                    ["type", "anyof", "VendBill"],
                    "AND",
                    ["mainline", "is", "F"],
                    "AND",
                    ["custcol_me_bill_line_item_receipt", "anyof", params]
                ],
            columns:
                [
                    search.createColumn({
                        name: "formulanumeric",
                        summary: "SUM",
                        formula: "{amount} + {taxamount}",
                        label: "Formula (Numeric)"
                    })
                ]
        }).run().getRange({
            start: 0,
            end: 1000,
        });

        log.debug('Math.abs(vendorbillSearchObj[0].getValue(vendorbillSearchObj[0].columns[0]))', Math.abs(vendorbillSearchObj[0].getValue(vendorbillSearchObj[0].columns[0])))

        return Math.abs(vendorbillSearchObj[0].getValue(vendorbillSearchObj[0].columns[0]));
    }


    function afterSubmit(context) {
        var rec = context.newRecord;

        var recId = rec.id;

        if (context.type != 'delete' && context.type != 'xedit') {
            var loadBill = record.load({
                type: record.Type.VENDOR_BILL,
                id: recId,
            });

            var getItemLine = loadBill.getLineCount('item')

            var totalAmountBillReceiptGross = 0
            var totalAmountBillReceipt = 0

            var billedReceiptArr = [];
            log.debug('getItemLine',getItemLine)
            for (let i = 0; i < getItemLine; i++) {
                var getItemReceipt = loadBill.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_me_bill_line_item_receipt',
                    line: i
                });
                var getAmountGross = loadBill.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'grossamt',
                    line: i
                });
                var getAmountNet = loadBill.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'amount',
                    line: i
                });
                
                if (!billedReceiptArr.some((data) => data.item_receipt == getItemReceipt) && getItemReceipt) {
                    billedReceiptArr.push({
                        item_receipt: getItemReceipt,
                        amount: getAmountGross,
                        amount_net: getAmountNet,
                    });
                    log.debug("testinmg OUNTPUT",billedReceiptArr.some((data) => data.item_receipt == getItemReceipt))
                    log.debug('getAmountGross', getAmountGross)
                    totalAmountBillReceiptGross += Number(getAmountGross)
                    totalAmountBillReceipt += Number(getAmountNet)
                }else if(billedReceiptArr.some((data) => data.item_receipt == getItemReceipt) && getItemReceipt){
                    var getBillReceiptArrIndex = billedReceiptArr.findIndex((data) => data.item_receipt == getItemReceipt);
                    log.debug('getBillReceiptArrIndex',getBillReceiptArrIndex);
                    billedReceiptArr[getBillReceiptArrIndex].amount += Number(getAmountGross);
                    billedReceiptArr[getBillReceiptArrIndex].amount_net += Number(getAmountNet);
                    totalAmountBillReceiptGross += Number(getAmountGross)
                    totalAmountBillReceipt += Number(getAmountNet)
                }

            }

            var setTgItemBill = loadBill.setValue('custbody_me_grossamt_item_receipt', totalAmountBillReceiptGross)
            var setTgItemBill = loadBill.setValue('custbody_me_grossamt_item_receipt', totalAmountBillReceipt)

            log.debug('billedReceiptArr', billedReceiptArr)

            for (let i = 0; i < billedReceiptArr.length; i++) {
                var loadReceipt = record.load({
                    type: record.Type.ITEM_RECEIPT,
                    id: billedReceiptArr[i].item_receipt,
                    // isDynamic: true,
                });

                var getBilledReceipt = searchBilledReceipt(billedReceiptArr[i].item_receipt)

                var setTgAP = loadReceipt.setValue('custbody_me_amount_item_receipt', getBilledReceipt);

                loadReceipt.save();

            }
            loadBill.save();
        }
    }


    return {
        afterSubmit: afterSubmit,
    }
});
