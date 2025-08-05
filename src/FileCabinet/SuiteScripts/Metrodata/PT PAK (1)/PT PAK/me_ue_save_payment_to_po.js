/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/search'], function (record, search) {

    function beforeSubmit(context) {
        var rec = context.newRecord;
        var recOld = context.oldRecord;

        if (context.type == 'delete') {

            var getBillLine = rec.getLineCount('apply');

            for (let i = 0; i < getBillLine; i++) {
                var isApplied = rec.getSublistValue({
                    sublistId: 'apply',
                    fieldId: 'apply',
                    line: i
                })
                var getBillIdId = ""
                if (isApplied == 'T' || isApplied == 'true' || isApplied == true) {
                    var getAmountPaid = rec.getSublistValue({
                        sublistId: 'apply',
                        fieldId: 'amount',
                        line: i,
                    });

                    var getBillId = rec.getSublistValue({
                        sublistId: 'apply',
                        fieldId: 'doc',
                        line: i,
                    });

                    getBillIdId = getBillId
                }

            }

            var loadBill = record.load({
                type: record.Type.VENDOR_BILL,
                id: getBillId,
            });

            var getPoId = loadBill.getSublistValue({
                sublistId: 'purchaseorders',
                fieldId: 'id',
                line: 0,
            });

            var loadPo = record.load({
                type: record.Type.PURCHASE_ORDER,
                id: getPoId,
            });

            var getPaymentTrans = loadPo.getValue({
                fieldId: 'custbody_me_po_payment_transaction',
            });

            var listTransactionPayment = []

            for (let x = 0; x < getPaymentTrans.length; x++) {
                if (getPaymentTrans[x] != rec.getValue('id')) {
                    listTransactionPayment.push(getPaymentTrans[x]);
                }

            }

            var totalAmount = 0;

            if (listTransactionPayment.length > 0) {
                var getTotalPay = search.create({
                    type: "vendorpayment",
                    filters:
                        [
                            ["type", "anyof", "VendPymt"],
                            "AND",
                            ["mainline", "is", "T"],
                            "AND",
                            ["internalid", "anyof", listTransactionPayment]
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

                for (let i = 0; i < getTotalPay.length; i++) {
                    var Amount = getTotalPay[i].getValue('fxamount');

                    totalAmount += Number(Math.abs(Amount))
                }

            }


            // // if (getPaymentTrans.length === 0) {
            // //     var setPaymetTrans = loadPo.setValue({
            // //         fieldId: 'custbody_me_po_payment_transaction',
            // //         value: rec.id,
            // //     });

            // // }
            // // if (getPaymentTrans.length > 0) {

            // //     getPaymentTrans.push(rec.id)

            // //     var setPaymetTrans = loadPo.setValue({
            // //         fieldId: 'custbody_me_po_payment_transaction',
            // //         value: getPaymentTrans,
            // //     });
            // // }

            // var getAmountPaymentTotal = loadPo.getValue({
            //     fieldId: 'custbody_me_po_payment_total',
            // })
            
                var setAmountPaymentTotal = loadPo.setValue({
                    fieldId: 'custbody_me_po_payment_total',
                    value: Number(totalAmount),
                });

            var save = loadPo.save();
        }

    }

    function afterSubmit(context) {
        var rec = context.newRecord;
        var recOld = context.oldRecord;

        if (context.type == 'create') {
            var loadPayment = record.load({
                type: 'vendorpayment',
                id: rec.id,
            })

            var getBillLine = loadPayment.getLineCount('apply')

            for (let i = 0; i < getBillLine; i++) {
                var isApplied = loadPayment.getSublistValue({
                    sublistId: 'apply',
                    fieldId: 'apply',
                    line: i
                })
                if (isApplied == 'T' || isApplied == 'true' || isApplied == true) {
                    var getAmountPaid = loadPayment.getSublistValue({
                        sublistId: 'apply',
                        fieldId: 'amount',
                        line: i,
                    });

                    var getBillId = loadPayment.getSublistValue({
                        sublistId: 'apply',
                        fieldId: 'doc',
                        line: i,
                    });
                }

            }

            var loadBill = record.load({
                type: record.Type.VENDOR_BILL,
                id: getBillId,
            });

            var getPoId = loadBill.getSublistValue({
                sublistId: 'purchaseorders',
                fieldId: 'id',
                line: 0,
            });

            if (getPoId) {
                var loadPo = record.load({
                    type: record.Type.PURCHASE_ORDER,
                    id: getPoId,
                });


                var getCustomForm = loadPo.getValue({
                    fieldId: 'customform',
                });

                if (getCustomForm == 101) {
                    var getPaymentTrans = loadPo.getValue({
                        fieldId: 'custbody_me_po_payment_transaction',
                    });

                    if (getPaymentTrans.length === 0) {
                        var setPaymetTrans = loadPo.setValue({
                            fieldId: 'custbody_me_po_payment_transaction',
                            value: rec.id,
                        });

                    }
                    if (getPaymentTrans.length > 0) {

                        getPaymentTrans.push(rec.id)

                        var setPaymetTrans = loadPo.setValue({
                            fieldId: 'custbody_me_po_payment_transaction',
                            value: getPaymentTrans,
                        });
                    }

                    var getAmountPaymentTotal = loadPo.getValue({
                        fieldId: 'custbody_me_po_payment_total',
                    })

                    var setAmountPaymentTotal = loadPo.setValue({
                        fieldId: 'custbody_me_po_payment_total',
                        value: Number(getAmountPaymentTotal) + Number(getAmountPaid)
                    });

                    var save = loadPo.save();
                }
            }
        }

        if (context.type == 'edit') {
            var loadPayment = record.load({
                type: record.type.VENDOR_PAYMENT,
                id: rec.id,
            })

            var getAmountPaidOld = recOld.total;
            var getAmountPaidNew = rec.total;

            for (let i = 0; i < getBillLine; i++) {
                var isApplied = loadPayment.getSublistValue({
                    sublistId: 'apply',
                    fieldId: 'apply',
                    line: i
                })
                var getBillIdId = ""
                if (isApplied == 'T' || isApplied == 'true' || isApplied == true) {
                    var getAmountPaid = loadPayment.getSublistValue({
                        sublistId: 'apply',
                        fieldId: 'amount',
                        line: i,
                    });

                    var getBillId = loadPayment.getSublistValue({
                        sublistId: 'apply',
                        fieldId: 'doc',
                        line: i,
                    });

                    getBillIdId = getBillId
                }

            }

            var loadBill = record.load({
                type: record.Type.VENDOR_BILL,
                id: getBillId,
            });

            var getPoId = loadBill.getSublistValue({
                sublistId: 'purchaseorders',
                fieldId: 'id',
                line: 0,
            });

            var loadPo = record.load({
                type: record.Type.PURCHASE_ORDER,
                id: getPoId,
            });

            var getPaymentTrans = loadPo.getValue({
                fieldId: 'custbody_me_po_payment_transaction',
            });

            var totalAmount = 0;

            if (getPaymentTrans.length > 0) {
                var getTotalPay = search.create({
                    type: "vendorpayment",
                    filters:
                        [
                            ["type", "anyof", "VendPymt"],
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

                for (let i = 0; i < listTransactionPayment.length; i++) {
                    var Amount = getTotalPay[i].getValue('fxamount');

                    totalAmount += Number(Math.abs(Amount))
                }

            }


            // if (getPaymentTrans.length === 0) {
            //     var setPaymetTrans = loadPo.setValue({
            //         fieldId: 'custbody_me_po_payment_transaction',
            //         value: rec.id,
            //     });

            // }
            // if (getPaymentTrans.length > 0) {

            //     getPaymentTrans.push(rec.id)

            //     var setPaymetTrans = loadPo.setValue({
            //         fieldId: 'custbody_me_po_payment_transaction',
            //         value: getPaymentTrans,
            //     });
            // }

            var getAmountPaymentTotal = loadPo.getValue({
                fieldId: 'custbody_me_po_payment_total',
            })

            if (getAmountPaymentTotal > 0) {
                var setAmountPaymentTotal = loadPo.setValue({
                    fieldId: 'custbody_me_po_payment_total',
                    value: Number(totalAmount),
                });
            }

            var save = loadPo.save();
        }

    }

    return {
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    }
});
