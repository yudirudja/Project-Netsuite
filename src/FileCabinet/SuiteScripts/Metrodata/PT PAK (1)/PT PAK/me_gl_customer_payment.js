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

function customizeGlImpact(transactionRecord, standardLines, customLines, book) {
    try {
        //Get Data User who trigger the action

        var isApplied = false;

        var userData = nlapiGetUser();
        var userRole = nlapiGetRole()
        nlapiLogExecution("DEBUG", "1 Data User", userData + ' || User Role' + userRole)

        var idCustPayment = transactionRecord.getId();

        var pkpNonPKP = parseInt(transactionRecord.getFieldValue('custbody_me_invoice_pkp_non_pkp'))
        nlapiLogExecution("DEBUG", "pkpNonPKP", pkpNonPKP);

        var ppnAmount = parseFloat(transactionRecord.getFieldValue('custbody_me_ppn_sales_invoice'))
        nlapiLogExecution("DEBUG", "ppnAmount", ppnAmount);

        var invoiceNum = parseInt(transactionRecord.getFieldValue('custbody_me_invoice_custom_field'))
        nlapiLogExecution("DEBUG", "invoiceNum", invoiceNum);

        var datePayment = (transactionRecord.getFieldValue('trandate'))
        nlapiLogExecution("DEBUG", "datePayment", datePayment);
        
        var status = transactionRecord.getFieldValue('status')
        nlapiLogExecution("DEBUG", "status", status);

        var getLineInvoiceCount = transactionRecord.getLineItemCount('apply');
        nlapiLogExecution("DEBUG", "getLineInvoiceCount", getLineInvoiceCount);

        var dataInvoices = [];

        for (var x = 1; x <= getLineInvoiceCount; x++) {
            var getInvoiceNumberSublist = transactionRecord.getLineItemValue('apply', 'doc', x);
            var isGetInvoiceNumberSublistTrue = transactionRecord.getLineItemValue('apply', 'apply', x);
            nlapiLogExecution("DEBUG", "isGetInvoiceNumberSublistTrue", isGetInvoiceNumberSublistTrue);
            nlapiLogExecution("DEBUG", "getInvoiceNumber", getInvoiceNumberSublist);

            if (isGetInvoiceNumberSublistTrue == 'T') {
                dataInvoices.push(getInvoiceNumberSublist);
            }
        }

        nlapiLogExecution("DEBUG", "dataInvoices", dataInvoices);

        var isTrue = false;

        if (dataInvoices.length > 0) {
            var searchinvoice = getInvoice(dataInvoices);
            var noDuplicateSearchInvoice = searchinvoice;
            for (var a = 0; a < noDuplicateSearchInvoice.length; a++) {
                for (var p = a+1; p < noDuplicateSearchInvoice.length; p++) {
                    if (noDuplicateSearchInvoice[a].internal_id == noDuplicateSearchInvoice[p].internal_id) {
                        noDuplicateSearchInvoice.splice(p,1);
                        break;
                        
                    }
                }
                
            }
            nlapiLogExecution("DEBUG", "searchinvoice[0].applyiing_trans", searchinvoice[0].applyiing_trans);
            nlapiLogExecution("DEBUG", "payment[0].id", searchinvoice[0].ppn);
            nlapiLogExecution("DEBUG", "noDuplicateSearchInvoice[x].entity_id", noDuplicateSearchInvoice[0].entity_id);
            var payment = getPayment(getInvoiceNumberSublist, datePayment)
            // nlapiLogExecution("DEBUG", "payment[0].id", payment[0].id);
            nlapiLogExecution("DEBUG", "current Id", idCustPayment);
            for (var x = 0; x < noDuplicateSearchInvoice.length; x++) {
                nlapiLogExecution("DEBUG","noDuplicateSearchInvoice[x].applyiing_trans == idCustPayment", noDuplicateSearchInvoice[x].applyiing_trans + "_____" + idCustPayment);
                nlapiLogExecution("DEBUG","noDuplicateSearchInvoice[x].applyiing_trans == idCustPayment", noDuplicateSearchInvoice[x].pkp_non_pkp );
                nlapiLogExecution("DEBUG","noDuplicateSearchInvoice[x].ppn", noDuplicateSearchInvoice[x].ppn);
                if ((noDuplicateSearchInvoice[x].pkp_non_pkp == 2 && noDuplicateSearchInvoice.length < dataInvoices.length * 2 && noDuplicateSearchInvoice[x].applyiing_trans_docnum == "") || (noDuplicateSearchInvoice[x].applyiing_trans == idCustPayment && noDuplicateSearchInvoice[x].pkp_non_pkp == 2)) {
                    nlapiLogExecution("DEBUG", "10 Invoice", "MASUK IF STATEMENT")
                    var newLine = customLines.addNewLine();
                    newLine.setDebitAmount(noDuplicateSearchInvoice[x].ppn);
                    newLine.setEntityId(Number(noDuplicateSearchInvoice[x].entity_id));
                    newLine.setAccountId(2151);
                    
                    nlapiLogExecution("DEBUG", "10 Invoice", "Line Debit created")
                    
                    var newLine = customLines.addNewLine();
                    newLine.setCreditAmount((noDuplicateSearchInvoice[x].ppn));
                    // newLine.setEntityId(Number(noDuplicateSearchInvoice[x].entity_id));
                    newLine.setAccountId(4525);

                    nlapiLogExecution("DEBUG", "11 Invoice", "Line Credit created")
                    isApplied = true;
                }
            }
        }

    } catch (error) {
        nlapiLogExecution("DEBUG", "error", error);
    }

}



