/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(['N/search', 'N/ui/serverWidget', 'N/log', 'N/task', 'N/redirect', 'N/url', 'N/format', 'N/record', "N/runtime", 'N/encode', 'N/render', 'N/file', './library/moment.min.js'],
    function (search, serverWidget, log, task, redirect, url, format, record, runtime, encode, render, file, moment) {

        var DATA = {
            head_date: 'custpage_date',
            head_vendor: 'custpage_vendor',
            head_subsidiary: 'custpage_subsidiary',
            head_currency: 'custpage_currency',
            head_accountingperiod: 'custpage_accountingperiod'
        }
        var DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        var COLOR = ['red', '#ffccff', '#ccffcc', '#ffffcc', '#ccffff', '#adb9ca', 'red']

        var data_supplier = {}

        function areObjectsPresent(arr1, arr2) {
            for (let i = 0; i < arr1.length; i++) {
                const obj1 = arr1[i];
                if (arr2.some(obj2 => obj2.vendor_id === obj1.vendor_id && obj2.currency === obj1.currency && obj2.subsidiary === obj1.subsidiary && obj2.type === obj1.type)) {
                    return true; // Found a common object
                }
            }
            return false; // No common objects found
        }

        function searchHutangTitip(data) {
            var dataSettlement = [];
            var reportData = [];
            var rawReportData = [];
            var filter = [
                ["account", "anyof", "4241", "4242", "4243", "4244"],
                "AND",
                ["type", "anyof", "VendBill", "VendCred", "VendPymt", "Journal", "FxReval"],
                // "AND",
                // ["mainline", "is", "T"],
            ];
            if (data.subsidiary != "") {
                filter.push(
                    "AND",
                    ["subsidiary.internalid", "anyof", data.subsidiary],);
            }

            if (data.date) {
                filter.push(
                    "AND",
                    ["trandate", "onorbefore", data.date],);
            }

            if (data.vendor != "") {
                filter.push(
                    "AND",
                    ["name", "anyof", data.vendor],);
            };

            if (data.currency != "") {
                filter.push(
                    "AND",
                    ["currency.internalid", "anyof", data.currency],);
            }

            // if (data.accountingperiod != "") {
            //     filter.push(
            //         "AND",
            //         ["accountingperiod.internalid", "anyof", data.accountingperiod],);
            // }
            var dataMonth = moment(data.date, 'DD/M/YYYY').format('MMM YYYY');

            var transactionSearchObj = search.create({
                type: "transaction",
                filters: filter,
                columns:
                    [
                        //0
                        search.createColumn({
                            name: "entityid",
                            join: "vendor",
                            sort: search.Sort.DESC,
                            label: "Name"
                        }),
                        //1
                        search.createColumn({
                            name: "formulatext",
                            formula: "case when {vendor.isperson}  = 'F' then {vendor.companyname} else {vendor.firstname} || {vendor.lastname} end",
                            label: "Vendor Name"
                        }),
                        //2
                        search.createColumn({ name: "currency", label: "Currency" }),
                        //3
                        search.createColumn({ name: "fxamount", label: "Amount (Foreign Currency)" }),
                        //4
                        search.createColumn({ name: "type", label: "Type" }),
                        //5
                        search.createColumn({ name: "account", label: "Account" }),
                        //6
                        search.createColumn({ name: "entity", label: "Name" }),
                        //7
                        search.createColumn({ name: "postingperiod", label: "Period" }),
                        //8
                        search.createColumn({
                            name: "category",
                            join: "vendor",
                            label: "Category"
                        }),
                        //9
                        search.createColumn({
                            name: "duedate",
                            sort: search.Sort.DESC,
                            label: "Due Date/Receive By"
                        }),
                        //10
                        // search.createColumn({ name: "custbody_me_vendor_category_po", label: "ME - Vendor Category" }),
                        //11
                        search.createColumn({
                            name: "formulatext",
                            formula: "REGEXP_SUBSTR({subsidiary}, '[^:]+', 1, 2)",
                            label: "subsidiary"
                        }),
                        //12
                        search.createColumn({ name: "subsidiary", label: "Subsidiary" }),
                        //13
                        // search.createColumn({
                        //     name: "formulacurrency",
                        //     formula: "case when {applyingforeignamount} != 0 then {fxamount} - {applyingforeignamount} else 0 end",
                        //     label: "Amount After payment/credit"
                        // }),
                        //14
                        // search.createColumn({ name: "applyingtransaction", label: "Applying Transaction" }),
                        // //15
                        // search.createColumn({ name: "applyingforeignamount", label: "Applying Link Amount (Foreign Currency)" }),
                        // //16
                        search.createColumn({ name: "internalid", label: "Internal Id" }),
                        // //17
                        // search.createColumn({
                        //     name: "trandate",
                        //     join: "applyingTransaction",
                        //     label: "Date"
                        // }),

                    ]
            });

            var countDup = 0;
            var countDupVendorId = 0;
            var countDupVendorIdSettlement = 0;
            var countDupVendorId = 0;
            var internaldCountArr = [];
            var isNotBillArr = [];
            var idVendor = [];
            var internaldCount = 0;

            do {
                var startrow = 0;
                var result = transactionSearchObj.run().getRange({
                    start: startrow,
                    end: startrow + 1000,
                });
                log.debug("result length", result.length)

                for (let x = 0; x < result.length; x++) {
                    var vendorId = result[x].getValue(result[x].columns[6]);
                    var vendorName = result[x].getText(result[x].columns[6]);
                    var companyName = result[x].getValue(result[x].columns[1]);
                    var currency = result[x].getValue(result[x].columns[2]);
                    var currencyText = result[x].getText(result[x].columns[2]);
                    var amountBeforeSettlement = result[x].getValue(result[x].columns[3]);
                    var typeTrans = result[x].getValue(result[x].columns[4]);
                    // var amount = result[x].getValue(result[x].columns[12]);
                    var periodPost = result[x].getValue(result[x].columns[7]);
                    var subsidiary = result[x].getValue(result[x].columns[10]);
                    var subsidiaryText = result[x].getText(result[x].columns[10]);
                    var dueDate = result[x].getValue(result[x].columns[9]);
                    // var type = result[x].getText(result[x].columns[10]);
                    // var typeId = result[x].getValue(result[x].columns[10]);
                    var subsidiaryId = result[x].getValue(result[x].columns[11]);
                    // var applyingTransaction = result[x].getValue(result[x].columns[13]);
                    // var applyingTransactionText = result[x].getText(result[x].columns[13]);
                    // var applyingTransactionAmount = result[x].getValue(result[x].columns[14]);
                    var internalId = result[x].getValue(result[x].columns[12]);
                    // var dateApplyingTrans = result[x].getValue(result[x].columns[16]);
                    var dueMonthTest = moment(dueDate, 'DD/M/YYYY').format('MMM YYYY');

                    log.debug("AMOUNT", "_______" + currency + "_____" + subsidiary + "______" + + "______");

                    idVendor.push(vendorId);

                    // if (idVendor.length == 0) {
                    //     idVendor.push(vendorId);
                    // } else if (idVendor.length > 0) {
                    //     for (let o = 0; o < idVendor.length; o++) {
                    //         if (idVendor[o] == vendorId) {
                    //             countDupVendorId++;
                    //             break;
                    //         }
                    //     }
                    //     if (countDupVendorId < 1) {
                    //         idVendor.push(vendorId);
                    //     }
                    // }

                    // if (typeTrans != "VendBill" && isNotBillArr.length > 0) {
                    //     for (let p = 0; p < isNotBillArr.length; p++) {
                    //         if (currency == isNotBillArr[p].currency && vendorId == isNotBillArr[p].vendor_id && subsidiaryId == isNotBillArr[p].subsidiary) {
                    //             isNotBillArr[p].amount_not_bill += Number(amountBeforeSettlement);
                    //             break;
                    //         } else {
                    //             isNotBillArr.push({
                    //                 // month: moment(date, 'DD/M/YYYY').format('MMM YYYY'),
                    //                 currency: currency,
                    //                 amount_not_bill: amountBeforeSettlement,
                    //                 vendor_id: vendorId,
                    //                 subsidiary: subsidiaryId,
                    //             });
                    //             break;
                    //         }
                    //     }
                    // } else if (typeTrans != "VendBill" && isNotBillArr.length == 0) {
                    //     isNotBillArr.push({
                    //         // month: moment(date, 'DD/M/YYYY').format('MMM YYYY'),
                    //         currency: currency,
                    //         amount_not_bill: amountBeforeSettlement,
                    //         vendor_id: vendorId,
                    //         subsidiary: subsidiaryId,
                    //     });
                    // }

                    for (let i = 0; i < reportData.length; i++) {
                        if (reportData[i].vendor_id == vendorId && reportData[i].currency == currency && reportData[i].subsidiary_id == subsidiaryId) {
                            // if (reportData[i].dueDate == "" && dueDate != "") {
                            //     reportData[i].dueDate = dueDate;
                            //     reportData[i].dueMonth = moment(dueDate, 'DD/M/YYYY').format('MMM YYYY');
                            // }
                            // if(reportData[i].vendor_id == vendorId && reportData[i].currency == currency && reportData[i].subsidiary_id == subsidiaryId && reportData[i].type_id != typeId){
                            //     countDup = 0; 
                            // } else if(reportData[i].vendor_id == vendorId && reportData[i].currency == currency && reportData[i].subsidiary_id == subsidiaryId && reportData[i].type_id == typeId && ((applyingTransactionAmount != 0 && applyingTransaction != "") || (applyingTransactionAmount == 0 && applyingTransaction == ""))){
                            //     reportData[i].amount += Number(amount);
                            //     countDup++;
                            // }
                        }
                    }

                    // for (let i = 0; i < dataSettlement.length; i++) {
                    //     if (dataSettlement[i].vendor_id == vendorId && dataSettlement[i].currency == currency && dataSettlement[i].subsidiary_id == subsidiaryId && (moment(data.date, 'D/M/YYYY').diff(moment(dateApplyingTrans, 'D/M/YYYY'), 'days')) >= 0) {
                    //         dataSettlement[i].amount += Number(applyingTransactionAmount);
                    //         countDupVendorIdSettlement++;
                    //     }
                    // }
                    // for (let i = 0; i < reportData.length; i++) {
                    //     if (reportData[i].vendor_id == vendorId && reportData[i].currency == currency && reportData[i].subsidiary_id == subsidiaryId && reportData[i].type_id == typeId && !applyingTransactionText.includes("Currency Revaluation") && internalId != reportData[i].internal_id && !applyingTransactionText.includes("Currency Revaluation")) {
                    //         log.debug("report data ada yang DUPLIKAT", reportData[i].applying_trans_id + "_________" + applyingTransaction + "___________" + amount + "___________" + internalId)
                    //         reportData[i].amount += Number(amountBeforeSettlement);
                    //         countDupVendorId++;
                    //         break;
                    //     }
                    //     //  if (reportData[i].vendor_id == vendorId && reportData[i].currency == currency && reportData[i].subsidiary_id == subsidiaryId && reportData[i].type_id == typeId && !applyingTransactionText.includes("Currency Revaluation" && applyingTransaction == "") ) {
                    //     //      log.debug("report data ada yang DUPLIKAT", reportData[i].applying_trans_id + "_________" + applyingTransaction + "___________" + amount + "___________" + internalId)
                    //     //      reportData[i].amount_dup += Number(amountBeforeSettlement);
                    //     //      countDupVendorId++;
                    //     //      break;
                    //     //  }
                    // }
                    for (let i = 0; i < reportData.length; i++) {
                        if (reportData[i].vendor_id == vendorId && reportData[i].currency == currency && reportData[i].subsidiary_id == subsidiaryId) {
                            log.debug("report data ada yang DUPLIKAT", "_________" + + "___________" + + "___________" + internalId)
                            reportData[i].amount += Number(amountBeforeSettlement);
                            countDupVendorId++;
                        }
                        //  if (reportData[i].vendor_id == vendorId && reportData[i].currency == currency && reportData[i].subsidiary_id == subsidiaryId && reportData[i].type_id == typeId && !applyingTransactionText.includes("Currency Revaluation" && applyingTransaction == "") ) {
                        //      log.debug("report data ada yang DUPLIKAT", reportData[i].applying_trans_id + "_________" + applyingTransaction + "___________" + amount + "___________" + internalId)
                        //      reportData[i].amount_dup += Number(amountBeforeSettlement);
                        //      countDupVendorId++;
                        //      break;
                        //  }
                    }

                    // if (countDupVendorIdSettlement < 1 && applyingTransactionAmount != 0 && (moment(data.date, 'D/M/YYYY').diff(moment(dateApplyingTrans, 'D/M/YYYY'), 'days')) >= 0) {
                    //     dataSettlement.push({
                    //         internal_id: internalId,
                    //         vendor_id: vendorId,
                    //         vendor_name: vendorId,
                    //         company_name: companyName,
                    //         currency: currency,
                    //         currency_text: currencyText,
                    //         amount: Number(applyingTransactionAmount),
                    //         period_post: periodPost,
                    //         subsidiary: subsidiary,
                    //         subsidiary_id: subsidiaryId,
                    //         type: type,
                    //         type_id: typeId,
                    //         dueDate: dueDate,
                    //         applying_transaction: applyingTransaction,
                    //         applying_transaction_date: dateApplyingTrans,
                    //         applying_transaction_text: applyingTransactionText,
                    //         applying_transaction_amount: applyingTransactionAmount,
                    //         dueMonth: moment(dueDate, 'DD/M/YYYY').format('MMM YYYY'),
                    //     });
                    // }
                    if (countDupVendorId < 1) {
                        reportData.push({
                            internal_id: internalId,
                            vendor_id: vendorId,
                            // applying_trans_id: applyingTransaction,
                            vendor_name: vendorName,
                            company_name: companyName,
                            currency: currency,
                            currency_text: currencyText,
                            amount_dup: Number(amountBeforeSettlement),
                            amount: Number(amountBeforeSettlement),
                            period_post: periodPost,
                            subsidiary: subsidiary,
                            subsidiary_id: subsidiaryId,
                            // type: type,
                            type: "test",
                            type_id: "typeId",
                            dueDate: dueDate,
                            // applying_transaction: applyingTransaction,
                            // applying_transaction_date: dateApplyingTrans,
                            // applying_transaction_text: applyingTransactionText,
                            // applying_transaction_amount: applyingTransactionAmount,
                            dueMonth: moment(dueDate, 'DD/M/YYYY').format('MMM YYYY'),
                        });

                    }
                    // if (countDupVendorId < 1 && (applyingTransaction == "" || applyingTransactionAmount != 0)) {
                    //     reportData.push({
                    //         internal_id: internalId,
                    //         vendor_id: vendorId,
                    //         applying_trans_id: applyingTransaction,
                    //         vendor_name: vendorId,
                    //         company_name: companyName,
                    //         currency: currency,
                    //         currency_text: currencyText,
                    //         amount_dup: Number(amountBeforeSettlement),
                    //         amount: Number(amountBeforeSettlement),
                    //         period_post: periodPost,
                    //         subsidiary: subsidiary,
                    //         subsidiary_id: subsidiaryId,
                    //         type: type,
                    //         type_id: typeId,
                    //         dueDate: dueDate,
                    //         applying_transaction: applyingTransaction,
                    //         applying_transaction_date: dateApplyingTrans,
                    //         applying_transaction_text: applyingTransactionText,
                    //         applying_transaction_amount: applyingTransactionAmount,
                    //         dueMonth: moment(dueDate, 'DD/M/YYYY').format('MMM YYYY'),
                    //     });
                    // }

                    // rawReportData.push({
                    //     internal_id: internalId,
                    //     vendor_id: vendorId,
                    //     applying_trans_id: applyingTransaction,
                    //     vendor_name: vendorId,
                    //     company_name: companyName,
                    //     currency: currency,
                    //     currency_text: currencyText,
                    //     amount_dup: Number(amountBeforeSettlement),
                    //     amount: Number(amountBeforeSettlement),
                    //     period_post: periodPost,
                    //     subsidiary: subsidiary,
                    //     subsidiary_id: subsidiaryId,
                    //     type: type,
                    //     type_id: typeId,
                    //     dueDate: dueDate,
                    //     applying_transaction: applyingTransaction,
                    //     applying_transaction_date: dateApplyingTrans,
                    //     applying_transaction_text: applyingTransactionText,
                    //     applying_transaction_amount: applyingTransactionAmount,
                    //     dueMonth: moment(dueDate, 'DD/M/YYYY').format('MMM YYYY'),
                    //     duplicate: 0,
                    //     non_duplicate_internal_id_count: 0,
                    // })
                    countDupVendorId = 0;
                    countDupVendorIdSettlement = 0;
                    countDup = 0;
                    countDupVendorId = 0;
                }
                startrow += 1000;
            } while (result == 1000);

            var removeDupArrayId = idVendor.filter((item,
                index) => idVendor.indexOf(item) === index);
            // for (let x = 0; x < isNotBillArr.length; x++) {
            //     for (let p = 0; p < reportData.length; p++) {
            //         if (isNotBillArr[x].vendor_id == reportData[p].vendor_id && isNotBillArr[x].currency == reportData[p].currency && isNotBillArr[x].subsidiary == reportData[p].subsidiary_id) {
            //             reportData[p].amount += Number(isNotBillArr[x].amount_not_bill);
            //         }
            //     }
            // }
            log.debug("hutang titip not obj123", reportData)

            for (let p = 0; p < removeDupArrayId.length; p++) {
                var getCompanyName = search.lookupFields({
                    type: search.Type.VENDOR,
                    id: removeDupArrayId[p],
                    columns: ['companyname', 'firstname', 'lastname']
                });
                var companyNameResult = getCompanyName.companyname;
                var firstNameResult = getCompanyName.firstname;
                var lastNameResult = getCompanyName.lastname;



                for (let i = 0; i < reportData.length; i++) {
                    if (reportData[i].vendor_id == removeDupArrayId[p]) {
                        reportData[i].company_name = companyNameResult + " " + firstNameResult + " " + lastNameResult;
                    }

                }

            }

            // var newReportData = [];
            // var newDataSettlement = [];
            // var countDuplicate = 0;
            // var countDuplicateSettlement = 0;
            // var duplicateRawData = 0;
            // var countNonDuplicateRawData = 1;

            // var existingRawReportData = [];


            // for (let x = 0; x < rawReportData.length; x++) {
            //     for (let i = 0; i < existingRawReportData.length; i++) {
            //         if (rawReportData[x].internal_id == existingRawReportData[i].internal_id && rawReportData[x].vendor_id == existingRawReportData[i].vendor_id && rawReportData[x].currency == existingRawReportData[i].currency && rawReportData[x].subsidiary_id == existingRawReportData[i].subsidiary_id && rawReportData[x].type_id == existingRawReportData[i].type_id) {
            //             duplicateRawData++;
            //             // if (rawReportData[x].internal_id != existingRawReportData[i].internal_id) {
            //             //     duplicateRawData--;
            //             // }
            //             existingRawReportData[i].duplicate = duplicateRawData;
            //         }
            //     }
            //     if (duplicateRawData < 1) {
            //         existingRawReportData.push(rawReportData[x]);

            //     }
            //     duplicateRawData = 0;
            // }

            // for (let x = 0; x < existingRawReportData.length; x++) {
            //     for (let i = x + 1; i < existingRawReportData.length; i++) {
            //         if (existingRawReportData[x].internal_id != existingRawReportData[i].internal_id && existingRawReportData[x].vendor_id == existingRawReportData[i].vendor_id && existingRawReportData[x].currency == existingRawReportData[i].currency && existingRawReportData[x].subsidiary_id == existingRawReportData[i].subsidiary_id && existingRawReportData[x].type_id == existingRawReportData[i].type_id && existingRawReportData[i].duplicate < 1) {
            //             existingRawReportData[x].amount -= existingRawReportData[i].amount;
            //         }

            //     }

            // }

            // //CHECK IF THERE IS DUPLICATE ID IN "reportData"
            // for (let i = 0; i < reportData.length; i++) {
            //     // for (let x = i+1; x < reportData.length; x++) {
            //     //     if (reportData[i].vendor_id == reportData[x].vendor_id && reportData[i].currency == reportData[x].currency && reportData[i].subsidiary_id == reportData[x].subsidiary_id && reportData[i].type_id == reportData[x].type_id) {
            //     //         reportData[i].amount += reportData[x].amount;
            //     //     }
            //     // }
            //     for (let p = 0; p < newReportData.length; p++) {
            //         if (reportData[i].vendor_id == newReportData[p].vendor_id && reportData[i].currency == newReportData[p].currency && reportData[i].subsidiary_id == newReportData[p].subsidiary_id && reportData[i].type_id == newReportData[p].type_id) {
            //             countDuplicate++;
            //         }
            //     }
            //     if (countDuplicate < 1) {
            //         newReportData.push(reportData[i]);
            //     }
            //     countDuplicate = 0;
            // }
            // for (let i = 0; i < newReportData.length; i++) {
            //     for (let p = 0; p < existingRawReportData.length; p++) {
            //         if (newReportData[i].vendor_id == existingRawReportData[p].vendor_id && newReportData[i].currency == existingRawReportData[p].currency && newReportData[i].subsidiary_id == existingRawReportData[p].subsidiary_id && newReportData[i].type_id == existingRawReportData[p].type_id && existingRawReportData[p].duplicate > 0) {
            //             // var currAmount = (existingRawReportData[p].amount - newReportData[i].amount);
            //             // var currAmountDup = newReportData[i].amount_dup - dataSettlement[p].amount;
            //             // newReportData[i].amount -= dataSettlement[p].amount;
            //             newReportData[i].amount -= existingRawReportData[p].amount;
            //         }
            //     }

            // }
            // log.debug("hutang titip not obj", existingRawReportData)

            // for (let i = 0; i < newReportData.length; i++) {
            //     for (let p = 0; p < dataSettlement.length; p++) {
            //         if (newReportData[i].vendor_id == dataSettlement[p].vendor_id && newReportData[i].currency == dataSettlement[p].currency && newReportData[i].subsidiary_id == dataSettlement[p].subsidiary_id && newReportData[i].type_id == dataSettlement[p].type_id && (moment(data.date, 'D/M/YYYY').diff(moment(dataSettlement[p].applying_transaction_date, 'D/M/YYYY'), 'days')) >= 0) {
            //             // var currAmount = newReportData[i].amount - dataSettlement[p].amount;
            //             // var currAmountDup = newReportData[i].amount_dup - dataSettlement[p].amount;
            //             // newReportData[i].amount -= dataSettlement[p].amount;
            //             newReportData[i].amount -= dataSettlement[p].amount;
            //         }
            //     }

            // }


            // log.debug("hutang titip", newReportData);

            return reportData;
        }

        function searchHutangDagang(data) {
            // log.debug("subsidiary", data.subsidiary)
            var dataSettlement = [];
            var reportData = [];
            var filter = [
                ["account", "anyof", "411", "412", "413", "414"],
                "AND",
                ["type", "anyof", "VendBill", "VendCred", "VendPymt", "Journal", "FxReval"],
            ];

            if (data.subsidiary != "") {
                filter.push(
                    "AND",
                    ["subsidiary.internalid", "anyof", data.subsidiary],);
            }
            if (data.date) {
                filter.push(
                    "AND",
                    ["trandate", "onorbefore", data.date],);
            }

            if (data.vendor != "") {
                filter.push(
                    "AND",
                    ["name", "anyof", data.vendor],);
            };

            if (data.currency != "") {
                filter.push(
                    "AND",
                    ["currency.internalid", "anyof", data.currency],);
            }

            // if (data.accountingperiod != "") {
            //     filter.push(
            //         "AND",
            //         ["accountingperiod.internalid", "anyof", data.accountingperiod],);
            // }
            var dataMonth = moment(data.date, 'DD/M/YYYY').format('MMM YYYY')

            var transactionSearchObj = search.create({
                type: "transaction",
                filters: filter,
                columns:
                    [
                        //0
                        search.createColumn({
                            name: "entityid",
                            join: "vendor",
                            sort: search.Sort.DESC,
                            label: "Name"
                        }),
                        //1
                        search.createColumn({
                            name: "formulatext",
                            formula: "case when {vendor.isperson}  = 'F' then {entity} else {vendor.firstname} || {vendor.lastname} end",
                            label: "Vendor Name"
                        }),
                        //2
                        search.createColumn({ name: "currency", label: "Currency" }),
                        //3
                        search.createColumn({ name: "fxamount", label: "Amount (Foreign Currency)" }),
                        //4
                        search.createColumn({ name: "type", label: "Type" }),
                        //5
                        search.createColumn({ name: "account", label: "Account" }),
                        //6
                        search.createColumn({ name: "entity", label: "Name" }),
                        //7
                        search.createColumn({ name: "postingperiod", label: "Period" }),
                        //8
                        search.createColumn({
                            name: "category",
                            join: "vendor",
                            label: "Category"
                        }),
                        //9
                        search.createColumn({
                            name: "duedate",
                            sort: search.Sort.DESC,
                            label: "Due Date/Receive By"
                        }),
                        //10
                        search.createColumn({ name: "custbody_me_vendor_category_po", label: "ME - Vendor Category" }),
                        //11
                        search.createColumn({
                            name: "formulatext",
                            formula: "REGEXP_SUBSTR({subsidiary}, '[^:]+', 1, 2)",
                            label: "subsidiary"
                        }),
                        //12
                        search.createColumn({ name: "trandate", label: "Date" }),
                        //13
                        search.createColumn({ name: "internalid", label: "Date" }),
                        //14
                        search.createColumn({ name: "subsidiary", label: "Subsidiary" }),
                    ]
            });

            var countDup = 0;
            var countDupSettlement = 0;
            var countDupVendorId = 0;
            var isNotBillArr = [];
            var idVendor = [];

            do {
                var startrow = 0;
                var result = transactionSearchObj.run().getRange({
                    start: startrow,
                    end: startrow + 1000,
                });

                for (let x = 0; x < result.length; x++) {
                    var vendorId = result[x].getValue(result[x].columns[6]);
                    var vendorName = result[x].getText(result[x].columns[6]);
                    var companyName = result[x].getValue(result[x].columns[1]);
                    var currency = result[x].getValue(result[x].columns[2]);
                    var currencyText = result[x].getText(result[x].columns[2]);
                    var amountBeforeSettlement = result[x].getValue(result[x].columns[3]);
                    var typeTrans = result[x].getValue(result[x].columns[4]);
                    // var amount = result[x].getValue(result[x].columns[15]);
                    var periodPost = result[x].getValue(result[x].columns[7]);
                    var subsidiary = result[x].getValue(result[x].columns[11]);
                    var subsidiaryText = result[x].getText(result[x].columns[11]);
                    var dueDate = result[x].getValue(result[x].columns[9]);
                    var type = result[x].getText(result[x].columns[10]);
                    var typeId = result[x].getValue(result[x].columns[10]);
                    var date = result[x].getValue(result[x].columns[12]);
                    var subsidiaryId = result[x].getValue(result[x].columns[14]);
                    // var applyingTransaction = result[x].getValue(result[x].columns[17]);
                    // var applyingTransactionText = result[x].getText(result[x].columns[17]);
                    // var applyingTransactionAmount = result[x].getValue(result[x].columns[18]);
                    var internalId = result[x].getValue(result[x].columns[13]);
                    // var dateApplyingTrans = result[x].getValue(result[x].columns[16]);
                    var dueMonthTest = moment(dueDate, 'DD/M/YYYY').format('MMM YYYY');

                    if (idVendor.length == 0) {
                        idVendor.push(vendorId);
                    } else {
                        for (let o = 0; o < idVendor.length; o++) {
                            if (idVendor[o] == vendorId) {
                                countDupVendorId++;
                            }
                        }
                        if (countDupVendorId < 1) {
                            idVendor.push(vendorId);
                        }
                    }

                    // log.debug("AMOUNT", amount + "_______" + currency + "_____" + subsidiary + "______" + type + "__________" + ((moment(data.date, 'D/M/YYYY').diff(moment(dateApplyingTrans, 'D/M/YYYY'), 'days')) >= 0 ? Number(amount) : Number(amountBeforeSettlement)));
                    if (typeTrans != "VendBill" && isNotBillArr.length > 0) {
                        for (let p = 0; p < isNotBillArr.length; p++) {
                            if (currency == isNotBillArr[p].currency && vendorId == isNotBillArr[p].vendor_id && subsidiaryId == isNotBillArr[p].subsidiary && (moment(dataMonth, 'MMM YYYY').diff(moment(dueMonthTest, 'MMM YYYY'), 'months')) >= 0 && (moment(dataMonth, 'MMM YYYY').diff(moment(isNotBillArr[p].due_month, 'MMM YYYY'), 'months')) >= 0) {
                                isNotBillArr[p].amount_not_bill += Number(amountBeforeSettlement);
                                break;
                            } else if (currency == isNotBillArr[p].currency && vendorId == isNotBillArr[p].vendor_id && subsidiaryId == isNotBillArr[p].subsidiary && (moment(dataMonth, 'MMM YYYY').diff(moment(dueMonthTest, 'MMM YYYY'), 'months')) < 0 && (moment(dataMonth, 'MMM YYYY').diff(moment(isNotBillArr[p].due_month, 'MMM YYYY'), 'months')) < 0) {
                                isNotBillArr[p].amount_not_bill += Number(amountBeforeSettlement);
                                break;
                            } else {
                                isNotBillArr.push({
                                    month: moment(date, 'DD/M/YYYY').format('MMM YYYY'),
                                    currency: currency,
                                    amount_not_bill: amountBeforeSettlement,
                                    vendor_id: vendorId,
                                    subsidiary: subsidiaryId,
                                });
                                break;
                            }
                        }
                    } else if (typeTrans != "VendBill" && isNotBillArr.length == 0) {
                        isNotBillArr.push({
                            month: moment(date, 'DD/M/YYYY').format('MMM YYYY'),
                            currency: currency,
                            amount_not_bill: amountBeforeSettlement,
                            vendor_id: vendorId,
                            subsidiary: subsidiaryId,
                        });
                    }

                    //CHECK IF THERE ARE DUPLICATE IN DATA SETTLEMENT ARRAY
                    for (let i = 0; i < dataSettlement.length; i++) {
                        //  if (dataSettlement[i].vendor_id == vendorId && dataSettlement[i].currency == currency  && applyingTransactionAmount != 0 && dataSettlement[i].subsidiary_id == subsidiaryId && (moment(data.date, 'D/M/YYYY').diff(moment(dateApplyingTrans, 'D/M/YYYY'), 'days')) >= 0) {
                        //      if (repodataSettlementrtData[i].dueDate == "" && dueDate != "") {
                        //          dataSettlement[i].dueDate = dueDate;
                        //          dataSettlement[i].dueMonth = moment(dueDate, 'DD/M/YYYY').format('MMM YYYY');
                        //      }
                        //      if (dataSettlement[i].vendor_id == vendorId && dataSettlement[i].currency == currency && dataSettlement[i].subsidiary_id == subsidiaryId && dataSettlement[i].type_id != typeId && applyingTransactionAmount != 0) {
                        //          countDupSettlement = 0;
                        //      } else if (dataSettlement[i].vendor_id == vendorId && dataSettlement[i].currency == currency && dataSettlement[i].subsidiary_id == subsidiaryId && dataSettlement[i].type_id == typeId && applyingTransactionAmount != 0) {
                        //          dataSettlement[i].amount += Number(amount);
                        //          if ((moment(dataMonth, 'MMM YYYY').diff(moment(dueMonthTest, 'MMM YYYY'), 'months')) >= 0) {
                        //              dataSettlement[i].amount_before_curr_month += Number(applyingTransactionAmount);
                        //          }
                        //          if ((moment(dataMonth, 'MMM YYYY').diff(moment(dueMonthTest, 'MMM YYYY'), 'months')) < 0) {
                        //              dataSettlement[i].amount_before_curr_month += Number(applyingTransactionAmount);
                        //          }
                        //          countDupSettlement++;
                        //          log.debug("test amount", dataSettlement[i].amount);
                        //      }
                        // if (dataSettlement[i].vendor_id == vendorId && dataSettlement[i].currency == currency && dataSettlement[i].subsidiary_id == subsidiaryId && dataSettlement[i].type_id == typeId && (applyingTransactionAmount != 0 || applyingTransactionAmount != "") && (moment(data.date, 'D/M/YYYY').diff(moment(dateApplyingTrans, 'D/M/YYYY'), 'days')) >= 0) {
                        //     dataSettlement[i].amount += Number(applyingTransactionAmount);
                        //     if ((moment(dataMonth, 'MMM YYYY').diff(moment(dueMonthTest, 'MMM YYYY'), 'months')) >= 0) {
                        //         dataSettlement[i].amount_before_curr_month += Number(applyingTransactionAmount);
                        //     }
                        //     if ((moment(dataMonth, 'MMM YYYY').diff(moment(dueMonthTest, 'MMM YYYY'), 'months')) < 0) {
                        //         dataSettlement[i].amount_before_curr_month += Number(applyingTransactionAmount);
                        //     }
                        //     countDupSettlement++;
                        // }
                        //  }
                    }
                    //CHECK IF THERE ARE DUPLICATE IN REPORT DATA ARRAY
                    for (let i = 0; i < reportData.length; i++) {
                        //  if (reportData[i].vendor_id == vendorId && reportData[i].currency == currency && reportData[i].subsidiary_id == subsidiaryId  && applyingTransactionAmount == 0) {
                        //      if (reportData[i].dueDate == "" && dueDate != "") {
                        //          reportData[i].dueDate = dueDate;
                        //          reportData[i].dueMonth = moment(dueDate, 'DD/M/YYYY').format('MMM YYYY');
                        //      }
                        //      if (reportData[i].vendor_id == vendorId && reportData[i].currency == currency && reportData[i].subsidiary_id == subsidiaryId && reportData[i].type_id != typeId && applyingTransactionAmount == 0) {
                        //          countDup = 0;
                        //      } else if (reportData[i].vendor_id == vendorId && reportData[i].currency == currency && reportData[i].subsidiary_id == subsidiaryId && reportData[i].type_id == typeId && applyingTransactionAmount == 0) {
                        //          reportData[i].amount += Number(amount);
                        //          if ((moment(dataMonth, 'MMM YYYY').diff(moment(dueMonthTest, 'MMM YYYY'), 'months')) >= 0) {
                        //              reportData[i].amount_before_curr_month += Number(amount);
                        //          }
                        //          if ((moment(dataMonth, 'MMM YYYY').diff(moment(dueMonthTest, 'MMM YYYY'), 'months')) < 0) {
                        //              reportData[i].amount_before_curr_month += Number(amount);
                        //          }
                        //          countDup++;
                        //          log.debug("test amount", reportData[i].amount);
                        //      }
                        //  }
                        if (reportData[i].vendor_id == vendorId && reportData[i].currency == currency && reportData[i].subsidiary_id == subsidiaryId) {
                            reportData[i].amount += Number(amountBeforeSettlement);
                            if ((moment(dataMonth, 'MMM YYYY').diff(moment(dueMonthTest, 'MMM YYYY'), 'months')) >= 0) {
                                reportData[i].amount_before_curr_month += Number(amountBeforeSettlement);
                            }
                            if ((moment(dataMonth, 'MMM YYYY').diff(moment(dueMonthTest, 'MMM YYYY'), 'months')) < 0) {
                                reportData[i].amount_before_curr_month += Number(amountBeforeSettlement);
                            }
                            countDup++;
                        }
                    }

                    //PUSH DATA THAT HAVE SETTLEMENT
                    // if (countDupSettlement < 1 && applyingTransactionAmount != 0 && (moment(data.date, 'D/M/YYYY').diff(moment(dateApplyingTrans, 'D/M/YYYY'), 'days')) >= 0) {
                    //     dataSettlement.push({
                    //         vendor_id: vendorId,
                    //         vendor_name: vendorId,
                    //         company_name: companyName,
                    //         currency: currency,
                    //         currency_text: currencyText,
                    //         amount: Number(applyingTransactionAmount),
                    //         amount_before_curr_month: ((moment(dataMonth, 'MMM YYYY').diff(moment(dueMonthTest, 'MMM YYYY'), 'months')) >= 0 ? Number(applyingTransactionAmount) : 0),
                    //         amount_after_curr_month: ((moment(dataMonth, 'MMM YYYY').diff(moment(dueMonthTest, 'MMM YYYY'), 'months')) < 0 ? Number(applyingTransactionAmount) : 0),
                    //         period_post: periodPost,
                    //         subsidiary: subsidiary,
                    //         subsidiary_id: subsidiaryId,
                    //         type: type,
                    //         type_id: typeId,
                    //         date: date,
                    //         month: moment(date, 'DD/M/YYYY').format('MMM YYYY'),
                    //         dueDate: dueDate,
                    //         dueDate: dueDate,
                    //         dueMonth: moment(dueDate, 'DD/M/YYYY').format('MMM YYYY'),
                    //     });
                    // }

                    //PUSH DATA IF THERE ARE NO SETTLEMENT
                    if (countDup < 1) {
                        reportData.push({
                            vendor_id: vendorId,
                            vendor_name: vendorName,
                            company_name: companyName,
                            currency: currency,
                            currency_text: currencyText,
                            amount: Number(amountBeforeSettlement),
                            amount_before_curr_month: ((moment(dataMonth, 'MMM YYYY').diff(moment(dueMonthTest, 'MMM YYYY'), 'months')) >= 0 ? Number(amountBeforeSettlement) : 0),
                            amount_after_curr_month: ((moment(dataMonth, 'MMM YYYY').diff(moment(dueMonthTest, 'MMM YYYY'), 'months')) < 0 ? Number(amountBeforeSettlement) : 0),
                            period_post: periodPost,
                            subsidiary: subsidiary,
                            subsidiary_id: subsidiaryId,
                            type_trans: typeTrans,
                            type: "type",
                            type_id: "typeId",
                            date: date,
                            month: moment(date, 'DD/M/YYYY').format('MMM YYYY'),
                            dueDate: dueDate,
                            dueDate: dueDate,
                            dueMonth: moment(dueDate, 'DD/M/YYYY').format('MMM YYYY'),
                        });
                    }
                    countDupSettlement = 0;
                    countDup = 0;
                    countDupVendorId = 0;
                    //  for (let P = 0; P < result.length; P++) {

                    //  }
                }
                startrow += 1000;
            } while (result.length == 1000);

            log.debug("isNotBillArr", isNotBillArr);
            for (let x = 0; x < isNotBillArr.length; x++) {
                for (let p = 0; p < reportData.length; p++) {
                    if (isNotBillArr[x].vendor_id == reportData[p].vendor_id && isNotBillArr[x].currency == reportData[p].currency && isNotBillArr[x].subsidiary == reportData[p].subsidiary_id && (moment(dataMonth, 'MMM YYYY').diff(moment(isNotBillArr[x].month, 'MMM YYYY'), 'months')) >= 0) {
                        reportData[p].amount_before_curr_month += Number(isNotBillArr[x].amount_not_bill);
                    } else if (isNotBillArr[x].vendor_id == reportData[p].vendor_id && isNotBillArr[x].currency == reportData[p].currency && isNotBillArr[x].subsidiary == reportData[p].subsidiary_id && (moment(dataMonth, 'MMM YYYY').diff(moment(isNotBillArr[x].month, 'MMM YYYY'), 'months')) < 0) {
                        reportData[p].amount_after_curr_month += Number(isNotBillArr[x].amount_not_bill);
                    }
                }
            }

            for (let p = 0; p < idVendor.length; p++) {
                var getCompanyName = search.lookupFields({
                    type: search.Type.VENDOR,
                    id: idVendor[p],
                    columns: ['companyname', 'firstname', 'lastname']
                });
                var companyNameResult = getCompanyName.companyname;
                var firstNameResult = getCompanyName.firstname;
                var lastNameResult = getCompanyName.lastname;



                for (let i = 0; i < reportData.length; i++) {
                    if (reportData[i].vendor_id == idVendor[p]) {
                        reportData[i].company_name = companyNameResult + " " + firstNameResult + " " + lastNameResult;
                    }

                }

            }

            log.debug("report Data", reportData);

            // var newReportData = [];
            // var countDuplicate = 0;

            // for (let i = 0; i < reportData.length; i++) {
            //     // for (let x = i+1; x < reportData.length; x++) {
            //     // if (reportData[i].vendor_id == reportData[x].vendor_id && reportData[i].currency == reportData[x].currency && reportData[i].subsidiary_id == reportData[x].subsidiary_id && reportData[i].type_id == reportData[x].type_id) {
            //     //     reportData[i].amount += reportData[x].amount;
            //     // }
            //     // }
            //     for (let p = 0; p < newReportData.length; p++) {
            //         if (reportData[i].vendor_id == newReportData[p].vendor_id && reportData[i].currency == newReportData[p].currency && reportData[i].subsidiary_id == newReportData[p].subsidiary_id && reportData[i].type_id == newReportData[p].type_id) {
            //             countDuplicate++;
            //         }
            //     }
            //     if (countDuplicate < 1) {
            //         newReportData.push(reportData[i]);
            //     }
            //     countDuplicate = 0;
            // }

            // for (let i = 0; i < newReportData.length; i++) {
            //     for (let p = 0; p < dataSettlement.length; p++) {
            //         if (newReportData[i].vendor_id == dataSettlement[p].vendor_id && newReportData[i].currency == dataSettlement[p].currency && newReportData[i].subsidiary_id == dataSettlement[p].subsidiary_id && newReportData[i].type_id == dataSettlement[p].type_id) {
            //             newReportData[i].amount -= dataSettlement[p].amount;
            //             newReportData[i].amount_before_curr_month -= dataSettlement[p].amount_before_curr_month;
            //             // newReportData[i].amount_after_curr_month -= dataSettlement[p].amount_after_curr_month;
            //         }
            //     }

            // }

            log.debug("hutang Dagang", reportData);
            return reportData;
        }

        function getParameter() {
            var form = serverWidget.createForm({ title: 'Export Report AP Balance' })


            var usergroup = form.addFieldGroup({
                id: 'usergroup',
                label: 'Filters'
            });

            var date = form.addField({
                id: DATA.head_date,
                type: serverWidget.FieldType.DATE,
                label: 'As Of Date',
                container: 'usergroup',
            });
            date.isMandatory = false
            date.defaultValue = new Date()

            var subsidiary = form.addField({
                id: DATA.head_subsidiary,
                type: serverWidget.FieldType.SELECT,
                label: 'subsidiary',
                source: 'subsidiary',
                container: 'usergroup'
            });

            var vendor = form.addField({
                id: DATA.head_vendor,
                type: serverWidget.FieldType.SELECT,
                label: 'vendor',
                source: 'vendor',
                container: 'usergroup'
            });

            var currency = form.addField({
                id: DATA.head_currency,
                type: serverWidget.FieldType.SELECT,
                label: 'Currency',
                container: 'usergroup',
                source: 'currency'
            });
            var accountingperiod = form.addField({
                id: DATA.head_accountingperiod,
                type: serverWidget.FieldType.SELECT,
                label: 'Period',
                container: 'usergroup',
                source: 'accountingperiod'
            })
            accountingperiod.isMandatory = true;

            return form
        }

        function renderExcel(context, data, dataVendorHutangDagang, dataVendorHutangTitip) {
            var xmlString = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
            xmlString += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
            xmlString += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
            xmlString += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
            xmlString += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
            xmlString += 'xmlns:html="http://www.w3.org/TR/REC-html40">';

            xmlString += '<Styles>' +
                '<Style ss:ID="MyNumber">' +
                '<NumberFormat ss:Format="#,#"/>' +
                '</Style>' +
                '<Style ss:ID="title">' +
                '<Alignment ss:WrapText="1"/>' +
                '<Font ss:Bold="1" ss:FontName="Arial"/>' +
                '</Style>' +
                '<Style ss:ID="MyNumberBody">' +
                '<NumberFormat ss:Format="#,#"/>' +
                '<Borders>' +
                '<Border ss:Position="Left" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="1" />' +
                '<Border ss:Position="Right" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="1" /></Borders>' +
                '</Style>' +
                '<Style ss:ID="MyCurr">' +
                '<NumberFormat ss:Format="#,#"/>' +
                '</Style>' +
                '<Style ss:ID="MyCurrTotal">' +
                '<NumberFormat ss:Format="#,#"/>' +
                '<Borders>' +
                '<Border ss:Position="Top" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="1" />' +
                '<Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="1" />' +
                '<Border ss:Position="Left" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="1" />' +
                '<Border ss:Position="Right" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="1" /></Borders>' +
                '</Style>' +
                '<Style ss:ID="MyCurrBody">' +
                '<NumberFormat ss:Format="#,#"/>' +
                '<Borders>' +
                '<Border ss:Position="Left" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="1" />' +
                '<Border ss:Position="Right" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="1" /></Borders>' +
                '</Style>' +
                '<Style ss:ID="RedFont">' +
                '<Font ss:Color="#ff0000"/>' +
                '</Style>' +
                '<Style ss:ID="MyHeader">' +
                '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
                '<Font ss:Bold="1" ss:FontName="Arial"/>' +
                '<Borders><Border ss:Position="Top" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="2" />' +
                '<Border ss:Position="Bottom" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="2" />' +
                '<Border ss:Position="Left" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="2" />' +
                '<Border ss:Position="Right" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="2" /></Borders>' +
                '</Style>' +
                '<Style ss:ID="MyAlign">' +
                '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
                '<Borders>' +
                '<Border ss:Position="Left" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="1" />' +
                '<Border ss:Position="Right" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="1" /></Borders>' +
                '</Style>' +
                '<Style ss:ID="MyAlignEnd">' +
                '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
                '<Borders><Border ss:Position="Top" ss:Color="#000000" ss:LineStyle="Continuous" ss:Weight="1" />' +
                '</Borders>' +
                '</Style>' +
                '<Style ss:ID="MyAlignRed">' +
                '<Font ss:Color="#ff0000"/>' +
                '<Alignment ss:WrapText="1" ss:Vertical="Center"/>' +
                '</Style>' +
                '<Style ss:ID="MyAlignCenter">' +
                '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center"/>' +
                '</Style>' +
                '<Style ss:ID="MyAlignRight">' +
                '<Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Right"/>' +
                '</Style>' +
                '</Styles>'

            xmlString += '<Worksheet ss:Name="Hutang Dagang">';
            xmlString += '<WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">';
            xmlString += '<PageSetup>';
            xmlString += '<PageMargins x:Bottom="0.75" x:Left="0.25" x:Right="0.25" x:Top="0.75"/>'
            xmlString += '</PageSetup>';
            xmlString += '</WorksheetOptions>';

            xmlString += '<Table>';

            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="75"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="90"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';

            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';

            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';

            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';

            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';

            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';

            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';


            xmlString += '<Row>' +
                '<Cell ss:StyleID="title" ss:MergeAcross="4"><Data ss:Type="String"> Report Account Payable (AP) Balance </Data></Cell>' +
                '</Row>';
            xmlString += '<Row>' +
                '<Cell ss:StyleID="title" ss:MergeAcross="4"><Data ss:Type="String"> As-Of ' + moment(data.date, 'DD/M/YYYY').format('DD-MMM-YYYY') + '</Data></Cell>' +
                '</Row>';
            if (data.subsidiary == 2) {
                xmlString += '<Row>' +
                    '<Cell ss:StyleID="title" ss:MergeAcross="4"><Data ss:Type="String"> PT. Berlian Abadi Korpora</Data></Cell>' +
                    '</Row>';
            } else if (data.subsidiary == 3) {
                xmlString += '<Row>' +
                    '<Cell ss:StyleID="title" ss:MergeAcross="4"><Data ss:Type="String"> PT. Passion Abadi Korpora</Data></Cell>' +
                    '</Row>';
            } else {
                xmlString += '<Row>' +
                    '<Cell ss:StyleID="title" ss:MergeAcross="4"><Data ss:Type="String">PT. Berlian Abadi Korpora, PT. Passion Abadi Korpora</Data></Cell>' +
                    '</Row>';
            }

            xmlString += '<Row>' +
                '<Cell ss:StyleID="MyHeader"><Data ss:Type="String"> Supplier No </Data></Cell>' +
                '<Cell ss:StyleID="MyHeader"><Data ss:Type="String"> Supplier Name </Data></Cell>' +
                '<Cell ss:StyleID="MyHeader"><Data ss:Type="String"> Subsidiary </Data></Cell>' +
                '<Cell ss:StyleID="MyHeader"><Data ss:Type="String"> Currency </Data></Cell>' +
                '<Cell ss:StyleID="MyHeader"><Data ss:Type="String"> Amount </Data></Cell>' +
                '<Cell ss:StyleID="MyHeader"><Data ss:Type="String"> JT <= ' + moment(data.date, 'DD/M/YYYY').format('MMM-YY') + '</Data></Cell>' +
                '<Cell ss:StyleID="MyHeader"><Data ss:Type="String"> JT > ' + moment(data.date, 'DD/M/YYYY').format('MMM-YY') + '</Data></Cell>' +
                '<Cell ss:StyleID="MyHeader"><Data ss:Type="String">' + moment(data.date, 'DD/M/YYYY').format('MMM-YY') + '</Data></Cell>' +
                '<Cell ss:StyleID="MyHeader"><Data ss:Type="String">' + moment(data.date, 'DD/M/YYYY').add(1, 'months').format('MMM-YY') + '</Data></Cell>' +
                '<Cell ss:StyleID="MyHeader"><Data ss:Type="String">' + moment(data.date, 'DD/M/YYYY').add(2, 'months').format('MMM-YY') + '</Data></Cell>' +
                //  '<Cell ss:StyleID="MyHeader"><Data ss:Type="String"> Type</Data></Cell>' +


                '</Row>';

            var duplicateHutangDagang = 0;
            var totalEachCurrencyHutangDagang = [];

            // '<Cell ss:StyleID="MyCurrBody"><Data ss:Type="Number">' + ((moment(getMonth, 'MMM-YYYY').diff(moment(dataVendorHutangDagang[x].dueMonth, 'MMM YYYY'), 'months')) >= 0 ? dataVendorHutangDagang[x].amount : 0) + '</Data></Cell>' +
            // '<Cell ss:StyleID="MyCurrBody"><Data ss:Type="Number">' + ((moment(getMonth, 'MMM-YYYY').diff(moment(dataVendorHutangDagang[x].dueMonth, 'MMM YYYY'), 'months')) < 0 ? dataVendorHutangDagang[x].amount : 0) + '</Data></Cell>' +
            for (let x = 0; x < dataVendorHutangDagang.length; x++) {
                var getMonth = moment(data.date, 'DD/M/YYYY').format('MMM-YYYY');
                xmlString += '<Row>' +
                    '<Cell ss:StyleID="MyAlign"><Data ss:Type="String">' + dataVendorHutangDagang[x].vendor_name + '</Data></Cell>' +
                    '<Cell ss:StyleID="MyAlign"><Data ss:Type="String">' + dataVendorHutangDagang[x].company_name + '</Data></Cell>' +
                    '<Cell ss:StyleID="MyAlign"><Data ss:Type="String">' + dataVendorHutangDagang[x].subsidiary + '</Data></Cell>' +
                    '<Cell ss:StyleID="MyAlign"><Data ss:Type="String">' + dataVendorHutangDagang[x].currency_text + '</Data></Cell>' +
                    '<Cell ss:StyleID="MyCurrBody"><Data ss:Type="Number">' + dataVendorHutangDagang[x].amount + '</Data></Cell>' +
                    '<Cell ss:StyleID="MyCurrBody"><Data ss:Type="Number">' + dataVendorHutangDagang[x].amount_before_curr_month + '</Data></Cell>' +
                    '<Cell ss:StyleID="MyCurrBody"><Data ss:Type="Number">' + dataVendorHutangDagang[x].amount_after_curr_month + '</Data></Cell>' +
                    '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"></Data></Cell>' +
                    '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"></Data></Cell>' +
                    '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"></Data></Cell>' +
                    //  '<Cell ss:StyleID="MyAlign"><Data ss:Type="String">' + dataVendorHutangDagang[x].type + '</Data></Cell>' +
                    '</Row>';

                for (let i = 0; i < totalEachCurrencyHutangDagang.length; i++) {
                    if (totalEachCurrencyHutangDagang[i].id_currency == dataVendorHutangDagang[x].currency) {
                        totalEachCurrencyHutangDagang[i].total_amount += Number(dataVendorHutangDagang[x].amount);
                        duplicateHutangDagang++;
                    }
                }

                if (duplicateHutangDagang < 1) {
                    totalEachCurrencyHutangDagang.push({
                        id_currency: dataVendorHutangDagang[x].currency,
                        text_currency: dataVendorHutangDagang[x].currency_text,
                        total_amount: Number(dataVendorHutangDagang[x].amount),
                    })
                }

                duplicateHutangDagang = 0;


            }

            xmlString += '<Row>' +
                '<Cell ss:StyleID="MyAlignEnd"><Data ss:Type="String"></Data></Cell>' +
                '<Cell ss:StyleID="MyAlignEnd"><Data ss:Type="String"></Data></Cell>' +
                '<Cell ss:StyleID="MyAlignEnd"><Data ss:Type="String"></Data></Cell>' +
                '<Cell ss:StyleID="MyAlignEnd"><Data ss:Type="String"></Data></Cell>' +
                '<Cell ss:StyleID="MyAlignEnd"><Data ss:Type="String"></Data></Cell>' +
                '<Cell ss:StyleID="MyAlignEnd"><Data ss:Type="String"></Data></Cell>' +
                '<Cell ss:StyleID="MyAlignEnd"><Data ss:Type="String"></Data></Cell>' +
                '<Cell ss:StyleID="MyAlignEnd"><Data ss:Type="String"></Data></Cell>' +
                '<Cell ss:StyleID="MyAlignEnd"><Data ss:Type="String"></Data></Cell>' +
                '<Cell ss:StyleID="MyAlignEnd"><Data ss:Type="String"></Data></Cell>' +
                //  '<Cell ss:StyleID="MyAlignEnd"><Data ss:Type="String"></Data></Cell>' +


                '</Row>';

            xmlString += '<Row>' +
                '<Cell ss:StyleID="MyHeader"><Data ss:Type="String"> Total IDR</Data></Cell>' +
                '<Cell ss:StyleID="MyCurrTotal"><Data ss:Type="Number">' + ((typeof (totalEachCurrencyHutangDagang.find((element) => element.id_currency == 1))) == 'undefined' ? 0 : (totalEachCurrencyHutangDagang.find((element) => element.id_currency == 1).total_amount)) + '</Data></Cell>' +
                '</Row>';

            xmlString += '<Row>' +
                '<Cell ss:StyleID="MyHeader"><Data ss:Type="String"> Total HKD</Data></Cell>' +
                '<Cell ss:StyleID="MyCurrTotal"><Data ss:Type="Number">' + ((typeof (totalEachCurrencyHutangDagang.find((element) => element.id_currency == 6))) == 'undefined' ? 0 : (totalEachCurrencyHutangDagang.find((element) => element.id_currency == 6).total_amount)) + '</Data></Cell>' +
                '</Row>';

            xmlString += '<Row>' +
                '<Cell ss:StyleID="MyHeader"><Data ss:Type="String"> Total USD</Data></Cell>' +
                '<Cell ss:StyleID="MyCurrTotal"><Data ss:Type="Number">' + ((typeof (totalEachCurrencyHutangDagang.find((element) => element.id_currency == 2))) == 'undefined' ? 0 : (totalEachCurrencyHutangDagang.find((element) => element.id_currency == 2).total_amount)) + '</Data></Cell>' +
                '</Row>';

            xmlString += '<Row>' +
                '<Cell ss:StyleID="MyHeader"><Data ss:Type="String"> Total SGD</Data></Cell>' +
                '<Cell ss:StyleID="MyCurrTotal"><Data ss:Type="Number">' + ((typeof (totalEachCurrencyHutangDagang.find((element) => element.id_currency == 7))) == 'undefined' ? 0 : totalEachCurrencyHutangDagang.find((element) => element.id_currency == 7).total_amount) + '</Data></Cell>' +
                '</Row>';

            // xmlString += '<Row>' + // Row Header Hari
            // '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"></Data></Cell>' +
            // '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"></Data></Cell>' +
            // '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"></Data></Cell>' +
            // '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"></Data></Cell>' +
            // '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"></Data></Cell>' +
            // '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"></Data></Cell>' +
            // '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"></Data></Cell>' +
            // '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> Hari </Data></Cell>' +
            // '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> Hari </Data></Cell>' +
            // '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> Hari </Data></Cell>' +
            // '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> Hari </Data></Cell>' +
            // '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> Hari </Data></Cell>' +
            // '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> Hari </Data></Cell>' +
            // '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> Hari </Data></Cell>' +

            // '</Row>';


            xmlString += '</Table></Worksheet>';

            xmlString += '<Worksheet ss:Name="Hutang Titip">';
            xmlString += '<WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">';
            xmlString += '<PageSetup>';
            xmlString += '<PageMargins x:Bottom="0.75" x:Left="0.25" x:Right="0.25" x:Top="0.75"/>'
            xmlString += '</PageSetup>';
            xmlString += '</WorksheetOptions>';

            xmlString += '<Table>';

            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="75"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="90"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';

            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';

            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';

            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';

            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';

            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';

            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';
            xmlString += '<Column ss:AutoFitWidth="1" ss:Width="80"/>';

            xmlString += '<Row>' +
                '<Cell ss:StyleID="title" ss:MergeAcross="4"><Data ss:Type="String"> Report Account Payable (AP) Balance </Data></Cell>' +
                '</Row>';
            xmlString += '<Row>' +
                '<Cell ss:StyleID="title" ss:MergeAcross="4"><Data ss:Type="String"> As-Of ' + moment(data.date, 'DD/M/YYYY').format('DD-MMM-YYYY') + '</Data></Cell>' +
                '</Row>';
            if (data.subsidiary == 2) {
                xmlString += '<Row>' +
                    '<Cell ss:StyleID="title" ss:MergeAcross="4"><Data ss:Type="String"> PT. Berlian Abadi Korpora</Data></Cell>' +
                    '</Row>';
            } else if (data.subsidiary == 3) {
                xmlString += '<Row>' +
                    '<Cell ss:StyleID="title" ss:MergeAcross="4"><Data ss:Type="String"> PT. Passion Abadi Korpora</Data></Cell>' +
                    '</Row>';
            } else {
                xmlString += '<Row>' +
                    '<Cell ss:StyleID="title" ss:MergeAcross="4"><Data ss:Type="String">PT. Berlian Abadi Korpora, PT. Passion Abadi Korpora</Data></Cell>' +
                    '</Row>';
            }


            xmlString += '<Row>' +
                '<Cell ss:StyleID="MyHeader"><Data ss:Type="String"> Supplier No </Data></Cell>' +
                '<Cell ss:StyleID="MyHeader"><Data ss:Type="String"> Supplier Name </Data></Cell>' +
                '<Cell ss:StyleID="MyHeader"><Data ss:Type="String"> Subsidiary </Data></Cell>' +
                '<Cell ss:StyleID="MyHeader"><Data ss:Type="String"> Currency </Data></Cell>' +
                '<Cell ss:StyleID="MyHeader"><Data ss:Type="String"> Amount </Data></Cell>' +
                //  '<Cell ss:StyleID="MyHeader"><Data ss:Type="String">Type</Data></Cell>' +
                '<Cell ss:StyleID="MyHeader"><Data ss:Type="String">' + moment(data.date, 'DD/M/YYYY').format('MMM-YY') + '</Data></Cell>' +
                '<Cell ss:StyleID="MyHeader"><Data ss:Type="String">' + moment(data.date, 'DD/M/YYYY').add(1, 'months').format('MMM-YY') + '</Data></Cell>' +
                '<Cell ss:StyleID="MyHeader"><Data ss:Type="String">' + moment(data.date, 'DD/M/YYYY').add(2, 'months').format('MMM-YY') + '</Data></Cell>' +


                '</Row>';

            var totalEachCurrencyHutangTitip = [];
            var duplicates = 0;

            for (let x = 0; x < dataVendorHutangTitip.length; x++) {
                xmlString += '<Row>' +
                    '<Cell ss:StyleID="MyAlign"><Data ss:Type="String">' + dataVendorHutangTitip[x].vendor_name + '</Data></Cell>' +
                    '<Cell ss:StyleID="MyAlign"><Data ss:Type="String">' + dataVendorHutangTitip[x].company_name + '</Data></Cell>' +
                    '<Cell ss:StyleID="MyAlign"><Data ss:Type="String">' + dataVendorHutangTitip[x].subsidiary + '</Data></Cell>' +
                    '<Cell ss:StyleID="MyAlign"><Data ss:Type="String">' + dataVendorHutangTitip[x].currency_text + '</Data></Cell>' +
                    '<Cell ss:StyleID="MyCurrBody"><Data ss:Type="Number">' + dataVendorHutangTitip[x].amount + '</Data></Cell>' +
                    //  '<Cell ss:StyleID="MyAlign"><Data ss:Type="String">' + dataVendorHutangTitip[x].type + '</Data></Cell>' +
                    '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"></Data></Cell>' +
                    '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"></Data></Cell>' +
                    '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"></Data></Cell>' +
                    '</Row>';

                for (let i = 0; i < totalEachCurrencyHutangTitip.length; i++) {
                    if (totalEachCurrencyHutangTitip[i].id_currency == dataVendorHutangTitip[x].currency) {
                        totalEachCurrencyHutangTitip[i].total_amount += Number(dataVendorHutangTitip[x].amount);
                        duplicates++;
                    }
                }

                if (duplicates < 1) {
                    totalEachCurrencyHutangTitip.push({
                        id_currency: dataVendorHutangTitip[x].currency,
                        text_currency: dataVendorHutangTitip[x].currency_text,
                        total_amount: Number(dataVendorHutangTitip[x].amount),
                    })
                }

                duplicates = 0;


            }

            //  log.debug("total", totalEachCurrencyHutangDagang);
            xmlString += '<Row>' +
                '<Cell ss:StyleID="MyAlignEnd"><Data ss:Type="String"></Data></Cell>' +
                '<Cell ss:StyleID="MyAlignEnd"><Data ss:Type="String"></Data></Cell>' +
                '<Cell ss:StyleID="MyAlignEnd"><Data ss:Type="String"></Data></Cell>' +
                '<Cell ss:StyleID="MyAlignEnd"><Data ss:Type="String"></Data></Cell>' +
                '<Cell ss:StyleID="MyAlignEnd"><Data ss:Type="String"></Data></Cell>' +
                '<Cell ss:StyleID="MyAlignEnd"><Data ss:Type="String"></Data></Cell>' +
                '<Cell ss:StyleID="MyAlignEnd"><Data ss:Type="String"></Data></Cell>' +
                '<Cell ss:StyleID="MyAlignEnd"><Data ss:Type="String"></Data></Cell>' +
                //  '<Cell ss:StyleID="MyAlignEnd"><Data ss:Type="String"></Data></Cell>' +



                '</Row>';

            xmlString += '<Row>' +
                '<Cell ss:StyleID="MyHeader"><Data ss:Type="String"> Total IDR</Data></Cell>' +
                '<Cell ss:StyleID="MyCurrTotal"><Data ss:Type="Number">' + ((typeof (totalEachCurrencyHutangTitip.find((element) => element.id_currency == 1))) == 'undefined' ? 0 : (totalEachCurrencyHutangTitip.find((element) => element.id_currency == 1).total_amount)) + '</Data></Cell>' +
                '</Row>';

            xmlString += '<Row>' +
                '<Cell ss:StyleID="MyHeader"><Data ss:Type="String"> Total HKD</Data></Cell>' +
                '<Cell ss:StyleID="MyCurrTotal"><Data ss:Type="Number">' + ((typeof (totalEachCurrencyHutangTitip.find((element) => element.id_currency == 6))) == 'undefined' ? 0 : (totalEachCurrencyHutangTitip.find((element) => element.id_currency == 6).total_amount)) + '</Data></Cell>' +
                '</Row>';

            xmlString += '<Row>' +
                '<Cell ss:StyleID="MyHeader"><Data ss:Type="String"> Total USD</Data></Cell>' +
                '<Cell ss:StyleID="MyCurrTotal"><Data ss:Type="Number">' + ((typeof (totalEachCurrencyHutangTitip.find((element) => element.id_currency == 2))) == 'undefined' ? 0 : (totalEachCurrencyHutangTitip.find((element) => element.id_currency == 2).total_amount)) + '</Data></Cell>' +
                '</Row>';

            xmlString += '<Row>' +
                '<Cell ss:StyleID="MyHeader"><Data ss:Type="String"> Total SGD</Data></Cell>' +
                '<Cell ss:StyleID="MyCurrTotal"><Data ss:Type="Number">' + ((typeof (totalEachCurrencyHutangTitip.find((element) => element.id_currency == 7))) == 'undefined' ? 0 : totalEachCurrencyHutangTitip.find((element) => element.id_currency == 7).total_amount) + '</Data></Cell>' +
                '</Row>';

            // xmlString += '<Row>' + // Row Header Hari
            // '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"></Data></Cell>' +
            // '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"></Data></Cell>' +
            // '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"></Data></Cell>' +
            // '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"></Data></Cell>' +
            // '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"></Data></Cell>' +
            // '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"></Data></Cell>' +
            // '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"></Data></Cell>' +
            // '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> Hari </Data></Cell>' +
            // '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> Hari </Data></Cell>' +
            // '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> Hari </Data></Cell>' +
            // '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> Hari </Data></Cell>' +
            // '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> Hari </Data></Cell>' +
            // '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> Hari </Data></Cell>' +
            // '<Cell ss:StyleID="MyAlign"><Data ss:Type="String"> Hari </Data></Cell>' +

            // '</Row>';


            xmlString += '</Table></Worksheet></Workbook>';

            log.debug('xmlString', xmlString)
            var strXmlEncoded = encode.convert({
                string: xmlString,
                inputEncoding: encode.Encoding.UTF_8,
                outputEncoding: encode.Encoding.BASE_64
            });
            log.debug('strXmlEncoded', strXmlEncoded)

            var objXlsFile = file.create({
                name: 'Report AP Balance.xls',
                fileType: file.Type.EXCEL,
                contents: strXmlEncoded

            });
            log.debug('objXlsFile', objXlsFile)


            context.response.writeFile({
                file: objXlsFile
            });

        }

        function getDataHutang(data) {
            var vendor = data.vendor
            var subsidiary = data.subsidiary
            var currency = data.currency
            var accountingperiod = data.accountingperiod

        }

        function getDataPembelian(data) {
            var vendor = data.vendor
            var subsidiary = data.subsidiary
            var currency = data.currency
            var accountingperiod = data.accountingperiod

        }

        function getDataPeriod(data) {
            var vendor = data.vendor
            var subsidiary = data.subsidiary
            var currency = data.currency
            var accountingperiod = data.accountingperiod

            var rec_accper = search.lookupFields({
                type: search.Type.ACCOUNTING_PERIOD,
                id: accountingperiod,
                columns: ["startdate", "enddate"]
            })

            var accper_startdate = moment(rec_accper.startdate, "DD/M/YYYY").format("YYYY-MM-DD")
            var accper_enddate = moment(rec_accper.enddate, "DD/M/YYYY").format("YYYY-MM-DD")
            log.debug('Accper Startdate +  Accper Enddate', accper_startdate + ' + ' + accper_enddate)
            log.debug('Accper Startdate +  Accper Enddate New Date', new Date(accper_startdate) + ' + ' + new Date(accper_enddate))

            var date_in_month = []
            var day_in_month = []
            var year_period = new Date(accper_startdate).getFullYear()
            var month_period = new Date(accper_startdate).getMonth()
            var date = new Date(year_period, month_period, 1);

            while (date.getMonth() === month_period) {
                var new_date = date.getDate()
                var new_month = date.getMonth()
                var new_year = date.getFullYear()
                var new_day = date.getDay()
                date_in_month.push(new_date + '/' + (new_month + 1) + new_year);
                day_in_month.push(new_day)
                date.setDate(date.getDate() + 1);
            }
            log.debug('date_in_month' + date_in_month.length, date_in_month)
            log.debug('day_in_month' + day_in_month.length, day_in_month)

        }

        function onRequest(context) {
            var form = getParameter()
            var params = context.request.parameters
            var vendor = params[DATA.head_vendor]
            var date = params[DATA.head_date]
            var subsidiary = params[DATA.head_subsidiary]
            var currency = params[DATA.head_currency]
            var accountingperiod = params[DATA.head_accountingperiod]


            if (context.request.method === 'GET') {

                form.addSubmitButton({
                    label: 'Export Excel'
                });
                context.response.writePage(form)

            } else {
                var loadAccountPeriod = record.load({
                    type: search.Type.ACCOUNTING_PERIOD,
                    id: accountingperiod,
                });

                var getAccountPeriodText = loadAccountPeriod.getValue({
                    fieldId: 'periodname',
                })
                var data = {
                    vendor: vendor,
                    date: date,
                    currency: currency,
                    accountingperiod: getAccountPeriodText,
                    subsidiary: subsidiary,
                    data_print: []
                }

                log.debug("data", data);

                var getVendorHutangDagang = searchHutangDagang(data);
                var getVendorHutangTitip = searchHutangTitip(data);



                log.debug("getVendor", getVendorHutangDagang);
                // var data_period = getDataPeriod(data)
                // var data_hutang = getDataHutang(data)
                // data.data_print = data_hutang

                var renderExcels = renderExcel(context, data, getVendorHutangDagang, getVendorHutangTitip);
            }
            // context.response.writePage(form)
        }

        return {
            onRequest: onRequest
        }
    });