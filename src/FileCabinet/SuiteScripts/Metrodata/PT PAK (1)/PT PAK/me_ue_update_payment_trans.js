/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/search'], function (search) {

    function beforeSubmit(context) {
        var rec = context.newRecord;

        var getPaymentTrans = rec.getValue({
            fieldId: 'custbody_me_po_payment_transaction'
        });

        log.debug("getPaymentTrans", getPaymentTrans)

        var getTotalPay = search.create({
            type: "vendorpayment",
            filters:
                [
                    ["type", "anyof", "VendPymt"],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["internalid", "anyof", getPaymentTrans]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" }),
                    search.createColumn({ name: "fxamount", label: "Amount (Foreign Currency)" })
                ]
        }).run().getRange({
            start: 0,
            end: 1000,
        })

        var totalAmount = 0;

        for (let i = 0; i < getTotalPay.length; i++) {
            var Amount = getTotalPay[i].getValue('fxamount');

            totalAmount += Number(Math.abs(Amount))
        }

        var setAmount = rec.setValue({
            fieldId: 'custbody_me_po_payment_total',
            value: totalAmount,
        })

    }

    return {
        beforeSubmit: beforeSubmit,
    }
});
