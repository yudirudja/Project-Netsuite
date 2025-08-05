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

        var getGlLineCount = standardLines.getCount();
        // var isTrue = false;

        for (var i = 0; i < getGlLineCount; i++) {
            var account = standardLines.getLine(i).getAccountId()
            nlapiLogExecution("DEBUG", "account", account)
            // var amountDebit = standardLines.getLine(i).getDebitAmount()
        }

    } catch (error) {
        nlapiLogExecution("DEBUG", "error", error);
    }

}



