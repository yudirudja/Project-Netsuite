function getPayment(invoice, datePayment) {
    //disini hardcode internal id location depo khusus
    var paymentList = [];
    var customerpaymentSearch = nlapiSearchRecord("customerpayment", null,
        [
            ["type", "anyof", "CustPymt"],
            "AND",
            ["trandate", "onorbefore", datePayment],
            "AND",
            ["appliedtotransaction", "anyof", invoice],
        ],
        [
            new nlobjSearchColumn("tranid"),
            new nlobjSearchColumn("trandate"),
            new nlobjSearchColumn("appliedtotransaction"),
            new nlobjSearchColumn("internalid"),
        ]
    );

    nlapiLogExecution("DEBUG", "customerpayment", customerpaymentSearch);

    if (customerpaymentSearch != null) {
        for (var x = 0; x < customerpaymentSearch.length; x++) {
            paymentList.push({
                cust_pay_docnum: customerpaymentSearch[x].getValue("tranid"),
                date: customerpaymentSearch[x].getValue("trandate"),
                applied_tp_transaction: customerpaymentSearch[x].getValue("appliedtotransaction"),
                id: customerpaymentSearch[x].getValue("internalid"),
            });
        }
    }

    return paymentList;

}

function getInvoice(invoice) {
    var data = [];
    var invoiceSearch = nlapiSearchRecord("invoice", null,
        [
            ["type", "anyof", "CustInvc"],
            "AND",
            ["internalid", "anyof", invoice],
            "AND",
            ["applyingtransaction.type", "anyof", "CustPymt", "@NONE@"]
        ],
        [
            new nlobjSearchColumn("custbody_me_dpp_invoice_sales"),
            new nlobjSearchColumn("custbody_me_ppn_sales_invoice"),
            new nlobjSearchColumn("custbody_me_invoice_pkp_non_pkp"),
            new nlobjSearchColumn("applyingtransaction"),
            new nlobjSearchColumn("tranid", "applyingTransaction", null),
            new nlobjSearchColumn("internalid"),
            new nlobjSearchColumn("datecreated"),
            new nlobjSearchColumn("internalid", "applyingTransaction", null).setSort(false),
            new nlobjSearchColumn("entity"),
        ]
    );

    var countDuplicateNoPayment = 0;

    for (var x = 0; x < invoiceSearch.length; x++) {

        for (var p = 0; p < data.length; p++) {
            if (invoiceSearch[x].getValue("internalid") == data[p].internal_id && invoiceSearch[x].getValue("tranid", "applyingTransaction", null) == "") {
                countDuplicateNoPayment++;
            }

        }

        if (invoiceSearch[x].getValue("tranid", "applyingTransaction", null) != "") {
            data.push({
                dpp: invoiceSearch[x].getValue("custbody_me_dpp_invoice_sales"),
                ppn: invoiceSearch[x].getValue("custbody_me_ppn_sales_invoice"),
                pkp_non_pkp: invoiceSearch[x].getValue("custbody_me_invoice_pkp_non_pkp"),
                applyiing_trans: invoiceSearch[x].getValue("applyingtransaction"),
                applyiing_trans_docnum: invoiceSearch[x].getValue("tranid", "applyingTransaction", null),
                internal_id: invoiceSearch[x].getValue("internalid"),
                entity_id: invoiceSearch[x].getValue("entity"),
            });
        }

        if ((countDuplicateNoPayment < 1 && invoiceSearch[x].getValue("tranid", "applyingTransaction", null) == "")) {
            data.push({
                dpp: invoiceSearch[x].getValue("custbody_me_dpp_invoice_sales"),
                ppn: invoiceSearch[x].getValue("custbody_me_ppn_sales_invoice"),
                pkp_non_pkp: invoiceSearch[x].getValue("custbody_me_invoice_pkp_non_pkp"),
                applyiing_trans: invoiceSearch[x].getValue("applyingtransaction"),
                applyiing_trans_docnum: invoiceSearch[x].getValue("tranid", "applyingTransaction", null),
                internal_id: invoiceSearch[x].getValue("internalid"),
                entity_id: invoiceSearch[x].getValue("entity"),
            });
        }
        countDuplicateNoPayment = 0;

    }

    for (var o = 0; o < data.length; o++) {
        nlapiLogExecution("DEBUG", "data.applyiing_trans_docnum", data[o].applyiing_trans_docnum + "__" + o);

    }

    nlapiLogExecution("DEBUG", "invoiceSearch.length", invoiceSearch.length);

    return data;
}

