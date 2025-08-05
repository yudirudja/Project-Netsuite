/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
 define(['N/record', 'N/search', './config/me_config.js'], function (record, search, config) {

    function afterSubmit(context) {
        var rec = context.newRecord;

        var loadCurrent = record.load({
            type: 'customtransaction_me_settlmnt_multicr_ap',
            id: rec.id,
        });

        var getFromCurrency = loadCurrent.getValue({
            fieldId: 'custbody_me_vendor_prepayment_um_curr'
        });
        var getToCurrency = loadCurrent.getValue({
            fieldId: 'custbody_me_child_settle_currency'
        });

        var exchangeRateFrom = loadCurrent.getValue({
            fieldId: 'custbody_me_child_settle_ex_rpum_ridr'
        });
        var exchangeRateTo = loadCurrent.getValue({
            fieldId: 'custbody_me_child_settle_ex_rstl_ridr'
        });

        var transClearingFrom = loadCurrent.getValue({
            fieldId: "custbody_me_child_settle_clearing_tran",
        });

        var getAmountFrom = search.lookupFields({
            type: "customtransaction_me_clearing_vp_1",
            id: transClearingFrom,
            columns: ['amount']
        });

        var amountFrom = getAmountFrom.amount;

        var transClearingTo = loadCurrent.getValue({
            fieldId: "custbody_me_child_settle_clearing_tra2",
        });

        var getAmountTo = search.lookupFields({
            type: "customtransaction_me_clearing_vp_1",
            id: transClearingTo,
            columns: ['amount']
        });

        var amountTo = getAmountTo.amount;

        var selisih = Math.abs(parseFloat(amountTo).toFixed(0)) - Math.abs(parseFloat(amountFrom).toFixed(0));

        var subsidiary = loadCurrent.getValue({
            fieldId: 'subsidiary'
        });
        log.debug("subsidiary", subsidiary)
        var classs = loadCurrent.getValue({
            fieldId: 'class'
        });
        log.debug("classs", classs)
        var location = loadCurrent.getValue({
            fieldId: 'location'
        });
        log.debug("location", location)
        var department = loadCurrent.getValue({
            fieldId: 'department'
        });
        log.debug("department", department)

        var clearingTransBalanceFrom = loadCurrent.setValue({
            fieldId: 'custbody_me_idr_balance_clearing_trx_1',
            value: Math.abs(parseFloat(amountFrom).toFixed(0)),
        });
        var clearingTransBalanceTo = loadCurrent.setValue({
            fieldId: 'custbody_me_idr_balance_clearing_trx_2',
            value: Math.abs(parseFloat(amountTo).toFixed(0)),
        });
        var clearingTransBalanceTo = loadCurrent.setValue({
            fieldId: 'custbody_me_selisih_amount_ap_payment',
            value: Math.abs(parseFloat(selisih).toFixed(0)),
        });

        if (context.type == 'create') {
            if (parseInt(selisih) > 0) {
                var createJournal = record.create({
                    type: record.Type.JOURNAL_ENTRY,
                    isDynamic: true
                });
    
                // var setCurrency = createJournal.setValue({
                //     fieldId: 'currency',
                //     value: 1
                // });
                var setSubsidiary = createJournal.setValue({
                    fieldId: 'subsidiary',
                    value: subsidiary
                });
                var setStatus = createJournal.setValue({
                    fieldId: 'approvalstatus',
                    value: 2
                });
    
                createJournal.selectNewLine('line');
                var setCreditAccount = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    line: 1,
                    value: config.account.gain_or_loss,
                });
    
                var setCreditAmount = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'credit',
                    line: 1,
                    value: parseFloat(Math.abs(selisih)).toFixed(2),
                });
                var setCreditDepartment = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    line: 1,
                    value: department,
                });
                var setCreditClass = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    line: 1,
                    value: classs,
                });
                var setCreditLocation = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    line: 1,
                    value: location,
                });
                createJournal.commitLine('line');
                createJournal.selectNewLine('line');
    
                var setDebitAccount = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    line: 2,
                    value: config.account.ap_clearing,
                });
                var setDebitAmount = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'debit',
                    line: 2,
                    value: parseFloat(Math.abs(selisih)).toFixed(2),
                });
                var setDebitDepartment = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    line: 2,
                    value: department,
                });
                var setDebitClass = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    line: 2,
                    value: classs,
                });
                var setDebitLocation = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    line: 2,
                    value: location,
                });
                createJournal.commitLine('line');
                var saveJournal = createJournal.save();
    
                var setJournal = loadCurrent.setValue({
                    fieldId: 'custbody_me_journal_selisih_ap_payment',
                    value: saveJournal,
                })
                // var setJournalLearing = loadBillPayment.setValue({
                //     fieldId: 'custbody_me_journal_selisih_vend_payme',
                //     value: saveJournal,
                // })
    
            }
            if (parseInt(selisih) < 0) {
                var createJournal = record.create({
                    type: record.Type.JOURNAL_ENTRY,
                    isDynamic: true
                });
    
                var setSubsidiary = createJournal.setValue({
                    fieldId: 'subsidiary',
                    value: subsidiary
                });
    
                var setStatus = createJournal.setValue({
                    fieldId: 'approvalstatus',
                    value: 2
                });
    
                createJournal.selectNewLine('line');
                var setDebitAccount = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    line: 1,
                    value: config.account.gain_or_loss,
                });
    
                var setDebitAmount = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'debit',
                    line: 1,
                    value: parseFloat(Math.abs(selisih)).toFixed(2),
                });
    
                var setDebitDepartment = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    line: 1,
                    value: department,
                });
                var setDebitClass = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    line: 1,
                    value: classs,
                });
                var setDebitLocation = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    line: 1,
                    value: location,
                });
                createJournal.commitLine('line');
                createJournal.selectNewLine('line');
    
                var setCreditAccount = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    line: 2,
                    value: config.account.ap_clearing,
                });
                var setCreditAmount = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'credit',
                    line: 2,
                    value: parseFloat(Math.abs(selisih)).toFixed(2),
                });
                var setCreditDepartment = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    line: 2,
                    value: department,
                });
                var setCreditClass = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    line: 2,
                    value: classs,
                });
                var setCreditLocation = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    line: 2,
                    value: location,
                });
                createJournal.commitLine('line');
                var saveJournal = createJournal.save();
    
                var setJournal = loadCurrent.setValue({
                    fieldId: 'custbody_me_journal_selisih_ap_payment',
                    value: saveJournal,
                })
                // var setJournalLearing = loadBillPayment.setValue({
                //     fieldId: 'custbody_me_journal_selisih_vend_payme',
                //     value: saveJournal,
                // })
    
            }
        }

        if (context.type == 'edit') {

            var getJournalId = loadCurrent.getValue({
                fieldId: 'custbody_me_journal_selisih_ap_payment',
            });

            if (parseInt(selisih) > 0) {
                var updateJournal = record.load({
                    type: 'journalentry',
                    id: getJournalId,
                });

                var getJournalLineCount = updateJournal.getLineCount('line');

                for (let i = getJournalLineCount - 1; i >= 0; i--) {
                    updateJournal.removeLine({
                        sublistId: 'line',
                        line: i,
                    });
                }
    
                var setCreditAccount = updateJournal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    line: 1,
                    value: config.account.gain_or_loss,
                });
    
                var setCreditAmount = updateJournal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'credit',
                    line: 1,
                    value: parseFloat(Math.abs(selisih)).toFixed(2),
                });
                var setCreditDepartment = updateJournal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    line: 1,
                    value: department,
                });
                var setCreditClass = updateJournal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    line: 1,
                    value: classs,
                });
                var setCreditLocation = updateJournal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    line: 1,
                    value: location,
                });
    
                var setDebitAccount = updateJournal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    line: 2,
                    value: config.account.ap_clearing,
                });
                var setDebitAmount = updateJournal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'debit',
                    line: 2,
                    value: parseFloat(Math.abs(selisih)).toFixed(2),
                });
                var setDebitDepartment = updateJournal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    line: 2,
                    value: department,
                });
                var setDebitClass = updateJournal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    line: 2,
                    value: classs,
                });
                var setDebitLocation = updateJournal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    line: 2,
                    value: location,
                });

                updateJournal.removeLine({
                    sublistId: 'line',
                    line: 0,
                });

                var saveJournal = updateJournal.save();
    
                var setJournal = loadCurrent.setValue({
                    fieldId: 'custbody_me_journal_selisih_ap_payment',
                    value: saveJournal,
                })

    
            }
            if (parseInt(selisih) < 0) {
                var updateJournal = record.load({
                    type: 'journalentry',
                    id: getJournalId,
                    // isDynamic: true,
                });
    
                // var setSubsidiary = updateJournal.setValue({
                //     fieldId: 'subsidiary',
                //     value: subsidiary
                // });
    
                // var setStatus = updateJournal.setValue({
                //     fieldId: 'approvalstatus',
                //     value: 2
                // });

                var getJournalLineCount = updateJournal.getLineCount('line');

                log.debug("getLineCount", getJournalLineCount)

                for (let i = getJournalLineCount - 1; i >= 0; i--) {
                    updateJournal.removeLine({
                        sublistId: 'line',
                        line: i,
                    });
                }
                var getJournalLineCount = updateJournal.getLineCount('line');

                log.debug("getLineCount", getJournalLineCount)
    
                // updateJournal.selectNewLine('line');
                var setDebitDepartment = updateJournal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    line: 1,
                    value: department,
                });
                var setDebitClass = updateJournal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    line: 1,
                    value: classs,
                });
                var setDebitLocation = updateJournal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    line: 1,
                    value: location,
                });
                var setDebitAccount = updateJournal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    line: 1,
                    value: config.account.gain_or_loss,
                });
    
                var setDebitAmount = updateJournal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'debit',
                    line: 1,
                    value: Math.abs(selisih),
                });

                var getDebit = updateJournal.getSublistValue({
                    sublistId: 'line',
                    fieldId: 'debit',
                    line: 1,
                })
                log.debug("getDebit", getDebit)
    

                // updateJournal.commitLine('line');
                // updateJournal.selectNewLine('line');
                var setCreditDepartment = updateJournal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    line: 2,
                    value: department,
                });
                var setCreditClass = updateJournal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    line: 2,
                    value: classs,
                });
                var setCreditLocation = updateJournal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    line: 2,
                    value: location,
                });
                var setCreditAccount = updateJournal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    line: 2,
                    value: config.account.ap_clearing,
                });
                var setCreditAmount = updateJournal.setSublistValue({
                    sublistId: 'line',
                    fieldId: 'credit',
                    line: 2,
                    value: Math.abs(selisih),
                });

                var getCredit = updateJournal.getSublistValue({
                    sublistId: 'line',
                    fieldId: 'credit',
                    line: 2,
                })
                log.debug("getCredit", getCredit)

                var getJournalLineCount = updateJournal.getLineCount('line');

                log.debug("getLineCount", getJournalLineCount)

                updateJournal.removeLine({
                    sublistId: 'line',
                    line: 0,
                });

                // updateJournal.commitLine('line');
                var saveJournal = updateJournal.save();
    
                var setJournal = loadCurrent.setValue({
                    fieldId: 'custbody_me_journal_selisih_ap_payment',
                    value: saveJournal,
                })
                // var setJournalLearing = loadBillPayment.setValue({
                //     fieldId: 'custbody_me_journal_selisih_vend_payme',
                //     value: saveJournal,
                // })
    
            }
        }
        var saveMcAp = loadCurrent.save();
    }

    return {
        afterSubmit: afterSubmit
    }
});
