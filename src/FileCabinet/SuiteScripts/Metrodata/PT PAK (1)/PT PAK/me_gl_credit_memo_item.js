// function getPayment(invoice, datePayment) {
//     //disini hardcode internal id location depo khusus
//     var paymentList = [];
//     var customerpaymentSearch = nlapiSearchRecord("customerpayment", null,
//         [
//             ["type", "anyof", "CustPymt"],
//             "AND",
//             ["trandate", "onorbefore", datePayment],
//             "AND",
//             ["appliedtotransaction", "anyof", invoice],
//         ],
//         [
//             new nlobjSearchColumn("tranid"),
//             new nlobjSearchColumn("trandate"),
//             new nlobjSearchColumn("appliedtotransaction"),
//             new nlobjSearchColumn("internalid"),
//         ]
//     );

//     nlapiLogExecution("DEBUG", "customerpayment", customerpaymentSearch);

//     if (customerpaymentSearch != null) {
//         for (var x = 0; x < customerpaymentSearch.length; x++) {
//             paymentList.push({
//                 cust_pay_docnum: customerpaymentSearch[x].getValue("tranid"),
//                 date: customerpaymentSearch[x].getValue("trandate"),
//                 applied_tp_transaction: customerpaymentSearch[x].getValue("appliedtotransaction"),
//                 id: customerpaymentSearch[x].getValue("internalid"),
//             });
//         }
//     }

//     return paymentList;

// }

function stringIncludes(str, substring) {
    return str.indexOf(substring) !== -1;
}

function searchItemIncomeAmount(data) {

    for (var x = 0; x < data.length; x++) {
        // var checkIfAssemblyOrNonInventory = nlapiLookupField('item', data[x].item_id, ['type']);
        if (data[x].item_type == "InvtPart" || data[x].item_type == "Assembly") {
            var getIncomeAccount = nlapiLookupField('item', data[x].item_id, 'incomeaccount', false);
            nlapiLogExecution("DEBUG", "getIncomeAmountr", getIncomeAccount)

            data[x].income_amount_account_id = getIncomeAccount;
        }

    }
    return data;
}

function searchAccountId() {
    var reportData = [];
    var accountSearch = nlapiSearchRecord("account", null,
        [
            ["name", "contains", "Potongan"]
        ],
        [
            new nlobjSearchColumn("internalid"),
            new nlobjSearchColumn("name")
        ]
    );
    for (var x = 0; x < accountSearch.length; x++) {
        var internalId = accountSearch[x].getValue("internalid");
        var name = accountSearch[x].getValue("name");

        reportData.push({
            internal_id: internalId,
            name: name,
        });
    }
    return reportData;
}

