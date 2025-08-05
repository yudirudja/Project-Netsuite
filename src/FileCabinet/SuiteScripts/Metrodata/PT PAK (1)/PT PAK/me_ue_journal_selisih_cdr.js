/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
 define(['N/record', 'N/search', './config/me_config.js'], function (record, search, config) {

    function afterSubmit(context) {
        var rec = context.newRecord;

        var loadCurrent = record.load({
            type: 'customtransaction_me_settlmnt_multicr_ar',
            id: rec.id,
        });

        var getFromCurrency = loadCurrent.getValue({
            fieldId: 'custbody_me_cmctf_from_currency'
        });
        var getToCurrency = loadCurrent.getValue({
            fieldId: 'custbody_me_cmctf_to_currency'
        });

        var exchangeRateFrom = loadCurrent.getValue({
            fieldId: 'custbody_me_cmctf_from_acc_exrate'
        });
        var exchangeRateTo = loadCurrent.getValue({
            fieldId: 'custbody_me_cmctf_to_acc_exrate'
        });

        var transClearingFrom = loadCurrent.getValue({
            fieldId: "custbody_me_stmcar_payment_ar_from",
        });

        var getAmountFrom = search.lookupFields({
            type: "customtransaction_me_clearing_deposit",
            id: transClearingFrom,
            columns: ['amount']
        });

        var amountFrom = getAmountFrom.amount;

        var transClearingTo = loadCurrent.getValue({
            fieldId: "custbody_me_stmcar_payment_ar_to",
        });

        var getAmountTo = search.lookupFields({
            type: "customtransaction_me_clearing_deposit",
            id: transClearingTo,
            columns: ['amount']
        });

        var amountTo = getAmountTo.amount;

        var selisih = Math.abs(parseFloat(amountTo).toFixed(0)) - Math.abs(parseFloat(amountFrom).toFixed(0));

        var subsidiary = loadCurrent.getValue({
            fieldId: 'subsidiary'
        });
        var classs = loadCurrent.getValue({
            fieldId: 'class'
        });
        var location = loadCurrent.getValue({
            fieldId: 'location'
        });
        var department = loadCurrent.getValue({
            fieldId: 'department'
        });

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
                var setDebitAccount = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    line: 0,
                    value: config.account.gain_or_loss_kurs_penjualan,
                });

                var setDebitAmount = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'debit',
                    line: 0,
                    value: parseFloat(Math.abs(selisih)).toFixed(2),
                });
                var setDebitDepartment = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    line: 0,
                    value: department,
                });
                var setDebitClass = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    line: 0,
                    value: classs,
                });
                var setDebitLocation = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    line: 0,
                    value: location,
                });
                createJournal.commitLine('line');
                createJournal.selectNewLine('line');

                var setCreditAccount = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    line: 1,
                    value: config.account.ar_clearing,
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
                var setCreditAccount = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    line: 0,
                    value: config.account.gain_or_loss_kurs_penjualan,
                });

                var setCreditAmount = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'credit',
                    line: 0,
                    value: parseFloat(Math.abs(selisih)).toFixed(2),
                });

                var setCreditDepartment = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    line: 0,
                    value: department,
                });
                var setCreditClass = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    line: 0,
                    value: classs,
                });
                var setCreditLocation = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    line: 0,
                    value: location,
                });
                createJournal.commitLine('line');
                createJournal.selectNewLine('line');

                var setDebitAccount = createJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    line: 1,
                    value: config.account.ar_clearing,
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
            })


            if (parseInt(selisih) > 0) {
                var updateJournal = record.load({
                    type: 'journalentry',
                    id: getJournalId,
                    isDynamic: true,
                });

                // var setCurrency = updateJournal.setValue({
                //     fieldId: 'currency',
                //     value: 1
                // });
                // var setSubsidiary = updateJournal.setValue({
                //     fieldId: 'subsidiary',
                //     value: subsidiary
                // });
                // var setStatus = updateJournal.setValue({
                //     fieldId: 'approvalstatus',
                //     value: 2
                // });

                updateJournal.selectLine('line', 0);
                var setDebitAccount = updateJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    line: 1,
                    value: config.account.gain_or_loss_kurs_penjualan,
                });

                var setDebitAmount = updateJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'debit',
                    line: 1,
                    value: parseFloat(Math.abs(selisih)).toFixed(2),
                });
                var setDebitDepartment = updateJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    line: 1,
                    value: department,
                });
                var setDebitClass = updateJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    line: 1,
                    value: classs,
                });
                var setDebitLocation = updateJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    line: 1,
                    value: location,
                });
                updateJournal.commitLine('line');
                updateJournal.selectLine('line', 1);

                var setCreditAccount = updateJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    line: 2,
                    value: config.account.ar_clearing,
                });
                var setCreditAmount = updateJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'credit',
                    line: 2,
                    value: parseFloat(Math.abs(selisih)).toFixed(2),
                });
                var setCreditDepartment = updateJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    line: 2,
                    value: department,
                });
                var setCreditClass = updateJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    line: 2,
                    value: classs,
                });
                var setCreditLocation = updateJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    line: 2,
                    value: location,
                });
                updateJournal.commitLine('line');
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
            if (parseInt(selisih) < 0) {
                var updateJournal = record.load({
                    type: 'journalentry',
                    id: getJournalId,
                });

                // var setSubsidiary = updateJournal.setValue({
                //     fieldId: 'subsidiary',
                //     value: subsidiary
                // });

                // var setStatus = updateJournal.setValue({
                //     fieldId: 'approvalstatus',
                //     value: 2
                // });

                updateJournal.selectLine('line', 0);
                var setCreditAccount = updateJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    line: 1,
                    value: config.account.gain_or_loss_kurs_penjualan,
                });

                var setCreditAmount = updateJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'credit',
                    line: 1,
                    value: parseFloat(Math.abs(selisih)).toFixed(2),
                });

                var setCreditDepartment = updateJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    line: 1,
                    value: department,
                });
                var setCreditClass = updateJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    line: 1,
                    value: classs,
                });
                var setCreditLocation = updateJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    line: 1,
                    value: location,
                });
                updateJournal.commitLine('line');
                updateJournal.selectLine('line', 1);

                var setDebitAccount = updateJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'account',
                    line: 2,
                    value: config.account.ar_clearing,
                });
                var setDebitAmount = updateJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'debit',
                    line: 2,
                    value: parseFloat(Math.abs(selisih)).toFixed(2),
                });
                var setDebitDepartment = updateJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'department',
                    line: 2,
                    value: department,
                });
                var setDebitClass = updateJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'class',
                    line: 2,
                    value: classs,
                });
                var setDebitLocation = updateJournal.setCurrentSublistValue({
                    sublistId: 'line',
                    fieldId: 'location',
                    line: 2,
                    value: location,
                });
                updateJournal.commitLine('line');
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
        // var savePaymentBill = loadCurrent.save();


        // }
        // if (context.type == context.UserEventType.UPDATE) {
        //     log.debug("masuk ke create journal", "Update")
        //     var rec_CMCAP = record.load({
        //         type: FLD_MAP.id,
        //         id: rec_id
        //     })

        //     var getFromExRate = rec_CMCAP.getValue({
        //         fieldId: 'exchangerate'
        //     });

        //     var getLinePaymentMulticurr = rec_CMCAP.getLineCount('line');
        //     var totalBalanceMc = 0;

        //     for (let i = 0; i < getLinePaymentMulticurr; i++) {
        //         var getDebitValue = rec_CMCAP.getSublistValue({
        //             sublistId: 'line',
        //             fieldId: 'debit',
        //             line: i,
        //         })
        //         if (getDebitValue) {
        //             totalBalanceMc += Number(Math.abs(getDebitValue));
        //         }
        //     }

        //     var convertToIdr = Number(totalBalanceMc) * Number(getFromExRate);

        //     var setFromAccIdrBalance = rec_CMCAP.setValue({
        //         fieldId: 'custbody_me_cmctf_from_acc_idr_balance',
        //         value: convertToIdr,
        //     });

        //     var getBillPaymentClearing = rec_CMCAP.getValue({
        //         fieldId: 'custbody_me_cmcap_bp_id',
        //     });

        //     // var loadBillPayment = record.load({
        //     //     type: record.Type.VENDOR_PAYMENT,
        //     //     id: getBillPaymentClearing,
        //     // });

        //     // var totalAmountPaid = loadBillPayment.getValue({
        //     //     fieldId: 'total',
        //     // });

        //     // var getToExRate = loadBillPayment.getValue({
        //     //     fieldId: 'exchangerate',
        //     // });

        //     // var convertToIdrPayment = Number(totalAmountPaid) * Number(getToExRate);

        //     // var setAccToIdrAmount = loadBillPayment.setValue({
        //     //     fieldId: 'custbody_me_cmctf_to_acc_idr_balance',
        //     //     value: convertToIdrPayment
        //     // });

        //     // var selisih = parseFloat(convertToIdrPayment).toFixed(0) - parseFloat(convertToIdr).toFixed(0);

        //     // var journalSelisihTo = loadBillPayment.setValue({
        //     //     fieldId: 'custbody_me_selisih_amount_ap_payment',
        //     //     value: parseFloat(selisih).toFixed(2),
        //     // });
        //     // var journalSelisihTo = rec_CMCAP.setValue({
        //     //     fieldId: 'custbody_me_selisih_amount_ap_payment',
        //     //     value: parseFloat(selisih).toFixed(2),
        //     // });

        //     var subsidiary = rec_CMCAP.getValue({
        //         fieldId: 'subsidiary'
        //     });
        //     var department = rec_CMCAP.getValue({
        //         fieldId: 'department'
        //     });
        //     var classs = rec_CMCAP.getValue({
        //         fieldId: 'class'
        //     });
        //     var location = rec_CMCAP.getValue({
        //         fieldId: 'location'
        //     });
        //     var billPaymentId = rec_CMCAP.getValue({
        //         fieldId: 'custbody_me_cmcap_bp_id'
        //     });

        //     if (parseInt(selisih) > 0) {
        //         var updateJournal = record.load({
        //             type: record.Type.JOURNAL_ENTRY,
        //             id: billPaymentId,
        //             isDynamic: true
        //         });

        //         // var setCurrency = updateJournal.setValue({
        //         //     fieldId: 'currency',
        //         //     value: 1
        //         // });
        //         var setSubsidiary = updateJournal.setValue({
        //             fieldId: 'subsidiary',
        //             value: subsidiary
        //         });
        //         var setStatus = updateJournal.setValue({
        //             fieldId: 'approvalstatus',
        //             value: 2
        //         });

        //         updateJournal.selectNewLine('line');
        //         var setCreditAccount = updateJournal.setCurrentSublistValue({
        //             sublistId: 'line',
        //             fieldId: 'account',
        //             line: 1,
        //             value: 4463
        //         });

        //         var setCreditAmount = updateJournal.setCurrentSublistValue({
        //             sublistId: 'line',
        //             fieldId: 'credit',
        //             line: 1,
        //             value: parseFloat(Math.abs(selisih)).toFixed(2),
        //         });
        //         var setCreditDepartment = updateJournal.setCurrentSublistValue({
        //             sublistId: 'line',
        //             fieldId: 'department',
        //             line: 1,
        //             value: department,
        //         });
        //         var setCreditClass = updateJournal.setCurrentSublistValue({
        //             sublistId: 'line',
        //             fieldId: 'class',
        //             line: 1,
        //             value: classs,
        //         });
        //         var setCreditLocation = updateJournal.setCurrentSublistValue({
        //             sublistId: 'line',
        //             fieldId: 'location',
        //             line: 1,
        //             value: location,
        //         });
        //         updateJournal.commitLine('line');
        //         updateJournal.selectNewLine('line');
        //         if (subsidiary == config.subsidiary.pak) {
        //             var setDebitAccount = updateJournal.setCurrentSublistValue({
        //                 sublistId: 'line',
        //                 fieldId: 'account',
        //                 line: 2,
        //                 value: 1018
        //             });
        //             var setDebitAmount = updateJournal.setCurrentSublistValue({
        //                 sublistId: 'line',
        //                 fieldId: 'debit',
        //                 line: 2,
        //                 value: parseFloat(Math.abs(selisih)).toFixed(2),
        //             });
        //             var setDebitDepartment = updateJournal.setCurrentSublistValue({
        //                 sublistId: 'line',
        //                 fieldId: 'department',
        //                 line: 2,
        //                 value: department,
        //             });
        //             var setDebitClass = updateJournal.setCurrentSublistValue({
        //                 sublistId: 'line',
        //                 fieldId: 'class',
        //                 line: 2,
        //                 value: classs,
        //             });
        //             var setDebitLocation = updateJournal.setCurrentSublistValue({
        //                 sublistId: 'line',
        //                 fieldId: 'location',
        //                 line: 2,
        //                 value: location,
        //             });
        //         }
        //         if (subsidiary == config.subsidiary.bak) {
        //             var setDebitAccount = updateJournal.setCurrentSublistValue({
        //                 sublistId: 'line',
        //                 fieldId: 'account',
        //                 line: 2,
        //                 value: 399
        //             });
        //             var setDebitAmount = updateJournal.setCurrentSublistValue({
        //                 sublistId: 'line',
        //                 fieldId: 'debit',
        //                 line: 2,
        //                 value: parseFloat(Math.abs(selisih)).toFixed(2),
        //             });
        //             var setDebitDepartment = updateJournal.setCurrentSublistValue({
        //                 sublistId: 'line',
        //                 fieldId: 'department',
        //                 line: 2,
        //                 value: department,
        //             });
        //             var setDebitClass = updateJournal.setCurrentSublistValue({
        //                 sublistId: 'line',
        //                 fieldId: 'class',
        //                 line: 2,
        //                 value: classs,
        //             });
        //             var setDebitLocation = updateJournal.setCurrentSublistValue({
        //                 sublistId: 'line',
        //                 fieldId: 'location',
        //                 line: 2,
        //                 value: location,
        //             });
        //         }
        //         updateJournal.commitLine('line');
        //         var saveJournal = updateJournal.save();

        //         // var setJournal = rec_CMCAP.setValue({
        //         //     fieldId: 'custbody_me_journal_selisih_ap_payment',
        //         //     value: saveJournal,
        //         // })
        //         // var setJournalLearing = loadBillPayment.setValue({
        //         //     fieldId: 'custbody_me_journal_selisih_vend_payme',
        //         //     value: saveJournal,
        //         // })

        //     }
        //     if (parseInt(selisih) < 0) {
        //         var updateJournal = record.create({
        //             type: record.Type.JOURNAL_ENTRY,
        //             isDynamic: true
        //         });

        //         var setSubsidiary = updateJournal.setValue({
        //             fieldId: 'subsidiary',
        //             value: subsidiary
        //         });

        //         var setStatus = updateJournal.setValue({
        //             fieldId: 'approvalstatus',
        //             value: 2
        //         });

        //         updateJournal.selectNewLine('line');
        //         var setDebitAccount = updateJournal.setCurrentSublistValue({
        //             sublistId: 'line',
        //             fieldId: 'account',
        //             line: 1,
        //             value: 4463
        //         });

        //         var setDebitAmount = updateJournal.setCurrentSublistValue({
        //             sublistId: 'line',
        //             fieldId: 'debit',
        //             line: 1,
        //             value: parseFloat(Math.abs(selisih)).toFixed(2),
        //         });

        //         var setDebitDepartment = updateJournal.setCurrentSublistValue({
        //             sublistId: 'line',
        //             fieldId: 'department',
        //             line: 1,
        //             value: department,
        //         });
        //         var setDebitClass = updateJournal.setCurrentSublistValue({
        //             sublistId: 'line',
        //             fieldId: 'class',
        //             line: 1,
        //             value: classs,
        //         });
        //         var setDebitLocation = updateJournal.setCurrentSublistValue({
        //             sublistId: 'line',
        //             fieldId: 'location',
        //             line: 1,
        //             value: location,
        //         });
        //         updateJournal.commitLine('line');
        //         updateJournal.selectNewLine('line');
        //         if (subsidiary == config.subsidiary.pak) {
        //             var setCreditAccount = updateJournal.setCurrentSublistValue({
        //                 sublistId: 'line',
        //                 fieldId: 'account',
        //                 line: 2,
        //                 value: 1018
        //             });
        //             var setCreditAmount = updateJournal.setCurrentSublistValue({
        //                 sublistId: 'line',
        //                 fieldId: 'credit',
        //                 line: 2,
        //                 value: parseFloat(Math.abs(selisih)).toFixed(2),
        //             });
        //             var setCreditDepartment = updateJournal.setCurrentSublistValue({
        //                 sublistId: 'line',
        //                 fieldId: 'department',
        //                 line: 2,
        //                 value: department,
        //             });
        //             var setCreditClass = updateJournal.setCurrentSublistValue({
        //                 sublistId: 'line',
        //                 fieldId: 'class',
        //                 line: 2,
        //                 value: classs,
        //             });
        //             var setCreditLocation = updateJournal.setCurrentSublistValue({
        //                 sublistId: 'line',
        //                 fieldId: 'location',
        //                 line: 2,
        //                 value: location,
        //             });
        //         }
        //         if (subsidiary == config.subsidiary.bak) {
        //             var setCreditAccount = updateJournal.setCurrentSublistValue({
        //                 sublistId: 'line',
        //                 fieldId: 'account',
        //                 line: 2,
        //                 value: 399
        //             });
        //             var setCreditAmount = updateJournal.setCurrentSublistValue({
        //                 sublistId: 'line',
        //                 fieldId: 'credit',
        //                 line: 2,
        //                 value: parseFloat(Math.abs(selisih)).toFixed(2),
        //             });
        //             var setCreditDepartment = updateJournal.setCurrentSublistValue({
        //                 sublistId: 'line',
        //                 fieldId: 'department',
        //                 line: 2,
        //                 value: department,
        //             });
        //             var setCreditClass = updateJournal.setCurrentSublistValue({
        //                 sublistId: 'line',
        //                 fieldId: 'class',
        //                 line: 2,
        //                 value: classs,
        //             });
        //             var setCreditLocation = updateJournal.setCurrentSublistValue({
        //                 sublistId: 'line',
        //                 fieldId: 'location',
        //                 line: 2,
        //                 value: location,
        //             });
        //         }
        //         updateJournal.commitLine('line');
        //         var saveJournal = updateJournal.save();

        //         // var setJournal = rec_CMCAP.setValue({
        //         //     fieldId: 'custbody_me_journal_selisih_ap_payment',
        //         //     value: saveJournal,
        //         // })
        //         // var setJournalLearing = loadBillPayment.setValue({
        //         //     fieldId: 'custbody_me_journal_selisih_vend_payme',
        //         //     value: saveJournal,
        //         // })

        //     }
        //     var saveMcBill = loadCurrent.save();
        //     // var savePaymentBill = loadBillPayment.save();


        // }
    }

    return {
        afterSubmit: afterSubmit
    }
});
