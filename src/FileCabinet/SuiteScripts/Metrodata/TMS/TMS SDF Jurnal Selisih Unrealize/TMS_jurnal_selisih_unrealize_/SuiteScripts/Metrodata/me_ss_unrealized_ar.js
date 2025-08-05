/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 * @author Caroline (ME)
*/

define(['N/search', 'N/record', 'N/runtime', "./lib/moment.min.js"], function (search, record, runtime, moment) {

    var currency_lib = {
        "US Dollar (USD)": "1",
        "British pound": "2",
        "Euro": "4",
        "Indonesia Rupiah (IDR)": "5",
        "Singapore Dollar(SGD)": "6",
        "Japanese Yen": "7",
        "Australian Dollar(AUD)": "8"
    }

    var recordTypes = {
        "Sales Order": "salesorder",
        "Invoice": "invoice",
        "Cash Sale": "cashsale",
        "Credit Memo": "creditmemo",
        "Purchase Order": "purchaseorder",
        "Vendor Bill": "vendorbill",
        "Vendor Credit": "vendorcredit",
        "Journal Entry": "journalentry",
        "Customer Payment": "customerpayment",
        "Vendor Payment": "vendorpayment",
        "Item Fulfillment": "fulfillment",
        "Customer": "customer",
        "Vendor": "vendor",
        "Employee": "employee",
        "Partner": "partner",
        "Contact": "contact",
        "Inventory Item": "inventoryitem",
        "Assembly Item": "assemblyitem",
        "Non-Inventory Item": "noninventoryitem",
        "Service Item": "serviceitem",
        "Kit Item": "kititem",
        "Gift Certificate Item": "giftcertificateitem",
        "Account": "account",
        "Location": "location",
        "Department": "department",
        "Classification": "classification",
        "Subsidiary": "subsidiary",
        "Opportunity": "opportunity",
        "Task": "task",
        "Project": "project",
        "Support Case": "supportcase",
        "Custom Record": "customrecord"
    }

    var transactionTypes = {
        "invoice": "CustInvc",
        "creditmemo": "CustCred",
        "cashsale": "CashSale",
        "salesorder": "SalesOrd",
        "customerpayment": "CustPymt",
        "estimate": "Estimate",
        "returnauthorization": "RtnAuth",
        "customerdeposit": "CustDep",
        "customerrefund": "CustRfnd",
        "itemfulfillment": "ItemShip",
        "cashrefund": "CashRfnd",
        "statementcharge": "StmtChrg",
        "salestaxpayment": "TaxLiab",
        "purchaseorder": "PurchOrd",
        "vendorbill": "VendBill",
        "vendorcredit": "VendCred",
        "vendorpayment": "VendPymt",
        "itemreceipt": "ItemRcpt",
        "vendorreturnauthorization": "VendAuth",
        "transferorder": "TrnfrOrd",
        "inventoryadjustment": "InvAdjst",
        "inventorytransfer": "InvTrnfr",
        "workorder": "WorkOrd",
        "assemblybuild": "Build",
        "assemblyunbuild": "Unbuild",
        "journalentry": "Journal",
        "intercompanyjournalentry": "IntercompanyJournal",
        "expensereport": "ExpRept",
        "timeentry": "TimeBill",
        "deposit": "Deposit",
        "check": "Check",
        "billpayment": "BillPymt",
        "billcredit": "BillCred",
        "projectexpenseallocation": "ExpAlloc",
        "projectrevenuerecognition": "RevRec",
        "revenuearrangement": "RevArrng",
        "revenuecommitment": "RevCmmt"
    };

    function control_formula(rate, spot_rate, balance) {
        return parseFloat((Math.abs(((1 / rate) - (1 / spot_rate)) * balance)).toFixed(2));
    }

    function getCR(posting_period, acctype, end_period) {
        var fxrevalSearchObj = search.create({
            type: "fxreval",
            filters:
                [
                    ["type", "anyof", "FxReval"],
                    "AND",
                    ["postingperiod", "abs", posting_period],
                    "AND",
                    ["account.type", "anyof", acctype],
                    "AND",
                    ["numbertext", "startswith", "CR/"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "internalid",
                        summary: "GROUP",
                        label: "Internal ID"
                    }),
                    search.createColumn({
                        name: "currency",
                        summary: "GROUP",
                        label: "Currency"
                    }),
                    search.createColumn({
                        name: "tranid",
                        summary: "GROUP",
                        label: "Tranid"
                    })
                ]
        });

        log.debug("date", end_period)
        // Add one day
        var newDate = moment(end_period, "DD/MM/YYYY").add(1, 'days').format("DD/MM/YYYY");
        log.debug("newDate", newDate)

        var fxrevalSearch_on1st = search.create({
            type: "fxreval",
            filters:
                [
                    ["type", "anyof", "FxReval"],
                    "AND",
                    ["trandate", "on", newDate],
                    "AND",
                    ["account.type", "anyof", acctype],
                    "AND",
                    ["numbertext", "startswith", "CR/"]
                ],
            columns:
                [
                    search.createColumn({
                        name: "internalid",
                        summary: "GROUP",
                        label: "Internal ID"
                    }),
                    search.createColumn({
                        name: "currency",
                        summary: "GROUP",
                        label: "Currency"
                    }),
                    search.createColumn({
                        name: "tranid",
                        summary: "GROUP",
                        label: "Tranid"
                    })
                ]
        });
        var startRow = 0;
        var pageSize = 1000;

        var recordData = [];
        var recordData1 = [];

        do {
            var resultSearch = fxrevalSearchObj.run().getRange({
                start: startRow,
                end: startRow + pageSize
            });
            for (var x = 0; x < resultSearch.length; x++) {
                recordData.push({
                    "internalid": resultSearch[x].getValue(resultSearch[x].columns[0]),
                    "currency": resultSearch[x].getValue(resultSearch[x].columns[1]),
                    "currency_text": resultSearch[x].getText(resultSearch[x].columns[1]),
                    "tranid": resultSearch[x].getValue(resultSearch[x].columns[2])
                })
            }
            startRow += pageSize
        } while (resultSearch.length === pageSize);

        var startRow = 0;
        var pageSize = 1000;
        do {
            var resultSearch1st = fxrevalSearch_on1st.run().getRange({
                start: startRow,
                end: startRow + pageSize
            });
            for (var y = 0; y < resultSearch1st.length; y++) {
                recordData.push({
                    "internalid": resultSearch1st[y].getValue(resultSearch[y].columns[0]),
                    "currency": resultSearch1st[y].getValue(resultSearch[y].columns[1]),
                    "currency_text": resultSearch1st[y].getText(resultSearch[y].columns[1]),
                    "tranid": resultSearch1st[y].getValue(resultSearch[y].columns[2])
                })
                recordData1.push({
                    "internalid": resultSearch1st[y].getValue(resultSearch[y].columns[0]),
                    "currency": resultSearch1st[y].getValue(resultSearch[y].columns[1]),
                    "currency_text": resultSearch1st[y].getText(resultSearch[y].columns[1]),
                    "tranid": resultSearch1st[y].getValue(resultSearch[y].columns[2])
                })
            }
        } while (resultSearch.length === pageSize);
        log.debug("RecordData", recordData1);
        return recordData;
    }

    function JEvalidation(ids) {
        var journalentrySearchObj = search.create({
            type: "journalentry",
            filters:
                [
                    ["mainline", "is", "T"],
                    "AND",
                    ["custbody_me_related_cr", "anyof", ids],
                    "AND",
                    ["type", "anyof", "Journal"]
                ],
            columns:
                [
                    search.createColumn({ name: "custbody_me_related_cr", label: "ME - Related CR" })
                ]
        });

        var recordData = []

        var startRow = 0;
        var pageSize = 1000;
        do {
            var resultSearch = journalentrySearchObj.run().getRange({
                start: startRow,
                end: startRow + pageSize
            });
            for (var i = 0; i < resultSearch.length; i++) {
                recordData.push({
                    "internalid": resultSearch[i].getValue(resultSearch[i].columns[0])
                })
            }
        } while (resultSearch.length === pageSize);
        return recordData;
    }

    // function getJE(posting_period) {
    //     var journalentrySearchObj = search.create({
    //         type: "journalentry",
    //         filters:
    //             [
    //                 ["type", "anyof", "Journal"],
    //                 "AND",
    //                 ["custbody_me_related_cr", "noneof", "@NONE@"],
    //                 "AND",
    //                 ["postingperiod", "abs", posting_period],
    //                 "AND",
    //                 ["mainline", "is", "T"],
    //                 "AND",
    //                 ["account.type", "anyof", "AcctRec", "AcctPay"]
    //             ],
    //         columns:
    //             [
    //                 search.createColumn({ name: "internalid", label: "Internal ID" }),
    //                 search.createColumn({ name: "tranid", label: "Document Number" }),
    //                 search.createColumn({ name: "custbody_me_related_cr", label: "ME - Related CR" })
    //             ]
    //     });
    //     var startRow = 0;
    //     var pageSize = 1000;

    //     var recordData = [];

    //     do {
    //         var resultSearch = journalentrySearchObj.run().getRange({
    //             start: startRow,
    //             end: startRow + pageSize
    //         });
    //         for (x = 0; x < resultSearch.length; x++) {
    //             recordData.push({
    //                 "internalid": resultSearch[x].getValue(resultSearch[x].columns[2]),
    //             })
    //         }
    //         startRow += pageSize
    //     } while (resultSearch.length === pageSize);
    //     return recordData;
    // }

    function getSublist(arraytrans) {
        var length = arraytrans.length;
        log.debug("length", length)

        var types = arraytrans.map(function (item) {
            return item.type;
        });
        var ids = arraytrans.map(function (item) {
            return item.id;
        });
        log.debug("types", types);
        log.debug("ids", ids);

        var savedSearches = []

        for (var b = 0; b < length; b++) {
            savedSearches[b] = search.create({
                type: search.Type.TRANSACTION,
                filters: [
                    search.createFilter({
                        name: 'mainline',
                        operator: search.Operator.IS,
                        values: "T"
                    }),
                    search.createFilter({
                        name: 'type',
                        operator: search.Operator.ANYOF,
                        values: types[b]
                    }),
                    search.createFilter({
                        name: 'internalid',
                        operator: search.Operator.ANYOF,
                        values: ids[b]
                    })
                ],
                columns: ['internalid', 'custbody_me_spot_rate', 'type']
            });
        }

        var startRow = 0;
        var pageSize = 1000;

        var recordData = [];

        log.debug("savedsearches", savedSearches);
        log.debug("savedsearches", savedSearches.length);
        do {
            for (var j = 0; j < savedSearches.length; j++) {
                var resultSearch = savedSearches[j].run().getRange({
                    start: startRow,
                    end: startRow + pageSize
                });
                for (x = 0; x < resultSearch.length; x++) {
                    recordData.push({
                        "internalid": resultSearch[x].getValue(resultSearch[x].columns[0]),
                        "spot_rate": resultSearch[x].getValue(resultSearch[x].columns[1]),
                        "type": resultSearch[x].getValue(resultSearch[x].columns[2])
                    })
                }
            }
            startRow += pageSize
        } while (resultSearch.length === pageSize);
        log.debug("recordData", recordData);
        log.debug("recordData", recordData.length);

        return recordData;
    }

    function getSpotRateAsNumber(internalid, type, dataresult) {
        var internalidToFind = internalid;
        var typeToFind = type;
        var data = dataresult;

        // Use the find method to search for the specific internalid and type
        var result = data.find(function (item) {
            return item.internalid == internalidToFind && item.type == typeToFind;
        });

        // If result is found, return the parsed spot_rate
        if (result) {
            result.spot_rate = parseFloat(result.spot_rate);
        }
        return result;
    }

    function execute(context) {
        var scriptObj = runtime.getCurrentScript();
        log.debug('Deployment Id: ', scriptObj.deploymentId);

        var paramDetail = scriptObj.getParameter({
            name: 'custscript_me_cr_parameter'
        });
        var parseDetail = JSON.parse(paramDetail);
        log.debug("parseDetail", parseDetail);

        var CRs = getCR(parseDetail.period, parseDetail.journalType, parseDetail.end_period);
        // var JEs = getJE(parseDetail.period, parseDetail.journalType);
        log.debug("CRs", CRs);
        // log.debug("JEs", JEs);
        var internalIdsArrayCRs = CRs.map(item => item.internalid);
        var validation = JEvalidation(internalIdsArrayCRs);
        log.debug("validation", validation)

        var uniqueData = Array.from(new Set(validation.map(item => item.internalid)))
            .map(id => ({ internalid: id }));

        // Create an array of internalids from array2
        // var internalIdsArray = JEs.map(item => item.internalid);
        var uniqueData_array = uniqueData.map(item => item.internalid);

        // var CRresult0 = [];
        // for (var i = 0; i < CRs.length; i++) {
        //     if (!internalIdsArray.includes(CRs[i].internalid)) {
        //         CRresult0.push(CRs[i]);
        //     }
        // }
        // log.debug("CRresult0", CRresult0);

        var CRresult = []

        for (var i = 0; i < CRs.length; i++) {
            if (!uniqueData_array.includes(CRs[i].internalid)) {
                CRresult.push(CRs[i]);
            }
        }
        log.debug("CRresult", CRresult);

        var cr_length = CRresult.length;
        log.debug("cr_length", cr_length);
        var exchangeRates = parseDetail.exchangerate;
        log.debug("exchangeRates", exchangeRates);
        log.debug("exchangeRates.length", exchangeRates.length);

        var journal = []

        if (cr_length > 0) {
            for (var i = 0; i < cr_length; i++) {
                var cr = record.load({
                    type: "fxreval",
                    id: CRresult[i].internalid
                });
                var cr_field = cr.getValue("variancetype");
                // log.debug("cr_field", cr_field);
                var status = (cr_field === "Unrealized");
                // log.debug("status", status);

                if (status == true) {
                    log.debug("crid", cr.getValue("initialtranid"));
                    if (parseDetail.journalType === 'AcctRec') { //
                        var sublist = 'openrecv'
                    } else {
                        var sublist = 'openpay'
                    }
                    var numLines = cr.getLineCount({
                        sublistId: sublist
                    }); log.debug("numlines", numLines);

                    var arraySublistresult = [];
                    var spot_rate_array = [];
                    for (var x = 0; x < numLines; x++) {
                        var account = cr.getSublistValue(sublist, 'acct', x);
                        var ddate = cr.getSublistValue(sublist, 'ddate', x);

                        var payee = cr.getSublistValue(sublist, 'kentity', x);

                        var currency = cr.getSublistValue(sublist, 'currency', x);
                        var currency_id = currency_lib[currency];

                        var searchKey = cr.getSublistValue(sublist, 'type', x);
                        for (var key in recordTypes) {
                            if (key.toLowerCase().includes(searchKey.toLowerCase())) {
                                type_result = recordTypes[key];
                                break; // stop searching after finding the first match
                            }
                        }
                        // log.debug("type_result", type_result);
                        // var spot_rate_lookup = search.lookupFields({
                        //     type: type_result,
                        //     id: cr.getSublistValue(sublist, 'typekey', x),
                        //     columns: 'custbody_me_spot_rate'
                        // });

                        // var spot_rate = Number(spot_rate_lookup.custbody_me_spot_rate);
                        var spot_rate = 0
                        spot_rate_array.push({
                            type: type_result,
                            id: cr.getSublistValue(sublist, 'typekey', x)
                        });
                        // log.debug("spot_rate_array", spot_rate_array)

                        var tran_exrate = cr.getSublistValue(sublist, 'tfxrate', x);

                        for (var a = 0; a < exchangeRates.length; a++) {
                            // log.debug("exchangeRates[i].source_currency", exchangeRates[a].source_currency)
                            if (exchangeRates[a].source_currency === currency_id) {
                                // log.debug("exchangeRate", "exchengeRate " + exchangeRates[a].rate)
                                var rate = exchangeRates[a].rate;
                                break; // Exit the loop once the rate is found
                            }
                        }
                        // log.debug("rate", rate)

                        var ending_exrate = cr.getSublistValue(sublist, 'cfxrate', x);

                        var balance = cr.getSublistValue(sublist, 'balance', x);

                        var gain_loss = cr.getSublistValue(sublist, 'variance', x);

                        var net_gain_loss = cr.getSublistValue(sublist, 'netvar', x);

                        var prior_gain_loss = cr.getSublistValue(sublist, 'previous', x);

                        arraySublistresult.push({
                            id: cr.getSublistValue(sublist, 'typekey', x),
                            type: type_result,
                            account: account,
                            ddate: ddate,
                            payee: payee,
                            currency_id: currency_id,
                            spot_rate: spot_rate,
                            tran_exrate: tran_exrate,
                            rate: rate,
                            ending_exrate: ending_exrate,
                            balance: balance,
                            gain_loss: gain_loss,
                            net_gain_loss: net_gain_loss,
                            prior_gain_loss: prior_gain_loss
                        })
                    }

                    log.debug("ArraySublistResult", arraySublistresult);
                    log.debug("spot_rate_array", spot_rate_array);

                    var groupedData = spot_rate_array.reduce(function (acc, item) {
                        // If the type doesn't exist in the accumulator, create a new array for it
                        if (!acc[item.type]) {
                            acc[item.type] = [];
                        }
                        // Push the id to the corresponding type array
                        acc[item.type].push(item.id);
                        return acc;
                    }, {});

                    // Convert the grouped data into the desired format
                    var result_grouped = Object.keys(groupedData).map(function (key) {
                        return {
                            "type": key,
                            "id": groupedData[key]
                        };
                    });
                    log.debug('Grouped Result:', result_grouped);  // Check the grouped result

                    var resultArrayGr = result_grouped.map(group => ({
                        type: transactionTypes[group.type] || group.type, // Fallback to original type if not found
                        id: group.id
                    }));
                    log.debug('Grouped Result:', resultArrayGr);  // Check the grouped result

                    var spot_rate_mapping = getSublist(resultArrayGr);
                    log.debug("spotRateMapping", spot_rate_mapping)

                    var journalEntry = record.create({
                        type: record.Type.JOURNAL_ENTRY,
                        isDynamic: true
                    });

                    // Set Journal Entry fields
                    journalEntry.setValue({
                        fieldId: 'custbody_me_related_cr',
                        value: CRresult[i].internalid
                    });
                    journalEntry.setValue({
                        fieldId: 'custbody_me_generate_by_sys',
                        value: true
                    });
                    if (parseDetail.journalType === 'AcctRec') {
                        journalEntry.setValue({
                            fieldId: 'memo',
                            value: "Journal Selisih Penyesuaian " + CRresult[i].currency_text + " dengan Exchange Rate NetSuite dan Exchange Rates TMS terhadap nomor Transaksi " + CRresult[i].tranid + " (OPEN RECEIVABLES)"
                        });
                    } else {
                        journalEntry.setValue({
                            fieldId: 'memo',
                            value: "Journal Selisih Penyesuaian " + CRresult[i].currency_text + " dengan Exchange Rate NetSuite dan Exchange Rates TMS terhadap nomor Transaksi " + CRresult[i].tranid + " (OPEN PAYABLES)"
                        });
                    }
                    journalEntry.setValue({
                        fieldId: 'currency',
                        value: CRresult[i].currency
                    });
                    journalEntry.setValue({
                        fieldId: 'trandate',
                        value: cr.getValue("trandate")
                    });
                    journalEntry.setValue({
                        fieldId: 'custbody_me_voucher_list',
                        value: 3
                    });
                    journalEntry.setValue({
                        fieldId: 'custbody_me_journal_category',
                        value: 3
                    });

                    var difference = 0;
                    var result;
                    var debitamount = 0;
                    var creditamount = 0;

                    for (var c = 0; c < numLines; c++) {
                        if (arraySublistresult[c].gain_loss < 0) { //CREDIT
                            var spot_rate_result = getSpotRateAsNumber(arraySublistresult[c].id, transactionTypes[arraySublistresult[c].type], spot_rate_mapping);
                            // log.debug("spot_rate_result " + [c], spot_rate_result);
                            var control = control_formula(parseFloat(arraySublistresult[c].rate), parseFloat(spot_rate_result.spot_rate), parseFloat(arraySublistresult[c].balance));
                            log.debug("control " + arraySublistresult[c].rate + " " + Number(spot_rate_result.spot_rate) + " " + arraySublistresult[c].balance, control)
                            // log.debug("gain_loss credit", Math.abs(arraySublistresult[c].gain_loss));
                            // log.debug("spot_rate", arraySublistresult[c].spot_rate);
                            // log.debug("balance", arraySublistresult[c].balance);

                            // Set line items (credit)
                            journalEntry.selectNewLine({
                                sublistId: 'line'
                            });
                            journalEntry.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'account',
                                value: arraySublistresult[c].account // Replace with appropriate Account ID for credit
                            });

                            var lineAmount = Math.abs((Number(arraySublistresult[c].gain_loss).toFixed(2))) - control;

                            // log.debug("lineAmount", lineAmount);
                            if (lineAmount < 0) {
                                var amount = Math.abs(parseFloat(lineAmount.toFixed(2)))
                                // log.debug("amount", amount);
                                journalEntry.setCurrentSublistValue({
                                    sublistId: 'line',
                                    fieldId: 'credit',
                                    value: amount // Debit amount
                                });
                                result = "Credit"
                                creditamount += amount
                                // log.debug("debitamount", debitamount)
                            } else {
                                var amount = Math.abs(parseFloat(lineAmount.toFixed(2)))
                                // log.debug("amount", amount);
                                journalEntry.setCurrentSublistValue({
                                    sublistId: 'line',
                                    fieldId: 'debit',
                                    value: amount // Credit amount
                                });
                                result = "Debit"
                                debitamount += amount
                                // log.debug("creditamount", creditamount)
                            }
                            // log.debug("lineAmount", ((lineAmount)).toFixed(2));

                            if (parseDetail.journalType === 'AcctRec') {
                                journalEntry.setCurrentSublistValue({
                                    sublistId: 'line',
                                    fieldId: 'memo',
                                    value: "Journal Selisih Penyesuaian " + CRresult[i].currency_text + " dengan Exchange Rate NetSuite dan Exchange Rates TMS terhadap nomor Transaksi " + CRresult[i].tranid + " (OPEN RECEIVABLES)"
                                });
                            } else {
                                journalEntry.setCurrentSublistValue({
                                    sublistId: 'line',
                                    fieldId: 'memo',
                                    value: "Journal Selisih Penyesuaian " + CRresult[i].currency_text + " dengan Exchange Rate NetSuite dan Exchange Rates TMS terhadap nomor Transaksi " + CRresult[i].tranid + " (OPEN PAYABLES)"
                                });
                            }

                            journalEntry.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'entity',
                                value: arraySublistresult[c].payee
                            });
                            journalEntry.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'department',
                                value: 124
                            });
                            journalEntry.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'location',
                                value: 38
                            });
                            journalEntry.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'class',
                                value: 106
                            });

                            if (result === "Debit") {
                                difference += Math.abs(lineAmount)
                            } else if (result === "Credit") {
                                difference -= Math.abs(lineAmount)
                            }

                            if (parseDetail.journalType === 'AcctRec') {
                                journalEntry.setValue({
                                    fieldId: 'memo',
                                    value: "Journal Selisih Penyesuaian " + CRresult[i].currency_text + " dengan Exchange Rate NetSuite dan Exchange Rates TMS terhadap nomor Transaksi " + CRresult[i].tranid + " (OPEN RECEIVABLES)"
                                });
                            } else {
                                journalEntry.setValue({
                                    fieldId: 'memo',
                                    value: "Journal Selisih Penyesuaian " + CRresult[i].currency_text + " dengan Exchange Rate NetSuite dan Exchange Rates TMS terhadap nomor Transaksi " + CRresult[i].tranid + " (OPEN PAYABLES)"
                                });
                            }

                            journalEntry.commitLine({
                                sublistId: 'line'
                            });
                        } else { // DEBIT
                            var spot_rate_result = getSpotRateAsNumber(arraySublistresult[c].id, transactionTypes[arraySublistresult[c].type], spot_rate_mapping);
                            // log.debug("spot_rate_result " + [c], spot_rate_result);
                            var control = control_formula(parseFloat(arraySublistresult[c].rate), parseFloat(spot_rate_result.spot_rate), parseFloat(arraySublistresult[c].balance));
                            log.debug("control " + arraySublistresult[c].rate + " " + Number(spot_rate_result.spot_rate) + " " + arraySublistresult[c].balance, control)
                            // log.debug("gain_loss debit", Math.abs(arraySublistresult[c].gain_loss));
                            // log.debug("spot_rate", arraySublistresult[c].spot_rate);
                            // log.debug("balance", arraySublistresult[c].balance);

                            // Set line items (debit)
                            journalEntry.selectNewLine({
                                sublistId: 'line'
                            });
                            journalEntry.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'account',
                                value: arraySublistresult[c].account // Replace with appropriate Account ID for debit
                            });

                            var lineAmount = Math.abs((Number(arraySublistresult[c].gain_loss).toFixed(2))) - control;

                            // log.debug("lineAmount", lineAmount);
                            if (lineAmount < 0) {
                                var amount = Math.abs(parseFloat(lineAmount.toFixed(2)))
                                // log.debug("amount", amount);
                                journalEntry.setCurrentSublistValue({
                                    sublistId: 'line',
                                    fieldId: 'debit',
                                    value: amount// Debit amount
                                });
                                result = "Debit"
                                debitamount += amount
                                // log.debug("debutamount", debitamount)
                            } else {
                                var amount = Math.abs(parseFloat(lineAmount.toFixed(2)))
                                // log.debug("amount", amount);
                                journalEntry.setCurrentSublistValue({
                                    sublistId: 'line',
                                    fieldId: 'credit',
                                    value: amount // Credit amount
                                });
                                result = "Credit"
                                creditamount += amount
                                // log.debug("creditamount", creditamount)
                            }
                            // log.debug("lineAmount", (Number(lineAmount)).toFixed(2));


                            if (parseDetail.journalType === 'AcctRec') {
                                journalEntry.setCurrentSublistValue({
                                    sublistId: 'line',
                                    fieldId: 'memo',
                                    value: "Journal Selisih Penyesuaian " + CRresult[i].currency_text + " dengan Exchange Rate NetSuite dan Exchange Rates TMS terhadap nomor Transaksi " + CRresult[i].tranid + " (OPEN RECEIVABLES)"
                                });
                            } else {
                                journalEntry.setCurrentSublistValue({
                                    sublistId: 'line',
                                    fieldId: 'memo',
                                    value: "Journal Selisih Penyesuaian " + CRresult[i].currency_text + " dengan Exchange Rate NetSuite dan Exchange Rates TMS terhadap nomor Transaksi " + CRresult[i].tranid + " (OPEN PAYABLES)"
                                });
                            }
                            journalEntry.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'entity',
                                value: arraySublistresult[c].payee
                            });
                            journalEntry.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'department',
                                value: 124
                            });
                            journalEntry.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'location',
                                value: 38
                            });
                            journalEntry.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'class',
                                value: 106
                            });

                            if (result === "Debit") {
                                difference += Math.abs(lineAmount)
                            } else if (result === "Credit") {
                                difference -= Math.abs(lineAmount)
                            }
                            if (parseDetail.journalType === 'AcctRec') {
                                journalEntry.setValue({
                                    fieldId: 'memo',
                                    value: "Journal Selisih Penyesuaian " + CRresult[i].currency_text + " dengan Exchange Rate NetSuite dan Exchange Rates TMS terhadap nomor Transaksi " + CRresult[i].tranid + " (OPEN RECEIVABLES)"
                                });
                            } else {
                                journalEntry.setValue({
                                    fieldId: 'memo',
                                    value: "Journal Selisih Penyesuaian " + CRresult[i].currency_text + " dengan Exchange Rate NetSuite dan Exchange Rates TMS terhadap nomor Transaksi " + CRresult[i].tranid + " (OPEN PAYABLES)"
                                });
                            }
                            journalEntry.commitLine({
                                sublistId: 'line'
                            });
                        }
                    }

                    var dcamount = debitamount - creditamount;
                    log.debug("dcamount", dcamount);
                    log.debug("difference", difference);
                    log.debug("spotratearray = numlines", spot_rate_array.length === numLines)

                    if (debitamount > creditamount) {
                        log.debug("credit amount", Math.abs(parseFloat(dcamount.toFixed(2))))
                        journalEntry.selectNewLine({
                            sublistId: 'line'
                        });
                        journalEntry.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'account',
                            value: 837
                        });
                        journalEntry.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'credit',
                            value: Math.abs(parseFloat(dcamount.toFixed(2)))
                        });
                        journalEntry.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'department',
                            value: 124
                        });
                        journalEntry.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'location',
                            value: 38
                        });
                        journalEntry.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'class',
                            value: 106
                        });
                        if (parseDetail.journalType === 'AcctRec') {
                            journalEntry.setValue({
                                fieldId: 'memo',
                                value: "Journal Selisih Penyesuaian " + CRresult[i].currency_text + " dengan Exchange Rate NetSuite dan Exchange Rates TMS terhadap nomor Transaksi " + CRresult[i].tranid + " (OPEN RECEIVABLES)"
                            });
                        } else {
                            journalEntry.setValue({
                                fieldId: 'memo',
                                value: "Journal Selisih Penyesuaian " + CRresult[i].currency_text + " dengan Exchange Rate NetSuite dan Exchange Rates TMS terhadap nomor Transaksi " + CRresult[i].tranid + " (OPEN PAYABLES)"
                            });
                        }
                        journalEntry.commitLine({
                            sublistId: 'line'
                        });
                    } else {
                        log.debug("debit amount", Math.abs(parseFloat(dcamount.toFixed(2))))
                        journalEntry.selectNewLine({
                            sublistId: 'line'
                        });
                        journalEntry.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'account',
                            value: 837
                        });
                        journalEntry.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'debit',
                            value: Math.abs(parseFloat(dcamount.toFixed(2)))
                        });
                        journalEntry.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'department',
                            value: 124
                        });
                        journalEntry.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'location',
                            value: 38
                        });
                        journalEntry.setCurrentSublistValue({
                            sublistId: 'line',
                            fieldId: 'class',
                            value: 106
                        });
                        if (parseDetail.journalType === 'AcctRec') {
                            journalEntry.setValue({
                                fieldId: 'memo',
                                value: "Journal Selisih Penyesuaian " + CRresult[i].currency_text + " dengan Exchange Rate NetSuite dan Exchange Rates TMS terhadap nomor Transaksi " + CRresult[i].tranid + " (OPEN RECEIVABLES)"
                            });
                        } else {
                            journalEntry.setValue({
                                fieldId: 'memo',
                                value: "Journal Selisih Penyesuaian " + CRresult[i].currency_text + " dengan Exchange Rate NetSuite dan Exchange Rates TMS terhadap nomor Transaksi " + CRresult[i].tranid + " (OPEN PAYABLES)"
                            });
                        }
                        journalEntry.commitLine({
                            sublistId: 'line'
                        });
                    }
                    var journalEntryId = journalEntry.save();
                    log.debug("journal", journalEntryId);
                    journal.push({
                        journal_id: journalEntryId
                    })
                    // break;
                }
            }
            log.debug("Journals", journal);
        } else {
            log.debug("message", "No More Currency Revaluation to process")
        }

        var remainingUsage = runtime.getCurrentScript().getRemainingUsage();
        log.debug('Remaining Usage:', remainingUsage);
    }

    return {
        execute: execute
    }
});