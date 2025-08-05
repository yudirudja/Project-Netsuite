/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
 define(['N/search', 'N/ui/serverWidget', 'N/log', 'N/task', 'N/redirect', 'N/url', 'N/format', 'N/record', "N/runtime", 'N/currentRecord', 'N/error'], function (search, serverWidget, log, task, redirect, url, format, record, runtime, currentRecord, error) {


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
        sublist_bill_id: '_sublist_bill_id',
        sublist_vendor: '_sublist_vendor',
        sublist_bill_date: '_sublist_bill_date',
        sublist_bill_number: '_sublist_bill_number',
        sublist_bill_currency: '_sublist_bill_currency',
        sublist_bill_origin_amount: '_sublist_origin_amount',
        sublist_bill_outstanding_amount: '_sublist_outstanding_amount',
        sublist_prepayment_amount: '_sublist_prepayment_amount',
        sublist_prepayment_amount_idr: '_sublist_prepayment_amount_idr',
        sublist_prepayment_currency: '_sublist_prepayment_currency',
        sublist_settlement_amount: '_sublist_settlement_amount',
        sublist_settlement_amount_idr: '_sublist_settlement_amount_idr',
    }

    var FLD_CSTRX = {


        sub_parent: 'recmachcustrecord_me_csrec_stmcap_parent',
        sub_bill_id: 'custrecord_me_csrec_stmcap_bill_id',
        sub_bill_vendor: 'custrecord_me_csrec_stmcap_bill_vendor',
        sub_bill_trandate: 'custrecord_me_csrec_stmcap_bill_trandate',
        sub_bill_currency: 'custrecord_me_csrec_stmcap_bill_currency',
        sub_bill_orig_amt: 'custrecord_me_csrec_stmcap_bill_orig_amt',
        sub_bill_otsdgamt: 'custrecord_me_csrec_stmcap_bill_otsdgamt',
        sub_check_amount: 'custrecord_me_csrec_stmcap_check_amount',
        sub_check_amt_idr: 'custrecord_me_csrec_stmcap_check_amt_idr',
        sub_check_currenc: 'custrecord_me_csrec_stmcap_check_currenc',
        sub_bc_amount: 'custrecord_me_csrec_stmcap_bc_amount',
        sub_bc_amt_idr: 'custrecord_me_csrec_stmcap_bc_amt_idr',
    }

    function searchChecks() {
        var data = [];
        var searchCheck = search.create({
            type: "check",
            filters:
                [
                    ["type", "anyof", "Check"],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["custbody_me_uang_muka", "is", "T"]
                ],
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

    function getParameters(context) {
        var form = serverWidget.createForm({ title: 'Vendor Prepayment/UM Pembelian Settlement Multicurrency' });
        var prepaymentInformation = form.addFieldGroup({
            id: 'prepayment_information',
            label: 'Prepayment Information'
        });
        var settlementInformation = form.addFieldGroup({
            id: 'settlement_information',
            label: 'Settlement Information'
        });
        var classification = form.addFieldGroup({
            id: 'classification',
            label: 'Classification'
        });

        var prepaymentVendor = form.addField({
            id: DATA.prepayment_vendor,
            type: serverWidget.FieldType.SELECT,
            source: -9, // "-9"is to use Entity List(vendors, employee) as Source
            label: 'Vendor',
            container: 'prepayment_information'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.ENTRY,
        });
        prepaymentVendor.isMandatory = true;

        var prepaymentChecks = form.addField({
            id: DATA.prepayment_checks,
            type: serverWidget.FieldType.SELECT,
            label: 'Vendor Prepayment/UM',
            container: 'prepayment_information'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED,
        });
        prepaymentChecks.isMandatory = true
        var getCheck = searchChecks()
        // log.debug("getCheck", getCheck);
        prepaymentChecks.addSelectOption({
            value: "",
            text: "",
        })
        for (let x = 1; x < getCheck.length; x++) {
            prepaymentChecks.addSelectOption({
                value: getCheck[x].tranid,
                text: getCheck[x].tranidText,
            })
        }

        var prepaymentCurrency = form.addField({
            id: DATA.prepayment_currency,
            type: serverWidget.FieldType.SELECT,
            source: 'currency',
            label: 'Vendor Prepayment/UM Currency',
            container: 'prepayment_information'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED,
        });

        var prepaymentOutstanding = form.addField({
            id: DATA.prepayment_vendor_outstanding,
            type: serverWidget.FieldType.FLOAT,
            label: 'Vendor Prepayment/UM Outstanding',
            container: 'prepayment_information'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.DISABLED,
        });

        var settlementExRatePumToIdr = form.addField({
            id: DATA.settlement_exrate_pum_to_idr,
            type: serverWidget.FieldType.FLOAT,
            label: 'Exchange Rate UM to IDR',
            container: 'prepayment_information'
        });
        settlementExRatePumToIdr.isMandatory = true;

        var settlementForeignToForeignEx = form.addField({
            id: DATA.settlement_foreign_to_foreign_exchange,
            type: serverWidget.FieldType.FLOAT,
            label: 'Foreign To Foreign Exchange Rate',
            container: 'settlement_information'
        });
        settlementForeignToForeignEx.isMandatory = true;
        // var settlementClearingTrans1 = form.addField({
        //     id: DATA.settlement_clearing_transaction_1,
        //     type: serverWidget.FieldType.SELECT,
        //     source: 'transaction',
        //     label: 'Clearing Transaction 1',
        //     container: 'settlement_information'
        // });

        var settlementCurrency = form.addField({
            id: DATA.settlement_currency,
            type: serverWidget.FieldType.SELECT,
            source: 'currency',
            label: 'Currency AP',
            container: 'settlement_information'
        });
        settlementCurrency.isMandatory = true;

        // var settelmentClearingTrans2 = form.addField({
        //     id: DATA.settlement_clearing_transaction_2,
        //     type: serverWidget.FieldType.SELECT,
        //     source: 'transaction',
        //     label: 'Clearing Transaction 2',
        //     container: 'settlement_information'
        // });
        var settlementAccountAp = form.addField({
            id: DATA.settlement_account_ap,
            type: serverWidget.FieldType.SELECT,
            source: 'account',
            label: 'Account AP',
            container: 'settlement_information'
        });
        settlementAccountAp.isMandatory = true;
        settlementAccountAp.updateBreakType({
            breakType: serverWidget.FieldBreakType.STARTCOL
        });

        var settlementDate = form.addField({
            id: DATA.settlement_date,
            type: serverWidget.FieldType.DATE,
            label: 'Settlement Date',
            container: 'settlement_information'
        });
        settlementDate.isMandatory = true;

        var settlementExRateSettleToIdr = form.addField({
            id: DATA.settlement_exrate_settle_to_idr,
            type: serverWidget.FieldType.FLOAT,
            label: 'Exchange Rate Settle to IDR',
            container: 'settlement_information'
        });
        settlementExRateSettleToIdr.isMandatory = true;
        // var settlementTrans = form.addField({
        //     id: DATA.settlement_transaction,
        //     type: serverWidget.FieldType.TEXT,
        //     label: 'Settlement Transaction',
        //     container: 'settlement_information'
        // });
        var departmentClassification = form.addField({
            id: DATA.classification_subsidiary,
            type: serverWidget.FieldType.SELECT,
            source: 'subsidiary',
            label: 'Subsidiary',
            container: 'classification'
        }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
        departmentClassification.isMandatory = true;

        var departmentClassification = form.addField({
            id: DATA.classification_department,
            type: serverWidget.FieldType.SELECT,
            source: 'department',
            label: 'Department',
            container: 'classification'
        });
        departmentClassification.isMandatory = true;

        var locationClassification = form.addField({
            id: DATA.classification_location,
            type: serverWidget.FieldType.SELECT,
            source: 'location',
            label: 'Location',
            container: 'classification'
        });
        locationClassification.isMandatory = true;
        var classClassification = form.addField({
            id: DATA.classification_class,
            type: serverWidget.FieldType.SELECT,
            source: 'classification',
            label: 'Class',
            container: 'classification'
        });
        classClassification.isMandatory = true;

        var sublist = form.addSublist({
            id: DATA.sublist,
            type: serverWidget.SublistType.LIST,
            label: 'Bill'
        });
        var sub_checkbox = sublist.addField({
            id: DATA.sublist_checkbox,
            type: serverWidget.FieldType.CHECKBOX,
            label: 'checkbox'
        });
        var sub_bill_id = sublist.addField({
            id: DATA.sublist_bill_id,
            type: serverWidget.FieldType.TEXT,
            // source: -9,
            label: 'Bill ID'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.HIDDEN
        });
        var sub_vendor = sublist.addField({
            id: DATA.sublist_vendor,
            type: serverWidget.FieldType.TEXT,
            // source: -9,
            label: 'Vendor'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE,
        });

        var sub_bill_date = sublist.addField({
            id: DATA.sublist_bill_date,
            type: serverWidget.FieldType.DATE,
            label: 'Bill Date'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });

        var sub_bill_number = sublist.addField({
            id: DATA.sublist_bill_number,
            type: serverWidget.FieldType.TEXT,
            // source: 'vendorbill',
            label: 'Bill Number'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });

        var sub_bill_currency = sublist.addField({
            id: DATA.sublist_bill_currency,
            type: serverWidget.FieldType.SELECT,
            source: 'currency',
            label: 'Bill Currency'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });

        var sub_bill_origin_amount = sublist.addField({
            id: DATA.sublist_bill_origin_amount,
            type: serverWidget.FieldType.FLOAT,
            label: 'Bill Origin Amount'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });

        var sub_bill_outstanding_amount = sublist.addField({
            id: DATA.sublist_bill_outstanding_amount,
            type: serverWidget.FieldType.FLOAT,
            label: 'Bill Outstanding Amount'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });

        var sub_bill_prepayment_amount = sublist.addField({
            id: DATA.sublist_prepayment_amount,
            type: serverWidget.FieldType.FLOAT,
            label: 'Bill Prepayment Amount'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.ENTRY
        });

        var sub_bill_prepayment_amount_idr = sublist.addField({
            id: DATA.sublist_prepayment_amount_idr,
            type: serverWidget.FieldType.FLOAT,
            label: 'Bill Prepayment Amount (IDR)'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.ENTRY
        });

        var sub_bill_prepayment_currency = sublist.addField({
            id: DATA.sublist_prepayment_currency,
            type: serverWidget.FieldType.TEXT,
            label: 'Currency UM'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });

        var sub_bill_settlement_amount = sublist.addField({
            id: DATA.sublist_settlement_amount,
            type: serverWidget.FieldType.FLOAT,
            label: 'Bill Settlement Amount'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.ENTRY
        });

        var sub_bill_settlement_amount_idr = sublist.addField({
            id: DATA.sublist_settlement_amount_idr,
            type: serverWidget.FieldType.FLOAT,
            label: 'Bill Settlement Amount (IDR)'
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.ENTRY
        });

        return form;
    }

    function searchBill(dataEntry) {
        var data = [];
        var getBill = search.create({
            type: "vendorbill",
            filters:
                [
                    ["type", "anyof", "VendBill"],
                    "AND",
                    ["vendor.internalid", "anyof", dataEntry.vendor],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["trandate", "onorbefore", dataEntry.settle_date],
                    "AND",
                    ["currency", "anyof", dataEntry.settle_currency],
                    "AND",
                    ["account", "anyof", dataEntry.settle_account_ap],
                    "AND",
                    ["subsidiary", "anyof", dataEntry.classification_subsidiary],
                    "AND",
                    ["fxamountremaining", "greaterthan", "0.00"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "entityid",
                        join: "vendor",
                        label: "Name"
                    }),
                    search.createColumn({ name: "trandate", label: "Date" }),
                    search.createColumn({ name: "tranid", label: "Document Number" }),
                    search.createColumn({ name: "currency", label: "Currency" }),
                    search.createColumn({ name: "fxamount", label: "Amount (Foreign Currency)" }),
                    search.createColumn({ name: "amount", label: "Amount" }),
                    search.createColumn({ name: "fxamountremaining", label: "Amount Remaining (Foreign Currency)" }),
                    search.createColumn({ name: "internalid", label: "internal ID" }),

                ]
        }).run().getRange({
            start: 0,
            end: 1000,
        });

        for (let i = 0; i < getBill.length; i++) {
            var vendorName = getBill[i].getValue(getBill[i].columns[0]);
            var date = getBill[i].getValue(getBill[i].columns[1]);
            var billid = getBill[i].getValue(getBill[i].columns[2]);
            var currency = getBill[i].getValue(getBill[i].columns[3]);
            var amountForeign = getBill[i].getValue(getBill[i].columns[4]);
            var amountIdr = getBill[i].getValue(getBill[i].columns[5]);
            var amountDue = getBill[i].getValue(getBill[i].columns[6]);
            var internalId = getBill[i].getValue(getBill[i].columns[7]);

            data.push({
                vendorName: vendorName,
                date: date,
                billid: billid,
                currency: currency,
                amountForeign: amountForeign,
                amountIdr: amountIdr,
                amountDue: amountDue,
                internalId: internalId
            });
        }

        return data;
    }

    function saveClearing1(data, settlementId) {
        var recClearing1 = record.create({
            type: 'customtransaction_me_clearing_vp_1',
            isDynamic: true,
        });

        recClearing1.setValue('subsidiary', data.classification_subsidiary);
        recClearing1.setValue('class', data.classification_class);
        recClearing1.setValue('location', data.classification_location);
        recClearing1.setValue('department', data.classification_department);
        recClearing1.setValue('currency', data.currency);

        var getSettlementId = recClearing1.getValue('custbody_me_stmcap_cstrx');
        // getSettlementId.push(settlementId)

        // var setSettlementId = recClearing1.setValue({
        //     fieldId: 'custbody_me_stmcap_cstrx',
        //     value: getSettlementId,
        // })
        var dateSettlement = recClearing1.setText({
            fieldId: 'trandate',
            text: (data.settle_date),
        });
        var lineValue = 0;
        for (let i = 0; i < data.data_bill.length; i++) {
            lineValue += Number(data.data_bill[i].subBillPrepaymentAmount);

        }

        let accountId = 0;

        if (data.currency == 1) {
            accountId = 4490;
        } else if (data.currency == 2) {
            accountId = 4491;
        } else if (data.currency == 7) {
            accountId = 4492
        } else if (data.currency == 6) {
            accountId = 4493
        }

        recClearing1.setValue('exchangerate', data.exrate_pum_to_idr);
        recClearing1.selectNewLine('line');

        recClearing1.setCurrentSublistValue({
            sublistId: 'line',
            fieldId: 'account',
            value: 4502,
        });
        recClearing1.setCurrentSublistValue({
            sublistId: 'line',
            fieldId: 'debit',
            value: lineValue,
        });
        recClearing1.commitLine('line');

        recClearing1.selectNewLine('line')

        recClearing1.setCurrentSublistValue({
            sublistId: 'line',
            fieldId: 'account',
            value: accountId,
        });

        recClearing1.setCurrentSublistValue({
            sublistId: 'line',
            fieldId: 'credit',
            value: lineValue,
        });
        recClearing1.commitLine('line');
        var saveClearing1 = recClearing1.save()

        return saveClearing1

    }

    function saveClearing2(data, settlementId) {
        var recClearing2 = record.create({
            type: 'customtransaction_me_clearing_vp_1',
            isDynamic: true,
        });

        recClearing2.setValue('subsidiary', data.classification_subsidiary);
        recClearing2.setValue('class', data.classification_class);
        recClearing2.setValue('location', data.classification_location);
        recClearing2.setValue('department', data.classification_department);
        recClearing2.setValue('currency', data.settle_currency);
        var dateSettlement = recClearing2.setText({
            fieldId: 'trandate',
            text: (data.settle_date),
        });
        var getSettlementId = recClearing2.getValue('custbody_me_settlement_vendor_prpmt_re');
        // getSettlementId.push(settlementId)

        // var setSettlementId = recClearing2.setValue({
        //     fieldId: 'custbody_me_settlement_vendor_prpmt_re',
        //     value: getSettlementId,
        // })

        var lineValue = 0;
        for (let i = 0; i < data.data_bill.length; i++) {
            lineValue += Number(data.data_bill[i].subBillSettlementAmount);

        }

        var accountIdDebit = 0;

        if (data.currency == 1) {
            accountIdDebit = 4474;
        } else if (data.currency == 2) {
            accountIdDebit = 4475;
        } else if (data.currency == 7) {
            accountIdDebit = 4476
        } else if (data.currency == 6) {
            accountIdDebit = 4477
        }

        var accountIdCred = 0;

        if (data.settle_currency == 1) {
            accountIdCred = 4490;
        } else if (data.settle_currency == 2) {
            accountIdCred = 4491;
        } else if (data.settle_currency == 7) {
            accountIdCred = 4492
        } else if (data.settle_currency == 6) {
            accountIdCred = 4493
        }

        recClearing2.setValue('exchangerate', data.settle_exrate_settle_to_idr);
        recClearing2.selectNewLine('line');

        recClearing2.setCurrentSublistValue({
            sublistId: 'line',
            fieldId: 'account',
            value: accountIdCred,
        });
        recClearing2.setCurrentSublistValue({
            sublistId: 'line',
            fieldId: 'debit',
            value: lineValue,
        });
        recClearing2.commitLine('line');

        recClearing2.selectNewLine('line')

        recClearing2.setCurrentSublistValue({
            sublistId: 'line',
            fieldId: 'account',
            value: 4502,
        });

        recClearing2.setCurrentSublistValue({
            sublistId: 'line',
            fieldId: 'credit',
            value: lineValue,
        });
        recClearing2.commitLine('line');
        var saveClearing2 = recClearing2.save();

        return saveClearing2;
    }

    function saveBillCredit(data, settlementId) {
        var recBillCredit = record.create({
            type: record.Type.VENDOR_CREDIT,
            isDynamic: true,
        });

        recBillCredit.setValue('entity', data.vendor);
        recBillCredit.setValue('account', data.settle_account_ap);
        recBillCredit.setValue('subsidiary', data.classification_subsidiary);
        recBillCredit.setValue('currency', data.settle_currency);
        recBillCredit.setValue('exchangerate', data.settle_exrate_settle_to_idr);
        recBillCredit.setValue('department', data.classification_department);
        recBillCredit.setValue('location', data.classification_location);
        recBillCredit.setValue('class', data.classification_class);

        var getSettlementId = recBillCredit.getValue('custbody_me_settlement_vendor_prpmt_re');
        // getSettlementId.push(settlementId)

        // var setSettlementId = recBillCredit.setValue({
        //     fieldId: 'custbody_me_settlement_vendor_prpmt_re',
        //     value: getSettlementId,
        // })

        var lineValue = 0;
        for (let i = 0; i < data.data_bill.length; i++) {
            lineValue += Number(data.data_bill[i].subBillSettlementAmount);
        }

        if (data.settle_currency == 1) {
            var lineItem = recBillCredit.selectLine({
                sublistId: 'item',
                line: 0
            });
            recBillCredit.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                value: 864
            });
            recBillCredit.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'rate',
                value: lineValue,
            });
            recBillCredit.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'amount',
                value: lineValue,
            });
            recBillCredit.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'department',
                value: data.classification_department,
            });
            recBillCredit.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'location',
                value: data.classification_location,
            });
            recBillCredit.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'class',
                value: data.classification_class,
            });
            lineItem.commitLine('item');

        } else if (data.settle_currency == 2) {
            var lineItem = recBillCredit.selectLine({
                sublistId: 'item',
                line: 0
            });
            recBillCredit.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                value: 861
            });
            recBillCredit.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'rate',
                value: lineValue,
            });
            recBillCredit.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'amount',
                value: lineValue,
            });
            recBillCredit.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'department',
                value: data.classification_department,
            });
            recBillCredit.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'location',
                value: data.classification_location,
            });
            recBillCredit.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'class',
                value: data.classification_class,
            });
            lineItem.commitLine('item');

        } else if (data.settle_currency == 7) {
            var lineItem = recBillCredit.selectLine({
                sublistId: 'item',
                line: 0
            });
            recBillCredit.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                value: 862
            });
            recBillCredit.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'rate',
                value: lineValue,
            });
            recBillCredit.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'amount',
                value: lineValue,
            });
            recBillCredit.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'department',
                value: data.classification_department,
            });
            recBillCredit.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'location',
                value: data.classification_location,
            });
            recBillCredit.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'class',
                value: data.classification_class,
            });
            lineItem.commitLine('item');

        } else if (data.settle_currency == 6) {
            var lineItem = recBillCredit.selectLine({
                sublistId: 'item',
                line: 0
            });
            recBillCredit.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                value: 863
            });
            recBillCredit.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'rate',
                value: lineValue,
            });
            recBillCredit.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'amount',
                value: lineValue,
            });
            recBillCredit.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'department',
                value: data.classification_department,
            });
            recBillCredit.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'location',
                value: data.classification_location,
            });
            recBillCredit.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'class',
                value: data.classification_class,
            });
            lineItem.commitLine('item');
        }

        var getLineCountBC = recBillCredit.getLineCount('apply');
        log.debug("getLineCountBC", getLineCountBC)

        for (let x = 0; x < getLineCountBC; x++) {

            var getIdBill = recBillCredit.getSublistValue({
                sublistId: 'apply',
                fieldId: 'doc',
                line: x
            });
            for (let i = 0; i < data.data_bill.length; i++) {
                if (data.data_bill[i].subBillId == getIdBill) {
                    log.debug('data.data_bill[i]', data.data_bill[i])
                    // log.debug("getIdBill", getIdBill + " == " + data.data_bill[i].subBillId)
                    // log.debug("getAMount", getIdBill + " == " + data.data_bill[i].subBillId + "__" + data.data_bill[i].subBillPrepaymentAmount)
                    var lineApply = recBillCredit.selectLine({
                        sublistId: 'apply',
                        line: x
                    })
                    recBillCredit.setCurrentSublistValue({
                        sublistId: 'apply',
                        fieldId: 'apply',
                        value: true,
                    });
                    recBillCredit.setCurrentSublistValue({
                        sublistId: 'apply',
                        fieldId: 'amount',
                        value: Number(data.data_bill[i].subBillSettlementAmount),
                    });
                    lineApply.commitLine('apply')
                }

            }
        }

        var saveBillcredit = recBillCredit.save()

        return saveBillcredit;
    }

    function saveMulticurrAp(data, clearing1, clearing2, billCredit) {
        log.debug('data saveMulticurrAp', data)
        log.debug('clearing1 saveMulticurrAp', clearing1)
        log.debug('clearing2 saveMulticurrAp', clearing2)
        log.debug('billcredit saveMulticurrAp', billCredit)
        // var getClearing = searchClearing()
        try {
            var billNumberArr = [];

            var recordAp = record.create({
                type: 'customtransaction_me_settlmnt_multicr_ap',
                isDynamic: true
            });

            var customForm = recordAp.setValue({
                fieldId: "customform",
                value: 188
            });

            var subsidiary = recordAp.setValue({
                fieldId: "subsidiary",
                value: data.classification_subsidiary
            });

            var department = recordAp.setValue({
                fieldId: "department",
                value: data.classification_department
            });
            var claass = recordAp.setValue({
                fieldId: "class",
                value: data.classification_class
            });
            var location = recordAp.setValue({
                fieldId: "location",
                value: data.classification_location
            });

            var exchangeRateDataDummy = recordAp.setValue({
                fieldId: "exchangerate",
                value: 1
            });

            var prepaymentUm = recordAp.setValue({
                fieldId: 'custbody_me_vendor_prepay',
                value: data.checks,
            });

            var prepaymentCurrency = recordAp.setValue({
                fieldId: 'custbody_me_vendor_prepayment_um_curr',
                value: data.currency,
            });

            var vendor = recordAp.setValue({
                fieldId: 'custbody_me_vendor',
                value: data.vendor,
            });

            var prepaymentOutstanding = recordAp.setValue({
                fieldId: 'custbody_me_prepay_um_outstanding',
                value: data.vendor_outstanding,
            });

            var foreignToForeignExRate = recordAp.setValue({
                fieldId: 'custbody_me_child_settle_ftf_ex_rate',
                value: data.foreign_to_foreign_exchange,
            });

            var clearingTrans1 = recordAp.setValue({
                fieldId: 'custbody_me_child_settle_clearing_tran',
                value: clearing1
            });

            var clearingTrans2 = recordAp.setValue({
                fieldId: 'custbody_me_child_settle_clearing_tra2',
                value: clearing2
            });

            var exratePumToIdr = recordAp.setValue({
                fieldId: 'custbody_me_child_settle_ex_rpum_ridr',
                value: data.exrate_pum_to_idr
            });

            var settleCurrency = recordAp.setValue({
                fieldId: 'custbody_me_child_settle_currency',
                value: data.settle_currency,
            });

            var accountAp = recordAp.setValue({
                fieldId: 'custbody_me_child_settle_account_ap',
                value: data.settle_account_ap,
            });

            var dateSettlement = recordAp.setText({
                fieldId: 'custbody_me_child_settle_date',
                text: (data.settle_date),
            });
            var dateSettlement = recordAp.setText({
                fieldId: 'trandate',
                text: (data.settle_date),
            });

            var exSettleToIdr = recordAp.setValue({
                fieldId: 'custbody_me_child_settle_ex_rstl_ridr',
                value: data.settle_exrate_settle_to_idr,
            });

            // var settlementTrans = recordAp.setValue({
            //     fieldId: 'custbody_me_child_settle_transaction',
            //     value: data.settle_trans,
            // });
            // var getBillCredit = searchBillCredit();
            var billCredit = recordAp.setValue({
                fieldId: 'custbody_me_bill_credit_settlement',
                value: billCredit
            })

            // var sublist = recordAp.getSublist('recmachcustrecord_me_settlement_multicrr_ap');




            for (let x = 0; x < data.data_bill.length; x++) {

                recordAp.selectNewLine(FLD_CSTRX.sub_parent)
                var vendorBill = recordAp.setCurrentSublistValue({
                    sublistId: FLD_CSTRX.sub_parent,
                    fieldId: FLD_CSTRX.sub_bill_vendor,
                    value: data.vendor,
                    // line: x
                });
                var currencyPrepaymentBill = recordAp.setCurrentSublistValue({
                    sublistId: FLD_CSTRX.sub_parent,
                    fieldId: FLD_CSTRX.sub_check_currenc,
                    value: data.currency,
                    // line: x
                });
                var currencySettlementBill = recordAp.setCurrentSublistValue({
                    sublistId: FLD_CSTRX.sub_parent,
                    fieldId: FLD_CSTRX.sub_bill_currency,
                    value: data.data_bill[x].subBillCurrency,
                    // line: x
                });
                var billNumber = recordAp.setCurrentSublistValue({
                    sublistId: FLD_CSTRX.sub_parent,
                    fieldId: FLD_CSTRX.sub_bill_id,
                    value: data.data_bill[x].subBillId,
                    // line: x

                });

                billNumberArr.push(billNumber);



                var dateBill = recordAp.setCurrentSublistText({
                    sublistId: FLD_CSTRX.sub_parent,
                    fieldId: FLD_CSTRX.sub_bill_trandate,
                    text: (data.data_bill[x].subBillDate),
                    // line: x
                });

                var originAmountBill = recordAp.setCurrentSublistValue({
                    sublistId: FLD_CSTRX.sub_parent,
                    fieldId: FLD_CSTRX.sub_bill_orig_amt,
                    value: data.data_bill[x].subBillOriginAmount,
                    // line: x
                });

                var outstandingAmountBill = recordAp.setCurrentSublistValue({
                    sublistId: FLD_CSTRX.sub_parent,
                    fieldId: FLD_CSTRX.sub_bill_otsdgamt,
                    value: data.data_bill[x].subBillOutstandingAmount,
                    // line: x
                });

                var prepaymentAmountBill = recordAp.setCurrentSublistValue({
                    sublistId: FLD_CSTRX.sub_parent,
                    fieldId: FLD_CSTRX.sub_check_amount,
                    value: data.data_bill[x].subBillPrepaymentAmount,
                    // line: x
                });

                var prepaymentAmountIdrBill = recordAp.setCurrentSublistValue({
                    sublistId: FLD_CSTRX.sub_parent,
                    fieldId: FLD_CSTRX.sub_check_amt_idr,
                    value: data.data_bill[x].subBillPrepaymentAmountIdr,
                    // line: x
                });

                var settlementAmountBill = recordAp.setCurrentSublistValue({
                    sublistId: FLD_CSTRX.sub_parent,
                    fieldId: FLD_CSTRX.sub_bc_amount,
                    value: data.data_bill[x].subBillSettlementAmount,
                    // line: x
                });

                var settlementAmountIdrBill = recordAp.setCurrentSublistValue({
                    sublistId: FLD_CSTRX.sub_parent,
                    fieldId: FLD_CSTRX.sub_bc_amt_idr,
                    value: data.data_bill[x].subBillSettlementAmountIdr,
                    // line: x
                });
                recordAp.commitLine(FLD_CSTRX.sub_parent)


            }
            var saveRecAp = recordAp.save();
            log.debug('Berhasil Create Settlement')

            return saveRecAp;

        } catch (error) {
            throw ('Failed Create Record Settlement. ' + error)
        }

    }

    function updateChecks(data, prepaymentTotAmount, settlementId) {
        log.debug('data updateChecks', data)
        // log.debug("idcheck", data.checks);

        var loadCheck = record.load({
            type: 'check',
            id: Number(data.checks)
        });

        var getSettlementAp = loadCheck.getValue('custbody_me_stmcap_cstrx');
        if (getSettlementAp > 0) {
            getSettlementAp.push(settlementId);
            var setSettlementAp = loadCheck.setValue({
                fieldId: 'custbody_me_stmcap_cstrx',
                value: getSettlementAp,
            })
        } else {
            var setSettlementAp = loadCheck.setValue({
                fieldId: 'custbody_me_stmcap_cstrx',
                value: settlementId,
            })

        }

        var getSettlementAmount = loadCheck.getValue('custbody_me_settlement_amount');
        var setSettlementAmount = loadCheck.setValue({
            fieldId: 'custbody_me_settlement_amount',
            value: Number(getSettlementAmount + prepaymentTotAmount),
        })

        var saveEdit = loadCheck.save();

        // var update = record.submitFields({
        //     type: 'check',
        //     id: data.checks,
        //     values: {
        //         custbody_me_amount_uang_muka: prepaymentTotAmount,
        //     },
        //     options: {
        //         enableSourcing: false,
        //         ignoreMandatoryFields: true
        //     }
        // })
    }

    function onRequest(context) {
        var isSettled = false;

        var form = getParameters(context);

        var prepayment_check = form.getField({ id: DATA.prepayment_checks });
        var prepayment_vendor = form.getField({ id: DATA.prepayment_vendor });
        var prepayment_currency = form.getField({ id: DATA.prepayment_currency });
        var prepayment_vendor_outstanding = form.getField({ id: DATA.prepayment_vendor_outstanding });
        var settlement_foreign_to_foreign_exchange = form.getField({ id: DATA.settlement_foreign_to_foreign_exchange });
        // var settlement_clearing_transaction_1 = form.getField({ id: DATA.settlement_clearing_transaction_1 });
        var settlement_exrate_pum_to_idr = form.getField({ id: DATA.settlement_exrate_pum_to_idr });
        // var settlement_clearing_transaction_2 = form.getField({ id: DATA.settlement_clearing_transaction_2 });
        var settlement_currency = form.getField({ id: DATA.settlement_currency });
        var settlement_account_ap = form.getField({ id: DATA.settlement_account_ap });
        var settlement_date = form.getField({ id: DATA.settlement_date });
        var settlement_exrate_settle_to_idr = form.getField({ id: DATA.settlement_exrate_settle_to_idr });
        var settlement_transaction = form.getField({ id: DATA.settlement_transaction });
        var classification_subsidiary = form.getField({ id: DATA.classification_subsidiary });
        var classification_department = form.getField({ id: DATA.classification_department });
        var classification_location = form.getField({ id: DATA.classification_location });
        var classification_class = form.getField({ id: DATA.classification_class });

        var sublistId = form.getSublist({ id: DATA.sublist });

        var params = context.request.parameters;
        var prepaymentCheck = params[DATA.prepayment_checks];
        var prepaymentVendor = params[DATA.prepayment_vendor];
        var prepaymentCurrency = params[DATA.prepayment_currency];
        var prepaymentVendorOutstanding = params[DATA.prepayment_vendor_outstanding];
        var settlementForeignToForeignExchange = params[DATA.settlement_foreign_to_foreign_exchange];
        // var settlementClearingTransaction1 = params[DATA.settlement_clearing_transaction_1];
        var settlementExratePumToIdr = params[DATA.settlement_exrate_pum_to_idr];
        // var settlementClearingTransaction2 = params[DATA.settlement_clearing_transaction_2];
        var settlementCurrency = params[DATA.settlement_currency];
        var settlementAccountAp = params[DATA.settlement_account_ap];
        var settlementDate = params[DATA.settlement_date];
        var settlementExrateSettleToIdr = params[DATA.settlement_exrate_settle_to_idr];
        // var settlementTransaction = params[DATA.settlement_transaction];
        var classificationSubsidiary = params[DATA.classification_subsidiary];
        var classificationDepartment = params[DATA.classification_department];
        var classificationLocation = params[DATA.classification_location];
        var classificationClass = params[DATA.classification_class];
        log.debug("settlementExrateSettleToIdr", settlementExrateSettleToIdr);

        var currencyNamePrepayment = ""
        // if (prepaymentCurrency != "" || prepaymentCurrency != null) {
        //     var lookUpCurrency = search.lookupFields({
        //         type: search.Type.CURRENCY,
        //         id: prepaymentCurrency,
        //         columns: ['name']
        //     });
        //     currencyNamePrepayment = lookUpCurrency.name;

        // }


        //Populate Parameter

        if (context.request.method === 'GET') {
            form.addSubmitButton({ label: 'Get Bill' });
            form.clientScriptModulePath = 'SuiteScripts/METRODATA/me_sl_cs_settlement_multicurrency_ap.js';

        } else if (context.request.method === 'POST') {

            prepayment_check.defaultValue = prepaymentCheck
            prepayment_check.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })
            prepayment_vendor.defaultValue = prepaymentVendor
            prepayment_vendor.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })
            prepayment_currency.defaultValue = prepaymentCurrency
            prepayment_currency.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })
            prepayment_vendor_outstanding.defaultValue = prepaymentVendorOutstanding
            prepayment_vendor_outstanding.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })
            settlement_foreign_to_foreign_exchange.defaultValue = settlementForeignToForeignExchange
            settlement_foreign_to_foreign_exchange.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.ENTRY
            })
            // prepayment_vendor.defaultValue = prepaymentVendor
            // prepayment_vendor.updateDisplayType({
            //     displayType: serverWidget.FieldDisplayType.INLINE
            // })
            settlement_exrate_pum_to_idr.defaultValue = settlementExratePumToIdr
            settlement_exrate_pum_to_idr.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.ENTRY
            })
            // prepayment_vendor.defaultValue = prepaymentVendor
            // prepayment_vendor.updateDisplayType({
            //     displayType: serverWidget.FieldDisplayType.INLINE
            // })
            settlement_currency.defaultValue = settlementCurrency
            settlement_currency.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })
            // prepayment_vendor.defaultValue = prepaymentVendor
            // prepayment_vendor.updateDisplayType({
            //     displayType: serverWidget.FieldDisplayType.INLINE
            // })
            settlement_date.defaultValue = settlementDate
            settlement_date.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })
            settlement_exrate_settle_to_idr.defaultValue = settlementExrateSettleToIdr
            settlement_exrate_settle_to_idr.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.ENTRY
            })
            settlement_account_ap.defaultValue = settlementAccountAp
            settlement_account_ap.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })
            // settlement_transaction.defaultValue = settlementTransaction
            // settlement_transaction.updateDisplayType({
            //     displayType: serverWidget.FieldDisplayType.INLINE
            // })
            classification_subsidiary.defaultValue = classificationSubsidiary
            classification_subsidiary.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })
            classification_department.defaultValue = classificationDepartment
            classification_department.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })
            classification_location.defaultValue = classificationLocation
            classification_location.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })
            classification_class.defaultValue = classificationClass
            classification_class.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            })

            var dataFilter = {
                checks: prepaymentCheck,
                vendor: prepaymentVendor,
                currency: prepaymentCurrency,
                vendor_outstanding: prepaymentVendorOutstanding,
                foreign_to_foreign_exchange: settlementForeignToForeignExchange,
                // clearing_trans_1: settlementClearingTransaction1,
                exrate_pum_to_idr: settlementExratePumToIdr,
                // clearing_trans_2: settlementClearingTransaction2,
                settle_currency: settlementCurrency,
                settle_account_ap: settlementAccountAp,
                settle_date: settlementDate,
                settle_exrate_settle_to_idr: settlementExrateSettleToIdr,
                // settle_trans: settlementTransaction,
                classification_subsidiary: classificationSubsidiary,
                classification_department: classificationDepartment,
                classification_location: classificationLocation,
                classification_class: classificationClass,
                data_bill: [],
            }
            log.debug("dataFilter", dataFilter.settle_exrate_settle_to_idr)

            var prepaymentAmountSublist = sublistId.getField({ id: DATA.sublist_prepayment_amount })
            var prepaymentAmountSublistIdr = sublistId.getField({ id: DATA.sublist_prepayment_amount_idr })
            var settlementAmountSublist = sublistId.getField({ id: DATA.sublist_settlement_amount })
            var settlementAmountSublistIdr = sublistId.getField({ id: DATA.sublist_settlement_amount_idr })

            var subCount = context.request.getLineCount({
                group: DATA.sublist,
            })

            var checkedBill = [];

            var totalPrepayment = 0;

            for (let i = 0; i < subCount; i++) {
                var isChecked = context.request.getSublistValue({
                    group: DATA.sublist,
                    name: DATA.sublist_checkbox,
                    line: i
                });

                if (isChecked == "T" || isChecked == true) {
                    var subBillId = context.request.getSublistValue({
                        group: DATA.sublist,
                        name: DATA.sublist_bill_id,
                        line: i
                    });
                    var subVendor = context.request.getSublistValue({
                        group: DATA.sublist,
                        name: DATA.sublist_vendor,
                        line: i
                    });
                    var subBillDate = context.request.getSublistValue({
                        group: DATA.sublist,
                        name: DATA.sublist_bill_date,
                        line: i
                    });
                    var subBillNumber = context.request.getSublistValue({
                        group: DATA.sublist,
                        name: DATA.sublist_bill_number,
                        line: i
                    });
                    var subBillCurrency = context.request.getSublistValue({
                        group: DATA.sublist,
                        name: DATA.sublist_bill_currency,
                        line: i
                    });
                    var subBillOriginAmount = context.request.getSublistValue({
                        group: DATA.sublist,
                        name: DATA.sublist_bill_origin_amount,
                        line: i
                    });

                    var subBillOutstandingAmount = context.request.getSublistValue({
                        group: DATA.sublist,
                        name: DATA.sublist_bill_outstanding_amount,
                        line: i
                    });
                    var subBillPrepaymentAmount = context.request.getSublistValue({
                        group: DATA.sublist,
                        name: DATA.sublist_prepayment_amount,
                        line: i
                    });
                    // totalPrepayment += subBillPrepaymentAmount;

                    var subBillPrepaymentAmountIdr = 0
                    var subBillSettlementAmount = 0
                    var subBillSettlementAmountIdr = 0

                    if (dataFilter.currency == 1 && dataFilter.settle_currency != 1) {
                        subBillPrepaymentAmountIdr = subBillPrepaymentAmount * settlementExratePumToIdr;

                        subBillSettlementAmount = subBillPrepaymentAmount / settlementExrateSettleToIdr;

                        subBillSettlementAmountIdr = subBillSettlementAmount * settlementExrateSettleToIdr;

                    }
                    if (dataFilter.currency != 1 && dataFilter.settle_currency == 1) {
                        subBillPrepaymentAmountIdr = subBillPrepaymentAmount * settlementExratePumToIdr;

                        subBillSettlementAmount = subBillPrepaymentAmount * settlementExratePumToIdr;

                        subBillSettlementAmountIdr = subBillPrepaymentAmount * settlementExratePumToIdr;
                    }

                    if (dataFilter.currency != 1 && dataFilter.settle_currency != 1) {
                        subBillPrepaymentAmountIdr = subBillPrepaymentAmount * settlementExratePumToIdr;

                        subBillSettlementAmount = subBillPrepaymentAmount * settlementForeignToForeignExchange;

                        subBillSettlementAmountIdr = subBillSettlementAmount * settlementExrateSettleToIdr;

                    }

                    checkedBill.push({
                        subBillId: subBillId,
                        subVendor: subVendor,
                        subBillDate: subBillDate,
                        subBillNumber: subBillNumber,
                        subBillCurrency: subBillCurrency,
                        subBillOriginAmount: subBillOriginAmount,
                        subBillOutstandingAmount: subBillOutstandingAmount,
                        subBillPrepaymentAmount: subBillPrepaymentAmount,
                        subBillPrepaymentAmountIdr: parseFloat(subBillPrepaymentAmountIdr).toFixed(2),
                        subBillSettlementAmount: parseFloat(subBillSettlementAmount).toFixed(2),
                        subBillSettlementAmountIdr: parseFloat(subBillSettlementAmountIdr).toFixed(2)
                    });

                }

            }
            var totalPrepaymentamount = 0;
            for (let j = 0; j < checkedBill.length; j++) {
                totalPrepaymentamount += Number(checkedBill[j].subBillPrepaymentAmount);
            }

            // if (totalPrepaymentamount > dataFilter.vendor_outstanding) {          
            //         var exceededOutstandingPrepayment = error.create({
            //             name: 'EXCEEDED_DEP_AMOUNT',
            //             message: 'Prepayment Amount has Exceeded the Deposit Transaction ',
            //             notifyOff: false
            //         });
            //         throw exceededOutstandingPrepayment;


            // }

            var prepaymentStringSublist = "";

            if (prepaymentCurrency == 1) {
                prepaymentStringSublist = "IDR"
            } else if (prepaymentCurrency == 2) {
                prepaymentStringSublist = "USD"
            } else if (prepaymentCurrency == 3) {
                prepaymentStringSublist = "CAD"
            } else if (prepaymentCurrency == 4) {
                prepaymentStringSublist = "EUR"
            } else if (prepaymentCurrency == 5) {
                prepaymentStringSublist = "GBP"
            } else if (prepaymentCurrency == 6) {
                prepaymentStringSublist = "HKD"
            } else if (prepaymentCurrency == 7) {
                prepaymentStringSublist = "SGD"
            } else if (prepaymentCurrency == 8) {
                prepaymentStringSublist = "JPY"
            } else if (prepaymentCurrency == 9) {
                prepaymentStringSublist = "XAJ"
            }

            if (checkedBill.length <= 0) {
                var getBillData = searchBill(dataFilter);

                for (let x = 0; x < getBillData.length; x++) {
                    sublistId.setSublistValue({
                        id: DATA.sublist_bill_id,
                        line: x,
                        value: getBillData[x].internalId
                    })
                    sublistId.setSublistValue({
                        id: DATA.sublist_vendor,
                        line: x,
                        value: getBillData[x].vendorName
                    })
                    sublistId.setSublistValue({
                        id: DATA.sublist_bill_date,
                        line: x,
                        value: getBillData[x].date
                    })
                    sublistId.setSublistValue({
                        id: DATA.sublist_bill_number,
                        line: x,
                        value: getBillData[x].billid
                    })
                    sublistId.setSublistValue({
                        id: DATA.sublist_bill_currency,
                        line: x,
                        value: getBillData[x].currency
                    })
                    sublistId.setSublistValue({
                        id: DATA.sublist_prepayment_currency,
                        line: x,
                        value: prepaymentStringSublist,
                    });
                    sublistId.setSublistValue({
                        id: DATA.sublist_bill_origin_amount,
                        line: x,
                        value: getBillData[x].amountForeign
                    })
                    sublistId.setSublistValue({
                        id: DATA.sublist_bill_outstanding_amount,
                        line: x,
                        value: getBillData[x].amountDue
                    })
                }
            }
            form.addSubmitButton({ label: 'Make Settlement' });
            form.clientScriptModulePath = 'SuiteScripts/METRODATA/me_sl_cs_settlement_multicurrency_ap.js';

            if (checkedBill.length > 0) {
                dataFilter.data_bill = checkedBill;
                log.debug('Final Data', dataFilter)
                var saveCr1 = saveClearing1(dataFilter, saveRecordMulticurrAp);
                var saveCr2 = saveClearing2(dataFilter, saveRecordMulticurrAp);
                var saveBillCred = saveBillCredit(dataFilter, saveRecordMulticurrAp);
                var saveRecordMulticurrAp = saveMulticurrAp(dataFilter, saveCr1, saveCr2, saveBillCred);
                var updateChecksRec = updateChecks(dataFilter, totalPrepaymentamount, saveRecordMulticurrAp);

                // Update Bill
                for (var x = 0; x < checkedBill.length; x++) {

                    var bill_rec = search.lookupFields({
                        type: search.Type.VENDOR_BILL,
                        id: checkedBill[x].subBillId,
                        columns: ["tranid", "custbody_me_stmcap_cstrx"]
                    })
                    log.debug('bill_rec', bill_rec)
                    var cstrx_arr = bill_rec.custbody_me_stmcap_cstrx
                    var new_cstrx_arr = [saveRecordMulticurrAp]
                    if (cstrx_arr.length > 0) {
                        for (var i = 0; i < cstrx_arr.length; i++) {
                            new_cstrx_arr.push(cstrx_arr[i].value)
                        }
                    }

                    var update_bill = record.submitFields({
                        type: record.Type.VENDOR_BILL,
                        id: checkedBill[x].subBillId,
                        values: {
                            'custbody_me_stmcap_cstrx': new_cstrx_arr
                        }
                    })
                }
                log.debug('Berhasil Update Bill')


                // Update Bill Credit
                var update_cm = record.submitFields({
                    type: record.Type.VENDOR_CREDIT,
                    id: saveBillCred,
                    values: {
                        'custbody_me_stmcap_cstrx': saveRecordMulticurrAp
                    }
                })
                log.debug('Berhasil Update Bill Credit')

                // Update MC Payment
                var update_mcpayment_from = record.submitFields({
                    type: 'customtransaction_me_clearing_vp_1',
                    id: saveCr1,
                    values: {
                        'custbody_me_stmcap_cstrx': saveRecordMulticurrAp
                    }
                })
                var update_mcpayment_to = record.submitFields({
                    type: 'customtransaction_me_clearing_vp_1',
                    id: saveCr2,
                    values: {
                        'custbody_me_stmcap_cstrx': saveRecordMulticurrAp
                    }
                })
                log.debug('Berhasil Update Settlement Payment AP')



                isSettled = true
                if (isSettled == true) {
                    redirect.toRecord({
                        type: 'customtransaction_me_settlmnt_multicr_ap',
                        id: saveRecordMulticurrAp,
                    });
                }
            }

        }

        context.response.writePage(form);
    }

    return {
        onRequest: onRequest
    }
});