function getCreditMemo(creditMemo) {
    var data = [];
    var creditmemoSearch = nlapiSearchRecord("creditmemo", null,
        [
            ["type", "anyof", "CustCred"],
            "AND",
            ["internalid", "anyof", creditMemo],
            "AND",
            ["item.type", "anyof", "@NONE@"]
        ],
        [
            new nlobjSearchColumn("createdfrom"),
            new nlobjSearchColumn("internalid").setSort(false)
        ]
    );

    for (var x = 0; x < creditmemoSearch.length; x++) {
        data.push(creditmemoSearch[x].getValue("createdfrom"));
    }
    
    return data;

}

function customizeGlImpact(transactionRecord, standardLines, customLines, book) {
    try {
        //Get Data User who trigger the action

        var isApplied = false;

        var idCustRefund = transactionRecord.getId();

        var datePayment = (transactionRecord.getFieldValue('trandate'))
        nlapiLogExecution("DEBUG", "datePayment", datePayment);

        var getLineCreditMemoCount = transactionRecord.getLineItemCount('apply');
        nlapiLogExecution("DEBUG", "getLineInvoiceCount", getLineCreditMemoCount);

        var dataCreditMemo = [];

        for (var x = 1; x <= getLineCreditMemoCount; x++) {
            var getCreditMemoSublist = transactionRecord.getLineItemValue('apply', 'doc', x);
            var isGetCreditMemoSublistTrue = transactionRecord.getLineItemValue('apply', 'apply', x);
            nlapiLogExecution("DEBUG", "isGetInvoiceNumberSublistTrue", isGetCreditMemoSublistTrue);
            nlapiLogExecution("DEBUG", "getInvoiceNumber", getCreditMemoSublist);

            if (isGetCreditMemoSublistTrue == 'T') {
                dataCreditMemo.push(getCreditMemoSublist);
            }
        }

        nlapiLogExecution("DEBUG", "dataInvoices", dataCreditMemo);

        var isTrue = false;

        if (dataCreditMemo.length > 0) {
            var getInvoiceId = getCreditMemo(dataCreditMemo);
            var searchinvoice = getInvoice(getInvoiceId);
            for (var x = 0; x < searchinvoice.length; x++) {
                for (var p = x+1; p < searchinvoice.length; p++) {
                    if (searchinvoice[x].internal_id == searchinvoice[p].internal_id) {
                        searchinvoice.splice(x,1);
                        break;
                    }
                    
                }
                
            }
            nlapiLogExecution("DEBUG", "searchinvoice[0].applyiing_trans", searchinvoice[0].applyiing_trans);
            nlapiLogExecution("DEBUG", "payment[0].id", searchinvoice[0].ppn);
            var payment = getPayment(getCreditMemoSublist, datePayment)
            // nlapiLogExecution("DEBUG", "payment[0].id", payment[0].id);
            nlapiLogExecution("DEBUG", "current Id", idCustRefund);
            for (var x = 0; x < searchinvoice.length; x++) {
                if ((searchinvoice[x].pkp_non_pkp == 2 && searchinvoice.length < dataCreditMemo.length * 2 && idCustRefund == "") || (idCustRefund != "" && searchinvoice[x].pkp_non_pkp == 2)) {
                    var newLine = customLines.addNewLine();
                    newLine.setCreditAmount(searchinvoice[x].ppn);
                    newLine.setEntityId(Number(searchinvoice[x].entity_id));
                    newLine.setAccountId(2151);

                    nlapiLogExecution("DEBUG", "10 Invoice", "Line Debit created")

                    var newLine = customLines.addNewLine();
                    newLine.setDebitAmount(searchinvoice[x].ppn);
                    // newLine.setEntityId(Number(searchinvoice[x].entity_id));
                    newLine.setAccountId(4368);

                    nlapiLogExecution("DEBUG", "11 Invoice", "Line Credit created")
                    isApplied = true;
                }
            }
        }

    } catch (error) {
        nlapiLogExecution("DEBUG", "error", error);
    }

}



