/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/error'], function (record, error) {


    function beforeSubmit(context) {
        var rec = context.newRecord;

        var getSettleme = rec.getValue('custrecord_me_settlement_multicrr_ap');

        log.debug("context", getSettleme)
        log.debug("context", context.type)

        if (context.type == "edit") {
            var getSettlementAmountInitial = rec.getValue('custrecord_me_settlmnt_amt_initial');
            var getSettlementAmount = rec.getValue('custrecord_me_child_settle_amount');
            var settlementSubstract = Number(getSettlementAmountInitial - getSettlementAmount);

            var getPrepaymentAmountinital = rec.getValue('custrecord_me_prepayment_amount_initial');
            var getPrepaymentAmount = rec.getValue('custrecord_me_child_settle_prepay_amount');
            var prepaymentSubstract = Number(getPrepaymentAmountinital - getPrepaymentAmount);

            var getBillIdInitial = rec.getValue('custrecord_me_bill_number_initial');
            var getBillId = rec.getValue('custrecord_me_child_settle_bill_number');
            var getSettlementMulticurrAp = rec.getValue('custrecord_me_settlement_multicrr_ap');

            //=============================load Settlement Record=================================
            var loadSettlementRec = record.load({
                type: 'customtransaction_me_settlmnt_multicr_ap',
                id: getSettlementMulticurrAp,
            });
            var getClearing1 = loadSettlementRec.getValue('custbody_me_child_settle_clearing_tran');
            var getClearing2 = loadSettlementRec.getValue('custbody_me_child_settle_clearing_tra2');
            var getBillCreditId = loadSettlementRec.getValue('custbody_me_bill_credit_settlement');
            //===================================================================================

            //=================================load Clearing 1===================================
            var loadClearing1 = record.load({
                type: 'customtransaction_me_clearing_vp_1',
                id: getClearing1,
            });
            var getDebitValue1 = loadClearing1.getSublistValue({
                sublistId: 'line',
                fieldId: 'debit',
                line: 0
            })
            var getCreditValue1 = loadClearing1.getSublistValue({
                sublistId: 'line',
                fieldId: 'credit',
                line: 1
            })
            var setDebitValue = loadClearing1.setSublistValue({
                sublistId: 'line',
                fieldId: 'debit',
                value: parseFloat(getPrepaymentAmount),
                line: 0,
            });
            var setCreditValue = loadClearing1.setSublistValue({
                sublistId: 'line',
                fieldId: 'credit',
                value: parseFloat(getPrepaymentAmount),
                line: 1,
            });
            loadClearing1.save();
            //=======================================================================================

            //===============================load Clearing 2=========================================
            var loadClearing2 = record.load({
                type: 'customtransaction_me_clearing_vp_1',
                id: getClearing2,
            });
            var getDebitValue2 = loadClearing2.getSublistValue({
                sublistId: 'line',
                fieldId: 'debit',
                line: 0
            })
            var getCreditValue2 = loadClearing2.getSublistValue({
                sublistId: 'line',
                fieldId: 'credit',
                line: 1
            })
            var setDebitValue = loadClearing2.setSublistValue({
                sublistId: 'line',
                fieldId: 'debit',
                value: parseFloat(getSettlementAmount),
                line: 0,
            });
            var setCreditValue = loadClearing2.setSublistValue({
                sublistId: 'line',
                fieldId: 'credit',
                value: parseFloat(getSettlementAmount),
                line: 1,
            });
            loadClearing2.save();
            //==============================================================

            //==========================load Bill Credit====================
            var loadBillCredit = record.load({
                type: 'vendorcredit',
                id: getBillCreditId,
            });

            var getlineRate = loadBillCredit.getLineCount('item');
            var getItemRate = loadBillCredit.getSublistValue({
                sublistId: 'item',
                fieldId: 'rate',
                line: 0,
            })
            var setItemRate = loadBillCredit.setSublistValue({
                sublistId: 'item',
                fieldId: 'rate',
                value: getSettlementAmount + getItemRate,
                line: 0,
            })

            var getLineApply = loadBillCredit.getLineCount('apply');
            if (getBillId == getBillIdInitial) {
                for (let x = 0; x < getLineApply; x++) {
                    var getBillIdLine = loadBillCredit.getSublistValue({
                        sublistId: 'apply',
                        fieldId: 'internalid',
                        line: x
                    })
                    if (getBillIdLine == getBillId) {
                        var setApplyAmount = loadBillCredit.setSublistValue({
                            sublistId: 'apply',
                            fieldId: 'amount',
                            value: getSettlementAmount,
                            line: x
                        });
                    }
                }
            } else {
                for (let x = 0; x < getLineApply; x++) {
                    var getBillIdLine1 = loadBillCredit.getSublistValue({
                        sublistId: 'apply',
                        fieldId: 'internalid',
                        line: x
                    });
                    if (getBillIdLine1 == getBillIdInitial) {
                        var setApply = loadBillCredit.setSublistValue({
                            sublistId: 'apply',
                            fieldId: 'apply',
                            value: false,
                            line: x
                        });
                    }
                    if (getBillIdLine1 == getBillId) {
                        // try {
                        var setApply1 = loadBillCredit.setSublistValue({
                            sublistId: 'apply',
                            fieldId: 'apply',
                            value: true,
                            line: x
                        });
                        var setApplyAmount = loadBillCredit.setSublistValue({
                            sublistId: 'apply',
                            fieldId: 'amount',
                            value: getSettlementAmount,
                            line: x
                        });

                        // } catch (error) {
                        //      throw error.create({
                        //         name: 'RCRD_NOT_FOUND',
                        //         message: 'bill Not Found in Bill Credit',
                        //         notifyOff: false
                        //     });
                        // }
                    }

                }
            }
            loadBillCredit.save();
            //===================================================================

            getBillIdInitial = rec.setValue('custrecord_me_bill_number_initial', getBillId);
            getPrepaymentAmountinital = rec.setValue('custrecord_me_settlmnt_amt_initial', getPrepaymentAmount);
            getSettlementAmountInitial = rec.setValue('custrecord_me_settlmnt_amt_initial', getSettlementAmount);

        } else if (context.type == 'delete') {
            var getSettlementAmountInitialDlt = rec.getValue('custrecord_me_settlmnt_amt_initial');
            var getSettlementAmountDlt = rec.getValue('custrecord_me_child_settle_amount');
            var settlementSubstractDlt = Number(getSettlementAmountInitialDlt - getSettlementAmountDlt);

            var getPrepaymentAmountinitalDlt = rec.getValue('custrecord_me_prepayment_amount_initial');
            var getPrepaymentAmountDlt = rec.getValue('custrecord_me_child_settle_prepay_amount');
            var prepaymentSubstractDlt = Number(getPrepaymentAmountinitalDlt - getPrepaymentAmountDlt);

            var getBillIdDlt = rec.getValue('custrecord_me_child_settle_bill_number');
            var getSettlementMulticurrApDlt = rec.getValue('custrecord_me_settlement_multicrr_ap');
            log.debug("getSetlmntAMountID",getSettlementMulticurrApDlt)

            //====================================load Settlement========================================
            var loadSettlementRecDlt = record.load({
                type: 'customtransaction_me_settlmnt_multicr_ap',
                id: getSettlementMulticurrApDlt,
            });
            var getClearing1Dlt = loadSettlementRecDlt.getValue('custbody_me_child_settle_clearing_tran');
            var getClearing2Dlt = loadSettlementRecDlt.getValue('custbody_me_child_settle_clearing_tra2');
            var getBillCreditIdDlt = loadSettlementRecDlt.getValue('custbody_me_bill_credit_settlement');
            //===========================================================================================

            //=============================================load Clearing 1===============================
            var loadClearing1Dlt = record.load({
                type: 'customtransaction_me_clearing_vp_1',
                id: getClearing1Dlt,
            });
            var getDebitValue = loadClearing1Dlt.getSublistValue({
                sublistId: 'line',
                fieldId: 'debit',
                line: 0
            })
            var setDebitValue = loadClearing1Dlt.setSublistValue({
                sublistId: 'line',
                fieldId: 'debit',
                value: Number(getDebitValue - getPrepaymentAmountDlt),
                line: 0,
            });
            var setCreditValue = loadClearing1Dlt.setSublistValue({
                sublistId: 'line',
                fieldId: 'credit',
                value: Number(getDebitValue - getPrepaymentAmountDlt),
                line: 1,
            });
            loadClearing1Dlt.save();
            //=============================================================================================

            //=============================================load Clearing 2=================================
            var loadClearing2Dlt = record.load({
                type: 'customtransaction_me_clearing_vp_1',
                id: getClearing2Dlt,
            });
            var getDebitValue = loadClearing2Dlt.getSublistValue({
                sublistId: 'line',
                fieldId: 'debit',
                line: 0
            })
            var setDebitValue = loadClearing2Dlt.setSublistValue({
                sublistId: 'line',
                fieldId: 'debit',
                value: Number(getDebitValue - getSettlementAmountDlt),
                line: 0,
            });
            var setCreditValue = loadClearing2Dlt.setSublistValue({
                sublistId: 'line',
                fieldId: 'credit',
                value: Number(getDebitValue - getSettlementAmountDlt),
                line: 1,
            });
            loadClearing2Dlt.save();
            //=============================================================================================

            //==================================load Bill Credit===========================================
            var loadBillCreditDlt = record.load({
                type: 'vendorcredit',
                id: getBillCreditIdDlt,
            });
            var getLineApply = loadBillCreditDlt.getLineCount('apply');
            for (let x = 0; x < getLineApply; x++) {
                var getBillIdLineDlt = loadBillCreditDlt.getSublistValue({
                    sublistId: 'apply',
                    fieldId: 'doc',
                    line: x
                })
                if (getBillIdLineDlt == getBillIdDlt) {
                    var setApplyAmount = loadBillCreditDlt.setSublistValue({
                        sublistId: 'apply',
                        fieldId: 'apply',
                        value: false,
                        line: x
                    });
                }

            }
            loadBillCreditDlt.save();
            //===============================================================================================
            getBillIdInitialDlt = rec.setValue('custrecord_me_bill_number_initial', getBillId);
            getPrepaymentAmountinitalDlt = rec.setValue('custrecord_me_settlmnt_amt_initial', getPrepaymentAmount);
            getSettlementAmountInitialDlt = rec.setValue('custrecord_me_settlmnt_amt_initial', getSettlementAmount);
        }else if(context.type == "create"){
            var getSettlementAmountInitialCrt = rec.getValue('custrecord_me_settlmnt_amt_initial');
            var getSettlementAmountCrt = rec.getValue('custrecord_me_child_settle_amount');
            var settlementSubstractCrt = Number(getSettlementAmountInitialCrt - getSettlementAmountCrt);

            var getPrepaymentAmountinitalCrt = rec.getValue('custrecord_me_prepayment_amount_initial');
            var getPrepaymentAmountCrt = rec.getValue('custrecord_me_child_settle_prepay_amount');
            var prepaymentSubstractCrt = Number(getPrepaymentAmountinitalCrt - getPrepaymentAmountCrt);

            var getBillIdCrt = rec.getValue('custrecord_me_child_settle_bill_number');
            var getSettlementMulticurrApCrt = rec.getValue('custrecord_me_settlement_multicrr_ap');
            log.debug("getSetlmntAMountID",getSettlementMulticurrApCrt)

            //====================================load Settlement========================================
            var loadSettlementRecCrt = record.load({
                type: 'customtransaction_me_settlmnt_multicr_ap',
                id: getSettlementMulticurrApCrt,
            });
            var getClearing1Crt = loadSettlementRecCrt.getValue('custbody_me_child_settle_clearing_tran');
            var getClearing2Crt = loadSettlementRecCrt.getValue('custbody_me_child_settle_clearing_tra2');
            var getBillCreditIdCrt = loadSettlementRecCrt.getValue('custbody_me_bill_credit_settlement');
            //===========================================================================================

            //=============================================load Clearing 1===============================
            var loadClearing1Crt = record.load({
                type: 'customtransaction_me_clearing_vp_1',
                id: getClearing1Crt,
            });
            var getDebitValue = loadClearing1Crt.getSublistValue({
                sublistId: 'line',
                fieldId: 'debit',
                line: 0
            })
            var getCreditValue = loadClearing1Crt.getSublistValue({
                sublistId: 'line',
                fieldId: 'credit',
                line: 1
            })
            var setDebitValue = loadClearing1Crt.setSublistValue({
                sublistId: 'line',
                fieldId: 'debit',
                value: Number(getDebitValue + getPrepaymentAmountCrt),
                line: 0,
            });
            var setCreditValue = loadClearing1Crt.setSublistValue({
                sublistId: 'line',
                fieldId: 'credit',
                value: Number(getCreditValue + getPrepaymentAmountCrt),
                line: 1,
            });
            loadClearing1Crt.save();
            //=============================================================================================

            //=============================================load Clearing 2=================================
            var loadClearing2Crt = record.load({
                type: 'customtransaction_me_clearing_vp_1',
                id: getClearing2Crt,
            });
            var getDebitValue1 = loadClearing2Crt.getSublistValue({
                sublistId: 'line',
                fieldId: 'debit',
                line: 0
            })
            var getCreditValue1 = loadClearing2Crt.getSublistValue({
                sublistId: 'line',
                fieldId: 'credit',
                line: 1
            })
            var setDebitValue = loadClearing2Crt.setSublistValue({
                sublistId: 'line',
                fieldId: 'debit',
                value: Number(getDebitValue1 + getSettlementAmountCrt),
                line: 0,
            });
            var setCreditValue = loadClearing2Crt.setSublistValue({
                sublistId: 'line',
                fieldId: 'credit',
                value: Number(getCreditValue1 + getSettlementAmountCrt),
                line: 1,
            });
            loadClearing2Crt.save();
            //=============================================================================================

            //==================================load Bill Credit===========================================
            var loadBillCreditCrt = record.load({
                type: 'vendorcredit',
                id: getBillCreditIdCrt,
            });
            var getLineApply1 = loadBillCreditCrt.getLineCount('apply');
            for (let x = 0; x < getLineApply1; x++) {
                var getBillIdLineCrt = loadBillCreditCrt.getSublistValue({
                    sublistId: 'apply',
                    fieldId: 'internalid',
                    line: x
                })
                if (getBillIdLineCrt == getBillIdCrt) {
                    var setApplyCrt = loadBillCreditCrt.setSublistValue({
                        sublistId: 'apply',
                        fieldId: 'apply',
                        value: true,
                        line: x
                    });
                    var setApplyAmountCrt = loadBillCreditCrt.setSublistValue({
                        sublistId: 'apply',
                        fieldId: 'amount',
                        value: getSettlementAmountCrt,
                        line: x
                    });
                }

            }
            loadBillCreditCrt.save();
            //===============================================================================================
            getBillIdInitialCrt = rec.setValue('custrecord_me_bill_number_initial', getBillId);
            getPrepaymentAmountinitalCrt = rec.setValue('custrecord_me_settlmnt_amt_initial', getPrepaymentAmount);
            getSettlementAmountInitialCrt = rec.setValue('custrecord_me_settlmnt_amt_initial', getSettlementAmount);
        }

    }


    return {
        beforeSubmit: beforeSubmit,
    }
});
