

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
                if ((noDuplicateSearchInvoice[x].pkp_non_pkp == 2 && status == "Deposited" && noDuplicateSearchInvoice.length < dataInvoices.length * 2 && noDuplicateSearchInvoice[x].applyiing_trans_docnum == "") || (noDuplicateSearchInvoice[x].applyiing_trans == idCustPayment && noDuplicateSearchInvoice[x].pkp_non_pkp == 2 && status == "Deposited")) {
                    nlapiLogExecution("DEBUG", "10 Invoice", "MASUK IF STATEMENT")
                    var newLine = customLines.addNewLine();
                    newLine.setDebitAmount(noDuplicateSearchInvoice[x].ppn);
                    newLine.setEntityId(Number(noDuplicateSearchInvoice[x].entity_id));
                    newLine.setAccountId(2151);
                    
                    nlapiLogExecution("DEBUG", "10 Invoice", "Line Debit created")
                    
                    var newLine = customLines.addNewLine();
                    newLine.setCreditAmount((noDuplicateSearchInvoice[x].ppn));
                    // newLine.setEntityId(Number(noDuplicateSearchInvoice[x].entity_id));
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
