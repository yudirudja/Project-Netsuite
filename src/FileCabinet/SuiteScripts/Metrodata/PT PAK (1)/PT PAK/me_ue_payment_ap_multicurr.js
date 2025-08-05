/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
 define(['N/record'], function (record) {

    // function beforeSubmit(context) {


    // }

    function afterSubmit(context) {
        var rec = context.newRecord;

        var loadCurrent = record.load({
            type: 'customtransaction_me_multicur_invoice_ap',
            id: rec.id,
        });

        var getCurrency = loadCurrent.getValue({
            fieldId: 'currency'
        });

        var exchangeRate = loadCurrent.getValue({
            fieldId: 'exchangerate'
        });

        var getSubsidiary = loadCurrent.getValue({
            fieldId: 'subsidiary'
        });
        var getClass = loadCurrent.getValue({
            fieldId: 'class'
        });
        var getLocation = loadCurrent.getValue({
            fieldId: 'location'
        });
        var getDepartment = loadCurrent.getValue({
            fieldId: 'department'
        });

        var lineCount = loadCurrent.getLineCount('line');

        for (let i = 0; i < lineCount; i++) {
            var getDebit = loadCurrent.getSublistValue({
                sublistId: 'line',
                fieldId: 'debit',
              line: i
            });
            if (getDebit != "") {
                if (getCurrency == 1) {
                    // var convertIdr = Number(Math.abs(getDebit)) * Number(exchangeRate);
                    var getVendPayment = loadCurrent.getValue({
                        fieldId: 'custbody_me_cmcap_bp_id',
                    });
                    if(getVendPayment){
                        var loadVendPayment = record.load({
                            type: record.Type.VENDOR_PAYMENT,
                            id: getVendPayment,
                        });
    
                        var totalApplied = 0;
    
                        var currencyVendBill = loadVendPayment.getValue({
                            fieldId: 'currency'
                        });
    
                        var vendorBillRate = loadVendPayment.getValue({
                            fieldId: 'exchangerate'
                        });
    
                        var lineCountVendPayment = loadVendPayment.getLineCount('apply');
    
                        for (let x = 0; x < lineCountVendPayment; x++) {
    
                            var payment = loadVendPayment.getSublistValue({
                                sublstId: 'apply',
                                fieldId: 'amount',
                            });
                            totalApplied += Number(payment);
                        }
                        if (currencyVendBill != 1) {
                            var convertIdrVendBil = Number(Math.abs(payment)) * Number(vendorBillRate);
                            var selisihFromTo = Number(convertIdrVendBil) - Number(getDebit);

                            log.debug("selisihFromTo", selisihFromTo);
    
                            if (parseInt(selisihFromTo) == 0) {
                                continue;
                            } else {
                                if (parseInt(selisihFromTo) > 0) {
                                    var createJournal = record.create({
                                        type: record.Type.JOURNAL_ENTRY,
                                        isDynamic: true
                                    });
        
                                    var setSubsidiary = createJournal.setValue({
                                        fieldId: 'subsidiary',
                                        value: getSubsidiary
                                    });
        
                                    createJournal.selectNewLine('line');
                                    var setDebitAccount = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'account',
                                        line: 1,
                                        value: 4463
                                    });
        
                                    var setDebitAmount = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'debit',
                                        line: 1,
                                        value: parseFloat(selisih).toFixed(2),
                                    });
                                    var setDebitDepartment = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'department',
                                        line: 1,
                                        value: getDepartment,
                                    });
                                    var setDebitClass = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'class',
                                        line: 1,
                                        value: getClass,
                                    });
                                    var setDebitLocation = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'location',
                                        line: 1,
                                        value: getLocation,
                                    });
                                    createJournal.commitLine('line');
                                    createJournal.selectNewLine('line');
                                    if (getSubsidiary == 3) {
                                        var setCreditAccount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'account',
                                            line: 2,
                                            value: 1018
                                        });
                                        var setCreditAmount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'credit',
                                            line: 2,
                                            value: parseFloat(selisih).toFixed(2),
                                        });
                                        var setCreditDepartment = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'department',
                                            line: 2,
                                            value: getDepartment,
                                        });
                                        var setCreditClass = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'class',
                                            line: 2,
                                            value: getClass,
                                        });
                                        var setCreditLocation = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'location',
                                            line: 2,
                                            value: getLocation,
                                        });
                                    }
                                    if (getSubsidiary == 2) {
                                        var setCreditAccount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'account',
                                            line: 2,
                                            value: 1399
                                        });
                                        var setCreditAmount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'credit',
                                            line: 2,
                                            value: parseFloat(selisih).toFixed(2),
                                        });
                                        var setCreditDepartment = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'department',
                                            line: 2,
                                            value: getDepartment,
                                        });
                                        var setCreditClass = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'class',
                                            line: 2,
                                            value: getClass,
                                        });
                                        var setCreditLocation = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'location',
                                            line: 2,
                                            value: getLocation,
                                        });
                                    }
                                    createJournal.commitLine('line');
                                    var saveJournal = createJournal.save();
        
                                    var setJournal = rec.setValue({
                                        fieldId: 'custrecord_me_cmtf_journal_selisih',
                                        value: saveJournal,
                                    })
                                    var setJournalVendBill = loadVendPayment.setValue({
                                        fieldId: 'custbody_me_journal_selisih_vend_payme',
                                        value: saveJournal,
                                    });
                                }
                                if (parseInt(selisihFromTo) < 0) {
                                    var createJournal = record.create({
                                        type: record.Type.JOURNAL_ENTRY,
                                        isDynamic: true
                                    });
        
                                    var setSubsidiary = createJournal.setValue({
                                        fieldId: 'subsidiary',
                                        value: getSubsidiary
                                    });
        
                                    createJournal.selectNewLine('line');
                                    var setDebitAccount = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'account',
                                        line: 1,
                                        value: 4463
                                    });
        
                                    var setDebitAmount = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'debit',
                                        line: 1,
                                        value: parseFloat(selisih).toFixed(2),
                                    });
        
                                    var setDebitDepartment = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'department',
                                        line: 1,
                                        value: getDepartment,
                                    });
                                    var setDebitClass = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'class',
                                        line: 1,
                                        value: getClass,
                                    });
                                    var setDebitLocation = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'location',
                                        line: 1,
                                        value: getLocation,
                                    });
                                    createJournal.commitLine('line');
                                    createJournal.selectNewLine('line');
                                    if (getSubsidiary == 3) {
                                        var setCreditAccount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'account',
                                            line: 2,
                                            value: 1018
                                        });
                                        var setCreditAmount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'credit',
                                            line: 2,
                                            value: parseFloat(selisih).toFixed(2),
                                        });
                                        var setCreditDepartment = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'department',
                                            line: 2,
                                            value: getDepartment,
                                        });
                                        var setCreditClass = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'class',
                                            line: 2,
                                            value: getClass,
                                        });
                                        var setCreditLocation = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'location',
                                            line: 2,
                                            value: getLocation,
                                        });
                                    }
                                    if (getSubsidiary == 2) {
                                        var setCreditAccount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'account',
                                            line: 2,
                                            value: 1399
                                        });
                                        var setCreditAmount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'credit',
                                            line: 2,
                                            value: parseFloat(selisih).toFixed(2),
                                        });
                                        var setCreditDepartment = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'department',
                                            line: 2,
                                            value: getDepartment,
                                        });
                                        var setCreditClass = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'class',
                                            line: 2,
                                            value: getClass,
                                        });
                                        var setCreditLocation = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'location',
                                            line: 2,
                                            value: getLocation,
                                        });
                                    }
                                    createJournal.commitLine('line');
                                    var saveJournal = createJournal.save();
        
                                    var setJournal = rec.setValue({
                                        fieldId: 'custbody_me_journal_selisih_ap_payment',
                                        value: saveJournal,
                                    })
                                    var setJournalVendBill = loadVendPayment.setValue({
                                        fieldId: 'custbody_me_journal_selisih_vend_payme',
                                        value: saveJournal,
                                    });
                                }
                                
                            }

                        }
                        if (currencyVendBill == 1) {
                            var convertIdrVendBil = Number(Math.abs(payment));
                            var selisihFromTo = Number(convertIdrVendBil) - Number(getDebit);
    
                            if (parseInt(selisihFromTo) == 0) {
                                continue;
                            } else {
                                if (parseInt(selisihFromTo) > 0) {
                                    var createJournal = record.create({
                                        type: record.Type.JOURNAL_ENTRY,
                                        isDynamic: true
                                    });
        
                                    var setSubsidiary = createJournal.setValue({
                                        fieldId: 'subsidiary',
                                        value: getSubsidiary
                                    });
        
                                    createJournal.selectNewLine('line');
                                    var setDebitAccount = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'account',
                                        line: 1,
                                        value: 4463
                                    });
        
                                    var setDebitAmount = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'debit',
                                        line: 1,
                                        value: parseFloat(selisih).toFixed(2),
                                    });
                                    var setDebitDepartment = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'department',
                                        line: 1,
                                        value: getDepartment,
                                    });
                                    var setDebitClass = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'class',
                                        line: 1,
                                        value: getClass,
                                    });
                                    var setDebitLocation = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'location',
                                        line: 1,
                                        value: getLocation,
                                    });
                                    createJournal.commitLine('line');
                                    createJournal.selectNewLine('line');
                                    if (getSubsidiary == 3) {
                                        var setCreditAccount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'account',
                                            line: 2,
                                            value: 1018
                                        });
                                        var setCreditAmount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'credit',
                                            line: 2,
                                            value: parseFloat(selisih).toFixed(2),
                                        });
                                        var setCreditDepartment = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'department',
                                            line: 2,
                                            value: getDepartment,
                                        });
                                        var setCreditClass = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'class',
                                            line: 2,
                                            value: getClass,
                                        });
                                        var setCreditLocation = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'location',
                                            line: 2,
                                            value: getLocation,
                                        });
                                    }
                                    if (getSubsidiary == 2) {
                                        var setCreditAccount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'account',
                                            line: 2,
                                            value: 1399
                                        });
                                        var setCreditAmount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'credit',
                                            line: 2,
                                            value: parseFloat(selisih).toFixed(2),
                                        });
                                        var setCreditDepartment = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'department',
                                            line: 2,
                                            value: getDepartment,
                                        });
                                        var setCreditClass = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'class',
                                            line: 2,
                                            value: getClass,
                                        });
                                        var setCreditLocation = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'location',
                                            line: 2,
                                            value: getLocation,
                                        });
                                    }
                                    createJournal.commitLine('line');
                                    var saveJournal = createJournal.save();
        
                                    var setJournal = rec.setValue({
                                        fieldId: 'custrecord_me_cmtf_journal_selisih',
                                        value: saveJournal,
                                    })
                                    var setJournalVendBill = loadVendPayment.setValue({
                                        fieldId: 'custbody_me_journal_selisih_vend_payme',
                                        value: saveJournal,
                                    });
                                }
                                if (parseInt(selisihFromTo) < 0) {
                                    var createJournal = record.create({
                                        type: record.Type.JOURNAL_ENTRY,
                                        isDynamic: true
                                    });
        
                                    var setSubsidiary = createJournal.setValue({
                                        fieldId: 'subsidiary',
                                        value: getSubsidiary
                                    });
        
                                    createJournal.selectNewLine('line');
                                    var setDebitAccount = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'account',
                                        line: 1,
                                        value: 4463
                                    });
        
                                    var setDebitAmount = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'credit',
                                        line: 1,
                                        value: parseFloat(selisih).toFixed(2),
                                    });
        
                                    var setDebitDepartment = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'department',
                                        line: 1,
                                        value: getDepartment,
                                    });
                                    var setDebitClass = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'class',
                                        line: 1,
                                        value: getClass,
                                    });
                                    var setDebitLocation = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'location',
                                        line: 1,
                                        value: getLocation,
                                    });
                                    createJournal.commitLine('line');
                                    createJournal.selectNewLine('line');
                                    if (getSubsidiary == 3) {
                                        var setCreditAccount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'account',
                                            line: 2,
                                            value: 1018
                                        });
                                        var setCreditAmount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'debit',
                                            line: 2,
                                            value: parseFloat(selisih).toFixed(2),
                                        });
                                        var setCreditDepartment = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'department',
                                            line: 2,
                                            value: getDepartment,
                                        });
                                        var setCreditClass = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'class',
                                            line: 2,
                                            value: getClass,
                                        });
                                        var setCreditLocation = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'location',
                                            line: 2,
                                            value: getLocation,
                                        });
                                    }
                                    if (getSubsidiary == 2) {
                                        var setCreditAccount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'account',
                                            line: 2,
                                            value: 1399
                                        });
                                        var setCreditAmount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'debit',
                                            line: 2,
                                            value: parseFloat(selisih).toFixed(2),
                                        });
                                        var setCreditDepartment = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'department',
                                            line: 2,
                                            value: getDepartment,
                                        });
                                        var setCreditClass = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'class',
                                            line: 2,
                                            value: getClass,
                                        });
                                        var setCreditLocation = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'location',
                                            line: 2,
                                            value: getLocation,
                                        });
                                    }
                                    createJournal.commitLine('line');
                                    var saveJournal = createJournal.save();
        
                                    var setJournal = rec.setValue({
                                        fieldId: 'custbody_me_journal_selisih_ap_payment',
                                        value: saveJournal,
                                    })
                                    var setJournalVendBill = loadVendPayment.setValue({
                                        fieldId: 'custbody_me_journal_selisih_vend_payme',
                                        value: saveJournal,
                                    });
                                }
                                
                            }

                        }
                    }

                }
                if (getCurrency != 1) {
                    var convertIdr = Number(Math.abs(getDebit)) * Number(exchangeRate);
                    var getVendPayment = loadCurrent.getValue({
                        fieldId: 'custbody_me_cmcap_bp_id',
                    });
                    if(getVendPayment){
                        var loadVendPayment = record.load({
                            type: record.Type.VENDOR_PAYMENT,
                            id: getVendPayment,
                        });
    
                        var totalApplied = 0;
    
                        var currencyVendBill = loadVendPayment.getValue({
                            fieldId: 'currency'
                        });
    
                        var vendorBillRate = loadVendPayment.getValue({
                            fieldId: 'exchangerate'
                        });
    
                        var lineCountVendPayment = loadVendPayment.getLineCount('apply');
    
                        for (let x = 0; x < lineCountVendPayment; x++) {
    
                            var payment = loadVendPayment.getSublistValue({
                                sublstId: 'apply',
                                fieldId: 'amount',
                            });
                            totalApplied += Number(payment);
                        }
                        if (currencyVendBill != 1) {
                            var convertIdrVendBil = Number(Math.abs(payment)) * Number(vendorBillRate);
                            var selisihFromTo = Number(convertIdrVendBil) - Number(convertIdr);
    
                            if (parseInt(selisihFromTo) == 0) {
                                continue;
                            }else{
                                if (parseInt(selisihFromTo) > 0) {
                                    var createJournal = record.create({
                                        type: record.Type.JOURNAL_ENTRY,
                                        isDynamic: true
                                    });
        
                                    var setSubsidiary = createJournal.setValue({
                                        fieldId: 'subsidiary',
                                        value: getSubsidiary
                                    });
        
                                    createJournal.selectNewLine('line');
                                    var setDebitAccount = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'account',
                                        line: 1,
                                        value: 4463
                                    });
        
                                    var setDebitAmount = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'debit',
                                        line: 1,
                                        value: parseFloat(selisih).toFixed(2),
                                    });
                                    var setDebitDepartment = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'department',
                                        line: 1,
                                        value: getDepartment,
                                    });
                                    var setDebitClass = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'class',
                                        line: 1,
                                        value: getClass,
                                    });
                                    var setDebitLocation = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'location',
                                        line: 1,
                                        value: getLocation,
                                    });
                                    createJournal.commitLine('line');
                                    createJournal.selectNewLine('line');
                                    if (getSubsidiary == 3) {
                                        var setCreditAccount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'account',
                                            line: 2,
                                            value: 1018
                                        });
                                        var setCreditAmount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'credit',
                                            line: 2,
                                            value: parseFloat(selisih).toFixed(2),
                                        });
                                        var setCreditDepartment = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'department',
                                            line: 2,
                                            value: getDepartment,
                                        });
                                        var setCreditClass = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'class',
                                            line: 2,
                                            value: getClass,
                                        });
                                        var setCreditLocation = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'location',
                                            line: 2,
                                            value: getLocation,
                                        });
                                    }
                                    if (getSubsidiary == 2) {
                                        var setCreditAccount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'account',
                                            line: 2,
                                            value: 1399
                                        });
                                        var setCreditAmount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'credit',
                                            line: 2,
                                            value: parseFloat(selisih).toFixed(2),
                                        });
                                        var setCreditDepartment = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'department',
                                            line: 2,
                                            value: getDepartment,
                                        });
                                        var setCreditClass = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'class',
                                            line: 2,
                                            value: getClass,
                                        });
                                        var setCreditLocation = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'location',
                                            line: 2,
                                            value: getLocation,
                                        });
                                    }
                                    createJournal.commitLine('line');
                                    var saveJournal = createJournal.save();
        
                                    var setJournal = currentRecord.setValue({
                                        fieldId: 'custrecord_me_cmtf_journal_selisih',
                                        value: saveJournal,
                                    })
                                }
                                if (parseInt(selisihFromTo) < 0) {
                                    var createJournal = record.create({
                                        type: record.Type.JOURNAL_ENTRY,
                                        isDynamic: true
                                    });
        
                                    var setSubsidiary = createJournal.setValue({
                                        fieldId: 'subsidiary',
                                        value: getSubsidiary
                                    });
        
                                    createJournal.selectNewLine('line');
                                    var setDebitAccount = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'account',
                                        line: 1,
                                        value: 4463
                                    });
        
                                    var setDebitAmount = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'credit',
                                        line: 1,
                                        value: parseFloat(selisih).toFixed(2),
                                    });
        
                                    var setDebitDepartment = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'department',
                                        line: 1,
                                        value: getDepartment,
                                    });
                                    var setDebitClass = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'class',
                                        line: 1,
                                        value: getClass,
                                    });
                                    var setDebitLocation = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'location',
                                        line: 1,
                                        value: getLocation,
                                    });
                                    createJournal.commitLine('line');
                                    createJournal.selectNewLine('line');
                                    if (getSubsidiary == 3) {
                                        var setCreditAccount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'account',
                                            line: 2,
                                            value: 1018
                                        });
                                        var setCreditAmount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'debit',
                                            line: 2,
                                            value: parseFloat(selisih).toFixed(2),
                                        });
                                        var setCreditDepartment = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'department',
                                            line: 2,
                                            value: getDepartment,
                                        });
                                        var setCreditClass = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'class',
                                            line: 2,
                                            value: getClass,
                                        });
                                        var setCreditLocation = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'location',
                                            line: 2,
                                            value: getLocation,
                                        });
                                    }
                                    if (getSubsidiary == 2) {
                                        var setCreditAccount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'account',
                                            line: 2,
                                            value: 1399
                                        });
                                        var setCreditAmount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'debit',
                                            line: 2,
                                            value: parseFloat(selisih).toFixed(2),
                                        });
                                        var setCreditDepartment = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'department',
                                            line: 2,
                                            value: getDepartment,
                                        });
                                        var setCreditClass = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'class',
                                            line: 2,
                                            value: getClass,
                                        });
                                        var setCreditLocation = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'location',
                                            line: 2,
                                            value: getLocation,
                                        });
                                    }
                                    createJournal.commitLine('line');
                                    var saveJournal = createJournal.save();
        
                                    var setJournal = currentRecord.setValue({
                                        fieldId: 'custbody_me_journal_selisih_ap_payment',
                                        value: saveJournal,
                                    });
                                    var setJournalVendBill = loadVendPayment.setValue({
                                        fieldId: 'custbody_me_journal_selisih_vend_payme',
                                        value: saveJournal,
                                    });
                                }

                            }
                        }
                        if (currencyVendBill == 1) {
                            var convertIdrVendBil = Number(Math.abs(payment));
                            var selisihFromTo = Number(convertIdrVendBil) - Number(convertIdr);
    
                            if (parseInt(selisihFromTo) == 0) {
                                continue;
                            }else{
                                if (parseInt(selisihFromTo) > 0) {
                                    var createJournal = record.create({
                                        type: record.Type.JOURNAL_ENTRY,
                                        isDynamic: true
                                    });
        
                                    var setSubsidiary = createJournal.setValue({
                                        fieldId: 'subsidiary',
                                        value: getSubsidiary
                                    });
        
                                    createJournal.selectNewLine('line');
                                    var setDebitAccount = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'account',
                                        line: 1,
                                        value: 4463
                                    });
        
                                    var setDebitAmount = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'debit',
                                        line: 1,
                                        value: parseFloat(selisih).toFixed(2),
                                    });
                                    var setDebitDepartment = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'department',
                                        line: 1,
                                        value: getDepartment,
                                    });
                                    var setDebitClass = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'class',
                                        line: 1,
                                        value: getClass,
                                    });
                                    var setDebitLocation = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'location',
                                        line: 1,
                                        value: getLocation,
                                    });
                                    createJournal.commitLine('line');
                                    createJournal.selectNewLine('line');
                                    if (getSubsidiary == 3) {
                                        var setCreditAccount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'account',
                                            line: 2,
                                            value: 1018
                                        });
                                        var setCreditAmount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'credit',
                                            line: 2,
                                            value: parseFloat(selisih).toFixed(2),
                                        });
                                        var setCreditDepartment = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'department',
                                            line: 2,
                                            value: getDepartment,
                                        });
                                        var setCreditClass = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'class',
                                            line: 2,
                                            value: getClass,
                                        });
                                        var setCreditLocation = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'location',
                                            line: 2,
                                            value: getLocation,
                                        });
                                    }
                                    if (getSubsidiary == 2) {
                                        var setCreditAccount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'account',
                                            line: 2,
                                            value: 1399
                                        });
                                        var setCreditAmount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'credit',
                                            line: 2,
                                            value: parseFloat(selisih).toFixed(2),
                                        });
                                        var setCreditDepartment = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'department',
                                            line: 2,
                                            value: getDepartment,
                                        });
                                        var setCreditClass = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'class',
                                            line: 2,
                                            value: getClass,
                                        });
                                        var setCreditLocation = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'location',
                                            line: 2,
                                            value: getLocation,
                                        });
                                    }
                                    createJournal.commitLine('line');
                                    var saveJournal = createJournal.save();
        
                                    var setJournal = currentRecord.setValue({
                                        fieldId: 'custrecord_me_cmtf_journal_selisih',
                                        value: saveJournal,
                                    })
                                }
                                if (parseInt(selisihFromTo) < 0) {
                                    var createJournal = record.create({
                                        type: record.Type.JOURNAL_ENTRY,
                                        isDynamic: true
                                    });
        
                                    var setSubsidiary = createJournal.setValue({
                                        fieldId: 'subsidiary',
                                        value: getSubsidiary
                                    });
        
                                    createJournal.selectNewLine('line');
                                    var setDebitAccount = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'account',
                                        line: 1,
                                        value: 4463
                                    });
        
                                    var setDebitAmount = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'credit',
                                        line: 1,
                                        value: parseFloat(selisih).toFixed(2),
                                    });
        
                                    var setDebitDepartment = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'department',
                                        line: 1,
                                        value: getDepartment,
                                    });
                                    var setDebitClass = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'class',
                                        line: 1,
                                        value: getClass,
                                    });
                                    var setDebitLocation = createJournal.setCurrentSublistValue({
                                        sublistId: 'line',
                                        fieldId: 'location',
                                        line: 1,
                                        value: getLocation,
                                    });
                                    createJournal.commitLine('line');
                                    createJournal.selectNewLine('line');
                                    if (getSubsidiary == 3) {
                                        var setCreditAccount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'account',
                                            line: 2,
                                            value: 1018
                                        });
                                        var setCreditAmount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'debit',
                                            line: 2,
                                            value: parseFloat(selisih).toFixed(2),
                                        });
                                        var setCreditDepartment = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'department',
                                            line: 2,
                                            value: getDepartment,
                                        });
                                        var setCreditClass = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'class',
                                            line: 2,
                                            value: getClass,
                                        });
                                        var setCreditLocation = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'location',
                                            line: 2,
                                            value: getLocation,
                                        });
                                    }
                                    if (getSubsidiary == 2) {
                                        var setCreditAccount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'account',
                                            line: 2,
                                            value: 1399
                                        });
                                        var setCreditAmount = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'debit',
                                            line: 2,
                                            value: parseFloat(selisih).toFixed(2),
                                        });
                                        var setCreditDepartment = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'department',
                                            line: 2,
                                            value: getDepartment,
                                        });
                                        var setCreditClass = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'class',
                                            line: 2,
                                            value: getClass,
                                        });
                                        var setCreditLocation = createJournal.setCurrentSublistValue({
                                            sublistId: 'line',
                                            fieldId: 'location',
                                            line: 2,
                                            value: getLocation,
                                        });
                                    }
                                    createJournal.commitLine('line');
                                    var saveJournal = createJournal.save();
        
                                    var setJournal = rec.setValue({
                                        fieldId: 'custbody_me_journal_selisih_ap_payment',
                                        value: saveJournal,
                                    });
                                    var setJournalVendBill = loadVendPayment.setValue({
                                        fieldId: 'custbody_me_journal_selisih_vend_payme',
                                        value: saveJournal,
                                    });
                                }

                            }
                        }

                    }
                }
            }

        }
    }

    return {
        // beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit,
    }
});
