/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
 define(['N/search', 'N/record', 'N/currency', './library/moment.min.js'], function (search, record, currency, moment) {

    const DATA = {
        prepayment_checks: 'custpage_prepayment_checks',
        prepayment_currency: 'custpage_prepayment_currency',
        prepayment_vendor: 'custpage_prepayment_vendor',
        prepayment_vendor_outstanding: 'custpage_prepayment_outstanding',

        settlement_foreign_to_foreign_exchange: 'custpage_settlement_foreign_to_foreign_exchange',
        settlement_clearing_transaction_1: 'custpage_settlement_clearing_transaction_1',
        settlement_exrate_pum_to_idr: 'custpage_settlement_exrate_pum_to_idr',
        settlement_currency: 'custpage_settlement_currency',
        settlement_clearing_transaction_2: 'custpage_settlement_clearing_transaction_2',
        settlement_account_ap: 'custpage_settlement_account_ap',
        settlement_date: 'custpage_settlement_date',
        settlement_exrate_settle_to_idr: 'custpage_settlement_exrate_settle_to_idr',
        settlement_transaction: 'custpage_settlement_transaction',

        classification_subsidiary: 'custpage_classification_subsidiary',
        classification_department: 'custpage_classification_department',
        classification_location: 'custpage_classification_location',
        classification_class: 'custpage_classification_class',

        sublist: 'custpage_sublist',
        sublist_checkbox: '_sublist_checkbox',
        sublist_vendor: '_sublist_vendor',
        sublist_bill_date: '_sublist_bill_date',
        sublist_bill_number: '_sublist_bill_number',
        sublist_bill_currency: '_sublist_bill_currency',
        sublist_bill_origin_amount: '_sublist_origin_amount',
        sublist_bill_outstanding_amount: '_sublist_outstanding_amount',
        sublist_prepayment_amount: '_sublist_prepayment_amount',
        sublist_prepayment_amount_idr: '_sublist_prepayment_amount_idr',
        sublist_settlement_amount: '_sublist_settlement_amount',
        sublist_settlement_amount_idr: '_sublist_settlement_amount_idr',

    }

    function searchChecks(getVendorValue) {
        var data = [];
        var filter = [
            ["type", "anyof", "Check"],
            "AND",
            ["mainline", "is", "T"],
            "AND",
            ["custbody_me_uang_muka", "is", "T"],
            "AND",
            ["vendor.internalid", "anyof", getVendorValue]
        ];
        var searchCheck = search.create({
            type: "check",
            filters: filter,
            columns:
                [
                    search.createColumn({ name: "tranid", label: "Document Number" }),
                    search.createColumn({ name: "internalid", label: "id" }),
                ]
        }).run().getRange({
            start: 0,
            end: 1000,
        });

        for (let i = 0; i < searchCheck.length; i++) {
            var tranidText = searchCheck[i].getValue(searchCheck[i].columns[0]);
            var tranid = searchCheck[i].getValue(searchCheck[i].columns[1]);
            data.push({
                tranid: tranid,
                tranidText: tranidText,
            });
        }
        return data;

    }

    function pageInit(context) {

    }

    function fieldChanged(context) {
        var rec = context.currentRecord;
        var sublistId = context.sublistId;
        var fieldId = context.fieldId;



        console.log("Field ID: " + fieldId + ", sublist:" + sublistId);
        console.log(rec.getValue(fieldId));

        // if (fieldId == DATA.settlement_currency) {
        // var getCurrencySettlement = rec.getText(DATA.settlement_currency);
        // if (getCurrencySettlement.includes("IDR")) {
        //     var setSettlementCurrency = rec.setValue({
        //         fieldId: DATA.settlement_foreign_to_foreign_exchange,
        //         value: 1,
        //         ignoreFieldChange: true,
        //     });
        //     var setFieldSettlementCurrency = rec.getField({
        //         fieldId: DATA.settlement_foreign_to_foreign_exchange,
        //     }).isDisabled = true;
        // }
        // }

        var initialDepAmount = 0
        var getFieldCheck = rec.getField(DATA.prepayment_checks);
        
        if (fieldId == DATA.prepayment_vendor) {
            getFieldCheck.removeSelectOption({ value: null });
            getFieldCheck.isDisabled = false
            var getVendorValue = rec.getValue(DATA.prepayment_vendor);
            var getCheck = searchChecks(getVendorValue);

            getFieldCheck.insertSelectOption({
                value: "",
                text: ''
            });
            for (let i = 0; i < getCheck.length; i++) {
                getFieldCheck.insertSelectOption({
                    value: getCheck[i].tranid,
                    text: getCheck[i].tranidText,
                });

            }
        }


        if (fieldId == DATA.prepayment_checks) {
            var getPrepaymentCheck = rec.getValue(fieldId);

            console.log(fieldId);
            if (getPrepaymentCheck != "") {
                var checkLoad = record.load({
                    type: record.Type.CHECK,
                    id: getPrepaymentCheck,
                });

                var amountUm = Number(checkLoad.getValue('custbody_me_amount_uang_muka') - checkLoad.getValue('custbody_me_settlement_amount'));

                var checkId = checkLoad.getValue('internalid');
                var currencyData = checkLoad.getValue('currency');
                var entityId = checkLoad.getValue('entity');
                var subsidiary = checkLoad.getValue('subsidiary');
                var department = checkLoad.getValue('department');
                var getClass = checkLoad.getValue('class');
                var location = checkLoad.getValue('location');
                var mataUang = checkLoad.getText('currency');

                var ratePUMToIdr = currency.exchangeRate({
                    source: currencyData,
                    target: 1,
                    date: new Date(moment().format('M/D/YYYY'))
                });
                console.log("RATE:" + ratePUMToIdr);

                if (mataUang.includes("IDR")) {
                    var setUmCurrency = rec.setValue({
                        fieldId: DATA.settlement_foreign_to_foreign_exchange,
                        value: 1,
                        ignoreFieldChange: true,
                    });
                    var setFieldUmCurrency = rec.getField({
                        fieldId: DATA.settlement_foreign_to_foreign_exchange,
                    }).isDisabled = true;
                }else{
                    var setFieldUmCurrency = rec.getField({
                        fieldId: DATA.settlement_foreign_to_foreign_exchange,
                    }).isDisabled = false;

                }
                var setCheck = rec.setValue({
                    fieldId: DATA.prepayment_checks,
                    value: getPrepaymentCheck,
                    ignoreFieldChange: true,
                });
                var setPUMToIdr = rec.setValue({
                    fieldId: DATA.settlement_exrate_pum_to_idr,
                    value: ratePUMToIdr,
                    ignoreFieldChange: true,
                });

                var setVendUmCurrency = rec.setValue({
                    fieldId: DATA.prepayment_currency,
                    value: currencyData,
                    ignoreFieldChange: true
                });
                var setVendUmOutstanding = rec.setValue({
                    fieldId: DATA.prepayment_vendor_outstanding,
                    value: amountUm,
                    ignoreFieldChange: true
                });
                var setVendor = rec.setValue({
                    fieldId: DATA.prepayment_vendor,
                    value: entityId,
                    ignoreFieldChange: true
                });
                var setSubsidiaryHeader = rec.setValue({
                    fieldId: DATA.classification_subsidiary,
                    value: subsidiary,
                    ignoreFieldChange: true
                });
                var setDepartmentHeader = rec.setValue({
                    fieldId: DATA.classification_department,
                    value: department,
                    ignoreFieldChange: true
                });
                var setLocationHeader = rec.setValue({
                    fieldId: DATA.classification_location,
                    value: location,
                    ignoreFieldChange: true
                });
                var setClassHeader = rec.setValue({
                    fieldId: DATA.classification_class,
                    value: getClass,
                    ignoreFieldChange: true
                });
            }
        } else {
            var getPrepaymentCheck1 = rec.getValue(DATA.prepayment_checks);
            if (getPrepaymentCheck1 != "") {
                var checkLoad1 = record.load({
                    type: record.Type.CHECK,
                    id: getPrepaymentCheck1,
                });
                var amountUm = checkLoad1.getValue('custbody_me_amount_uang_muka');
                var amountSettle = checkLoad1.getValue('custbody_me_settlement_amount');
                initialDepAmount = amountUm - amountSettle;

            }
        }
        // Set Exchange Rate settlement to IDR
        var getCurrencySettlement = rec.getText(DATA.settlement_currency);
        if (fieldId == DATA.settlement_currency) {
            if (getCurrencySettlement.includes("IDR")) {
                var setSettlementCurrency = rec.setValue({
                    fieldId: DATA.settlement_foreign_to_foreign_exchange,
                    value: 1,
                    ignoreFieldChange: true,
                });
                var setFieldSettlementCurrency = rec.getField({
                    fieldId: DATA.settlement_foreign_to_foreign_exchange,
                }).isDisabled = true;
            } else {
                var setFieldSettlementCurrency = rec.getField({
                    fieldId: DATA.settlement_foreign_to_foreign_exchange,
                }).isDisabled = false;
            }
            var getsettlementCurrency = rec.getValue(DATA.settlement_currency)
            if (getsettlementCurrency != "") {
                var getSettlementCurrency = rec.getValue(DATA.settlement_currency);

                var rateSettleToIdr = currency.exchangeRate({
                    source: getSettlementCurrency,
                    target: 1,
                    date: new Date(moment().format('M/D/YYYY'))
                });
                var setSettleToIdr = rec.setValue({
                    fieldId: DATA.settlement_exrate_settle_to_idr,
                    value: rateSettleToIdr,
                    ignoreFieldChange: true,
                });
            }
        }


        var billPrepayInput = [];
        if (fieldId == DATA.sublist_prepayment_amount) {

            var ratePUMToIdrSub = rec.getValue({
                fieldId: DATA.settlement_exrate_pum_to_idr,
            });
            var rateForeignToForeign = rec.getValue({
                fieldId: DATA.settlement_foreign_to_foreign_exchange,
            });
            var rateSettleToIdrSub = rec.getValue({
                fieldId: DATA.settlement_exrate_settle_to_idr,
            });

            var UangMukaStartAmount = rec.getValue({
                fieldId: DATA.prepayment_vendor_outstanding
            });
            var getBillPrepayAmount = rec.getCurrentSublistValue({
                sublistId: DATA.sublist,
                fieldId: DATA.sublist_prepayment_amount,
            });
            var getBillSettleAmount = rec.getCurrentSublistValue({
                sublistId: DATA.sublist,
                fieldId: DATA.sublist_settlement_amount,
            });

            billPrepayInput.push(getBillPrepayAmount);

            var getCountLineStlmnt = rec.getLineCount(DATA.sublist);

            var totalPrepaymentSublist = 0;

            for (let x = 0; x < getCountLineStlmnt; x++) {
                var getPrepaymentSublist = rec.getSublistValue({
                    sublistId: DATA.sublist,
                    fieldId: DATA.sublist_prepayment_amount,
                    line: x,
                });

                totalPrepaymentSublist += Number(getPrepaymentSublist);
            }

            if (totalPrepaymentSublist > initialDepAmount) {
                rec.setCurrentSublistValue(DATA.sublist, DATA.sublist_prepayment_amount, 0)
                rec.setCurrentSublistValue(DATA.sublist, DATA.sublist_prepayment_amount_idr, 0)
                rec.setCurrentSublistValue(DATA.sublist, DATA.sublist_settlement_amount, 0)
                rec.setCurrentSublistValue(DATA.sublist, DATA.sublist_settlement_amount_idr, 0)
                throw ('Payment should not be more than UM Outstanding Amount!')
            }

            var getCurrPrepayment = rec.getText(DATA.prepayment_currency);
            var getCurrSettlement = rec.getText(DATA.settlement_currency);

            if (UangMukaStartAmount > 0 && !getCurrPrepayment.includes("IDR") && getCurrSettlement.includes("IDR")) {

                console.log(ratePUMToIdrSub + " + " + getBillPrepayAmount);
                rec.setCurrentSublistValue({
                    sublistId: DATA.sublist,
                    fieldId: DATA.sublist_prepayment_amount_idr,
                    value: parseFloat(ratePUMToIdrSub * getBillPrepayAmount).toFixed(2),
                    ignoreFieldChange: true,
                });
                rec.setCurrentSublistValue({
                    sublistId: DATA.sublist,
                    fieldId: DATA.sublist_settlement_amount,
                    value: parseFloat(getBillPrepayAmount * ratePUMToIdrSub).toFixed(2),
                    ignoreFieldChange: true,
                });
                rec.setCurrentSublistValue({
                    sublistId: DATA.sublist,
                    fieldId: DATA.sublist_settlement_amount_idr,
                    value: parseFloat(getBillPrepayAmount * ratePUMToIdrSub).toFixed(2),
                    ignoreFieldChange: true,
                });

                var getCurrentBillBillCurrencySublist = rec.getCurrentSublistValue({
                    sublistId: DATA.sublist,
                    fieldId: DATA.sublist_bill_currency
                })
                var getCurrentBillOriginAmountSublist = rec.getCurrentSublistValue({
                    sublistId: DATA.sublist,
                    fieldId: DATA.sublist_bill_origin_amount
                })
                var getLineOutstandingAMount = rec.getCurrentSublistIndex(DATA.sublist)
                var getCurrentBillOutAmountSublist = rec.getSublistValue({
                    sublistId: DATA.sublist,
                    fieldId: DATA.sublist_bill_outstanding_amount,
                    line: getLineOutstandingAMount,
                })
                var getCurrentSettlementSublist = rec.getCurrentSublistValue({
                    sublistId: DATA.sublist,
                    fieldId: DATA.sublist_settlement_amount,
                })

                console.log(getCurrentSettlementSublist + "___" + getCurrentBillOutAmountSublist + "___" + getCurrentBillOriginAmountSublist + "__" + getCurrentBillBillCurrencySublist);
                if (getCurrentSettlementSublist > getCurrentBillOutAmountSublist) {
                    rec.setCurrentSublistValue(DATA.sublist, DATA.sublist_prepayment_amount, 0)
                    rec.setCurrentSublistValue(DATA.sublist, DATA.sublist_prepayment_amount_idr, 0)
                    rec.setCurrentSublistValue(DATA.sublist, DATA.sublist_settlement_amount, 0)
                    rec.setCurrentSublistValue(DATA.sublist, DATA.sublist_settlement_amount_idr, 0)
                    throw ('Settlement must not be more than Bill Outstanding Amount!')
                }


                var sublistLine = rec.getLineCount(DATA.sublist);
                console.log("sublistLine :" + sublistLine);
                var totalPrepayment = 0;
                for (let j = 0; j < sublistLine; j++) {
                    var getPrepayAmount = rec.getSublistValue({
                        sublistId: DATA.sublist,
                        fieldId: DATA.sublist_prepayment_amount,
                        line: j
                    });
                    totalPrepayment += Number(getPrepayAmount);
                }
                console.log("getPrepayAmount :" + totalPrepayment);

                // rec.setValue({
                //     fieldId: DATA.prepayment_vendor_outstanding,
                //     value: Number(initialDepAmount - totalPrepayment),
                //     ignoreFieldChange: true,
                // });

            }
            if (UangMukaStartAmount > 0 && getCurrPrepayment.includes("IDR") && !getCurrSettlement.includes("IDR")) {

                console.log(ratePUMToIdrSub + " + " + getBillPrepayAmount);
                var setSublistPrepaymentAmountIdr = rec.setCurrentSublistValue({
                    sublistId: DATA.sublist,
                    fieldId: DATA.sublist_prepayment_amount_idr,
                    value: parseFloat(ratePUMToIdrSub * getBillPrepayAmount).toFixed(2),
                    ignoreFieldChange: true,
                });
                var setSublistSettlementAmount = rec.setCurrentSublistValue({
                    sublistId: DATA.sublist,
                    fieldId: DATA.sublist_settlement_amount,
                    value: parseFloat(getBillPrepayAmount / rateSettleToIdrSub).toFixed(2),
                    ignoreFieldChange: true,
                });
                var setSublistSettlementAmountIdr = rec.setCurrentSublistValue({
                    sublistId: DATA.sublist,
                    fieldId: DATA.sublist_settlement_amount_idr,
                    value: parseFloat((getBillPrepayAmount / rateSettleToIdrSub) * rateSettleToIdrSub).toFixed(2),
                    ignoreFieldChange: true,
                });

                var getCurrentBillBillCurrencySublist = rec.getCurrentSublistValue({
                    sublistId: DATA.sublist,
                    fieldId: DATA.sublist_bill_currency
                })
                var getCurrentBillOriginAmountSublist = rec.getCurrentSublistValue({
                    sublistId: DATA.sublist,
                    fieldId: DATA.sublist_bill_origin_amount
                })
                var getLineOutstandingAMount = rec.getCurrentSublistIndex(DATA.sublist)
                var getCurrentBillOutAmountSublist = rec.getSublistValue({
                    sublistId: DATA.sublist,
                    fieldId: DATA.sublist_bill_outstanding_amount,
                    line: getLineOutstandingAMount,
                })
                var getCurrentSettlementSublist = rec.getCurrentSublistValue({
                    sublistId: DATA.sublist,
                    fieldId: DATA.sublist_settlement_amount,
                })

                console.log(getCurrentSettlementSublist + "___" + getCurrentBillOutAmountSublist + "___" + getCurrentBillOriginAmountSublist + "__" + getCurrentBillBillCurrencySublist);
                if (getCurrentSettlementSublist > getCurrentBillOutAmountSublist) {
                    rec.setCurrentSublistValue(DATA.sublist, DATA.sublist_prepayment_amount, 0)
                    rec.setCurrentSublistValue(DATA.sublist, DATA.sublist_prepayment_amount_idr, 0)
                    rec.setCurrentSublistValue(DATA.sublist, DATA.sublist_settlement_amount, 0)
                    rec.setCurrentSublistValue(DATA.sublist, DATA.sublist_settlement_amount_idr, 0)
                    throw ('Settlement must not be more than Bill Outstanding Amount!')
                }


                var sublistLine = rec.getLineCount(DATA.sublist);
                console.log("sublistLine :" + sublistLine);
                var totalPrepayment = 0;
                for (let j = 0; j < sublistLine; j++) {
                    var getPrepayAmount = rec.getSublistValue({
                        sublistId: DATA.sublist,
                        fieldId: DATA.sublist_prepayment_amount,
                        line: j
                    });
                    totalPrepayment += Number(getPrepayAmount);
                }
                console.log("getPrepayAmount :" + totalPrepayment);

                // rec.setValue({
                //     fieldId: DATA.prepayment_vendor_outstanding,
                //     value: Number(initialDepAmount - totalPrepayment),
                //     ignoreFieldChange: true,
                // });
            }

            if (UangMukaStartAmount > 0 && !getCurrPrepayment.includes("IDR") && !getCurrSettlement.includes("IDR")) {

                console.log(ratePUMToIdrSub + " + " + getBillPrepayAmount);
                rec.setCurrentSublistValue({
                    sublistId: DATA.sublist,
                    fieldId: DATA.sublist_prepayment_amount_idr,
                    value: parseFloat(ratePUMToIdrSub * getBillPrepayAmount).toFixed(2),
                    ignoreFieldChange: true,
                });
                rec.setCurrentSublistValue({
                    sublistId: DATA.sublist,
                    fieldId: DATA.sublist_settlement_amount,
                    value: parseFloat(rateForeignToForeign * getBillPrepayAmount).toFixed(2),
                    ignoreFieldChange: true,
                });
                rec.setCurrentSublistValue({
                    sublistId: DATA.sublist,
                    fieldId: DATA.sublist_settlement_amount_idr,
                    value: parseFloat(rateSettleToIdrSub * (rateForeignToForeign * getBillPrepayAmount)).toFixed(2),
                    ignoreFieldChange: true,
                });

                var getCurrentBillBillCurrencySublist = rec.getCurrentSublistValue({
                    sublistId: DATA.sublist,
                    fieldId: DATA.sublist_bill_currency
                })
                var getCurrentBillOriginAmountSublist = rec.getCurrentSublistValue({
                    sublistId: DATA.sublist,
                    fieldId: DATA.sublist_bill_origin_amount
                })
                var getLineOutstandingAMount = rec.getCurrentSublistIndex(DATA.sublist)
                var getCurrentBillOutAmountSublist = rec.getSublistValue({
                    sublistId: DATA.sublist,
                    fieldId: DATA.sublist_bill_outstanding_amount,
                    line: getLineOutstandingAMount,
                })
                var getCurrentSettlementSublist = rec.getCurrentSublistValue({
                    sublistId: DATA.sublist,
                    fieldId: DATA.sublist_settlement_amount,
                })

                console.log(getCurrentSettlementSublist + "___" + getCurrentBillOutAmountSublist + "___" + getCurrentBillOriginAmountSublist + "__" + getCurrentBillBillCurrencySublist);
                if (getCurrentSettlementSublist > getCurrentBillOutAmountSublist) {
                    rec.setCurrentSublistValue(DATA.sublist, DATA.sublist_prepayment_amount, 0)
                    rec.setCurrentSublistValue(DATA.sublist, DATA.sublist_prepayment_amount_idr, 0)
                    rec.setCurrentSublistValue(DATA.sublist, DATA.sublist_settlement_amount, 0)
                    rec.setCurrentSublistValue(DATA.sublist, DATA.sublist_settlement_amount_idr, 0)
                    throw ('Settlement must not be more than Bill Outstanding Amount!')
                }


                var sublistLine = rec.getLineCount(DATA.sublist);
                console.log("sublistLine :" + sublistLine);
                var totalPrepayment = 0;
                for (let j = 0; j < sublistLine; j++) {
                    var getPrepayAmount = rec.getSublistValue({
                        sublistId: DATA.sublist,
                        fieldId: DATA.sublist_prepayment_amount,
                        line: j
                    });
                    totalPrepayment += Number(getPrepayAmount);
                }
                console.log("getPrepayAmount :" + totalPrepayment);

                // rec.setValue({
                //     fieldId: DATA.prepayment_vendor_outstanding,
                //     value: Number(initialDepAmount - totalPrepayment),
                //     ignoreFieldChange: true,
                // });

            }

            // var calculateUangMuka = UangMukaStartAmount - getBillPrepayAmount;
            // UangMukaStartAmount = calculateUangMuka;



        }

    }



    return {
        // pageInit: pageInit,
        fieldChanged: fieldChanged,

    }
});