function customizeGlImpact(transactionRecord, standardLines, customLines, book) {
    try {
        //Get Data User who trigger the action

        var userData = nlapiGetUser();
        var userRole = nlapiGetRole()
        nlapiLogExecution("DEBUG", "1 Data User", "DATA ")

        // var idCustPayment = transactionRecord.getId();

        // var pkpNonPKP = parseInt(transactionRecord.getFieldValue('custbody_me_invoice_pkp_non_pkp'))
        // nlapiLogExecution("DEBUG", "pkpNonPKP", pkpNonPKP);

        // var ppnAmount = parseFloat(transactionRecord.getFieldValue('custbody_me_ppn_sales_invoice'))
        // nlapiLogExecution("DEBUG", "ppnAmount", ppnAmount);

        // var invoiceNum = parseInt(transactionRecord.getFieldValue('custbody_me_invoice_custom_field'))
        // nlapiLogExecution("DEBUG", "invoiceNum", invoiceNum);

        // var datePayment = (transactionRecord.getFieldValue('trandate'))
        // nlapiLogExecution("DEBUG", "datePayment", datePayment);

        var getCategoryResell = transactionRecord.getFieldValue('custbody_me_category_resell_trx');
        var getLineInvoiceCount = transactionRecord.getLineItemCount('item');
        var getParent = transactionRecord.getFieldValue('createdfrom');
        nlapiLogExecution("DEBUG", "getLineInvoiceCount", getLineInvoiceCount);

        var getIncomeAmountAccount = [];
        var dataInvoices = [];

        var loadRecord = nlapiLoadRecord('invoice', getParent);

        for (var x = 1; x <= getLineInvoiceCount; x++) {
            var getItemId = loadRecord.getLineItemValue('item', 'item', x);
            nlapiLogExecution("DEBUG", "getLineInvoiceCount", "1");
            var getItemType = loadRecord.getLineItemValue('item', 'itemtype', x);
            nlapiLogExecution("DEBUG", "getLineInvoiceCount", "2");
            var categoryItemPl = loadRecord.getLineItemText('item', 'custcol_me_potongan_pl_category', x);
            nlapiLogExecution("DEBUG", "getLineInvoiceCount", "3");
            var discountRatePl = loadRecord.getLineItemValue('item', 'custcol_me_potongan_pl_rp', x);
            nlapiLogExecution("DEBUG", "getLineInvoiceCount", "4");
            var categoryItemPotonganLainnya = loadRecord.getLineItemText('item', 'custcol_me_potongan_diskon_lainnya_ct', x);
            nlapiLogExecution("DEBUG", "getLineInvoiceCount", "5");
            var discountRatePotonganLainnya = loadRecord.getLineItemValue('item', 'custcol_me_pot_disc_lainnya_rp', x);
            nlapiLogExecution("DEBUG", "getLineInvoiceCount", "6");
            var categoryItemPotonganExtra = loadRecord.getLineItemText('item', 'custcol_me_potongan_extra_dscount_cat', x);
            nlapiLogExecution("DEBUG", "getLineInvoiceCount", "7");
            var discountRatePotonganExtra = loadRecord.getLineItemValue('item', 'custcol_me_pot_extra_disc_rp', x);
            nlapiLogExecution("DEBUG", "getLineInvoiceCount", "8");
            var categoryItemPotonganWelcome = loadRecord.getLineItemText('item', 'custcol_me_potongan_welcome_voucher_c', x);
            nlapiLogExecution("DEBUG", "getLineInvoiceCount", "9");
            var discountRatePotonganWelcome = loadRecord.getLineItemValue('item', 'custcol_me_potongan_voucher_rp', x);
            nlapiLogExecution("DEBUG", "getLineInvoiceCount", "10");
            var categoryItemVoucherLainnya = loadRecord.getLineItemText('item', 'custcol_me_potongan_voucher_lainnya_c', x);
            nlapiLogExecution("DEBUG", "getLineInvoiceCount", "11");
            var discountRateVoucherLainnya = loadRecord.getLineItemValue('item', 'custcol_me_pot_voucher_lainnya_rp', x);
            nlapiLogExecution("DEBUG", "getLineInvoiceCount", "12");
            var categoryItemVoucherBirthday = loadRecord.getLineItemText('item', 'custcol_me_potongan_voucher_birthdy_c', x);
            nlapiLogExecution("DEBUG", "getLineInvoiceCount", "13");
            var discountRateVoucherBirthday = loadRecord.getLineItemValue('item', 'custcol_me_ptongan_vchr_birthday_rp', x);
            nlapiLogExecution("DEBUG", "getLineInvoiceCount", "14");
            // nlapiLogExecution("DEBUG", "getInvoiceNumber", getInvoiceNumberSublist);

            dataInvoices.push({
                item_id: getItemId,
                item_type: getItemType,
                categoryItemPl: categoryItemPl,
                discountRatePl: discountRatePl,
                categoryItemPotonganLainnya: categoryItemPotonganLainnya,
                discountRatePotonganLainnya: discountRatePotonganLainnya,
                categoryItemPotonganExtra: categoryItemPotonganExtra,
                discountRatePotonganExtra: discountRatePotonganExtra,
                categoryItemPotonganWelcome: categoryItemPotonganWelcome,
                discountRatePotonganWelcome: discountRatePotonganWelcome,
                categoryItemVoucherLainnya: categoryItemVoucherLainnya,
                discountRateVoucherLainnya: discountRateVoucherLainnya,
                categoryItemVoucherBirthday: categoryItemVoucherBirthday,
                discountRateVoucherBirthday: discountRateVoucherBirthday,
                income_amount_account_id: "",
            });

            getIncomeAmountAccount = searchItemIncomeAmount(dataInvoices);

        }

        var searchIdAccount = searchAccountId();

        var glInput = [];
        nlapiLogExecution("DEBUG", "SEE DATA getIncomeAmountAccount ", getIncomeAmountAccount[0].income_amount_account_id);

        for (var x = 0; x < getIncomeAmountAccount.length; x++) {
            for (var i = 0; i < searchIdAccount.length; i++) {
                nlapiLogExecution("DEBUG", "SEE NAME BRUH", searchIdAccount[i].name);
                if (getCategoryResell != 6) {

                    if (getIncomeAmountAccount[x].categoryItemPl == "Diamond Jewerly" && getIncomeAmountAccount[x].discountRatePl != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Penjualan PL Diamond Jewelry") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePl,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemPl == "Gold Jewerly" && getIncomeAmountAccount[x].discountRatePl != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Penjualan PL Gold Jewelry") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePl,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemPl == "Loose Stone" && getIncomeAmountAccount[x].discountRatePl != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Penjualan PL Loose Stone") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePl,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemPl == "Logam Mulia" && getIncomeAmountAccount[x].discountRatePl != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Penjualan PL Logam Mulia") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePl,
                        });
                    }
                    //==================================================
                    if (getIncomeAmountAccount[x].categoryItemPotonganLainnya == "Diamond Jewerly" && getIncomeAmountAccount[x].discountRatePotonganLainnya != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Diskon Lainnya Diamond Jewelry") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePotonganLainnya,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemPotonganLainnya == "Gold Jewerly" && getIncomeAmountAccount[x].discountRatePotonganLainnya != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Diskon Lainnya Gold Jewelry") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePotonganLainnya,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemPotonganLainnya == "Loose Stone" && getIncomeAmountAccount[x].discountRatePotonganLainnya != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Diskon Lainnya Loose Stone") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePotonganLainnya,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemPotonganLainnya == "Logam Mulia" && getIncomeAmountAccount[x].discountRatePotonganLainnya != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Diskon Lainnya Logam Mulia") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePotonganLainnya,
                        });
                    }
                    //==================================================
                    if (getIncomeAmountAccount[x].categoryItemPotonganExtra == "Diamond Jewerly" && getIncomeAmountAccount[x].discountRatePotonganExtra != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Extra Diskon Diamond Jewelry") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePotonganExtra,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemPotonganExtra == "Gold Jewerly" && getIncomeAmountAccount[x].discountRatePotonganExtra != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Extra Diskon Gold Jewelry") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePotonganExtra,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemPotonganExtra == "Loose Stone" && getIncomeAmountAccount[x].discountRatePotonganExtra != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Extra Diskon Loose Stone") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePotonganExtra,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemPotonganExtra == "Logam Mulia" && getIncomeAmountAccount[x].discountRatePotonganExtra != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Extra Diskon Logam Mulia") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePotonganExtra,
                        });
                    }
                    //==================================================
                    if (getIncomeAmountAccount[x].categoryItemPotonganWelcome == "Diamond Jewerly" && getIncomeAmountAccount[x].discountRatePotonganWelcome != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Welcome Voucher Diamond Jewelry") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePotonganWelcome,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemPotonganWelcome == "Gold Jewerly" && getIncomeAmountAccount[x].discountRatePotonganWelcome != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Welcome Voucher Gold Jewelry") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePotonganWelcome,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemPotonganWelcome == "Loose Stone" && getIncomeAmountAccount[x].discountRatePotonganWelcome != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Welcome Voucher Loose Stone") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePotonganWelcome,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemPotonganWelcome == "Logam Mulia" && getIncomeAmountAccount[x].discountRatePotonganWelcome != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Welcome Voucher Logam Mulia") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePotonganWelcome,
                        });
                    }
                    //==================================================
                    if (getIncomeAmountAccount[x].categoryItemVoucherLainnya == "Diamond Jewerly" && getIncomeAmountAccount[x].discountRateVoucherLainnya != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Voucher Lainnya Diamond Jewelry") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRateVoucherLainnya,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemVoucherLainnya == "Gold Jewerly" && getIncomeAmountAccount[x].discountRateVoucherLainnya != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Voucher Lainnya Gold Jewelry") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRateVoucherLainnya,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemVoucherLainnya == "Loose Stone" && getIncomeAmountAccount[x].discountRateVoucherLainnya != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Voucher Lainnya Loose Stone") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRateVoucherLainnya,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemVoucherLainnya == "Logam Mulia" && getIncomeAmountAccount[x].discountRateVoucherLainnya != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Voucher Lainnya Logam Mulia") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRateVoucherLainnya,
                        });
                    }
                    //==================================================
                    if (getIncomeAmountAccount[x].categoryItemVoucherBirthday == "Diamond Jewerly" && getIncomeAmountAccount[x].discountRateVoucherBirthday != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Voucher Birthday Diamond Jewelry") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRateVoucherBirthday,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemVoucherBirthday == "Gold Jewerly" && getIncomeAmountAccount[x].discountRateVoucherBirthday != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Voucher Birthday Gold Jewelry") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRateVoucherBirthday,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemVoucherBirthday == "Loose Stone" && getIncomeAmountAccount[x].discountRateVoucherBirthday != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Voucher Birthday Loose Stone") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRateVoucherBirthday,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemVoucherBirthday == "Logam Mulia" && getIncomeAmountAccount[x].discountRateVoucherBirthday != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Voucher Birthday Logam Mulia") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRateVoucherBirthday,
                        });
                    }
                }else{
                    if (getIncomeAmountAccount[x].categoryItemPl == "Diamond Jewerly" && getIncomeAmountAccount[x].discountRatePl != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Penjualan PL Diamond Jewelry") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePl,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemPl == "Gold Jewerly" && getIncomeAmountAccount[x].discountRatePl != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Penjualan PL Gold Jewelry") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePl,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemPl == "Loose Stone" && getIncomeAmountAccount[x].discountRatePl != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Penjualan PL Loose Stone") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePl,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemPl == "Logam Mulia" && getIncomeAmountAccount[x].discountRatePl != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Penjualan PL Logam Mulia") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePl,
                        });
                    }
                    //==================================================
                    if (getIncomeAmountAccount[x].categoryItemPotonganLainnya == "Diamond Jewerly" && getIncomeAmountAccount[x].discountRatePotonganLainnya != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Diskon Lainnya Diamond Jewelry") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePotonganLainnya,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemPotonganLainnya == "Gold Jewerly" && getIncomeAmountAccount[x].discountRatePotonganLainnya != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Diskon Lainnya Gold Jewelry") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePotonganLainnya,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemPotonganLainnya == "Loose Stone" && getIncomeAmountAccount[x].discountRatePotonganLainnya != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Diskon Lainnya Loose Stone") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePotonganLainnya,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemPotonganLainnya == "Logam Mulia" && getIncomeAmountAccount[x].discountRatePotonganLainnya != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Diskon Lainnya Logam Mulia") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePotonganLainnya,
                        });
                    }
                    //==================================================
                    if (getIncomeAmountAccount[x].categoryItemPotonganExtra == "Diamond Jewerly" && getIncomeAmountAccount[x].discountRatePotonganExtra != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Extra Diskon Diamond Jewelry") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePotonganExtra,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemPotonganExtra == "Gold Jewerly" && getIncomeAmountAccount[x].discountRatePotonganExtra != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Extra Diskon Gold Jewelry") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePotonganExtra,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemPotonganExtra == "Loose Stone" && getIncomeAmountAccount[x].discountRatePotonganExtra != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Extra Diskon Loose Stone") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePotonganExtra,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemPotonganExtra == "Logam Mulia" && getIncomeAmountAccount[x].discountRatePotonganExtra != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Extra Diskon Logam Mulia") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePotonganExtra,
                        });
                    }
                    //==================================================
                    if (getIncomeAmountAccount[x].categoryItemPotonganWelcome == "Diamond Jewerly" && getIncomeAmountAccount[x].discountRatePotonganWelcome != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Welcome Voucher Diamond Jewelry") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePotonganWelcome,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemPotonganWelcome == "Gold Jewerly" && getIncomeAmountAccount[x].discountRatePotonganWelcome != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Welcome Voucher Gold Jewelry") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePotonganWelcome,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemPotonganWelcome == "Loose Stone" && getIncomeAmountAccount[x].discountRatePotonganWelcome != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Welcome Voucher Loose Stone") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePotonganWelcome,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemPotonganWelcome == "Logam Mulia" && getIncomeAmountAccount[x].discountRatePotonganWelcome != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Welcome Voucher Logam Mulia") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRatePotonganWelcome,
                        });
                    }
                    //==================================================
                    if (getIncomeAmountAccount[x].categoryItemVoucherLainnya == "Diamond Jewerly" && getIncomeAmountAccount[x].discountRateVoucherLainnya != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Voucher Lainnya Diamond Jewelry") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRateVoucherLainnya,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemVoucherLainnya == "Gold Jewerly" && getIncomeAmountAccount[x].discountRateVoucherLainnya != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Voucher Lainnya Gold Jewelry") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRateVoucherLainnya,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemVoucherLainnya == "Loose Stone" && getIncomeAmountAccount[x].discountRateVoucherLainnya != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Voucher Lainnya Loose Stone") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRateVoucherLainnya,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemVoucherLainnya == "Logam Mulia" && getIncomeAmountAccount[x].discountRateVoucherLainnya != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Voucher Lainnya Logam Mulia") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRateVoucherLainnya,
                        });
                    }
                    //==================================================
                    if (getIncomeAmountAccount[x].categoryItemVoucherBirthday == "Diamond Jewerly" && getIncomeAmountAccount[x].discountRateVoucherBirthday != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Voucher Birthday Diamond Jewelry") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRateVoucherBirthday,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemVoucherBirthday == "Gold Jewerly" && getIncomeAmountAccount[x].discountRateVoucherBirthday != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Voucher Birthday Gold Jewelry") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRateVoucherBirthday,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemVoucherBirthday == "Loose Stone" && getIncomeAmountAccount[x].discountRateVoucherBirthday != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Voucher Birthday Loose Stone") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRateVoucherBirthday,
                        });
                    }
                    if (getIncomeAmountAccount[x].categoryItemVoucherBirthday == "Logam Mulia" && getIncomeAmountAccount[x].discountRateVoucherBirthday != 0 && stringIncludes(searchIdAccount[i].name, "Potongan Voucher Birthday Logam Mulia") && getIncomeAmountAccount[x].income_amount_account_id != "") {
                        glInput.push({
                            internal_id_account_credit: searchIdAccount[i].internal_id,
                            internal_id_account_debit: getIncomeAmountAccount[x].income_amount_account_id,
                            discount_rate: getIncomeAmountAccount[x].discountRateVoucherBirthday,
                        });
                    }
                }


            }

        }

        nlapiLogExecution("DEBUG", "Gl Input", glInput.length);

        // var isTrue = false;

        if (glInput.length > 0) {
            for (var x = 0; x < glInput.length; x++) {
                var newLine = customLines.addNewLine();
                newLine.setDebitAmount(glInput[x].discount_rate);
                // newLine.setEntityId(Number(glInput[x].entity_id));
                newLine.setAccountId(Number(glInput[x].internal_id_account_debit));

                nlapiLogExecution("DEBUG", "10 Invoice", glInput[x].internal_id_account_debit)
                nlapiLogExecution("DEBUG", "10 Invoice", "Line Debit created")

                var newLine = customLines.addNewLine();
                newLine.setCreditAmount(glInput[x].discount_rate);
                // newLine.setEntityId(Number(glInput[x].entity_id));
                newLine.setAccountId(Number(glInput[x].internal_id_account_credit));

                nlapiLogExecution("DEBUG", "11 Invoice", glInput[x].internal_id_account_credit)
                nlapiLogExecution("DEBUG", "11 Invoice", "Line Credit created")
            }
        }

    } catch (error) {
        nlapiLogExecution("DEBUG", "error", error);
    }

}



